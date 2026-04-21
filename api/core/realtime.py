import asyncio
from collections import defaultdict
from typing import Any
from uuid import UUID


class RealtimeHub:
    """Per-user pub/sub for working-session field changes.

    Every WebSocket client subscribes to exactly one user_id and receives
    events whenever a field on that user's WorkingSession is mutated.
    """

    def __init__(self) -> None:
        self._subscribers: dict[UUID, set[asyncio.Queue]] = defaultdict(set)

    def subscribe(self, user_id: UUID) -> asyncio.Queue:
        queue: asyncio.Queue = asyncio.Queue(maxsize=64)
        self._subscribers[user_id].add(queue)
        return queue

    def unsubscribe(self, user_id: UUID, queue: asyncio.Queue) -> None:
        listeners = self._subscribers.get(user_id)
        if listeners is None:
            return
        listeners.discard(queue)
        if not listeners:
            self._subscribers.pop(user_id, None)

    async def publish(self, user_id: UUID, event: dict[str, Any]) -> None:
        for queue in list(self._subscribers.get(user_id, ())):
            try:
                queue.put_nowait(event)
            except asyncio.QueueFull:
                pass


hub = RealtimeHub()
