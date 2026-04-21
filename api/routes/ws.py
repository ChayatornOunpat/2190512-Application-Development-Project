import asyncio
import json

import jwt
from quart import Blueprint, websocket

from core.realtime import hub
from core.security import decode_token


bp = Blueprint("ws", __name__)


@bp.websocket("/ws")
async def ws():
    token = websocket.args.get("token")
    if not token:
        await websocket.close(1008, "missing_token")
        return
    try:
        user_id = decode_token(token)
    except jwt.PyJWTError:
        await websocket.close(1008, "invalid_token")
        return

    queue = hub.subscribe(user_id)
    try:
        while True:
            event = await queue.get()
            await websocket.send(json.dumps(event))
    except asyncio.CancelledError:
        raise
    finally:
        hub.unsubscribe(user_id, queue)
