from fastapi import APIRouter
from backend.routers.user_router import user_router
from typing import TypedDict


class RouterConfig(TypedDict):
    path: str
    router: APIRouter

router = APIRouter()

all_routers: list[RouterConfig] = [
    {
        "path": "/auth",
        "router": user_router,
    }
]

for x in all_routers:
    router.include_router(
        x["router"],
        prefix=x["path"],
    )