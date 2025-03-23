/* eslint-disable @typescript-eslint/no-explicit-any */
import { JobData, JobDataWithLinkedInProfiles } from "../types/data";
import {
  GetJobsRequest,
  LinkedInGenerateMessageResponse,
  LinkedInGenerateMessageRequest,
  AutoSuggestionsRequest,
  AutoSuggestionsResponse,
  AutoSuggestionsRequestLocation,
  AutoSuggestionsLocationResponse,
  ApplicationStatus,
} from "./types";
import { constructServerUrlFromPath } from "../utils/helper";
import axios, { CancelTokenSource } from "axios";
import { userRefresh } from "./user";
import showToast from "../components/ui/toast";

// get /jobs
let cancelTokenSource: CancelTokenSource | null = null;

export const getJobs = async (params: GetJobsRequest): Promise<JobData[]> => {
  try {
    if (cancelTokenSource) {
      cancelTokenSource.cancel("Operation canceled due to new request.");
    }
    cancelTokenSource = axios.CancelToken.source();

    if (!params.results_wanted) params.results_wanted = 10;

    const response = await axios.get(constructServerUrlFromPath("/jobs"), {
      params,
      cancelToken: cancelTokenSource.token,
    });
    if (
      response.data &&
      response.data.detail &&
      response.data.detail === "Token expired"
    ) {
      await userRefresh();
      return await axios
        .get(constructServerUrlFromPath("/jobs"), {
          params,
          cancelToken: cancelTokenSource.token,
        })
        .then((res) => res.data as JobData[]);
    }

    return response.data as JobData[];
  } catch (error: any) {
    // showToast(
    //   "Error fetching jobs: " + (error.message || "Unknown error"),
    //   "error",
    // );
    console.error("Error fetching jobs: " + (error.message || "Unknown error"));
    throw error;
  }
};

export const getJob = async (jobId: string): Promise<JobData> => {
  try {
    const response = await axios.get(
      constructServerUrlFromPath(`/job/${jobId}`),
    );
    if (
      response.data &&
      response.data.detail &&
      response.data.detail === "Token expired"
    ) {
      await userRefresh();
      return await axios
        .get(constructServerUrlFromPath(`/job/${jobId}`))
        .then((res) => res.data as JobData);
    }
    return response.data as JobData;
  } catch (error: any) {
    showToast(
      "Error fetching job: " + (error.message || "Unknown error"),
      "error",
    );
    throw error;
  }
};

// get /job/:id/linkedin/profile
export const getLinkedInProfilesForJob = async (
  jobId: string,
  getNew: boolean = false,
): Promise<JobDataWithLinkedInProfiles> => {
  try {
    const response = await axios.get(
      constructServerUrlFromPath(
        `/job/${jobId}/linkedin/profile?get_new=${getNew}`,
      ),
    );
    if (
      response.data &&
      response.data.detail &&
      response.data.detail === "Token expired"
    ) {
      await userRefresh();
      return await axios
        .get(
          constructServerUrlFromPath(
            `/job/${jobId}/linkedin/profile?get_new=${getNew}`,
          ),
        )
        .then((res) => res.data as JobDataWithLinkedInProfiles);
    }
    return response.data as JobDataWithLinkedInProfiles;
  } catch (error: any) {
    showToast(
      "Error fetching LinkedIn profiles: " + (error.message || "Unknown error"),
      "error",
    );
    throw error;
  }
};

// get /generate/linkedin/message/:resumeId
export const generateLinkedInMessage = async (
  params: LinkedInGenerateMessageRequest,
): Promise<LinkedInGenerateMessageResponse> => {
  try {
    const response = await axios.get(
      constructServerUrlFromPath(`/generate/linkedin/message/${params.email}`),
      { params },
    );
    if (
      response.data &&
      response.data.detail &&
      response.data.detail === "Token expired"
    ) {
      await userRefresh();
      return await axios
        .get(
          constructServerUrlFromPath(
            `/generate/linkedin/message/${params.email}`,
          ),
          { params },
        )
        .then((res) => res.data as LinkedInGenerateMessageResponse);
    }
    return response.data as LinkedInGenerateMessageResponse;
  } catch (error: any) {
    showToast(
      "Error generating LinkedIn message: " +
        (error.message || "Unknown error"),
      "error",
    );
    throw error;
  }
};

// get /search/suggestions/job_title
export const getSearchSuggestions = async (
  params: AutoSuggestionsRequest,
): Promise<AutoSuggestionsResponse> => {
  try {
    const response = await axios.get(
      constructServerUrlFromPath("/search/suggestions/job_title"),
      { params },
    );
    if (
      response.data &&
      response.data.detail &&
      response.data.detail === "Token expired"
    ) {
      await userRefresh();
      return await axios
        .get(constructServerUrlFromPath("/search/suggestions/job_title"), {
          params,
        })
        .then((res) => res.data as AutoSuggestionsResponse);
    }
    return response.data as AutoSuggestionsResponse;
  } catch (error: any) {
    showToast(
      "Error fetching search suggestions: " +
        (error.message || "Unknown error"),
      "error",
    );
    throw error;
  }
};

// get /search/suggestions/location
export const getLocationSuggestions = async (
  params: AutoSuggestionsRequestLocation,
): Promise<AutoSuggestionsLocationResponse> => {
  try {
    const response = await axios.get(
      constructServerUrlFromPath("/search/suggestions/location"),
      { params },
    );
    if (
      response.data &&
      response.data.detail &&
      response.data.detail === "Token expired"
    ) {
      await userRefresh();
      return await axios
        .get(constructServerUrlFromPath("/search/suggestions/location"), {
          params,
        })
        .then((res) => res.data as AutoSuggestionsLocationResponse);
    }
    return response.data as AutoSuggestionsLocationResponse;
  } catch (error: any) {
    showToast(
      "Error fetching location suggestions: " +
        (error.message || "Unknown error"),
      "error",
    );
    throw error;
  }
};

// post /job/application_status/update
export const applicationStatusUpdate = async (
  jobId: string,
  ApplicationStatus: ApplicationStatus,
): Promise<void> => {
  try {
    const response = await axios.post(
      constructServerUrlFromPath(`/job/application_status/update`),
      { status: ApplicationStatus, job_id: jobId },
    );
    if (
      response.data &&
      response.data.detail &&
      response.data.detail === "Token expired"
    ) {
      await userRefresh();
      return await axios
        .post(constructServerUrlFromPath(`/job/${jobId}`))
        .then(() => {});
    }
  } catch (error: any) {
    showToast(
      "Error applying to job: " + (error.message || "Unknown error"),
      "error",
    );
    throw error;
  }
};

// post /job/applied_jobs
export const getAppliedJobs = async (): Promise<JobData[]> => {
  try {
    const response = await axios.get(
      constructServerUrlFromPath(`/job/applied_jobs`),
    );
    if (
      response.data &&
      response.data.detail &&
      response.data.detail === "Token expired"
    ) {
      await userRefresh();
      return await axios
        .post(constructServerUrlFromPath(`/job/applied_jobs`))
        .then((res) => {
          if (res.data.message === "No applied jobs found") {
            return [];
          }
          return res.data as JobData[];
        });
    }
    if (response.data.message === "No applied jobs found") {
      return [];
    }
    return response.data as JobData[];
  } catch (error: any) {
    showToast(
      "Error applying to job: " + (error.message || "Unknown error"),
      "error",
    );
    throw error;
  }
};
