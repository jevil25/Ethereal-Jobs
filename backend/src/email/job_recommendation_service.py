from src.db.mongo import DatabaseOperations
from src.email.email_sender import EmailService, EmailTemplates, EmailSender, JobRecommendationsEmail
from typing import List, Tuple, Dict
from models.job import Job
from src.db.model import JobModel
from src.api.jobs import get_jobs_api_response, validate_indeed_country
from jobspy import JobType
import json
import uuid
import os

# Country data mapping
COUNTRY_DATA = [
    {"code": "AD", "name": "Andorra"}, {"code": "AE", "name": "United Arab Emirates"},
    {"code": "AF", "name": "Afghanistan"}, {"code": "AG", "name": "Antigua and Barbuda"},
    {"code": "AI", "name": "Anguilla"}, {"code": "AL", "name": "Albania"},
    {"code": "AM", "name": "Armenia"}, {"code": "AO", "name": "Angola"},
    {"code": "AR", "name": "Argentina"}, {"code": "AT", "name": "Austria"},
    {"code": "AU", "name": "Australia"}, {"code": "BE", "name": "Belgium"},
    {"code": "BR", "name": "Brazil"}, {"code": "CA", "name": "Canada"},
    {"code": "CH", "name": "Switzerland"}, {"code": "CL", "name": "Chile"},
    {"code": "CN", "name": "China"}, {"code": "CO", "name": "Colombia"},
    {"code": "CR", "name": "Costa Rica"}, {"code": "CZ", "name": "Czechia"},
    {"code": "DE", "name": "Germany"}, {"code": "DK", "name": "Denmark"},
    {"code": "EC", "name": "Ecuador"}, {"code": "EG", "name": "Egypt"},
    {"code": "ES", "name": "Spain"}, {"code": "FI", "name": "Finland"},
    {"code": "FR", "name": "France"}, {"code": "GB", "name": "United Kingdom"},
    {"code": "GR", "name": "Greece"}, {"code": "HK", "name": "Hong Kong"},
    {"code": "HU", "name": "Hungary"}, {"code": "ID", "name": "Indonesia"},
    {"code": "IE", "name": "Ireland"}, {"code": "IL", "name": "Israel"},
    {"code": "IN", "name": "India"}, {"code": "IT", "name": "Italy"},
    {"code": "JP", "name": "Japan"}, {"code": "KR", "name": "Korea, Republic of"},
    {"code": "KW", "name": "Kuwait"}, {"code": "LU", "name": "Luxembourg"},
    {"code": "MY", "name": "Malaysia"}, {"code": "MT", "name": "Malta"},
    {"code": "MX", "name": "Mexico"}, {"code": "NG", "name": "Nigeria"},
    {"code": "NL", "name": "Netherlands"}, {"code": "NO", "name": "Norway"},
    {"code": "NZ", "name": "New Zealand"}, {"code": "OM", "name": "Oman"},
    {"code": "PA", "name": "Panama"}, {"code": "PE", "name": "Peru"},
    {"code": "PH", "name": "Philippines"}, {"code": "PK", "name": "Pakistan"},
    {"code": "PL", "name": "Poland"}, {"code": "PT", "name": "Portugal"},
    {"code": "QA", "name": "Qatar"}, {"code": "RO", "name": "Romania"},
    {"code": "SA", "name": "Saudi Arabia"}, {"code": "SG", "name": "Singapore"},
    {"code": "SE", "name": "Sweden"}, {"code": "TH", "name": "Thailand"},
    {"code": "TR", "name": "Türkiye"}, {"code": "TW", "name": "Taiwan"},
    {"code": "UA", "name": "Ukraine"}, {"code": "US", "name": "United States"},
    {"code": "VN", "name": "Viet Nam"}, {"code": "ZA", "name": "South Africa"}
]

