
import os


api_id = os.getenv('TG_API_ID')
api_hash = os.getenv('TG_API_HASH')


def get_api_id(): return api_id

def get_api_hash(): return api_hash
