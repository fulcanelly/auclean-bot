
import asyncio
from tg.loginer import user_loginer
from pyrogram import Client
from pyrogram.errors import SessionPasswordNeeded, PhoneCodeInvalid, PasswordHashInvalid
import pyrogram.errors

from util.session_helpers import sesion_by_phone_and_phone
from util.session_store import get_session_store
from util.vars import get_api_hash, get_api_id

def pyro_session_name_by_phone(phone: str):
    return f"pyro-{sesion_by_phone_and_phone(None, phone)}"

async def login_pyro(client: Client, phone_number: str, code_func, fact_func):
    sent_code_info = await client.send_code(phone_number)
    phone_code = await code_func()

    try:
        await client.sign_in(phone_number, sent_code_info.phone_code_hash, phone_code)
    except PhoneCodeInvalid:
        print("Invalid phone code.")
        return False
    except SessionPasswordNeeded:
        password = await fact_func()
        try:
            await client.check_password(password)
        except PasswordHashInvalid:
            print("Invalid password.")
            return False
    return True


async def is_authorized(client: Client):
    try:
        await client.get_me()
        return True
    except pyrogram.errors.exceptions.unauthorized_401.AuthKeyUnregistered:
        return False


class pyrogram_user_loginer(user_loginer):
    def login_user(self):
        asyncio.set_event_loop(asyncio.new_event_loop())

        session_name = pyro_session_name_by_phone(self.phone)

        print(get_session_store())
        old_client = get_session_store().get(session_name)

        client = None

        if old_client:
            client = old_client.client
            print("OLD CLIENT RUNNING")
            # asyncio.set_event_loop(
                #TODO
            return
        else:
            client = Client(session_name, get_api_id(), get_api_hash(), workdir='./')

        async def login():
            try:
                await client.connect()

                if not await is_authorized(client):
                    if await login_pyro(
                        client,
                        self.phone,
                        code_func=self.obtain_code,
                        fact_func=self.obtain_password
                    ): self.notify_ok(session_name, 'pyro')

            finally:
                await client.disconnect()
                # TODO don't seems to be enough
                client.loop.stop()


        asyncio.run(login())
