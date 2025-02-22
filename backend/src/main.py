from datetime import date, datetime, timedelta
import json
from typing import List, Dict, Optional
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from starlette.responses import JSONResponse
from bson import ObjectId
from jobspy import JobType

from src.api.linkedin_profiles import get_linkedin_profiles_api_response
from src.api.jobs import get_jobs_api_response
from src.api.generate_linkedin_message import generate_message_api_response
from src.logger import logger
from src.db.mongo import DatabaseOperations

class CustomJSONEncoder(json.JSONEncoder):
    """Custom JSON encoder for handling date and datetime objects."""
    def default(self, obj):
        if isinstance(obj, (date, datetime)):
            return obj.isoformat()
        return super().default(obj)

def serialize_dates(obj):
    """Recursively serialize datetime objects in nested structures."""
    match obj:
        case date() | datetime():
            return obj.isoformat()
        case dict():
            return {k: serialize_dates(v) for k, v in obj.items()}
        case list():
            return [serialize_dates(i) for i in obj]
        case _:
            return obj

# Initialize FastAPI app
app = FastAPI()
db_ops = DatabaseOperations()

# Configure CORS
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
def get_jobs(
    city: str,
    country_code: str,
    country: str,
    job_title: str,
    recruiters: str = "",
    results_wanted: int = Query(default=20, ge=1, le=200),
    job_type: Optional[str] = None,
    is_remote: Optional[bool] = None,
    distance: Optional[int] = Query(default=None, ge=0, le=100)
) -> List[Dict]:
    # Validate input parameters
    if not all([city, country_code, country, job_title]):
        raise HTTPException(status_code=400, detail="Missing required parameters")

    jobTypesFrontend = ['Full-time', 'Part-time', 'Internship']
    if job_type and job_type not in jobTypesFrontend:
        raise HTTPException(status_code=400, detail="Invalid job type")
    if job_type == 'Full-time':
        job_type = JobType.FULL_TIME.value[0]
    elif job_type == 'Part-time':
        job_type = JobType.PART_TIME.value[0]
    elif job_type == 'Internship':
        job_type = JobType.INTERNSHIP.value[0]
    # Normalize input parameters
    query_params = {
        "city": city.lower(),
        "country_code": country_code.lower(),
        "country": country.lower(),
        "job_title": job_title.lower(),
        "results_wanted": results_wanted,
        "job_type": job_type,
        "is_remote": is_remote,
        "distance": distance
    }

    # Check for cached jobs from yesterday onwards
    yesterday = str(date.today() - timedelta(days=1))
    cached_jobs = db_ops.get_jobs_from_db(query_params, yesterday)

    if len(cached_jobs) > 10:
        return JSONResponse(
            content=[{k: v for k, v in job.items() if k != '_id'} for job in cached_jobs],
            media_type="application/json"
        )

    # Get new jobs from API
    recruiters_list = [r for r in recruiters.split(",") if r]
    jobs = get_jobs_api_response(
        query_params["city"],
        query_params["country_code"],
        query_params["country"],
        query_params["job_title"],
        recruiters_list,
        query_params["results_wanted"],
        query_params["job_type"],
        query_params["is_remote"],
        query_params["distance"]
    )

    # Process and store jobs
    serialized_jobs = serialize_dates(jobs)
    db_ops.update_jobs(serialized_jobs, query_params)
    
    logger.info(f"Returning {len(jobs)} jobs")
    return JSONResponse(
        content=[{k: v for k, v in job.items() if k != '_id'} for job in serialized_jobs],
        media_type="application/json"
    )

@app.get("/job/{job_id}/linkedin/profile")
async def get_linkedin_profile(job_id: str) -> Dict:
    job_id = job_id.lower()
    logger.info(f"Getting linkedin profile for job {job_id}")

    # Get job details
    job = db_ops.db["jobs"].find_one({"id": job_id})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    company = job.get("company", "").lower()
    city = job["query"].get("city", "").lower()

    if not company or not city:
        raise HTTPException(status_code=400, detail="Company and city are required")

    # Get or fetch LinkedIn profiles
    linkedin_profiles = db_ops.get_linkedin_profiles(company, city)
    
    if not linkedin_profiles or not linkedin_profiles.get("profiles"):
        logger.info(f"Getting linkedin profiles for {company} in {city}")
        profiles = get_linkedin_profiles_api_response(company, city)
        db_ops.update_linkedin_profiles(company, city, profiles)
    else:
        profiles = linkedin_profiles.get("profiles")

    # Prepare response
    job.pop("_id")
    job["linkedin_profiles"] = profiles
    
    return JSONResponse(content=job, media_type="application/json")

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
        raise HTTPException(status_code=304, detail="Resume not found")
    
    return JSONResponse(
        content={"resume_id": resume_id},
        media_type="application/json"
    )

@app.get("/generate/linkedin/message/{resume_id}")
async def generate_linkedin_message(resume_id: str, company: str, position: str, newMessage:bool) -> Dict:    
    # Get resume
    resume = db_ops.db["resumes"].find_one({"_id": ObjectId(resume_id)})
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    # Check for existing message
    linkedin_messages_collection = db_ops.db["linkedin_messages"]
    linkedin_message = linkedin_messages_collection.find_one({
        "resumeId": resume_id,
        "company": company,
        "position": position
    })

    if not linkedin_message or newMessage:
        message_dict = generate_message_api_response(resume, company, position)
        message_dict.update({
            "resumeId": resume_id,
            "company": company,
            "position": position
        })
        linkedin_messages_collection.insert_one(message_dict)
        linkedin_message = message_dict

    # Clean up response
    linkedin_message.pop("_id", None)
    linkedin_message.pop("metadata", None)
    linkedin_message.pop("status", None)

    return JSONResponse(content=linkedin_message, media_type="application/json")