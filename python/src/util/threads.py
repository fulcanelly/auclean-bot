
import asyncio


class semaphore_sort_of:
    def __init__(self) -> None:
        self.data = None

    def set_data(self, data):
        self.data = data

    async def get(self):
        while True:
            if self.data:
                return self.data
            else:
                await asyncio.sleep(0.1)
