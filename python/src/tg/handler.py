
import asyncio
import datetime
from threading import Thread

from telethon import TelegramClient, events

from rmq.rmq import EnsuredPikaChannel
from rmq.send.curator import curator_notifier_t
from util.vars import get_api_hash, get_api_id




class session_handler:
    def __init__(self, session_name, user_id) -> None:
        self.session_name = session_name
        self.client: TelegramClient
        self.ensured_channel = EnsuredPikaChannel()
        self.user_id = user_id

    def start(self):
        Thread(target=self.run).start()

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

    def pause(self):
        # TODO
        self.client.disconnect()
        def resume():
            self.start()
        return resume

    async def test(self):
        while True:
            if self.client.is_connected():
                me = await self.client.get_me()
                print(f" [-] heartbeat of {me.first_name} ({self.user_id}) ")

            await asyncio.sleep(3)

    def run(self):
        print("starting session")

        asyncio.set_event_loop(asyncio.new_event_loop())

        self.client = TelegramClient(self.session_name, get_api_id(), get_api_hash())
        self.client.session
        # client.send_message('me', 'huedjwen')
        self.client.on(events.UserUpdate)(self.user_update_event_handler)

        with self.client:
            self.client.loop.run_until_complete(self.test())
            self.client.run_until_disconnected()
        print("ENDED")
