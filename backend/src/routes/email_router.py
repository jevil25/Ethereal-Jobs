from fastapi import APIRouter, HTTPException
from src.db.email_model import EmailPreferences
from datetime import datetime

router = APIRouter()

@router.post("/unsubscribe/{token}")
async def unsubscribe_email(token: str, type: str):
    # Find preferences by token
    prefs = await EmailPreferences.find_one({"unsubscribe_token": token})
    if not prefs:
        return {
            "message": "Invalid unsubscribe link",
            "is_valid": False,
            "is_expired": False
        }
    
    # Add email type to unsubscribed list if not already there
    if type not in prefs.unsubscribed_from:
        prefs.unsubscribed_from.append(type)
        prefs.updated_at = datetime.utcnow()
        await prefs.save()
    
    return {
        "message": "Successfully unsubscribed from emails",
        "is_valid": True,
        "is_expired": False
    }
