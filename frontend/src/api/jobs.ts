import { JobData } from "../types/data";
import { GetJobsRequest, LinkedInGenerateMessageResponse, LinkedInGenerateMessageRequest } from "./types";
import axios from 'axios';
import { constructServerUrlFromPath } from "../utils/helper";

// get /jobs
export const getJobs = async (params: GetJobsRequest): Promise<JobData[]> => {
  const response = await axios.get(constructServerUrlFromPath('/jobs'), { params });
  return response.data as JobData[];
}

// get /job/:id/linkedin/profile
export const getLinkedInProfilesForJob = async (jobId: string): Promise<JobData> => {
    const response = await axios.get(constructServerUrlFromPath(`/job/${jobId}/linkedin/profile`));
    return response.data as JobData;
}

// get /generate/linkedin/message/:resumeId
export const generateLinkedInMessage = async (params: LinkedInGenerateMessageRequest): Promise<LinkedInGenerateMessageResponse> => {
    const response = await axios.get(constructServerUrlFromPath(`/generate/linkedin/message/${params.resumeId}`), { params });
    return response.data as LinkedInGenerateMessageResponse;
}
