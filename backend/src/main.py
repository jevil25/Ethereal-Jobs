from datetime import date, datetime
import json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from starlette.responses import PlainTextResponse, JSONResponse
from models.job import Job
from src.api.jobs import get_jobs_api_response
from src.logger import logger

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
def get_jobs(city: str, country_code: str, country: str, job_title: str, recruiters: str) -> list:
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
    return JSONResponse(
        content=serialized_jobs,
        media_type="application/json",
    )
    

