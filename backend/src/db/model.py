from datetime import datetime, timedelta
from typing import List, Optional
from beanie import Document, Indexed, before_event, Insert, BeanieObjectId
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

class LinkedInProfile(BaseModel):
    name: str
    vanity_name: str
    profile_url: str

class CompanyLinkedInProfiles(Document):
    jobId: Indexed(str) # type: ignore
    profiles: List[LinkedInProfile]
    
    # Timestamp fields
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "company_linkedin_profiles"
        indexes = [
            [("company", 1), ("city", 1), ("title", 1)],
        ]

class UserLinkedInProfiles(Document):
    email: Indexed(str) # type: ignore
    jobId: Indexed(str) # type: ignore
    profiles: List[LinkedInProfile]
    
    # Timestamp fields
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "user_linkedin_profiles"
        indexes = [
            [("email", 1)],
        ]

class User(Document):
    name: str
    email: Indexed(str, unique=True) # type: ignore
    password: str
    provider: str
    is_verified: bool = False
    is_onboarded: bool = False
    
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

class LinkedMessages(Document):
    email: Indexed(str) # type: ignore
    company: Indexed(str) # type: ignore
    position: Indexed(str) # type: ignore
    message: str
    
    # Timestamp fields
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "linkedin_messages"
        indexes = [
            [("resume_id", 1)],
            [("company", 1)],
            [("position", 1)],
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
    
class PersonalInfo(BaseModel):
    headline: str
    location: str
    phone: str
    website: str

class JobPreferences(BaseModel):
    jobTypes: List[str]
    locations: List[str]
    remotePreference: str
    salaryExpectation: str
    immediateStart: bool

class Experience(BaseModel):
    id: str
    company: str
    title: str
    location: str
    startDate: str
    endDate: str
    current: bool
    description: str

class Education(BaseModel):
    id: str
    school: str
    degree: str
    fieldOfStudy: str
    startDate: str
    endDate: str
    current: bool
    grade: Optional[str] = None

class SkillsCardProps(BaseModel):
    data: List[str]

class Project(BaseModel):
    id: str
    title: str
    url: str
    technologies: List[str]
    description: str

class Certification(BaseModel):
    id: str
    name: str
    description: str
    credentialUrl: str

class ResumeModel(Document):
    email: Indexed(str) # type: ignore
    personalInfo: PersonalInfo
    experience: List[Experience]
    education: List[Education]
    projects: List[Project]
    certifications: List[Certification]
    skills: List[str]
    jobPreferences: JobPreferences
    resumeFile: Optional[str] = None
    
    # Timestamp fields
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "resume"
        indexes = [
            [("email", 1)],
        ]
class ResumeUpdate(BaseModel):
    personalInfo: PersonalInfo
    experience: List[Experience]
    education: List[Education]
    projects: List[Project]
    certifications: List[Certification]
    skills: List[str]
    jobPreferences: JobPreferences
    resumeFile: Optional[str] = None
    is_onboarded: bool = True

class AiOptimzedResumeModel(Document):
    email: Indexed(str) # type: ignore
    personalInfo: PersonalInfo
    experience: List[Experience]
    education: List[Education]
    projects: List[Project]
    certifications: List[Certification]
    skills: List[str]
    jobPreferences: JobPreferences
    is_main_resume: bool = True
    job_id: Optional[str] = None
    
    # Timestamp fields
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

    @before_event(Insert)
    def check_job_id(self):
        if not self.is_main_resume and not self.job_id:
            raise ValueError("Job ID is required for non-main resume")

    class Settings:
        name = "ai_optimized_resume"
        indexes = [
            [("email", 1)],
        ]

class AIResumeUpdate(BaseModel):
    is_main_resume: bool
    job_id: Optional[str] = None
    regenerate: Optional[bool] = False

class AIResumeSave(BaseModel):
    is_main_resume: bool
    job_id: Optional[str] = None
    data: ResumeUpdate

class DownloadResume(BaseModel):
    optimized: bool
    is_main_resume: bool = False
    job_id: Optional[str] = None
