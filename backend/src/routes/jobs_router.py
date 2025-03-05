from fastapi import APIRouter, Query, HTTPException
from fastapi.responses import JSONResponse
from typing import List, Dict, Optional
from datetime import date, timedelta
from jobspy import JobType
from src.db.model import JobModel, JobQuery
from src.api.jobs import get_jobs_api_response
from src.db.mongo import DatabaseOperations
from src.utils.helpers import serialize_dates
from src.api.linkedin_profiles import get_linkedin_profiles_api_response
from src.logger import logger

app = APIRouter()
db_ops = DatabaseOperations()

@app.get("/jobs")
async def get_jobs(
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
    query_params = JobQuery(
        city=city.lower(),
        country_code=country_code.lower(),
        country=country.lower(),
        job_title=job_title.lower(),
        results_wanted=results_wanted,
        job_type=job_type,
        is_remote=is_remote if is_remote is not None else False,
        distance=distance if distance is not None else 25
    )

    # Check for cached jobs from yesterday onwards
    yesterday = str(date.today() - timedelta(days=1))
    cached_jobs = await db_ops.get_jobs_from_db(query_params, yesterday)

    if len(cached_jobs) > 10:
        return JSONResponse(
            content=[job.model_dump() for job in cached_jobs],
            media_type="application/json"
        )

    # Get new jobs from API
    recruiters_list = [r for r in recruiters.split(",") if r]
    jobs = get_jobs_api_response(
        query_params.city,
        query_params.country_code,
        query_params.country,
        query_params.job_title,
        recruiters_list,
        query_params.results_wanted,
        query_params.job_type,
        query_params.is_remote,
        query_params.distance
    )

    # Process and store jobs
    serialized_jobs = serialize_dates(jobs)
    job_models = [JobModel(
        company=job.get("company") if job.get("company") else "",
        id=job.get("id") if job.get("id") else "",
        title=job.get("title") if job.get("title") else "",
        location=job.get("location") if job.get("location") else "",
        date_posted=job.get("date_posted") if job.get("date_posted") else "",
        query=query_params,
        description=job.get("description") if job.get("description") else "",
        url=job.get("job_url_direct") if job.get("job_url_direct") else job.get("job_url", ""),
        salary=job.get("salary") if job.get("salary") else "",
        company_logo=job.get("company_logo") if job.get("company_logo") else "",
        min_amount=str(job.get("min_amount")) if job.get("min_amount") else "",
        max_amount=str(job.get("max_amount")) if job.get("max_amount") else "",
        company_url=job.get("company_url") if job.get("company_url") else "",
        company_description=job.get("company_description") if job.get("company_description") else "",
        company_num_employees=job.get("company_num_employees") if job.get("company_num_employees") else "",
        company_revenue=job.get("company_revenue") if job.get("company_revenue") else "",
        company_industry=job.get("company_industry") if job.get("company_industry") else "",
        company_addresses=job.get("company_addresses") if job.get("company_addresses") else "",
        company_url_direct=job.get("company_url_direct") if job.get("company_url_direct") else "",
        job_level=job.get("job_level") if job.get("job_level") else "",
        job_function=job.get("job_function") if job.get("job_function") else "",
        currency=job.get("currency") if job.get("currency") else "",
    ) for job in serialized_jobs]
    await db_ops.update_jobs(job_models, query_params)
    
    logger.info(f"Returning {len(jobs)} jobs")
    return JSONResponse(
        content=[{k: v for k, v in job.items() if k != '_id'} for job in serialized_jobs],
        media_type="application/json"
    )

@app.get("/job/{job_id}/linkedin/profile")
async def get_linkedin_profile(job_id: str) -> Dict:
    logger.info(f"Getting linkedin profile for job {job_id}")

    # Get job details
    job: JobModel = await db_ops.get_job(job_id)
    if not job:
        return JSONResponse(
            content={"message": "Job not found"},
            media_type="application/json",
            status_code=200
        )

    company = job.company.lower()
    city = job.query.city.lower()
    # TODO: Add title to query if needed
    # title = job["title"] if job.get("title") else ""
    title = ""

    if not company or not city:
        raise HTTPException(status_code=400, detail="Company and city are required")

    # Get or fetch LinkedIn profiles
    linkedin_profiles = await db_ops.get_linkedin_profiles(company, city, title)
    
    if not linkedin_profiles or not linkedin_profiles:
        logger.info(f"Getting linkedin profiles for {company} in {city}")
        profiles = get_linkedin_profiles_api_response(company, city, title)
        db_ops.update_linkedin_profiles(company, city, title, profiles)
    else:
        profiles = linkedin_profiles

    # Prepare response
    job_dict = job.model_dump()
    job_dict["linkedin_profiles"] = [profile.model_dump() for profile in profiles]
    fields_to_remove = ["updatedAt", "createdAt"]
    for field in fields_to_remove:
        job_dict.pop(field)
    
    return JSONResponse(content=job_dict, media_type="application/json")