# Create lookup dictionaries for faster access
COUNTRY_TO_CODE = {country["name"].lower(): country["code"] for country in COUNTRY_DATA}
CODE_TO_COUNTRY = {country["code"]: country["name"] for country in COUNTRY_DATA}

# Common variations mapping
COUNTRY_VARIATIONS = {
    "united states of america": "US",
    "usa": "US",
    "united kingdom of great britain and northern ireland": "GB",
    "uk": "GB",
    "united arab emirates": "AE",
    "uae": "AE",
    "russia": "RU",
    "russian federation": "RU",
    "south korea": "KR",
    "republic of korea": "KR",
    "vietnam": "VN"
}

db_ops = DatabaseOperations()

def get_country_info(location_part: str) -> Tuple[str, str]:
    state_to_country = {
        # Indian States
        "karnataka": ("India", "IN"),
        "maharashtra": ("India", "IN"),
        "tamil nadu": ("India", "IN"),
        "delhi": ("India", "IN"),
        "telangana": ("India", "IN"),
        "kerala": ("India", "IN"),
        "uttar pradesh": ("India", "IN"),
        # US States
        "california": ("United States", "US"),
        "new york": ("United States", "US"),
        "texas": ("United States", "US"),
        # UK Regions
        "london": ("United Kingdom", "GB"),
        "england": ("United Kingdom", "GB"),
        "scotland": ("United Kingdom", "GB"),
        "wales": ("United Kingdom", "GB"),
    }
    
    location_lower = location_part.lower().strip()
    
    # Check for direct state/region match
    for state, country_info in state_to_country.items():
        if state in location_lower:
            return country_info
            
    # Check for common variations
    if location_lower in COUNTRY_VARIATIONS:
        code = COUNTRY_VARIATIONS[location_lower]
        return CODE_TO_COUNTRY[code], code
        
    # Try direct country name lookup
    if location_lower in COUNTRY_TO_CODE:
        code = COUNTRY_TO_CODE[location_lower]
        return CODE_TO_COUNTRY[code], code
        
    # Try partial matches
    for country_name, code in COUNTRY_TO_CODE.items():
        if country_name in location_lower or location_lower in country_name:
            return CODE_TO_COUNTRY[code], code
            
    # If no match found, validate using Indeed's country list and default mappings
    country_name = validate_indeed_country(location_part)
    country_lower = country_name.lower()
    
    if country_lower in COUNTRY_TO_CODE:
        code = COUNTRY_TO_CODE[country_lower]
        return CODE_TO_COUNTRY[code], code
    
    # Default to US if no match found
    return "United States", "US"

async def generate_unsubscribe_token(user_id: str, email: str) -> str:
    prefs = await db_ops.get_email_preferences(user_id)
    if not prefs:
        token = str(uuid.uuid4())
        await db_ops.create_email_preferences(user_id, email, token)
        return token
    return prefs.unsubscribe_token

