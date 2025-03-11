import { JobData } from "../types/data";
import { GetJobsRequest, LinkedInGenerateMessageResponse, LinkedInGenerateMessageRequest, AutoSuggestionsRequest, AutoSuggestionsResponse, AutoSuggestionsRequestLocation,  AutoSuggestionsLocationResponse } from "./types";
import { constructServerUrlFromPath } from "../utils/helper";
import axios, { CancelTokenSource } from 'axios';
import { userRefresh } from "./user";

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
    console.log('getLinkedInProfilesForJob', jobId);
    const response = await axios.get(constructServerUrlFromPath(`/job/${jobId}/linkedin/profile`));
    return response.data as JobData;
}

// get /generate/linkedin/message/:resumeId
export const generateLinkedInMessage = async (params: LinkedInGenerateMessageRequest): Promise<LinkedInGenerateMessageResponse> => {
    const response = await axios.get(constructServerUrlFromPath(`/generate/linkedin/message/${params.resumeId}`), { params });
    if (response.data && response.data.detail && response.data.detail === 'Token expired') {
       await userRefresh();
        await axios.get(constructServerUrlFromPath(`/generate/linkedin/message/${params.resumeId}`), { params });
    }
    return response.data as LinkedInGenerateMessageResponse;
}

// get /search/suggestions/job_title
export const getSearchSuggestions = async (params: AutoSuggestionsRequest): Promise<AutoSuggestionsResponse> => {
    const response = await axios.get(constructServerUrlFromPath('/search/suggestions/job_title'), { params });
    return response.data as AutoSuggestionsResponse;
}

// get /search/suggestions/location
export const getLocationSuggestions = async (params: AutoSuggestionsRequestLocation): Promise<AutoSuggestionsLocationResponse> => {
    const response = await axios.get(constructServerUrlFromPath('/search/suggestions/location'), { params });
    return response.data as AutoSuggestionsLocationResponse;
}
