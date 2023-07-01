import asyncio
import json
import os
import pika
from pika.adapters.blocking_connection import BlockingChannel

import telethon

api_id = os.getenv('TG_API_ID')
api_hash = os.getenv('TG_API_HASH')

rmq_username = os.getenv('RMQ_USERNAME')
rmq_password = os.getenv('RMQ_PASSWORD')

connection = pika.BlockingConnection(
    pika.ConnectionParameters(
        host='rabbitmq',
        credentials=pika.PlainCredentials(
            username=rmq_username,
            password=rmq_password,
            erase_on_connect=True)))

channel = connection.channel()

channel.queue_declare(queue='tg:login:answer', durable=True)
channel.queue_declare(queue='tg:login', durable=True)

login_data_by_user_id = {}


def extract_session_from_login_data(user_id):
    phone = login_data_by_user_id[user_id]['phone']
    return f"sessions/{user_id}-{phone}"


async def async_handle_login(ch: BlockingChannel, method, properties, body):

    data = json.loads(body)

    # 1) check is loggined already
    # 2) send agree request
    # 3) init login by number
    # 4) enter password
    # 5) enter additional password

    print(type(method))
    print(" [x] %r:%r" % (method.routing_key, body))

    action = data['type']
    user_id = data['user_id']

    print(action)

    if action == 'login_init':

        channel.basic_publish(exchange='',
            routing_key= 'tg:login:answer',
            body= json.dumps({
                'user_id': user_id,
                'request_number': True
            }))

    elif action == 'pass_phone':
        phone = data['phone']

        session_name = f"sessions/{user_id}-{phone}"

        client = telethon.TelegramClient(session_name, api_id, api_hash)
        await client.connect()

        try:
            sent_code = await client.send_code_request(phone)

            login_data_by_user_id[user_id] = {
                'phone': phone,
                'sent_code': sent_code
            }

            channel.basic_publish(exchange='',
                routing_key= 'tg:login:answer',
                body= json.dumps({
                    'user_id': user_id,
                    'request_code': True
                }))
        except TypeError:
            os.remove(f"{session_name}.session")

            channel.basic_publish(exchange='',
                routing_key= 'tg:login:answer',
                body= json.dumps({
                    'user_id': user_id,
                    'wrong_number': True
                }))

    elif action == 'pass_code':
        code = data['code']
        login_data = login_data_by_user_id[user_id]

        login_data_by_user_id[user_id]['code'] = code

        session_name = extract_session_from_login_data(user_id)

        client = telethon.TelegramClient(session_name, api_id, api_hash)
        await client.connect()
        try:
            await client.sign_in(
                phone=login_data['phone'],
                code=obsuscate_code(code), # code obsuscation idk why but we need it
                phone_code_hash=login_data['sent_code'].phone_code_hash)

        except telethon.errors.rpcerrorlist.SessionPasswordNeededError as e:
            channel.basic_publish(exchange='',
                routing_key= 'tg:login:answer',
                body= json.dumps({
                    'user_id': user_id,
                    'request_password': True
                }))


    elif action == 'pass_password':
        password = data['password']

        login_data = login_data_by_user_id[user_id]

        print(login_data)
        code = login_data['code']

        session_name = extract_session_from_login_data(user_id)

        client = telethon.TelegramClient(session_name, api_id, api_hash)
        await client.connect()

        await client.sign_in(
            phone=login_data['phone'],
            code=obsuscate_code(code), # code obsuscation idk why but we need it
            password=password,
            phone_code_hash=login_data['sent_code'].phone_code_hash)


def obsuscate_code(code):
    return '.'.join(list(code))

def handle_login(ch: BlockingChannel, method, properties, body):
    asyncio.run(async_handle_login(ch, method, properties, body))


channel.basic_consume(
    queue='tg:login', on_message_callback=handle_login, auto_ack=True)

print('starting')
channel.start_consuming()



