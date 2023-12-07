
import asyncio
from threading import Thread

from telethon import TelegramClient
from rmq.rmq import get_new_channel
from rmq.send.curator import curator_notifier_t
from rmq.send.tg_login import tele_login_t
from util.session_helpers import sesion_by_phone_and_phone
from util.session_store import get_session_store
from util.threads import semaphore_sort_of
from util.vars import get_api_hash, get_api_id


class user_loginer:
    def __init__(self, user_id: str, phone: str) -> None:
        self.user_id = user_id
        self.phone = phone
        self.rmq_tele: tele_login_t = None
        self.password_queue = semaphore_sort_of()
        self.code_queue = semaphore_sort_of()

    def put_code(self, code):
        self.code_queue.set_data(code)

    def put_password(self, password):
        self.password_queue.set_data(password)

    async def obtain_code(self):
        self.rmq_tele = tele_login_t(get_new_channel())
        self.rmq_tele.request_code(self.user_id)

        return await self.code_queue.get()

    async def obtain_password(self):
        self.rmq_tele = tele_login_t(get_new_channel())
        self.rmq_tele.request_password(self.user_id)

        return await self.password_queue.get()

    def login_user(self):
        raise 'not implemented'

    def start(self):
        Thread(target=self.login_user).start()

    def notify_ok(self, session_name, type):
        self.rmq_tele = tele_login_t(get_new_channel())
        self.rmq_tele.notify_ok(self.user_id)
        ch = get_new_channel()
        curator_notifier_t(ch).notify_success_login(self.user_id, session_name, type)
        ch.close()
        self.rmq_tele.channel.close()

class telethon_user_loginer(user_loginer):
    def login_user(self):
        asyncio.set_event_loop(asyncio.new_event_loop())

        session_name = sesion_by_phone_and_phone(self.user_id, self.phone)

        old_client = get_session_store().get(session_name)

        client = None

        if old_client:
            client = old_client.client
            print("OLD CLIENT RUNNING")
            # asyncio.set_event_loop(
                #TODO
            return
        else:
            client = TelegramClient(session_name, get_api_id(), get_api_hash())

        async def login():
            try:
                await client.connect()
                await client.start(
                    max_attempts=1,
                    phone=self.phone,
                    code_callback=self.obtain_code,
                    password=self.obtain_password)

                self.notify_ok(session_name, 'tele')

            finally:
                await client.disconnect()
                client.loop.stop()

        client.loop.run_until_complete(login())
