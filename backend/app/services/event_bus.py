import asyncio
from collections.abc import AsyncIterator
from dataclasses import dataclass
from datetime import UTC, datetime
from itertools import count


@dataclass(frozen=True)
class StreamEvent:
    id: str
    type: str
    occurred_at: datetime
    resource: str

    def as_payload(self) -> dict[str, str]:
        return {
            "id": self.id,
            "type": self.type,
            "occurredAt": self.occurred_at.isoformat(),
            "resource": self.resource,
        }


class EventBus:
    """Small in-process fan-out suitable only for the initial single-host phase."""

    def __init__(self) -> None:
        self._subscribers: set[asyncio.Queue[StreamEvent]] = set()
        self._sequence = count(1)

    async def publish(self, event_type: str, resource: str) -> StreamEvent:
        event = StreamEvent(
            id=str(next(self._sequence)),
            type=event_type,
            occurred_at=datetime.now(UTC),
            resource=resource,
        )
        for queue in tuple(self._subscribers):
            queue.put_nowait(event)
        return event

    async def subscribe(self) -> AsyncIterator[StreamEvent]:
        queue: asyncio.Queue[StreamEvent] = asyncio.Queue(maxsize=100)
        self._subscribers.add(queue)
        try:
            while True:
                yield await queue.get()
        finally:
            self._subscribers.discard(queue)


event_bus = EventBus()
