from fastapi import APIRouter
from backend.routers.user_router import user_router
from backend.routers.menu_router import menu_router
from backend.routers.order_router import order_router
from typing import TypedDict


class RouterConfig(TypedDict):
    path: str
    router: APIRouter
    tags: list[str]

router = APIRouter()

all_routers: list[RouterConfig] = [
    {
        "path": "/auth",
        "router": user_router,
        "tags": ["user"]
    },
    {
        "path": "/menu",
        "router": menu_router,
        "tags": ["menu"]
    },
    {
        "path": "/orders",
        "router": order_router,
        "tags": ["orders"]
    }
]

for x in all_routers:
    router.include_router(
        x["router"],
        prefix=x["path"],
        tags=x["tags"]
    )