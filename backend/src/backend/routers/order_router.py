from fastapi import APIRouter, Depends, status
from fastapi.responses import JSONResponse
from typing import Annotated
from backend.models.order import Order,OrderItem,OrderStatus
from backend.core.database import get_db
from backend.utils.auth.dependancy import get_current_user
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

order_router = APIRouter()
db_session = Annotated[AsyncSession, Depends(get_db)]
