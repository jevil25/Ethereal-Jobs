from datetime import datetime
from typing import Optional
from beanie import Document
from pydantic import BaseModel

class EmailTracking(Document):
    user_id: str
    email: str
    email_type: str  # 'verification', 'reminder', etc.
    sent_at: datetime
    reminder_count: int = 0
    unsubscribed: bool = False
    unsubscribe_token: str
    
    class Settings:
        name = "email_tracking"
        
class EmailPreferences(Document):
    user_id: str
    email: str
    unsubscribed_from: list[str] = []  # Types of emails user has unsubscribed from
    unsubscribe_token: str
    updated_at: datetime
    
    class Settings:
        name = "email_preferences"
