import os
import pika
import sentry_sdk


rmq_username = os.getenv('RMQ_USERNAME')
rmq_password = os.getenv('RMQ_PASSWORD')
rmq_host = os.getenv('RMQ_HOST')

def get_new_channel() -> pika.BlockingConnection:

    connection = pika.BlockingConnection(
        pika.ConnectionParameters(
            host=rmq_host,
            credentials=pika.PlainCredentials(
                username=rmq_username,
                password=rmq_password,
                erase_on_connect=True)))

    channel = connection.channel()

    channel.queue_declare(queue='tg:login:answer', durable=True)
    channel.queue_declare(queue='tg:login', durable=True)
    channel.queue_declare(queue='curator:event', durable=True)
    channel.queue_declare(queue='curator:command', durable=True)
    channel.queue_declare(queue='py:chanscan', durable=True)
    channel.queue_declare(queue='py:chanscan:reply', durable=True)

    return channel
