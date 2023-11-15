from telethon import TelegramClient
from tg.handler import session_handler
import pprint
from telethon.tl.types import Message
from telethon.functions import channels
pp = pprint.PrettyPrinter(indent=2)


class idk:
    def send_channel():
        pass

    def send_post():
        pass

    def send_comment():
        pass

    def send_done():
        pass


async def get_subs_count(client: TelegramClient, chan):
    result = await client(channels.GetFullChannelRequest(chan))
    return result.full_chat.participants_count

async def scan_channel(handler: session_handler, identifier: str):
    client = handler.client
    chan = await client.get_entity(identifier)
    pp.pprint(chan.to_dict())
    result = await get_subs_count(client, chan)

    client
    async for m in client.iter_messages(chan, limit=2):
        m: Message = m

        m.grouped_id
        m.post_author
        pp.pprint(m.to_dict())



        #m.replies.replies
        print(m.replies)
        print("REPLS")

        #  m.id:
        return

        async for m in client.iter_messages(chan, reply_to=m.id): #ONLY THIS WORKIGN
            pp.pprint(m.to_dict())
        print("DONE\n\n\n")

        m.fwd_from # ?.channel_id, channel_post - id , post_author - name



