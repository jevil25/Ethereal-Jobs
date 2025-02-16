from dataclasses import dataclass
from typing import Optional
from pydantic import BaseModel

@dataclass
class Job(BaseModel):
    id: Optional[int]
    site: str
    job_url: Optional[str]
    job_url_direct: str
    title: Optional[str]
    company: Optional[str]
    location: str
    date_posted: Optional[str]
    job_type: str
    salary_source: str
    interval: str
    min_amount: float
    max_amount: float
    currency: str
    is_remote: bool
    job_level: str
    job_function: str
    listing_type: str
    emails: str
    description: str
    company_industry: str
    company_url: str
    company_logo: str
    company_url_direct: str
    company_addresses: str
    company_num_employees: str
    company_revenue: str
    company_description: str
