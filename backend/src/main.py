from fastapi import FastAPI
from backend.src.api.jobs import get_jobs_api_response

app = FastAPI()


@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.get("/jobs")
def read_jobs(city: str, country_code: str, country: str, job_title: str, recruiters: str):
    # some validation
    if not city:
        return {"error": "city is required"}
    if not country_code:
        return {"error": "country_code is required"}
    if not country:
        return {"error": "country is required"}
    if not job_title:
        return {"error": "job_title is required"}
    if not recruiters:
        return {"error": "recruiters is required"}
    recruiters = recruiters.split(",")
    return get_jobs_api_response(city, country_code, country, job_title, recruiters)

