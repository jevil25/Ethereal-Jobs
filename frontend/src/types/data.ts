export interface LinkedInProfile {
  name: string;
  profile_url: string;
  vanity_name: string;
}

export interface JobData {
  id: string;
  site: string;
  url: string;
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
  has_linkedIn_profiles: boolean;
}

export interface JobDataWithLinkedInProfiles extends JobData {
  linkedin_profiles: LinkedInProfile[];
  is_success: boolean;
  is_empty: boolean;
}

export interface User {
  email: string;
  name: string;
  is_onboarded: boolean;
}
