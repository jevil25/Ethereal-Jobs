from fastapi import APIRouter, Query, HTTPException
from fastapi.responses import JSONResponse
from typing import List, Dict, Optional
from datetime import date, timedelta
from jobspy import JobType
from src.api.jobs import get_jobs_api_response
from src.db.mongo import DatabaseOperations
from src.utils.helpers import serialize_dates
from src.api.linkedin_profiles import get_linkedin_profiles_api_response
from src.logger import logger

app = APIRouter()
db_ops = DatabaseOperations()

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