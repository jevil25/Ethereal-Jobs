from pymongo import MongoClient
from dotenv import load_dotenv
import os
from typing import Dict, List, Optional

# Load the dotenv file
load_dotenv()

def get_database():
    # Provide the mongodb atlas url to connect python to mongodb using pymongo
    CONNECTION_STRING = os.getenv("MONGO_CONNECTION_STRING")

    # Create a connection using MongoClient
    client = MongoClient(CONNECTION_STRING)

    # Create the database for our example (we will use the same database throughout the tutorial)
    return client['jobify-testing']

# This is added so that many files can reuse the function get_database()
if __name__ == "__main__":
    # Get the database
    dbname = get_database()
    print("Database connected:", dbname)

class DatabaseOperations:
    """Handle all database operations."""
    def __init__(self):
        self.db = get_database()

    def get_jobs_from_db(self, query_params: Dict, date_posted: str) -> List[Dict]:
        """Retrieve jobs from database based on query parameters."""
        return self.db["jobs"].find({
            "query.city": query_params["city"],
            "query.country_code": query_params["country_code"],
            "query.country": query_params["country"],
            "query.job_title": query_params["job_title"],
            "query.results_wanted": query_params["results_wanted"],
            "query.job_type": query_params["job_type"],
            "query.is_remote": query_params["is_remote"],
            "query.distance": query_params["distance"],
            "date_posted": {"$gte": date_posted}
        }).to_list()

    def update_jobs(self, jobs: List[Dict], query_params: Dict):
        """Update jobs in database with query parameters."""
        jobs_collection = self.db["jobs"]
        for job in jobs:
            job["query"] = query_params
            jobs_collection.update_one(
                {"id": job["id"]},
                {"$set": job},
                upsert=True
            )

    def get_linkedin_profiles(self, company: str, location: str) -> Optional[Dict]:
        """Get LinkedIn profiles for a company and location."""
        return self.db["company_linkedin_profiles"].find_one({
            "company": company,
            "city": location
        })

    def update_linkedin_profiles(self, company: str, location: str, profiles: List[Dict]):
        """Update LinkedIn profiles in database."""
        self.db["company_linkedin_profiles"].update_one(
            {"company": company, "city": location},
            {"$set": {"profiles": profiles}},
            upsert=True
        )
