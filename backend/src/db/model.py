import enum
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
    company_logo: Optional[str] = None
    company_url: Optional[str] = None
    company_description: Optional[str] = None
    company_num_employees: Optional[str] = None
    company_revenue: Optional[str] = None
    company_industry: Optional[str] = None
    company_addresses: Optional[str] = None
    company_url_direct: Optional[str] = None
    job_level: Optional[str] = None
    job_function: Optional[str] = None
    listing_type: Optional[str] = None
    emails: Optional[str] = None
    min_amount: Optional[str] = None
    max_amount: Optional[str] = None
    currency: Optional[str] = None

class LinkedInProfile(BaseModel):
    name: str
    vanity_name: str
    profile_url: str

class CompanyLinkedInProfiles(BaseModel):
    company: str
    city: str
    profiles: List[LinkedInProfile]

class User(BaseModel):
    name: str
    email: str
    password: str
    provider: str

class UserLogin(BaseModel):
    email: str
    password: str
    provider: str

class ResetPassword(BaseModel):
    email: str

class UserUpdatePassword(BaseModel):
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
    email: Optional[str] = None
    is_valid: bool = False
    is_expired: bool = False

class RefreshToken(BaseModel):
    user_email: str
    refresh_token: str
    revoked: bool

class CheckToken(BaseModel):
    is_expired: bool
    is_valid: bool

