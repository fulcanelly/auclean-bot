import asyncio
import datetime
import json
import os
from threading import Thread

from telethon import TelegramClient, events
import pretty_traceback
from tele_login import sesion_by_phone_and_phone
from tele_login import curator_notifier_t


from session_store import session_by_name
from pika.adapters.blocking_connection import BlockingChannel

from rmq import get_new_channel
from tele_login import tele_login_t, user_loginer

pretty_traceback.install()

channel = get_new_channel()

login_data_by_user_id = {}

api_id = os.getenv('TG_API_ID')
api_hash = os.getenv('TG_API_HASH')


tele_login = tele_login_t(channel)

def async_handle_login(ch: BlockingChannel, method, properties, body):


    data = json.loads(body)

    print(" [x] %r:%r" % (method.routing_key, body))

    action = data['type']
    user_id = data['user_id']

    print(action)

    if action == 'login_init':
        tele_login.request_number(user_id)

    elif action == 'pass_phone':
        phone = data['phone']

        loginer = user_loginer(user_id, phone)
        login_data_by_user_id[user_id] = loginer
        loginer.start()

    elif action == 'pass_code':
        loginer: user_loginer = login_data_by_user_id[user_id]
        loginer.put_code(data['code'])

    elif action == 'pass_password':
        loginer: user_loginer = login_data_by_user_id[user_id]
        loginer.put_password(data['password'])

def handle_login(ch: BlockingChannel, method, properties, body):
    async_handle_login(ch, method, properties, body)


channel.basic_consume(
    queue='tg:login', on_message_callback=handle_login, auto_ack=True)

curator_notifier = curator_notifier_t(channel)


class session_handler:
    def __init__(self, session_name, user_id) -> None:
        self.session_name = session_name
        self.client: TelegramClient = None
        self.curator_notifier = curator_notifier_t(get_new_channel())
        self.user_id = user_id

    def start(self):
        Thread(target=self.run).start()

    async def user_update_event_handler(self, event):
        print(f"EVENT from f{self.user_id}")


        try:
            #TODO
            if event.online == None: return

            self.curator_notifier.notify_online_status(event.user_id, self.user_id, event.online)

            user_details = await self.client.get_entity(event.user_id)
            print(f" {user_details.first_name}, time: {datetime.datetime.now()}, online {event.online:}")
        except Exception as e:
            print(e)
            print(event)

    def pause(self):
        # TODO
        self.client.disconnect()
        def resume():
            self.start()
        return resume

    async def test(self):
        me = await self.client.get_me()
        while True:
            if self.client.is_connected():
                me = await self.client.get_me()
                print(f" [-] heartbeat of {me.first_name} ({self.user_id}) ")

            await asyncio.sleep(3)
        print(me)

    def run(self):
        print("starting session")

        asyncio.set_event_loop(asyncio.new_event_loop())

        self.client = TelegramClient(self.session_name, api_id, api_hash)
        self.client.session
        # client.send_message('me', 'huedjwen')
        self.client.on(events.UserUpdate)(self.user_update_event_handler)

        with self.client:
            self.client.loop.run_until_complete(self.test())
            self.client.run_until_disconnected()
        print("ENDED")


def filename_from_session_name(session_name):
    print(session_name + '.session')
    return session_name + '.session'


def handle_curator_command(ch: BlockingChannel, method, properties, body):
    data = json.loads(body)
    sessions = data.get('sessions')
    print('get someting')
    print(data)

    if not len(data):
        # TODO, maybe somhow limit it for happening only once per runtime
        print("requesting sessions")
        curator_notifier.request_sessions()

    if sessions:
        for entry in sessions:
            session_name = entry.get('session_name')
            if session_by_name.get(session_name): continue


            print(os.path.exists(filename_from_session_name(session_name)))

            if not os.path.exists(filename_from_session_name(session_name)):
                print("Ignoring session")
                continue

            else:
                session_by_name[session_name] = session_handler(session_name, entry.get('user_id'))
                session_by_name[session_name].start()

    ch.basic_ack(method.delivery_tag)

channel.basic_consume(
    queue='curator:command', on_message_callback=handle_curator_command
)
print('starting')
curator_notifier.request_sessions()

channel.start_consuming()
