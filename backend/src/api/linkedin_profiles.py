from src.utils.google_search import get_linkedin_profiles
from src.db.model import LinkedInProfile, JobModel


def get_linkedin_profiles_api_response(job: JobModel) -> list[LinkedInProfile]:
    results = get_linkedin_profiles(job.company, job.location, job.query.job_title)
    results = [LinkedInProfile(
        name=profile.get("title") if profile.get("title") else "",
        vanity_name=profile.get("vanity_name") if profile.get("vanity_name") else "",
        profile_url=profile.get("link") if profile.get("link") else "",
        company=profile.get("company") if profile.get("company") else ""
    ) for profile in results]
    return results