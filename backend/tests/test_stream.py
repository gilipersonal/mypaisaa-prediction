import asyncio

import pytest

from app.services.event_bus import EventBus


@pytest.mark.asyncio
async def test_stream_events_are_minimal_and_reference_a_resource() -> None:
    bus = EventBus()
    subscription = bus.subscribe()
    waiting = asyncio.create_task(anext(subscription))
    await asyncio.sleep(0)

    published = await bus.publish("prediction.published", "/api/v1/predictions/pred_123")
    received = await waiting
    await subscription.aclose()

    assert received == published
    assert received.as_payload()["resource"] == "/api/v1/predictions/pred_123"
    assert "secret" not in str(received.as_payload()).lower()
