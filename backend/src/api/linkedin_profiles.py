from src.utils.google_search import get_linkedin_profiles
from src.db.model import LinkedInProfile


def get_linkedin_profiles_api_response(company: str, location: str) -> list:
    results = get_linkedin_profiles(company, location)
    print("Results:",results)
    results = [LinkedInProfile(
        name=profile.get("title") if profile.get("title") else "",
        vanity_name=profile.get("vanity_name") if profile.get("vanity_name") else "",
        profile_url=profile.get("link") if profile.get("link") else "",
    ) for profile in results]
    return results