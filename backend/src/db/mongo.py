from datetime import datetime
from pymongo import MongoClient
from dotenv import load_dotenv
import os
from typing import List, Optional
from src.db.model import CheckToken, JobQuery, JobModel, LinkedInProfile, RefreshToken, User

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

    def get_jobs_from_db(self, query_params: JobQuery, date_posted: str) -> List[JobModel]:
        """Retrieve jobs from database based on query parameters."""
        print("Query params:", query_params)
        jobs_cursor = self.db["jobs"].find({
            "query.city": query_params.city,
            "query.country_code": query_params.country_code,
            "query.country": query_params.country,
            "query.job_title": query_params.job_title,
            "query.results_wanted": query_params.results_wanted,
            "query.job_type": query_params.job_type,
            "query.is_remote": query_params.is_remote,
            "query.distance": query_params.distance,
            "date_posted": {"$gte": date_posted}
        })
        return [JobModel(**job) for job in jobs_cursor]

    def update_jobs(self, jobs: List[JobModel], query_params: JobQuery):
        """Update jobs in database with query parameters."""
        jobs_collection = self.db["jobs"]
        for job in jobs:
            job_dict = job.model_dump()
            job_dict["query"] = query_params.model_dump()
            jobs_collection.update_one(
                {"id": job.id},
                {"$set": job_dict},
                upsert=True
            )

    def get_linkedin_profiles(self, company: str, location: str, title:str) -> Optional[List[LinkedInProfile]]:
        """Get LinkedIn profiles for a company and location."""
        profile_data = self.db["company_linkedin_profiles"].find_one({
            "company": company,
            "city": location,
            "title": title
        })
        profiles = profile_data.get("profiles") if profile_data else []
        if len(profiles) == 0:
            return None
        return [LinkedInProfile(
            name=profile.get("name") if profile.get("name") else "",
            vanity_name=profile.get("vanity_name") if profile.get("vanity_name") else "",
            profile_url=profile.get("profile_url") if profile.get("profile_url") else "",
        ) for profile in profiles]

    def update_linkedin_profiles(self, company: str, location: str, title:str, profiles: List[LinkedInProfile]):
        """Update LinkedIn profiles in database."""
        profiles_dict = [profile.dict() for profile in profiles]
        self.db["company_linkedin_profiles"].update_one(
            {"company": company, "city": location, "title": title},
            {"$set": {"profiles": profiles_dict}},
            upsert=True
        )

    def insert_user(self, user: dict):
        """Insert a new user into the database."""
        return self.db["user"].insert_one(user).inserted_id
    
    def get_user(self, email: str):
        """Get a user from the database."""
        user = self.db["user"].find_one({"email": email})
        return User(**user) if user else None
    
    def add_refresh_token(self, user_email: str, refresh_token: str, expire: str):
        """Add a refresh token to the database."""
        return self.db["refresh_token"].insert_one({"user_email": user_email, "refresh_token": refresh_token, "revoked": False, "expire": expire}).inserted_id
    
    def check_refresh_token(self, refresh_token: str):
        """Check if a refresh token exists in the database."""
        res = self.db["refresh_token"].find_one({"refresh_token": refresh_token})
        if res and res.get("revoked"):
            return None
        datatime_str = res.get("expire")
        if res and datetime.strptime(datatime_str, "%Y-%m-%d %H:%M:%S") < datetime.now():
            return None
        return RefreshToken(**res) if res else None
    
    def revoke_refresh_token(self, refresh_token: str):
        """Revoke a refresh token in the database."""
        return self.db["refresh_token"].update_one({"refresh_token": refresh_token}, {"$set": {"revoked": True}})
    
    def add_reset_password_token(self, email: str, token: str, expire: str):
        """Add a reset password token to the database."""
        return self.db["reset_password_token"].insert_one({"email": email, "token": token, "expire": expire, "revoked": False}).inserted_id
    
    def check_reset_password_token(self, token: str):
        """Check if a reset password token exists in the database."""
        res = self.db["reset_password_token"].find_one({"token": token})
        if not res:
            return CheckToken(is_valid=False, is_expired=False)
        if res and res.get("revoked"):
            return CheckToken(is_valid=False, is_expired=False)
        datatime_str = res.get("expire")
        if res and datetime.strptime(datatime_str, "%Y-%m-%d %H:%M:%S") < datetime.now():
            return CheckToken(is_valid=False, is_expired=True)
        return CheckToken(is_valid=True, is_expired=False)
    
    def get_user_by_reset_password_token(self, token: str):
        """Get a user by reset password token."""
        res = self.db["reset_password_token"].find_one({"token": token})
        return res.get("email") if res else None
    
    def revoke_reset_password_token(self, token: str):
        """Revoke a reset password token in the database."""
        return self.db["reset_password_token"].update_one({"token": token}, {"$set": {"revoked": True}})
    
    def update_user_password(self, email: str, password: str, token: str):
        """Update a user's password in the database."""
        token_data = self.check_reset_password_token(token)
        if not token_data.is_valid:
            return False
        self.db["user"].update_one({"email": email}, {"$set": {"password": password}})
        self.revoke_reset_password_token(token)
        return True
