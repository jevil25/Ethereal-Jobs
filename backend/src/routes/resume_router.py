from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from bson import ObjectId
from typing import List, Dict
from src.db.mongo import DatabaseOperations
from src.logger import logger

app = APIRouter()
db_ops = DatabaseOperations()

@app.post("/resume/save")
async def save_resume(resume: Dict) -> Dict:
    logger.info("Saving resume")
    resume_id = db_ops.db["resumes"].insert_one(resume).inserted_id
    return JSONResponse(
        content={"resume_id": str(resume_id)},
        media_type="application/json"
    )

@app.get("/resume/{resume_id}")
async def get_resume(resume_id: str) -> Dict:
    logger.info(f"Getting resume {resume_id}")
    resume = db_ops.db["resumes"].find_one({"_id": ObjectId(resume_id)})
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    resume.pop("_id")
    return JSONResponse(content=resume, media_type="application/json")

@app.put("/resume/{resume_id}")
async def update_resume(resume_id: str, resume: Dict) -> Dict:
    logger.info(f"Updating resume {resume_id}")
    result = db_ops.db["resumes"].update_one(
        {"_id": ObjectId(resume_id)},
        {"$set": resume}
    )
    
    if not result.modified_count:
        resume_id = db_ops.db["resumes"].insert_one(resume).inserted_id
        return JSONResponse(
            content={"resume_id": str(resume_id)},
            media_type="application/json",
            status_code=201
        )
    
    return JSONResponse(
        content={"resume_id": resume_id},
        media_type="application/json"
    )
