import time
import os
import redis
from fastapi import Request, HTTPException
from app.core.config import settings

_redis_client = None

def get_redis():
    global _redis_client
    if _redis_client is None and settings.REDIS_URL:
        _redis_client = redis.Redis.from_url(settings.REDIS_URL, decode_responses=True)
    return _redis_client

async def rate_limit(request: Request):
    """Very simple IP-based sliding window limiter via Redis.
    Uses RATE_LIMIT_MAX_REQUESTS per RATE_LIMIT_WINDOW_SECONDS.
    Attach as dependency to sensitive routes.
    """
    if not settings.REDIS_URL:
        return  # disabled

    client = get_redis()
    if client is None:
        return

    window = int(settings.RATE_LIMIT_WINDOW_SECONDS or 60)
    max_req = int(settings.RATE_LIMIT_MAX_REQUESTS or 60)

    ip = request.client.host if request.client else "unknown"
    key = f"rl:{ip}:{int(time.time()//window)}"
    try:
        current = client.incr(key)
        if current == 1:
            client.expire(key, window)
        if current > max_req:
            raise HTTPException(status_code=429, detail="Rate limit exceeded. Try again later.")
    except redis.RedisError:
        # fail open
        return
