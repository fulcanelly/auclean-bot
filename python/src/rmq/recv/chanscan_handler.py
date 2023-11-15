import json
import os
from pika import BasicProperties, DeliveryMode
from pika.adapters.blocking_connection import BlockingChannel
from tg.handler import session_handler, enrolled_job
from tg.chanscan import scan_channel

from util.session_helpers import filename_from_session_name
from util.session_store import get_session_store


def obtain_chanscan_handler(channel: BlockingChannel):

    def handle(ch: BlockingChannel, method: DeliveryMode, properties: BasicProperties, body: bytes):
        data: dict = json.loads(body)
        identifier = data.get('identifier')
        session = data.get('session')


        if identifier and get_session_store().get(session):
            handler: session_handler = get_session_store().get(session)
            handler.job = enrolled_job(scan_channel, identifier = identifier)
            90
        print(data)

        print("\n\n\n\n\n\n\n")

        ch.basic_ack(method.delivery_tag)

        # raise 'asdaskdaksd'

    return handle


