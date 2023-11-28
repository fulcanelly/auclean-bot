import json
from telethon import TelegramClient
from tg.handler import session_handler
import pprint
from telethon.tl.types import Message
from telethon.hints import Entity
from telethon.functions import channels
from pika.adapters.blocking_connection import BlockingChannel
from datetime import datetime
#KNOWN FLAG

pp = pprint.PrettyPrinter(indent=2)

class rmq_json_notifier:
    def __init__(self, channel: BlockingChannel, queue: str) -> None:
        self.channel = channel
        self.queue = queue

    def notify_direct(self, body):
        self.channel.basic_publish(
            exchange='',
            routing_key=self.queue,
            body=json.dumps(body))

    def notifty_direct_by_keys(self, obj, keys):
        self.notify_direct(self.filter_by_kyes(obj, keys))

    def filter_by_kyes(dict_, keep):
        if not isinstance(dict_, dict):
            dict_ = dict_.to_dict()

        return {
            k: dict_[k] for k in keep if k in dict_}


class chanscan_notifier_t(rmq_json_notifier):

    def __init__(self, channel) -> None:
        super().__init__(channel, 'py:chanscan:reply')

    def send_channel(self, obj: Entity, subs: int):
        # if not isinstance(dict_, dict):
        #     dict_ = dict_.to_dict()
        keep = ['id', 'title', 'username']

        self.notify_direct({
            **__class__.filter_by_kyes(obj, keep),
            'subs': subs,
            'date': obj.date.timestamp(),

            'type': 'channel'
        })


    def send_post(self, obj: Message, chan_id):
        keep = ['id', 'grouped_id', 'views', 'post_author']

        self.notify_direct({
            **extract_fwd_from_msg(obj),
            **__class__.filter_by_kyes(obj, keep),
            'date': obj.date.timestamp(),

            'channel_id': chan_id,
            'type': 'post',
        })

    def send_comment():
        pass

    def send_done():
        pass

def extract_fwd_from_msg(m):
    if m.fwd_from and m.fwd_from.channel_post:
        return {
            'fwd_from_channel': {
                'channel_post_id': m.fwd_from.channel_post,
                'channel_id': m.fwd_from.from_id.channel_id,
                'post_author': m.post_author,
                'date': m.fwd_from.date.timestamp(),
            }
        }

    if m.fwd_from and m.fwd_from.from_id and m.fwd_from.from_id.user_id:
        return {
            'fwd_from_user': {
                'date': m.fwd_from.date.timestamp(),
                'user_id': m.fwd_from.from_id.user_id
           }
        }

    return {}


async def get_subs_count(client: TelegramClient, chan):
    result = await client(channels.GetFullChannelRequest(chan))
    return result.full_chat.participants_count



# group by group id
async def scan_channel(handler: session_handler, identifier: str):
    client = handler.client
    chan = await client.get_entity(identifier)
    # pp.pprint(chan.to_dict())

    subs = await get_subs_count(client, chan)

    with handler.ensured_channel as ch:
        chanscan_notifier_t(ch).send_channel(chan, subs)
    #     pass


    current_group_id = None
    current_group = []

    async for m in client.iter_messages(chan):
        message: Message = m

        # m.grouped_id
        # m.views
        # m.fwd_from # ?.channel_id, channel_post - id , post_author - name
        # m.post_author
        # m.date
        # pp.pprint(m.to_dict())

        with handler.ensured_channel as ch:
            chanscan_notifier_t(ch).send_post(m, chan.id)

        # if m.fwd_from and m.fwd_from.channel_post:
        #     channel_post
        #     from_id
        #     pass

        # if m.fwd_from and m.fwd_from.from_name:
        #     from_name

        # if m.replies and m.replies.replies != 0:
        #     pass

        # pp.pprint(m.to_dict())


    print('done')
    return


async def scan_post_comments(client: TelegramClient, chan, mid):
    async for m in client.iter_messages(chan, reply_to=mid): #ONLY THIS WORKIGN
        pp.pprint(m.to_dict())

    #     if message.grouped_id:
    #         if message.grouped_id != current_group_id and current_group:
    #             with handler.ensured_channel as chan:

    #                 chanscan_notifier_t(chan)
    #                 #send_grouped_messages_as_array(current_group)
    #             current_group = []

    #         current_group.append(message)
    #         current_group_id = message.grouped_id
    #     else:
    #         with handler.ensured_channel as chan: pass

    # if current_group:
    #     with handler.ensured_channel as chan: chanscan_notifier_t(chan)
    #     # send_grouped_messages_as_array(current_group)

    #     # process([m])

    #     m.post_author



    #     #m.replies.replies
    #     print(m.replies)
    #     print("REPLS")

    #     #  m.id:
    #     return

    #     async for m in client.iter_messages(chan, reply_to=m.id): #ONLY THIS WORKIGN
    #         pp.pprint(m.to_dict())
    #     print("DONE\n\n\n")





