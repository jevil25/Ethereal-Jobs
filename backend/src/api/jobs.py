import pprint
from typing import Optional
from jobspy import scrape_jobs, JobType
import pandas as pd
from src.logger import logger

indeed_countries = [
    "argentina", "australia", "austria", "bahrain", "belgium", "brazil", "canada", "chile", "china", "colombia", "costa rica", "czech republic", "czechia", "denmark", "ecuador", "egypt", "finland", "france", "germany", "greece", "hong kong", "hungary", "india", "indonesia", "ireland", "israel", "italy", "japan", "kuwait", "luxembourg", "malaysia", "malta", "mexico", "morocco", "netherlands", "new zealand", "nigeria", "norway", "oman", "pakistan", "panama", "peru", "philippines", "poland", "portugal", "qatar", "romania", "saudi arabia", "singapore", "south africa", "south korea", "spain", "sweden", "switzerland", "taiwan", "thailand", "türkiye", "turkey", "ukraine", "united arab emirates", "uk", "united kingdom", "usa", "us", "united states", "uruguay", "venezuela", "vietnam", "usa/ca", "worldwide"
]

def validate_indeed_country(country: str):
    if country.lower() not in indeed_countries:
        for indeed_country in indeed_countries:
            if country.lower() in indeed_country:
                return indeed_country
            if indeed_country in country.lower():
                return indeed_country
        return "worldwide"
    return country
    

def get_jobs(city: str, country_code: str, country: str, job_title: str, recruiters: list = [], 
             results_wanted: int = 20, job_type: Optional[JobType] = None, 
             is_remote: Optional[bool] = None, distance: Optional[int] = None):
    # TODO: add bayt in future if improved
    supported_recruiters = ["indeed",  "zip_recruiter", "glassdoor", "google"]
    if len(recruiters) > 0:
        for recruiter in recruiters:
            if recruiter not in supported_recruiters:
                return f"Recruiter {recruiter} is not supported. Supported recruiters are: {supported_recruiters}"
    else:
        recruiters = supported_recruiters
    
    # Calculate results per source
    results_per_source = max(1, results_wanted // len(recruiters))
    
    country = validate_indeed_country(country)
    jobs = scrape_jobs(
        site_name=recruiters,
        search_term=job_title,
        google_search_term=f"{job_title} jobs near {city}, {country_code} since yesterday",
        location=f"{city}, {country_code}",
        results_wanted=results_per_source,
        hours_old=72,
        country_indeed=country,
        linkedin_fetch_description=True,
        job_type=job_type,
        is_remote=is_remote if is_remote is not None else False,
        distance=distance if distance is not None else 25,
        description_format="html"
    )

    return pd.DataFrame(jobs)

def write_to_csv(jobs: pd.DataFrame, file_name: str):
    jobs.to_csv(file_name, index=False)
    

def print_jobs_table(jobs: pd.DataFrame):
    print(jobs)

def get_jobs_api_response(city: str, country_code: str, country: str, job_title: str, 
                         recruiters: list = [], results_wanted: int = 20,
                         job_type: Optional[JobType] = None, is_remote: Optional[bool] = None,
                         distance: Optional[int] = None) -> list[dict]:
    jobs = get_jobs(city, country_code, country, job_title, recruiters,
                    results_wanted, job_type, is_remote, distance)
    jobs = jobs.fillna("")
    return jobs.to_dict(orient="records")

def main():
    city = "Bengaluru"
    country_code = "IN"
    country = "India"
    job_title = "Software Engineer"
    recruiters = ["indeed", "linkedin", "zip_recruiter", "glassdoor", "google"]
    jobs = get_jobs(city, country_code, country, job_title, recruiters)