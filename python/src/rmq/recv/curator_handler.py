import json
import os
from pika import BasicProperties, DeliveryMode
from pika.adapters.blocking_connection import BlockingChannel
from rmq.send.curator import curator_notifier_t

from rmq.send.tg_login import tele_login_t
from tg.handler import session_handler
from tg.loginer import user_loginer
from util.session_helpers import filename_from_session_name
from util.session_store import get_session_store



SESSION_HANDLER_TYPES = {
    'tele': session_handler
}

def obtain_curator_handler(channel: BlockingChannel):

    curator_notifier = curator_notifier_t(channel)

    def handle_curator_command(ch: BlockingChannel, method: DeliveryMode, properties: BasicProperties, body: bytes):
        data = json.loads(body)
        sessions = data.get('sessions')
        print('get someting')
        print(data)

        if not len(data):
            # TODO, maybe somhow limit it for happening only once per runtime
            print("requesting sessions")
            curator_notifier.request_sessions()

        if sessions:
            for entry in sessions:
                session_name = entry.get('session_name')
                type = entry.get('type')

                if get_session_store().get(session_name): continue


                print(os.path.exists(filename_from_session_name(session_name)))

                if not os.path.exists(filename_from_session_name(session_name)):
                    print("Ignoring session")
                    continue

                elif type in SESSION_HANDLER_TYPES:

                    handler = SESSION_HANDLER_TYPES[type]
                    get_session_store()[session_name] = handler(session_name, entry.get('user_id'))
                    get_session_store()[session_name].start()

        ch.basic_ack(method.delivery_tag)

    return handle_curator_command
