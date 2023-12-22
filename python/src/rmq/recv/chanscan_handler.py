import json
import os
from pika import BasicProperties, DeliveryMode
from pika.adapters.blocking_connection import BlockingChannel
from tg.handler import session_handler, enrolled_job
from tg.chanscan import scan_channel
from tg.pyro_chansan import pyro_scan_channel
from util.session_helpers import filename_from_session_name
from util.session_store import get_session_store

def obtain_chanscan_handler(channel: BlockingChannel):

    def handle(ch: BlockingChannel, method: DeliveryMode, properties: BasicProperties, body: bytes):
        data: dict = json.loads(body)
        identifier = data.get('identifier')
        session = data.get('session')
        log_id = data.get('log_id')

        if identifier and get_session_store().get(session) and not data.get('type'):
            handler: session_handler = get_session_store().get(session)
            job = dispatch_scan_job(handler.client_type())
            handler.job = enrolled_job(job, identifier = identifier, log_id = log_id)

        request_type = data.get('type')
        if request_type == 'remove_job':
            handler: session_handler = get_session_store().get(session)
            handler.job = None


        print(data)

        print("\n\n\n\n\n\n\n")

        ch.basic_ack(method.delivery_tag)

        # raise 'asdaskdaksd'

    return handle


def dispatch_scan_job(name):
    methods = {
        'tele': scan_channel,
        'pyro': pyro_scan_channel
    }
    return methods[name]
