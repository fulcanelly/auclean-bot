
import asyncio
import datetime
from threading import Thread

from telethon import TelegramClient, events
from util.auto_ensure import EnsuredPikaChannel


from rmq.send.curator import curator_notifier_t
from util.vars import get_api_hash, get_api_id
from pyrogram import Client

import datetime
import sentry_sdk


class enrolled_job:
    def __init__(self, func, *args, **vargs):
        self.func = func
        self.args = args
        self.vargs = vargs

    async def async_exec(self, some):
        await self.func(some, *self.args, **self.vargs)


class session_handler:

    def __init__(self, session_name, user_id) -> None:
        self.session_name = session_name
        self.client: Client
        self.ensured_channel = EnsuredPikaChannel()
        self.user_id = user_id
        self.job: enrolled_job = None

    def start(self):
        Thread(target=self.run).start()

    def pause(self):
        # TODO
        pass

    def client_type(self):
        raise 'not implemented'

    def is_connected(self):
        raise 'not implemented'

    def run(self):
        raise 'not implemented'

    async def test(self):

        if self.is_connected():
            me = await self.client.get_me()
            while True:
                print(f" [-] [{self.client_type()}] heartbeat of {me.username} ({me.id}) ")
                if self.job:
                    # TODO add queue
                    try: self.job = await self.job.async_exec(self)
                    except Exception as e:
                        sentry_sdk.capture_exception(e)
                        print(e)
                    finally: self.job = None

                await asyncio.sleep(3)

class tele_session_handler(session_handler):
    client: TelegramClient

    async def user_update_event_handler(self, event: events.UserUpdate):
        print(f"EVENT from f{self.user_id}")

        try:
            #TODO
            if event.online == None: return

            user_details = await self.client.get_entity(event.user_id)

            with self.ensured_channel as channel:
                curator_notifier_t(channel).notify_online_status(event.user_id, self.user_id, event.online, user_details.first_name)

            print(f" {user_details.first_name}, time: {datetime.datetime.now()}, online {event.online:}")
        except Exception as e:
            print(e)
            print(event)

    def is_connected(self):
        return self.client.is_connected()

    def client_type(self):
        return 'tele'

    def run(self):
        print("starting session")

        asyncio.set_event_loop(asyncio.new_event_loop())

        self.client = TelegramClient(self.session_name, get_api_id(), get_api_hash())
        self.client.session
        # self.client.on(events.UserUpdate)(self.user_update_event_handler)

        with self.client:
            self.client.loop.run_until_complete(self.test())
            self.client.run_until_disconnected()

        print("ENDED")


class pyro_session_handler(session_handler):
    client: Client

    def is_connected(self):
        return self.client.is_connected

    def client_type(self):
        return 'pyro'

    async def setup(self):
        await self.client.start()
        await self.test()

    def run(self):
        print("starting session")

        asyncio.set_event_loop(asyncio.new_event_loop())
        self.client = Client(self.session_name, get_api_id(), get_api_hash(), workdir='./')


        self.client.run(self.setup())
