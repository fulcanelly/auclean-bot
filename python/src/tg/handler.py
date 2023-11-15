
import asyncio
import datetime
from threading import Thread

from telethon import TelegramClient, events

from rmq.rmq import EnsuredPikaChannel
from rmq.send.curator import curator_notifier_t
from util.vars import get_api_hash, get_api_id

import datetime



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
        self.client: TelegramClient
        self.ensured_channel = EnsuredPikaChannel()
        self.user_id = user_id
        #Use queue

        self.job: enrolled_job = None

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
                print(f" [-] heartbeat of {me.username} ({self.user_id}) ")
                if self.job:
                    try: self.job = await self.job.async_exec(self)
                    except Exception as e: print(e)
                    finally: self.job = None

            await asyncio.sleep(3)

    def run(self):
        print("starting session")

        asyncio.set_event_loop(asyncio.new_event_loop())

        self.client = TelegramClient(self.session_name, get_api_id(), get_api_hash())
        self.client.session
        self.client.on(events.UserUpdate)(self.user_update_event_handler)

        with self.client:
            self.client.loop.run_until_complete(self.test())
            self.client.run_until_disconnected()
        print("ENDED")


