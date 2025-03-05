import { RootState } from "../lib/redux/store";

interface GetJobsRequest {
    city: string;
    country_code: string;
    country: string;
    job_title: string;
    recruiters: string;
}

interface ResumeSaveRequest {
    state: RootState;
}

interface ResumeSaveResponse {
    email?: string;
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
}

export {
    Provider
}
