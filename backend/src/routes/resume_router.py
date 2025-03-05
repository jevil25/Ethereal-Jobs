from fastapi import APIRouter
from fastapi.responses import JSONResponse
from typing import Dict
from src.db.mongo import DatabaseOperations
from src.logger import logger

app = APIRouter(prefix="/resume")
db_ops = DatabaseOperations()

@app.post("/save")
async def save_resume(email: str, resume: Dict) -> Dict:
    logger.info("Saving resume")
    resume_id = await db_ops.save_resume(email, resume)
    return JSONResponse(
        content={"resume_id": resume_id},
        media_type="application/json"
    )

@app.get("/{email}")
async def get_resume(email: str) -> Dict:
    logger.info(f"Getting resume {email}")
    resume = await db_ops.get_resume(email)
    if not resume:
        return JSONResponse(
            content={"message": "Resume not found"},
            media_type="application/json",
            status_code=200
        )
    
    resume_dict = resume.__dict__
    fields_to_remove = ["_id", "updatedAt", "createdAt"]
    for field in fields_to_remove:
        resume_dict.pop(field)
    return JSONResponse(content=resume_dict, media_type="application/json")

@app.put("/{email}")
async def update_resume(email: str, resume: Dict) -> Dict:
    logger.info(f"Updating resume {email}")
    result = await db_ops.update_resume(email, resume)
    
    if not result:
        email = await db_ops.save_resume(email, resume)
        return JSONResponse(
            content={"email": email},
            media_type="application/json",
            status_code=201
        )
    
    resume_dict = result.__dict__
    fields_to_remove = ["_id", "updatedAt", "createdAt"]
    for field in fields_to_remove:
        resume_dict.pop(field)
    return JSONResponse(
        content={"email": resume_dict},
        media_type="application/json"
    )
