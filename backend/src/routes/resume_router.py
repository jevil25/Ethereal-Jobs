from typing import Optional
from fastapi import APIRouter
from fastapi.responses import JSONResponse
from src.api.extract_resume import get_ai_optimized_resume
from src.decorators.auth import is_user_logged_in
from src.db.mongo import DatabaseOperations
from src.logger import logger
from fastapi import Request, status
from src.db.model import AIResumeUpdate, ResumeUpdate, User, AiOptimzedResumeModel

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

@app.post("/ai/generate")
@is_user_logged_in
async def generate_resume(request: Request, data: AIResumeUpdate):
    is_main_resume = data.is_main_resume
    job_id = data.job_id
    user: User = request.state.user
    if not data.regenerate:
        ai_resume = await db_ops.get_ai_optimized_resume(user.email, is_main_resume, job_id)
        if ai_resume:
            return JSONResponse(content={"message": "AI optimized resume already exists", "extracted_data": ai_resume, "is_success": True}, media_type="application/json", status_code=200)
    resume = await db_ops.get_user_resume(user.email)
    if not resume:
        return JSONResponse(
            content={"message": "Resume not found", "no_resume_found": True, "is_success": False},
            media_type="application/json",
            status_code=200
        )
    ai_optimized_resume = await get_ai_optimized_resume(resume, is_main_resume, job_id)
    await db_ops.add_ai_optimized_resume(user.email, ai_optimized_resume, is_main_resume, job_id)
    return JSONResponse(content={"extracted_data": ai_optimized_resume, "is_success": True, "message": "New Ai resume generated"}, media_type="application/json", status_code=200)

@app.get("/ai/generate")
@is_user_logged_in
async def get_ai_resume(request: Request, is_main_resume: bool, job_id: Optional[str] = None):
    user: User = request.state.user
    ai_resume = await db_ops.get_ai_optimized_resume(user.email, is_main_resume, job_id)
    if not ai_resume:
        return JSONResponse(content={"message": "AI optimized resume not found", "is_success": False}, media_type="application/json", status_code=200)
    ai_resume = ai_resume.model_dump()
    fields_to_remove = ["id", "updatedAt", "createdAt"]
    for field in fields_to_remove:
        ai_resume.pop(field)
    return JSONResponse(content={"extracted_data": ai_resume, "is_success": True}, media_type="application/json", status_code=200)
