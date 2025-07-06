from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
from src.decorators.auth import is_user_admin
from src.db.mongo import DatabaseOperations


app = APIRouter(prefix="/admin")
db_ops = DatabaseOperations()

@app.get("/user-count")
async def get_user_count():
    """Get the total number of registered users - public endpoint"""
    try:
        user_count = await db_ops.get_user_count()
        return JSONResponse(content={"count": user_count})
    except Exception as e:
        return JSONResponse(content={"count": 15000}, status_code=500)  # Fallback to hardcoded value

@app.get("/users")
@is_user_admin
async def get_users(request: Request):
    users = await db_ops.get_users()
    users = [user.model_dump() for user in users]
    fields_to_remove = ["id", "password"]
    for user in users:
        for field in fields_to_remove:
            user.pop(field)
        user["createdAt"] = str(user["createdAt"])
        user["updatedAt"] = str(user["updatedAt"])
    return JSONResponse(content=users)

@app.get("/usage-stats")
@is_user_admin
async def get_usage_stats(request: Request):
    stats = await db_ops.get_usage_stats()
    stats = [stat.model_dump() for stat in stats]
    fields_to_remove = ["id"]
    for stat in stats:
        for field in fields_to_remove:
            stat.pop(field)
        stat["timeStamps"] = [str(ts) for ts in stat["timeStamps"]]
        stat["createdAt"] = str(stat["createdAt"])
        stat["updatedAt"] = str(stat["updatedAt"])
    return JSONResponse(content=stats)

@app.get("/feedback")
@is_user_admin
async def get_feedback(request: Request):
    feedback = await db_ops.get_feedback()
    feedback = [feed.model_dump() for feed in feedback]
    fields_to_remove = ["id"]
    for feed in feedback:
        for field in fields_to_remove:
            feed.pop(field)
        feed["createdAt"] = str(feed["createdAt"])
        feed["updatedAt"] = str(feed["updatedAt"])
    return JSONResponse(content=feedback)

