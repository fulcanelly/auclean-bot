
import json
from pika.adapters.blocking_connection import BlockingChannel


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

    def notify_ok(self, user_id):
        self.channel.basic_publish(exchange='',
            routing_key= 'tg:login:answer',
            body= json.dumps({
                'user_id': user_id,
                'login_ok': True
            }))
