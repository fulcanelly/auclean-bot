import json
import pyrogram
import pyrogram.errors
from telethon import TelegramClient
from util.auto_ensure import AutoChanEnsurer
from tg.chanscan import chanscan_notifier_t, rmq_json_notifier
from tg.handler import session_handler
import pprint
from telethon.tl.types import Message
from telethon.hints import Entity
from telethon.functions import channels
from pika.adapters.blocking_connection import BlockingChannel
from datetime import datetime
from pyrogram import Client


def extract_fwd_from_msg(m: pyrogram.types.Message):
    if m.forward_from_chat and m.forward_from_chat.type == pyrogram.enums.ChatType.CHANNEL:
        return {
            'fwd_from_channel': {
                'channel_post_id': m.forward_from_message_id,
                'channel_id': m.forward_from_chat.id,
                'username': m.forward_from_chat.username,
                'title': m.forward_from_chat.title,
                'date': m.forward_date.timestamp(),
            }
        }

    if m.forward_from:
        return {
            'fwd_from_user': {
                'date': m.forward_date.timestamp(),
                'user_id': m.forward_from.id
                #TODO: much more data avaliable, username, name, etc
           }
        }


    #TODO anon forwards
    return {}


class chanscan_notifier_pyro_t(rmq_json_notifier):

    def __init__(self, channel, log_id) -> None:
        super().__init__(channel, 'py:chanscan:reply')
        self.log_id = log_id

    def shared_props(self):
        return {
            'log_id': self.log_id
        }

    def send_start(self):
        self.notify_direct({
            **self.shared_props(),
            'type': 'start_event'
        })


    def send_finish(self):
        self.notify_direct({
            **self.shared_props(),
            'type': 'finish_event'
        })

    def send_channel(self, obj: pyrogram.types.Chat):
        keep = ['id', 'title', 'username']

        self.notify_direct({
            **__class__.filter_by_kyes(obj.__dict__, keep),
            'subs': obj.members_count,
            'type': 'channel',
            **self.shared_props()
        })

    def send_post(self, obj: pyrogram.types.Message, chan_id):
        keep = ['id', 'views']
        mapped = {
            'grouped_id': obj.media_group_id,
            'post_author': obj.author_signature,
            'date': obj.date.timestamp(),
        }
        self.notify_direct({
            **extract_fwd_from_msg(obj),
            **__class__.filter_by_kyes(obj.__dict__, keep),
            **mapped,
            'channel_id': chan_id,
            'type': 'post',
            **self.shared_props()
        })

    def send_comment(self, msg: pyrogram.types.Message, chan_id: int, post_id: int):
        #  todo

        comment_to = {
            'channel_id': chan_id,
            'message_id': post_id
        }

        filter_by_keys =  __class__.filter_by_kyes
        author_keys = ['id', 'username', 'first_name', 'last_name']
        author_info = filter_by_keys(msg.from_user.__dict__, author_keys) if msg.from_user else None

        sender_chat_keys = ['id', 'title',]
        sender_chat_info = filter_by_keys(msg.sender_chat.__dict__, sender_chat_keys) if msg.sender_chat else None

        message_keys = ['id', 'media_group_id', 'reply_to_message_id']
        message_info = filter_by_keys(msg.__dict__, message_keys)

        discussion_keys = ['id', 'title']
        discussion_chat = filter_by_keys(msg.chat.__dict__, discussion_keys)

        self.notify_direct({
            **message_info,
            'comment_to': comment_to,
            'author': author_info,
            'sender_chat': sender_chat_info,
            'date': msg.date.timestamp(),
            'discussion_chat': discussion_chat,
            'type': 'comment',
            **self.shared_props()
        })

# Example usage in

async def get_chan_subs(app: Client, chat_id: str | int):
    await app.get_chat_members_count(chat_id)

async def pyro_scan_channel(handler: session_handler, identifier: str, log_id: str):
    chat = await handler.client.get_chat(identifier)

    with AutoChanEnsurer(handler.ensured_channel, chanscan_notifier_pyro_t, log_id) as it:
        it.send_start()
        it.send_channel(chat)

        async for message in handler.client.get_chat_history(chat.id, limit=30):
            message: pyrogram.types.Message = message
            it.send_post(message, chat.id)

            await gather_comments(chat, message, handler.client, it)


        it.send_finish()

async def gather_comments(chat: pyrogram.types.Chat, message: pyrogram.types.Message, client: pyrogram.client.Client, it: chanscan_notifier_pyro_t):
    print({
        'chat_id': chat.id,
        'message_id': message.id
    })
    if not chat.linked_chat:
        return

    try:
        async for comment in client.get_discussion_replies(chat.id, message.id):
            it.send_comment(comment, chat.id, message.id)

    except pyrogram.errors.exceptions.bad_request_400.MsgIdInvalid as e:
        pass
