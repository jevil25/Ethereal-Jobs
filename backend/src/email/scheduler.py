from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from src.email.reminder_service import check_and_send_reminders
from fastapi import FastAPI

scheduler = AsyncIOScheduler()

def setup_scheduler(app: FastAPI):
    # Run at 9 AM every day
    scheduler.add_job(
        check_and_send_reminders,
        CronTrigger(hour=21, minute=13, timezone='Asia/Kolkata'),
        id="reminder_emails",
        name="Send reminder emails",
        replace_existing=True
    )
    
    @app.on_event("startup")
    async def start_scheduler():
        scheduler.start()
    
    @app.on_event("shutdown")
    async def shutdown_scheduler():
        scheduler.shutdown()
