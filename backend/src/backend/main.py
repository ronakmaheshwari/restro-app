from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
from typing import Annotated
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from backend.core.database import SessionLocal, get_db
from backend.routers.router import router
from backend.core.scheduler import start_scheduler, stop_scheduler
from backend.core.redis import r

def main():
    uvicorn.run(
        "backend.main:app",
        port=8000,
        reload=True
    )

@asynccontextmanager
async def lifespan(app: FastAPI):
    start_scheduler()
    from backend.utils.menu_cache import refresh_menu_items
    await refresh_menu_items()
    try:
        yield
    finally:
        stop_scheduler()
        await r.aclose()

app = FastAPI(lifespan=lifespan)
db_session = Annotated[AsyncSession, Depends(get_db)]



app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET","POST","PATCH","PUT","OPTIONS","DELETE"],
    allow_headers=["*"]
)

app.include_router(
    router,
    prefix="/api/v1"
)

@app.get("/")
def get_hello():
    return {
        "success": True,
        "message": "Hello World! The server is running",
    }

@app.get("/health")
async def check_health(db:db_session):
    try:
        await db.execute(text("SELECT 1"))
    except Exception as e:
        return JSONResponse (
            content = {
                "success": False,
                "status": "error",
                "message": "Database unavailable",
                "error": str(e),
            },
            status_code=503
        )
    return {
        "success": True,
        "status": "ok",
        "message": "The server is healthy"
    }
