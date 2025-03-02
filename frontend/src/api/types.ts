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
    resumeId?: string;
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

interface UserSignupRequest {
    email: string;
    password: string;
    name: string;
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
}

interface UserSigninResponse {
    message: string;
    is_exists: boolean;
    is_valid: boolean;
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
    UserSigninResponse
}
