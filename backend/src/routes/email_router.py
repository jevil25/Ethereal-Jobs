from fastapi import APIRouter, HTTPException
from src.db.model.email_model import EmailPreferences
from datetime import datetime

router = APIRouter()

@router.get("/unsubscribe")
async def unsubscribe_email(token: str, type: str):
    # Find preferences by token
    prefs = await EmailPreferences.find_one({"unsubscribe_token": token})
    if not prefs:
        raise HTTPException(status_code=404, detail="Invalid unsubscribe link")
    
    # Add email type to unsubscribed list if not already there
    if type not in prefs.unsubscribed_from:
        prefs.unsubscribed_from.append(type)
        prefs.updated_at = datetime.utcnow()
        await prefs.save()
    
    return {
        "message": f"Successfully unsubscribed from {type} emails",
        "status": "success"
    }
