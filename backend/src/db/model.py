from datetime import datetime, timedelta
from typing import List, Optional
from beanie import Document, Indexed, before_event, Insert
from pydantic import BaseModel, Field

class JobQuery(BaseModel):
    city: str
    country_code: str
    country: str
    job_title: str
    results_wanted: int
    job_type: str
    is_remote: bool
    distance: int

class JobModel(Document):
    id: str = Field(alias="_id")
    title: str
    company: Indexed(str) # type: ignore
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
    
    # Timestamp fields
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "jobs"
        indexes = [
            [("company", 1)],
            [("location", 1)],
            [("job_title", 1)],
            [("date_posted", -1)],
        ]
        use_cache = True
        cache_expiration_time = timedelta(minutes=5)
        cache_capacity = 100

class LinkedInProfile(BaseModel):
    name: str
    vanity_name: str
    profile_url: str

class CompanyLinkedInProfiles(Document):
    company: Indexed(str) # type: ignore
    city: Indexed(str) # type: ignore
    title: Indexed(str) # type: ignore
    profiles: List[LinkedInProfile]
    
    # Timestamp fields
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "company_linkedin_profiles"
        indexes = [
            [("company", 1), ("city", 1), ("title", 1)],
        ]
        use_cache = True
        cache_expiration_time = timedelta(minutes=5)
        cache_capacity = 100

class User(Document):
    name: str
    email: Indexed(str, unique=True) # type: ignore
    password: str
    provider: str
    is_verified: bool = False
    
    # Timestamp fields
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

    @before_event(Insert)
    def capitalize_name(self):
        self.name = self.name.capitalize()

    class Settings:
        name = "users"
        indexes = [
            [("email", 1)],
            [("provider", 1)],
        ]
        # use_cache = True
        cache_expiration_time = timedelta(minutes=5)
        cache_capacity = 100
        

class RefreshToken(Document):
    user_email: Indexed(str) # type: ignore
    refresh_token: Indexed(str, unique=True) # type: ignore
    revoked: bool = False
    expire: datetime
    
    # Timestamp fields
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "refresh_tokens"
        indexes = [
            [("user_email", 1)],
            [("refresh_token", 1)],
            [("expire", -1)],
        ]

class ResetPasswordToken(Document):
    email: Indexed(str) # type: ignore
    token: Indexed(str, unique=True) # type: ignore
    expire: datetime
    revoked: bool = False
    
    # Timestamp fields
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "reset_password_tokens"
        indexes = [
            [("email", 1)],
            [("token", 1)],
            [("expire", -1)],
        ]

class VerificationToken(Document):
    email: Indexed(str) # type: ignore
    token: Indexed(str, unique=True) # type: ignore
    expire: datetime
    revoked: bool = False
    
    # Timestamp fields
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "verification_tokens"
        indexes = [
            [("email", 1)],
            [("token", 1)],
            [("expire", -1)],
        ]

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

class CheckToken(BaseModel):
    is_expired: bool
    is_valid: bool
    