interface LinkedInProfile {
  name: string;
  profile_url: string;
  vanity_name: string;
}

export interface JobData {
    id: string;
    site: string;
    job_url: string;
    job_url_direct: string;
    title: string;
    company: string;
    location: string;
    date_posted: string;
    job_type: string;
    salary_source: string;
    interval: string;
    min_amount: number;
    max_amount: number;
    currency: string;
    is_remote: boolean;
    job_level: string;
    job_function: string;
    listing_type: string;
    emails: string;
    description: string;
    company_industry: string;
    company_url: string;
    company_logo: string;
    company_url_direct: string;
    company_addresses: string;
    company_num_employees: string;
    company_revenue: string;
    company_description: string;
    linkedin_profiles: LinkedInProfile[];
  }