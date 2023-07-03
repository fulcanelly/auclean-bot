import asyncio
import json
import os
from threading import Thread
from pika.adapters.blocking_connection import BlockingChannel
from telethon import TelegramClient

from rmq import get_new_channel


api_id = os.getenv('TG_API_ID')
api_hash = os.getenv('TG_API_HASH')


channel = get_new_channel()


class tele_login_t:
    def __init__(self, channel) -> None:
        self.channel: BlockingChannel = channel

    def request_number(self, user_id):
        self.channel.basic_publish(exchange='',
            routing_key= 'tg:login:answer',
            body= json.dumps({
                'user_id': user_id,
                'request_number': True
            }))

    def request_code(self, user_id):
        self.channel.basic_publish(exchange='',
            routing_key= 'tg:login:answer',
            body= json.dumps({
                'user_id': user_id,
                'request_code': True
            }))

    def notify_wrong_number(self, user_id):
        self.channel.basic_publish(exchange='',
            routing_key= 'tg:login:answer',
            body= json.dumps({
                'user_id': user_id,
                'wrong_number': True
            }))

    def request_password(self, user_id):
        self.channel.basic_publish(exchange='',
            routing_key= 'tg:login:answer',
            body= json.dumps({
                'user_id': user_id,
                'request_password': True
            }))

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
        self.rmq_tele.request_code(self.user_id)

        return await self.code_queue.get()

    async def obtain_password(self):
        self.rmq_tele.request_password(self.user_id)

        return await self.password_queue.get()

    def login_user(self):
        asyncio.set_event_loop(asyncio.new_event_loop())

        session_namee = sesion_by_phone_and_phone(self.user_id, self.phone)
        client = TelegramClient(session_namee, api_id, api_hash)

        async def login():
            self.rmq_tele = tele_login_t(get_new_channel())
            await client.connect()
            await client.start(
                max_attempts=1,
                phone=self.phone,
                code_callback=self.obtain_code,
                password=self.obtain_password)

        print('loop')

        client.loop.run_until_complete(login())

    def start(self):
        Thread(target=self.login_user).start()

def sesion_by_phone_and_phone(user_id, phone):
    return f"sessions/{user_id}-{phone}"



class semaphore_sort_of:
    def __init__(self) -> None:
        self.data = None

    def set_data(self, data):
        self.data = data

    async def get(self):
        while True:
            if self.data:
                return self.data
            else:
                await asyncio.sleep(0.1)
