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

export type {
    ResumeSaveRequest,
    ResumeSaveResponse,
    GetJobsRequest,
    LinkedInGenerateMessageRequest,
    LinkedInGenerateMessageResponse
}
