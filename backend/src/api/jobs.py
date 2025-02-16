from jobspy import scrape_jobs
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
    

def get_jobs(city: str, country_code: str, country: str, job_title: str, recruiters: list = []):
    supported_recruiters = ["indeed", "linkedin", "zip_recruiter", "glassdoor", "google"]
    if len(recruiters) > 0:
        for recruiter in recruiters:
            if recruiter not in supported_recruiters:
                return f"Recruiter {recruiter} is not supported. Supported recruiters are: {supported_recruiters}"
    else:
        recruiters = supported_recruiters
    country = validate_indeed_country(country)
    jobs = scrape_jobs(
        site_name=["indeed", "linkedin", "zip_recruiter", "glassdoor", "google"],
        search_term=job_title,
        google_search_term=f"{job_title} jobs near {city}, {country_code} since yesterday",
        location=f"{city}, {country_code}",
        results_wanted=20,
        hours_old=72,
        country_indeed=country,
        
        # linkedin_fetch_description=True # gets more info such as description, direct job url (slower)
        # proxies=["208.195.175.46:65095", "208.195.175.45:65095", "localhost"],
    )

    return pd.DataFrame(jobs)

def write_to_csv(jobs: pd.DataFrame, file_name: str):
    jobs.to_csv(file_name, index=False)
    

def print_jobs_table(jobs: pd.DataFrame):
    print(jobs)

def get_jobs_api_response(city: str, country_code: str, country, job_title: str, recruiters: list = []) -> list[dict]:
    logger.info("Getting jobs...")
    logger.info(f"{city} {country_code} {country} {job_title} {recruiters}")
    jobs = get_jobs(city, country_code, country, job_title, recruiters)
    jobs = jobs.fillna("")
    return jobs.to_dict(orient="records")

def main():
    city = "Bengaluru"
    country_code = "IN"
    country = "India"
    job_title = "Software Engineer"
    recruiters = ["indeed", "linkedin", "zip_recruiter", "glassdoor", "google"]
    jobs = get_jobs(city, country_code, country, job_title, recruiters)