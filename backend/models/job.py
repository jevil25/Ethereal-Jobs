from dataclasses import dataclass
from typing import Optional
from pydantic import BaseModel

@dataclass
class Job(BaseModel):
    id: str
    site: str
    job_url: str
    job_url_direct: Optional[str] = None
    title: str
    company: str
    location: Optional[str] = None
    date_posted: Optional[str] = None
    job_type: Optional[str] = None
    salary_source: Optional[str] = None
    interval: Optional[str] = None
    min_amount: Optional[str] = None
    max_amount: Optional[str] = None
    currency: Optional[str] = None
    is_remote: Optional[str] = None
    job_level: Optional[str] = None
    job_function: Optional[str] = None
    listing_type: Optional[str] = None
    emails: Optional[str] = None
    description: Optional[str] = None
    company_industry: Optional[str] = None
    company_url: Optional[str] = None
    company_logo: Optional[str] = None
    company_url_direct: Optional[str] = None
    company_addresses: Optional[str] = None
    company_num_employees: Optional[str] = None
    company_revenue: Optional[str] = None
    company_description: Optional[str] = None
