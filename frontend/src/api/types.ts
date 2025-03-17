import { Experience } from "@/components/OnBoarding/ExperienceCard";
import { Education } from "@/components/OnBoarding/EducationCard";
import { SkillsCardProps } from "@/components/OnBoarding/SkillsCard";
import { Project } from "@/components/OnBoarding/ProjectCard";
import { Certification } from "@/components/OnBoarding/CertificationCard";

interface GetJobsRequest {
  city: string;
  country_code: string;
  country: string;
  job_title: string;
  recruiters: string;
  job_type: string; 
  results_wanted?: number;
}

interface ResumeSaveRequest {
  data: FormData;
}

interface ResumeSaveResponse {
  message: string;
  is_updated: boolean;
}

interface extractResumeRequest {
  file: File;
}

interface LinkedInGenerateMessageRequest {
  position: string;
  company: string;
  email: string;
  newMessage: boolean;
}

interface LinkedInGenerateMessageResponse {
  position: string;
  company: string;
  resumeId: string;
  message: string;
  no_resume_found?: boolean;
}

interface AutoSuggestionsRequest {
  query: string;
}

interface Suggestions {
  score: number;
  suggestion: string;
}

interface AutoSuggestionsResponse {
  suggestions: Suggestions[];
}

interface AutoSuggestionsRequestLocation {
  query: string;
  country: string;
}
interface locationSuggestion {
  latitude: number;
  locationType: string;
  longitude: number;
  popularity: number;
  population: number;
  suggestion: string;
}

interface AutoSuggestionsLocationResponse {
  suggestions: locationSuggestion[];
}

enum Provider {
  Google = "google",
  Custom = "custom",
}
interface UserSignupRequest {
  email: string;
  password: string;
  name: string;
  provider: Provider;
}

interface UserSignupResponse {
  message: string;
  is_created: boolean;
  is_exists: boolean;
  user_id: string | undefined;
}

interface UserSigninRequest {
  email: string;
  password: string;
  provider: Provider;
}

interface UserSigninResponse {
  message: string;
  is_exists: boolean;
  is_valid: boolean;
  is_verified: boolean;
  is_onboarded: boolean;
}

interface ResetPasswordRequest {
  email: string;
}

interface ResetPasswordResponse {
  message: string;
  is_exists: boolean;
  is_valid: boolean;
}

interface ResetPasswordCheckRequest {
  token: string;
}

interface ResetPasswordCheckResponse {
  message: string;
  is_valid: boolean;
  is_expired: boolean;
}

interface ResetPasswordUpdateRequest {
  token: string;
  password: string;
}

interface ResetPasswordUpdateResponse {
  message: string;
  is_valid: boolean;
  is_expired: boolean;
}

interface sendVerificationEmailRequest {
  email: string;
}

interface sendVerificationEmailResponse {
  message: string;
  is_valid: boolean;
  is_verified: boolean;
}

interface verifyEmailRequest {
  token: string;
}

interface verifyEmailResponse {
  message: string;
  is_valid: boolean;
  is_expired: boolean;
  email?: string;
}

interface PersonalInfo {
  headline: string;
  location: string;
  phone: string;
  website: string;
}

interface JobPreferences {
  jobTypes: string[];
  locations: string[];
  remotePreference: string;
  salaryExpectation: string;
  immediateStart: boolean;
}

interface FormData {
  personalInfo: PersonalInfo;
  experience: Experience[];
  education: Education[];
  projects: Project[];
  certifications: Certification[];
  skills: SkillsCardProps["data"];
  jobPreferences: JobPreferences;
  resumeFile: File | null;
  no_resume_found?: boolean;
}

interface GenerateAiGetResumeRequest {
  is_main_resume: boolean;
  job_id?: string;
}

interface GenerateAiGetResumeResponse {
  message: string;
  extracted_data?: FormData;
  is_success: boolean;
}

interface GenerateAiResumeRequest {
  is_main_resume: boolean;
  regenerate: boolean;
  job_id?: string;
}

interface GenerateAiResumeResponse {
  message: string;
  extracted_data: FormData;
  is_success: boolean;
  no_resume_found?: boolean;
}

interface GenerateAiResumeUpdateRequest {
  is_main_resume: boolean;
  job_id?: string;
  data: FormData;
}

interface DownloadResumeRequest {
  optimized: boolean;
  is_main_resume: boolean;
  job_id?: string;
}

export type {
  ResumeSaveRequest,
  ResumeSaveResponse,
  GetJobsRequest,
  LinkedInGenerateMessageRequest,
  LinkedInGenerateMessageResponse,
  AutoSuggestionsRequest,
  AutoSuggestionsResponse,
  AutoSuggestionsRequestLocation,
  AutoSuggestionsLocationResponse,
  UserSignupRequest,
  UserSignupResponse,
  UserSigninRequest,
  UserSigninResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  ResetPasswordCheckRequest,
  ResetPasswordCheckResponse,
  ResetPasswordUpdateRequest,
  ResetPasswordUpdateResponse,
  sendVerificationEmailRequest,
  sendVerificationEmailResponse,
  verifyEmailRequest,
  verifyEmailResponse,
  FormData,
  PersonalInfo,
  JobPreferences,
  extractResumeRequest,
  GenerateAiGetResumeRequest,
  GenerateAiGetResumeResponse,
  GenerateAiResumeRequest,
  GenerateAiResumeResponse,
  DownloadResumeRequest,
  GenerateAiResumeUpdateRequest,
};

export { Provider };
