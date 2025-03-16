import axios from "axios";
import { constructServerUrlFromPath } from "../utils/helper";
import {
  ResumeSaveRequest,
  extractResumeRequest,
  GenerateAiResumeRequest,
  GenerateAiResumeResponse,
  GenerateAiGetResumeRequest,
  GenerateAiGetResumeResponse,
  DownloadResumeRequest,
  GenerateAiResumeUpdateRequest,
} from "./types";
import { FormData as customFormData } from "./types";
import { userRefresh } from "./user";

// put /resume
const updateResumeDetails = async (
  data: ResumeSaveRequest,
  is_onboarded: boolean,
): Promise<void> => {
  // for now make file as null
  // TODO: add file logic
  data.data.resumeFile = null;
  const data_to_send = {
    ...data.data,
    is_onboarded: is_onboarded,
  };
  const response = await axios.post(
    constructServerUrlFromPath(`/resume`),
    data_to_send,
  );
  if (
    response.data &&
    response.data.detail &&
    response.data.detail === "Token expired"
  ) {
    await userRefresh();
    await axios.post(constructServerUrlFromPath(`/resume`), data_to_send);
  }
};

// get /resume
const getResumeDetails = async (): Promise<customFormData> => {
  const response = await axios.get(constructServerUrlFromPath(`/resume`));
  return response.data as customFormData;
};

export { updateResumeDetails, getResumeDetails };

// post /extract/resume
export const extractResume = async (
  data: extractResumeRequest,
  controller?: AbortController,
): Promise<customFormData | undefined> => {
  const formData = new FormData();
  formData.append("file", data.file);

  const response = await axios.post(
    constructServerUrlFromPath(`/extract/resume`),
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      signal: controller?.signal,
    },
  );
  if (response.data.is_success) {
    return response.data.extracted_data as customFormData;
  }
  return undefined;
};

// get /resume/ai/generate
export const getResume = async (
  data: GenerateAiGetResumeRequest,
  signal: AbortSignal,
): Promise<GenerateAiGetResumeResponse | undefined> => {
  const response = await axios.get(
    constructServerUrlFromPath(`/resume/ai/generate`),
    {
      params: data,
      signal: signal,
    },
  );
  if (response.data.is_success) {
    return response.data as GenerateAiGetResumeResponse;
  }
  return undefined;
};

// post /resume/ai/generate
export const generateResume = async (
  data: GenerateAiResumeRequest,
): Promise<GenerateAiResumeResponse | undefined> => {
  const response = await axios.post(
    constructServerUrlFromPath(`/resume/ai/generate`),
    data,
  );
  if (response.data.is_success) {
    return response.data as GenerateAiResumeResponse;
  }
  return undefined;
};

// post /resume/ai/update
export const updateGeneratedResume = async (
  data: GenerateAiResumeUpdateRequest,
): Promise<GenerateAiResumeResponse | undefined> => {
  const response = await axios.post(
    constructServerUrlFromPath(`/resume/ai/update`),
    data,
  );
  if (response.data.is_success) {
    return response.data as GenerateAiResumeResponse;
  }
  return undefined;
};

// post /resume/download
export const DownloadResume = async (
  data: DownloadResumeRequest,
): Promise<void> => {
  const response = await axios.post(
    constructServerUrlFromPath(`/resume/download`),
    data,
    {
      responseType: "blob",
    },
  );
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "resume.pdf");
  document.body.appendChild(link);
  link.click();
  link.remove();
};
