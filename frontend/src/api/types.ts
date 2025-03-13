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
    resumeId: string;
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
    Google = 'google',
    Custom = 'custom'
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
    skills: SkillsCardProps['data'];
    jobPreferences: JobPreferences;
    resumeFile: File | null;
    no_resume_found?: boolean;
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
}

export {
    Provider
}