async def send_job_recommendations():
    try:
        resumes = await db_ops.get_resumes_with_preferences()
        
        for resume in resumes:
            user = await db_ops.get_user(resume.email)
            if not user:
                continue
                
            prefs = await db_ops.get_email_preferences(str(user.id))
            if prefs and "job_recommendations" in prefs.unsubscribed_from:
                continue
                
            job_preferences = resume.jobPreferences
            job_type = job_preferences.jobTypes[0] if hasattr(job_preferences, 'jobTypes') and job_preferences.jobTypes else None
            job_location = job_preferences.locations[0] if hasattr(job_preferences, 'locations') and job_preferences.locations else None
            
            if not job_type or not job_location:
                continue
                
            try:
                parts = [part.strip() for part in job_location.split(",")]
                if len(parts) >= 2:
                    city = parts[0]
                    location_part = parts[-1]
                else:
                    location_part = parts[0]
                    city = ""
                    
                country, country_code = get_country_info(location_part)
                
                # Convert job type to JobType enum
                job_type_mapping = {
                    "Full-time": JobType.FULL_TIME,
                    "Part-time": JobType.PART_TIME,
                    "Internship": JobType.INTERNSHIP,
                    "Contract": JobType.CONTRACT
                }
                
                job_type_enum = job_type_mapping.get(job_type)
                
                # Use default supported recruiters in order of reliability
                recruiters = ["indeed", "google", "glassdoor"]  # Put indeed first as it's most reliable
                matching_jobs = []
                
                try:
                    # Try to get jobs from job boards
                    scraped_jobs = get_jobs_api_response(
                        city=city,
                        country_code=country_code,
                        country=country,
                        job_title=resume.personalInfo.headline if hasattr(resume.personalInfo, 'headline') else "",
                        recruiters=recruiters,
                        results_wanted=15,  # Request more to account for potential failures
                        job_type=job_type_enum.value[0] if job_type_enum else None,
                        is_remote=False,
                        distance=25
                    )
                    
                    if job_type and scraped_jobs:
                        scraped_jobs = [job for job in scraped_jobs if job.get('job_type', '').lower() == job_type.lower()]
                    
                    if scraped_jobs:
                        matching_jobs = scraped_jobs[:5]
                except Exception as e:
                    print(f"Error fetching jobs from job boards: {str(e)}")
                
                # If no jobs from job boards or if they failed, try database
                if not matching_jobs:
                    try:
                        matching_jobs = await db_ops.get_matching_jobs(
                            job_type=job_type,
                            location=job_location,
                            limit=5
                        )
                    except Exception as e:
                        print(f"Error fetching jobs from database: {str(e)}")
                        continue  # Skip this user if both methods fail
                
                if not matching_jobs:
                    print(f"No jobs found for location {job_location} and job type {job_type}")
                    continue
                    
            except Exception as e:
                print(f"Error processing location {job_location}: {str(e)}")
                continue
                
            unsubscribe_token = await generate_unsubscribe_token(str(user.id), user.email)
            frontend_url = os.getenv("FRONTEND_URL")
            jobs_html, jobs_text = format_jobs_for_email(matching_jobs, frontend_url)
            email_service = EmailService(
                template_name=EmailTemplates.JOB_RECOMMENDATIONS,
                template_data=JobRecommendationsEmail(
                    name=user.name,
                    jobs_html=jobs_html,
                    jobs_text=jobs_text,
                    unsubscribe_link=f"{frontend_url}/unsubscribe?token={unsubscribe_token}&type=job_recommendations",
                    subject="Job Recommendations Based on Your Profile"
                ),
                recipient=user.email
            )
            email_sender = EmailSender()
            return email_sender.send_email_resend(email_service)
            
    except Exception as e:
        print(f"Error sending job recommendations: {str(e)}")
        
def format_jobs_for_text(jobs: List[JobModel], frontend_url: str) -> str:
    text = ""
    for job in jobs:
        url = f"{frontend_url}/jobs/{job.id}"
        text += f"""
• {job.title}
  {job.company} • {job.location}
  View Job: {url}

"""
    return text

def format_jobs_for_email(jobs: List[JobModel], frontend_url: str) -> Tuple[str, str]:
    html = ""
    text = format_jobs_for_text(jobs, frontend_url)
    
    for job in jobs:
        url = f"{frontend_url}/jobs/{job.id}"
        html += f"""
        <div style="margin-bottom: 20px; padding: 15px; border: 1px solid #e0e0e0; border-radius: 5px;">
            <h3 style="margin: 0; color: #2557a7;"><a href="{url}" style="text-decoration: none; color: inherit;">{job.title}</a></h3>
            <p style="margin: 5px 0; color: #666;">{job.company} • {job.location}</p>
            <a href="{url}" style="display: inline-block; padding: 8px 15px; background-color: #2557a7; color: white; text-decoration: none; border-radius: 3px;">View Job</a>
        </div>
        """
    return html, text
