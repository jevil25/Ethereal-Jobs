from src.utils.google_search import get_linkedin_profiles


def get_linkedin_profiles_api_response(company: str, location: str) -> list:
    results = get_linkedin_profiles(company, location)
    return results