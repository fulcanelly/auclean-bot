import json
import pretty_traceback
from tele_login import curator_notifier_t

pretty_traceback.install()

from pika.adapters.blocking_connection import BlockingChannel

from rmq import get_new_channel
from tele_login import tele_login_t, user_loginer

channel = get_new_channel()

login_data_by_user_id = {}


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


def handle_curator_command(ch: BlockingChannel, method, properties, body):
    data = json.loads(body)

    print('get someting')
    print(data)

    if not len(data):
        # TODO, maybe somhow limit it for happening only once per runtime
        print("requesting sessions")
        curator_notifier.request_sessions()

    ch.basic_ack(method.delivery_tag)

channel.basic_consume(
    queue='curator:command', on_message_callback=handle_curator_command
)
print('starting')

channel.start_consuming()
