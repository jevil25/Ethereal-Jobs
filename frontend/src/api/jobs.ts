import { JobData } from "../types/data";
import { GetJobsRequest, LinkedInGenerateMessageResponse, LinkedInGenerateMessageRequest } from "./types";
import { constructServerUrlFromPath } from "../utils/helper";
import axios, { CancelTokenSource } from 'axios';

// get /jobs
let cancelTokenSource: CancelTokenSource | null = null;

export const getJobs = async (params: GetJobsRequest): Promise<JobData[]> => {
  if (cancelTokenSource) {
    cancelTokenSource.cancel('Operation canceled due to new request.');
  }
  cancelTokenSource = axios.CancelToken.source();

  const response = await axios.get(constructServerUrlFromPath('/jobs'), {
    params,
    cancelToken: cancelTokenSource.token,
  });

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
