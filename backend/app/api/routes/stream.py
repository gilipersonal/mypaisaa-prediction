import asyncio
import json
from collections.abc import AsyncIterator

from fastapi import APIRouter, Request
from sse_starlette.sse import EventSourceResponse, ServerSentEvent

from app.core.config import get_settings
from app.services.event_bus import event_bus

router = APIRouter(tags=["stream"])


@router.get("/stream")
async def stream(request: Request) -> EventSourceResponse:
    """Send minimal notifications; clients fetch durable records via normal APIs."""

    settings = get_settings()

    async def events() -> AsyncIterator[ServerSentEvent]:
        ready = await event_bus.publish("stream.ready", "/api/v1/health")
        yield ServerSentEvent(
            data=json.dumps(ready.as_payload()),
            event=ready.type,
            id=ready.id,
        )
        subscription = event_bus.subscribe()
        while not await request.is_disconnected():
            try:
                event = await asyncio.wait_for(
                    anext(subscription), timeout=settings.sse_heartbeat_seconds
                )
                yield ServerSentEvent(
                    data=json.dumps(event.as_payload()),
                    event=event.type,
                    id=event.id,
                )
            except TimeoutError:
                yield ServerSentEvent(comment="heartbeat")
        await subscription.aclose()

    return EventSourceResponse(events())
