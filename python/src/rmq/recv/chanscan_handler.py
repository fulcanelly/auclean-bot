import asyncio
import json
import os
from pika import BasicProperties, DeliveryMode
from pika.adapters.blocking_connection import BlockingChannel
from rmq.send.curator import curator_notifier_t
from util.auto_ensure import EnsuredPikaChannel
from tg.handler import session_handler, enrolled_job
from tg.chanscan import scan_channel
from tg.pyro_chansan import pyro_scan_channel, recent_scan_channel
from util.session_helpers import filename_from_session_name
from util.session_store import get_session_store


def hanscan_handler(ch: BlockingChannel, method: DeliveryMode, properties: BasicProperties, body: bytes):
    ch.basic_ack(method.delivery_tag)
    data: dict = json.loads(body)
    print(data)

    identifier = data.get('identifier')
    session = data.get('session')
    log_id = data.get('log_id')
    request_type = data.get('type')

    handler: session_handler = get_session_store().get(session)

    if not handler:
        with EnsuredPikaChannel() as ch:
            return curator_notifier_t(ch).request_sessions()

    if request_type == 'full_scan':
        job = dispatch_scan_job(handler.client_type())
        handler.job = enrolled_job(job, identifier = identifier, log_id = log_id)

    if request_type == 'remove_job':
        handler.job = None
        handler.kill()

    if request_type == 'test_load':
        handler.job = enrolled_job(test_load)

    if request_type == 'recent_scan':
        recent_scan_channel
        handler.job = enrolled_job(recent_scan_channel, identifier = identifier, log_id = log_id, days = data.get('days'))

    print("\n\n\n\n\n\n\n")


def dispatch_scan_job(name):
    methods = {
        'tele': scan_channel,
        'pyro': pyro_scan_channel
    }
    return methods[name]


async def test_load(handler: session_handler):
    while True:
        await asyncio.sleep(2)
        print(f"test load!! {handler.client_type()}")
