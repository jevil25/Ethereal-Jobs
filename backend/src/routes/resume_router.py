from fastapi import APIRouter
from fastapi.responses import JSONResponse
from src.decorators.auth import is_user_logged_in
from src.db.mongo import DatabaseOperations
from src.logger import logger
from fastapi import Request, status
from src.db.model import ResumeUpdate, User

app = APIRouter(prefix="/resume")
db_ops = DatabaseOperations()

@app.get("/")
@is_user_logged_in
async def get_resume(request: Request):
    email = request.state.user.email
    logger.info(f"Getting resume {email}")
    resume = await db_ops.get_user_resume(email)
    if not resume:
        return JSONResponse(
            content={"message": "Resume not found", "no_resume_found": True},
            media_type="application/json",
            status_code=200
        )
    
    resume_dict = resume.model_dump()
    fields_to_remove = ["id", "updatedAt", "createdAt"]
    for field in fields_to_remove:
        resume_dict.pop(field)
    return JSONResponse(content=resume_dict, media_type="application/json")

@app.post("/")
@is_user_logged_in
async def update_onboarding(request: Request, data: ResumeUpdate):
    user: User = request.state.user
    await db_ops.update_onboarding_status(user.email, data, data.is_onboarded)
    return JSONResponse(content={"message": "Onboarding status updated", "is_updated": True}, status_code=status.HTTP_200_OK)
