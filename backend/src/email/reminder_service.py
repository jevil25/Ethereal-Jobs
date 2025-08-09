from datetime import datetime, timedelta
import uuid
from src.utils.hashing import Hash
from src.db.mongo import DatabaseOperations
from src.db.model import User
from src.email.email_sender import send_reminder_email as remainder_email_sender

db_ops = DatabaseOperations()

REMINDER_SCHEDULE = [
    {"days": 3, "subject": "Complete Your Profile on Ethereal Jobs"},
    {"days": 7, "subject": "Don't Miss Out on AI-Powered Job Matching"},
    {"days": 14, "subject": "Final Reminder: Activate Your Ethereal Jobs Account"}
]

async def generate_unsubscribe_token(user_id: str, email: str) -> str:
    # Check if user already has preferences
    prefs = await db_ops.get_email_preferences(user_id)
    if not prefs:
        token = str(uuid.uuid4())
        await db_ops.create_email_preferences(user_id, email, token)
        return token
    return prefs.unsubscribe_token

async def send_reminder_email(user: User, reminder_count: int):
    try:
        # Check if user is unsubscribed
        prefs = await db_ops.get_email_preferences(str(user.id))
        if prefs and "reminder" in prefs.unsubscribed_from:
            return False

        # Generate or get unsubscribe token
        unsubscribe_token = await generate_unsubscribe_token(str(user.id), user.email)
        
        reminder = REMINDER_SCHEDULE[reminder_count]
        
        token = Hash.generate_random_unique_string()
        # Send email using email_sender service
        success = remainder_email_sender(
            email=user.email,
            name=user.name,
            verification_token=token,
            unsubscribe_token=unsubscribe_token,
            subject=reminder["subject"]
        )
        await db_ops.add_verification_token(user.email, token, (datetime.now() + timedelta(hours=7*24)).strftime("%Y-%m-%d %H:%M:%S"))
        
        if success:
            # Track email sent
            await db_ops.create_email_tracking(
                user_id=str(user.id),
                email=user.email,
                email_type="reminder",
                reminder_count=reminder_count,
                unsubscribe_token=unsubscribe_token
            )
        
        return success
    except Exception as e:
        print(f"Error sending reminder email: {e}")
        return False

async def check_and_send_reminders():
    now = datetime.utcnow()
    # Find users who haven't completed onboarding
    incomplete_users = await db_ops.get_incomplete_users()

    for user in incomplete_users:
        # Get last reminder sent
        last_reminder = await db_ops.get_last_reminder(str(user.id))
        
        reminder_count = 0 if not last_reminder else last_reminder.reminder_count + 1
        
        # Check if we should send next reminder
        if reminder_count >= len(REMINDER_SCHEDULE):
            continue
            
        if last_reminder:
            days_since_last = (now - last_reminder.sent_at).days
            if days_since_last < REMINDER_SCHEDULE[reminder_count]["days"]:
                continue
        print(f"Sending reminder {reminder_count} to {user.email}")
        await send_reminder_email(user, reminder_count)
