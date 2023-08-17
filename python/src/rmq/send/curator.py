from datetime import datetime
import json
from pika.adapters.blocking_connection import BlockingChannel

class curator_notifier_t:

    def __init__(self, channel) -> None:
        self.channel: BlockingChannel = channel

    def notify_success_login(self, user_id, session_name, linked_to = None) -> None:
        self.channel.basic_publish(exchange='',
            routing_key= 'curator:event',
            body= json.dumps({
                'event': 'login_success',
                'login_success': {
                    'user_id': str(user_id),
                    'session_name': session_name,
                    'linked_to': linked_to
                }
            }))

    def request_sessions(self) -> None:
        self.channel.basic_publish(exchange='',
            routing_key= 'curator:event',
            body= json.dumps({
                'event': 'request_session',
            }))

    def notify_online_status(self, online_of_user_id, reported_by_user_id, online, name) -> None:
        self.channel.basic_publish(exchange='',
            routing_key= 'curator:event',
            body= json.dumps({
                'event': 'online_status',
                'online_status': {
                    'subject_user_id': str(online_of_user_id),
                    'reporter_user_id': str(reported_by_user_id),
                    'online': online,
                    'date': str(datetime.now()),
                    'name': name
                }
            }))
