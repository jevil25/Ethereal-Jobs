from datetime import date, datetime, timedelta
import json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from starlette.responses import JSONResponse
from src.api.linkedin_profiles import get_linkedin_profiles_api_response
from src.api.jobs import get_jobs_api_response
from src.api.generate_linkedin_message import generate_message_api_response
from src.logger import logger
from src.db.mongo import get_database
from bson import ObjectId

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
    city = city.lower()
    country_code = country_code.lower()
    country = country.lower()
    job_title = job_title.lower()
    yesterday = date.today() - timedelta(days=1)
    db = get_database()
    jobs_collection = db["jobs"]
    jobs = jobs_collection.find(
        {"query.city": city, "query.country_code": country_code, "query.country": country, "query.job_title": job_title, "date_posted": {"$gte": str(yesterday)}}
    ).to_list()
    if len(jobs) > 0 and len(jobs) > 10:
        response_jobs = [{k: v for k, v in job.items() if k != '_id'} for job in jobs]
        return JSONResponse(
            content=response_jobs,
            media_type="application/json",
        )
    recruiters_list = recruiters.split(",")
    recruiters_list.remove("")
    jobs = get_jobs_api_response(city, country_code, country, job_title, recruiters_list)
    logger.info(f"Returning {len(jobs)} jobs")
    serialized_jobs = serialize_dates(jobs)
    serialized_jobs_copy = serialized_jobs.copy()
    for job in serialized_jobs_copy:
        job["query"] = {"city": city, "country_code": country_code, "country": country, "job_title": job_title}
    for job in serialized_jobs:
        jobs_collection.update_one(
            {"id": job["id"]},
            {"$set": job},
            upsert=True
        )
    response_jobs = [{k: v for k, v in job.items() if k != '_id'} for job in serialized_jobs]
    return JSONResponse(
        content=response_jobs,
        media_type="application/json",
    )

@app.get("/job/{job_id}/linkedin/profile")
async def get_linkedin_profile(job_id: str) -> dict:
    job_id.lower()
    logger.info(f"Getting linkedin profile for job {job_id}")
    db = get_database()
    jobs_collection = db["jobs"]
    job = jobs_collection.find_one({"id": job_id})
    if not job:
        return HTTPException(status_code=404, detail="Job not found")
    company = job.get("company").lower()
    location = job.get("location").lower()
    linkedin_profiles_db = db["company_linkedin_profiles"]
    linkedin_profiles = linkedin_profiles_db.find_one({"company": company, "location": location})
    if not linkedin_profiles or not linkedin_profiles.get("profiles") or len(linkedin_profiles.get("profiles")) == 0:
        logger.info(f"Getting linkedin profiles for {company} in {location}")
        if not company:
            return HTTPException(status_code=400, detail="company is required")
        if not location:
            return HTTPException(status_code=400, detail="location is required")
        profiles = get_linkedin_profiles_api_response(company, location)
        db_company_linkedin_profiles = db["company_linkedin_profiles"]
        db_company_linkedin_profiles.update_one(
            {"company": company, "location": location},
            {"$set": {"profiles": profiles}},
            upsert=True
        )
    else:
        profiles = linkedin_profiles.get("profiles")
    job.pop("_id")
    job["linkedin_profiles"] = profiles
    return JSONResponse(
        content=job,
        media_type="application/json",
    )

@app.post("/resume/save")
async def save_resume(resume: dict) -> dict:
    logger.info(f"Saving resume")
    db = get_database()
    resumes_collection = db["resumes"]
    resume_id = resumes_collection.insert_one(resume).inserted_id
    return JSONResponse(
        content={"resume_id": str(resume_id)},
        media_type="application/json",
    ) 

@app.get("/resume/{resume_id}")
async def get_resume(resume_id: str) -> dict:
    logger.info(f"Getting resume {resume_id}")
    db = get_database()
    resumes_collection = db["resumes"]
    resume = resumes_collection.find_one({"_id": ObjectId(resume_id)})
    if not resume:
        return HTTPException(status_code=404, detail="Resume not found")
    resume.pop("_id")
    return JSONResponse(
        content=resume,
        media_type="application/json",
    )

@app.put("/resume/{resume_id}")
async def update_resume(resume_id: str, resume: dict) -> dict:
    logger.info(f"Updating resume {resume_id}")
    db = get_database()
    resumes_collection = db["resumes"]
    updated_resume = resumes_collection.update_one({"_id": ObjectId(resume_id)}, {"$set": resume})
    if not updated_resume:
        return HTTPException(status_code=404, detail="Resume not found")
    return JSONResponse(
        content={"resume_id": resume_id},
        media_type="application/json",
    )

@app.get("/generate/linkedin/message/{resume_id}")
async def generate_linkedin_message(resume_id: str, company: str, position: str) -> dict:
    logger.info(f"Generating linkedin message for resume {resume_id} and company {company} and position {position}")
    db = get_database()
    resume = db["resumes"].find_one({"_id": ObjectId(resume_id)})
    if not resume:
        return HTTPException(status_code=404, detail="Resume not found")
    linkedin_messages_collection = db["linkedin_messages"]
    linkedin_message = linkedin_messages_collection.find_one({"resumeId": resume_id, "company": company, "position": position})
    if not linkedin_message:
        message_dict = generate_message_api_response(resume, company, position)
        message_dict["resumeId"] = resume_id
        message_dict["company"] = company
        message_dict["position"] = position
        linkedin_messages_collection.insert_one(message_dict)
        linkedin_message = message_dict
    linkedin_message.pop("_id")
    linkedin_message.pop("metadata")
    linkedin_message.pop("status")
    return JSONResponse(
        content=linkedin_message,
        media_type="application/json",
    )
