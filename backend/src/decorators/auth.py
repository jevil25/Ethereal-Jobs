from fastapi import Request, HTTPException
from src.utils.jwttoken import verify_token
from src.db.mongo import DatabaseOperations
from functools import wraps

db_ops = DatabaseOperations()

def is_user_logged_in(func):
    """Decorator to check if user is logged in."""
    @wraps(func)
    async def wrapper(request: Request, *args, **kwargs):
        if "access_token" not in request.cookies:
            raise HTTPException(status_code=200, detail="User not logged in")
        
        access_token = request.cookies["access_token"]
        token_data = verify_token(access_token)
        
        if token_data.is_expired:
            raise HTTPException(status_code=200, detail="Token expired")
        
        if not token_data.is_valid:
            raise HTTPException(status_code=200, detail="Invalid token")
        
        user = await db_ops.get_user(token_data.email)
        if not user:
            raise HTTPException(status_code=200, detail="User does not exist")
        user.password = None
        request.state.user = user
        return await func(request, *args, **kwargs)
    
    return wrapper
