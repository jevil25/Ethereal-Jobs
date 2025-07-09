import pprint
from typing import Optional
from jobspy import scrape_jobs, JobType
import pandas as pd
from src.logger import logger

import random

# List of user agents
user_agents = [
    # Chrome (Windows)
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36",
    # Chrome (Mac)
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
    # Chrome (Linux)
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
    # Firefox
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/117.0",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:110.0) Gecko/20100101 Firefox/110.0",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/109.0",
    "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/109.0",
    # Safari (Mac)
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Safari/605.1.15",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 11_0_0) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.1 Safari/605.1.15",
    # Edge
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36 Edg/114.0.1823.67",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36 Edg/115.0.1901.203",
    # Mobile Chrome
    "Mozilla/5.0 (Linux; Android 13; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.5735.196 Mobile Safari/537.36",
    "Mozilla/5.0 (Linux; Android 12; SM-G998B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.5672.77 Mobile Safari/537.36",
    # Mobile Safari
    "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1",
    # iPad
    "Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1",
    # Samsung Internet
    "Mozilla/5.0 (Linux; Android 13; SAMSUNG SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/20.0 Chrome/114.0.5735.196 Mobile Safari/537.36",
    # Opera
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36 OPR/99.0.4788.77",
    # Brave (appears as Chrome)
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
    # Vivaldi (appears as Chrome)
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
    # Add more user agents as needed
]

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
    # "linkedin", "zip_recruiter"
    supported_recruiters = [ "indeed", "glassdoor", "google" ]
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
        hours_old=120,
        country_indeed=country,
        linkedin_fetch_description=True,
        job_type=job_type,
        is_remote=is_remote if is_remote is not None else False,
        distance=distance if distance is not None else 25,
        description_format="html",
        user_agent=random.choice(user_agents)
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