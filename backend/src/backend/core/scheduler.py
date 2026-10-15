
from zoneinfo import ZoneInfo
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from backend.utils.menu_cache import refresh_menu_items

scheduler = AsyncIOScheduler(timezone=ZoneInfo("Asia/Kolkata"))


def start_scheduler() -> None:
    scheduler.add_job(
        refresh_menu_items,
        trigger="cron",
        minute="*/5",
        id="refresh_menu_cache",
        replace_existing=True,
        max_instances=1,
        coalesce=True,
    )

    scheduler.start()


def stop_scheduler() -> None:
    if scheduler.running:
        scheduler.shutdown(wait=False)
