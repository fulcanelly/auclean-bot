
import pretty_traceback
from rmq.recv.curator_handler import obtain_curator_handler
from rmq.recv.login_handler import obtain_login_handler
from rmq.send.curator import curator_notifier_t

from rmq.rmq import get_new_channel

pretty_traceback.install()


def start():
    channel = get_new_channel()
    print('starting')

    channel.basic_consume(
        queue='tg:login', on_message_callback=obtain_login_handler(channel), auto_ack=True)

    channel.basic_consume(
        queue='curator:command', on_message_callback=obtain_curator_handler(channel))
    curator_notifier_t(channel).request_sessions()

    channel.start_consuming()

start()
