from datetime import datetime, timedelta
import uuid
from src.utils.hashing import Hash
from src.db.mongo import DatabaseOperations
from src.db.model import User
from src.email.email_sender import (
    send_reminder_email as remainder_email_sender,
    send_onboarding_reminder_email
)

db_ops = DatabaseOperations()

VERIFICATION_REMINDER_SCHEDULE = [
    {"days": 3, "subject": "Verify Your Email on Ethereal Jobs"},
    {"days": 7, "subject": "Don't Miss Out on AI-Powered Job Matching"},
    {"days": 14, "subject": "Final Reminder: Activate Your Ethereal Jobs Account"}
]

ONBOARDING_REMINDER_SCHEDULE = [
    {"days": 2, "subject": "Complete Your Profile to Access AI Features"},
    {"days": 5, "subject": "Unlock Advanced Job Search Features"},
    {"days": 10, "subject": "Final Reminder: Complete Your Profile Setup"}
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
        
        reminder = VERIFICATION_REMINDER_SCHEDULE[reminder_count]
        
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
    try:
        # Get all unverified users
        users = await db_ops.get_unverified_users()
        
        for user in users:
            reminder_count = 0
            if hasattr(user, 'reminder_count'):
                reminder_count = user.reminder_count
            if reminder_count >= len(VERIFICATION_REMINDER_SCHEDULE):
                continue

            # Check if enough time has passed since last reminder
            last_reminder = user.createdAt
            if hasattr(user, 'last_reminder'):
                last_reminder = user.last_reminder
            days_since_last = (datetime.utcnow() - last_reminder).days
            
            reminder = VERIFICATION_REMINDER_SCHEDULE[reminder_count]
            if days_since_last < reminder["days"]:
                continue

            # Send reminder email
            success = await send_reminder_email(user, reminder_count)
            
            if success:
                # Update reminder count and time
                await db_ops.update_reminder_status(
                    user.email,
                    reminder_count + 1,
                    datetime.utcnow()
                )

    except Exception as e:
        print(f"Error in check_and_send_reminders: {e}")
        
    # Handle onboarding reminders after verification reminders
    await check_onboarding_reminders()

async def check_onboarding_reminders():
    # Get verified but not onboarded users
    users = await db_ops.get_verified_not_onboarded_users()
    
    for user in users:
        reminder_count = 0
        if hasattr(user, 'onboarding_reminder_count'):
            reminder_count = user.onboarding_reminder_count
        if reminder_count >= len(ONBOARDING_REMINDER_SCHEDULE):
            continue

        last_reminder = user.createdAt
        if hasattr(user, 'last_onboarding_reminder'):
            last_reminder = user.last_onboarding_reminder
        days_since_last = (datetime.utcnow() - last_reminder).days

        if days_since_last < ONBOARDING_REMINDER_SCHEDULE[reminder_count]["days"]:
            continue

        # Generate unsubscribe token
        unsubscribe_token = await generate_unsubscribe_token(str(user.id), user.email)
        
        # Send reminder email
        reminder = ONBOARDING_REMINDER_SCHEDULE[reminder_count]
        send_onboarding_reminder_email(
            email=user.email,
            name=user.name,
            unsubscribe_token=unsubscribe_token
        )

        # Update user reminder status
        await db_ops.update_onboarding_reminder_status(
            user.email,
            reminder_count + 1,
            datetime.utcnow()
        )
