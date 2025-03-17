from typing import Optional
from fastapi import APIRouter
from fastapi.responses import JSONResponse, Response
from fastapi.templating import Jinja2Templates
from src.utils.helpers import get_templates
from src.api.extract_resume import get_ai_optimized_resume
from src.decorators.auth import is_user_logged_in
from src.db.mongo import DatabaseOperations
from src.logger import logger
from fastapi import Request, status
from src.db.model import AIResumeSave, AIResumeUpdate, ResumeUpdate, User, DownloadResume
from weasyprint import HTML
import os

app = APIRouter(prefix="/resume")
db_ops = DatabaseOperations()
templates = Jinja2Templates(directory=os.path.join(os.getcwd(),"src/templates"))

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
            fields_to_remove = ["id", "updatedAt", "createdAt"]
            ai_resume = ai_resume.model_dump()
            for field in fields_to_remove:
                ai_resume.pop(field)
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

@app.post("/ai/update")
@is_user_logged_in
async def update_ai_resume(request: Request, data: AIResumeSave):
    user: User = request.state.user
    if data.is_main_resume:
        ai_resume = await db_ops.add_ai_optimized_resume(user.email, data.data.model_dump(), data.is_main_resume, data.job_id)
    else:
        return JSONResponse(content={"message": "Cannot update AI optimized resume", "is_success": False}, media_type="application/json", status_code=200)
    ai_resume = ai_resume.model_dump()
    fields_to_remove = ["id", "updatedAt", "createdAt"]
    for field in fields_to_remove:
        ai_resume.pop(field)
    return JSONResponse(content={"message": "AI optimized resume updated", "is_success": True, "extracted_data": ai_resume}, media_type="application/json", status_code=200)

@app.post("/download")
@is_user_logged_in
async def download_resume(request: Request, data: DownloadResume):
    user: User = request.state.user
    template = "resume.jinja2"
    if data.optimized:
        resume = await db_ops.get_ai_optimized_resume(user.email, data.is_main_resume, data.job_id)
        filename = f"{user.name}_optimized_resume.pdf" if user.name else "resume_optimized.pdf"
    else:
        resume = await db_ops.get_user_resume(user.email)
        filename = f"{user.name}_resume.pdf" if user.name else "resume.pdf"
    rendered_template = templates.TemplateResponse(template, {
        "request": request,
        "name": user.name,
        "personalInfo": resume.personalInfo,
        "experience": resume.experience,
        "education": resume.education,
        "projects": resume.projects,
        "certifications": resume.certifications,
        "skills": resume.skills,
        "jobPreferences": resume.jobPreferences
    })
    pdf = HTML(string=rendered_template.body.decode()).write_pdf()
    return Response(
        content=pdf,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"'
        }
    )