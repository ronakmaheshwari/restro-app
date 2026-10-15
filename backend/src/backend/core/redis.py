import redis.asyncio as redis
from backend.core.config import settings

r = redis.Redis(
    host=settings.redis_host,
    port=settings.redis_port,
    password=settings.redis_password,
    db=0,
    decode_responses=True,
)
