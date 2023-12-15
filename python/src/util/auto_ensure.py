from typing import TypeVar, Generic, Type, Callable
import pika

import sentry_sdk

from rmq.rmq import get_new_channel

T = TypeVar('T')  # Generic type for the notifier class


class EnsuredPikaChannel:
    def __init__(self) -> None:
        self.channel = get_new_channel()

    def __enter__(self) -> pika.BlockingConnection:
        print('ensuring connection')
        if self.channel.is_open:
            return self.channel
        else:
            sentry_sdk.capture_message('reopening connection')
            print('reopening connection')
            self.channel = get_new_channel()
            return self.channel


    def __exit__(self, exc_type, exc_value, traceback):
        print('done')


class AutoChanEnsurer(Generic[T]):
    def __init__(self, handler: EnsuredPikaChannel, notifier_class: Type[T], *args):
        self.handler = handler
        self.notifier_class = notifier_class
        self.args = args

    def __enter__(self) -> Type[T]:
        return self

    def __getattr__(self, item):
        def wrapper(*args, **kwargs):
            with self.handler as ch:
                notifier = self.notifier_class(ch, *self.args)
                method = getattr(notifier, item)
                return method(*args, **kwargs)
        return wrapper

    def __exit__(self, exc_type, exc_value, traceback):
        pass
