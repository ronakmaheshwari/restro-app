import redis
from backend.core.config import settings

r = redis.Redis(host={settings.redis_host}, port={settings.redis_port}, db=0)

try:
    if r.ping():
        print("Connected to Redis successfully!")
except redis.ConnectionError:
    print("Could not connect to Redis server.")