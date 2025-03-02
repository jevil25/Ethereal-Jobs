from pydantic import BaseModel, Field
from typing import List, Optional

class JobQuery(BaseModel):
    city: str
    country_code: str
    country: str
    job_title: str
    results_wanted: int
    job_type: str
    is_remote: bool
    distance: int

class JobModel(BaseModel):
    id: str  # Assuming unique job ID
    title: str
    company: str
    location: str
    description: str
    url: str
    salary: Optional[str] = None
    date_posted: str
    query: JobQuery

class LinkedInProfile(BaseModel):
    name: str
    vanity_name: str
    profile_url: str

class CompanyLinkedInProfiles(BaseModel):
    company: str
    city: str
    profiles: List[LinkedInProfile]

class User(BaseModel):
    username: str
    email: str
    password: str

class UserAuth(BaseModel):
    username: str
    email: str
    access_token: str
    refresh_token: str
    revoked: bool

class Login(BaseModel):
	username: str
	password: str
     
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

