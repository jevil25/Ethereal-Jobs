import re
import requests
from typing import List, Dict
import os
from dotenv import load_dotenv
load_dotenv()

GOOGLE_CSE_KEY=os.getenv("GOOGLE_CSE_KEY")
SEARCH_ENGINE_ID = os.getenv("SEARCH_ENGINE_ID")
SEARCH_URL="https://customsearch.googleapis.com/customsearch/v1"

class GoogleSearchError(Exception):
    pass

def google_search(company_name: str, location: str, title:str, results_wanted: int = 10) -> List[Dict]:
    """
    Perform a Google Custom Search for HR/Recruiting contacts at a specific company and location.
    
    Args:
        company_name (str): Name of the company to search for
        location (str): Location/city to search in
        results_wanted (int): Number of results to return (default: 10, max: 10 for free tier)
    
    Returns:
        List[Dict]: List of search results containing title, link, and snippet
    
    Raises:
        GoogleSearchError: If the API request fails
    """
    location_variants = [location]
    if location.lower() == "benagluru" or location.lower() == "bengaluru":
        location_variants = ["Bangalore", "Bengaluru"]
    location_query = f"({' OR '.join(location_variants)})"

    search_terms = [
        'site:linkedin.com',
        f'{company_name}',
        f'{location_query}',
        f'(Human Resources OR HR OR People Operations OR Talent Acquisition OR {title})',
        f'intitle:{company_name}',  # Target profiles with "current" in title
    ]
    
    query = " ".join(search_terms)
    
    params = {
        "key": GOOGLE_CSE_KEY,
        "cx": SEARCH_ENGINE_ID,
        "q": query,
        "num": min(results_wanted, 10),  # API limits free tier to 10 results
    }
    
    try:
        response = requests.get(SEARCH_URL, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()
        if "items" not in data:
            return []
            
        return [
            {
                "title": item.get("title", ""),
                "link": item.get("link", ""),
                "snippet": item.get("snippet", "")
            }
            for item in data["items"]
        ]
    
    except requests.exceptions.HTTPError as e:
        status_code = e.response.status_code
        if status_code == 429:
            return []
    except requests.exceptions.RequestException as e:
        raise GoogleSearchError(f"Search request failed: {str(e)}") from e
    except (KeyError, ValueError) as e:
        raise GoogleSearchError(f"Failed to parse search results: {str(e)}") from e
    
def get_linkedin_profiles(company, location, title) -> List[Dict]:
    """ Ashish Chopra (He/Him) - Google | LinkedIn, Ashwin Kumar - Google | LinkedIn these are titles """
    results = google_search(company, location, title)
    profiles = []
    for result in results:
        if "linkedin.com" in result["link"]:
            title_arrary = result["title"].split("-")
            result["title"] = title_arrary[0] if len(title_arrary) > 0 else ""
            result["company"] = title_arrary[1] if len(title_arrary) > 1 else ""
            result["title"] = re.sub(r"\(.*?\)", "", result["title"]).strip()
            result["vanity_name"] = result["link"].split("/in/")[1].split("/")[0] if "/in/" in result["link"] else ""
            result.pop("snippet")
            profiles.append(result)
    return profiles
    

# Example usage
if __name__ == "__main__":
    try:
        company = "Google"
        city = "Bangalore"
        results = google_search(company, city)
        
        for result in results:
            print(f"Title: {result['title']}")
            print(f"Link: {result['link']}")
            print(f"Snippet: {result['snippet']}")
            print("-" * 80)
            
    except GoogleSearchError as e:
        print(f"Error: {e}")
