from datetime import date, datetime
import json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from starlette.responses import JSONResponse
from src.api.linkedin_profiles import get_linkedin_profiles_api_response
from src.api.jobs import get_jobs_api_response
from src.logger import logger
from src.db.mongo import get_database

class CustomJSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, (date, datetime)):
            return obj.isoformat()
        return super().default(obj)

def serialize_dates(obj):
    if isinstance(obj, (date, datetime)):
        return obj.isoformat()
    elif isinstance(obj, dict):
        return {k: serialize_dates(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [serialize_dates(i) for i in obj]
    else:
        return obj

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.get("/jobs")
def get_jobs(city: str, country_code: str, country: str, job_title: str, recruiters: str="") -> list:
    # some validation
    if not city:
        return HTTPException(status_code=400, detail="city is required")
    if not country_code:
        return HTTPException(status_code=400, detail="country_code is required")
    if not country:
        return HTTPException(status_code=400, detail="country is required")
    if not job_title:
        return HTTPException(status_code=400, detail="job_title is required")
    if not recruiters:
        recruiters = ""
    recruiters_list = recruiters.split(",")
    recruiters_list.remove("")
    jobs = get_jobs_api_response(city, country_code, country, job_title, recruiters_list)
    logger.info(f"Returning {len(jobs)} jobs")
    serialized_jobs = serialize_dates(jobs)
    serialized_jobs_copy = serialized_jobs.copy()
    db = get_database()
    jobs_collection = db["jobs"]
    jobs_collection.insert_many(serialized_jobs_copy)
    response_jobs = [{k: v for k, v in job.items() if k != '_id'} for job in serialized_jobs]
    return JSONResponse(
        content=response_jobs,
        media_type="application/json",
    )

@app.get("/job/{job_id}/linkedin/profile")
async def get_linkedin_profile(job_id: str) -> dict:
    logger.info(f"Getting linkedin profile for job {job_id}")
    db = get_database()
    jobs_collection = db["jobs"]
    job = jobs_collection.find_one({"id": job_id})
    if not job:
        return HTTPException(status_code=404, detail="Job not found")
    if not job.get("linkedin_profiles"):
        company = job.get("company")
        location = job.get("location")
        logger.info(f"Getting linkedin profiles for {company} in {location}")
        if not company:
            return HTTPException(status_code=400, detail="company is required")
        if not location:
            return HTTPException(status_code=400, detail="location is required")
        profiles = get_linkedin_profiles_api_response(company, location)
        job["linkedin_profiles"] = profiles
        jobs_collection.update_one({"id": job_id}, {"$set": {"linkedin_profiles": profiles}})
    job.pop("_id")
    return JSONResponse(
        content=job,
        media_type="application/json",
    )

    

