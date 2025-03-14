import axios from "axios";
import { constructServerUrlFromPath } from "../utils/helper";
import { ResumeSaveRequest, extractResumeRequest, GenerateAiResumeRequest, GenerateAiResumeResponse, GenerateAiGetResumeRequest, GenerateAiGetResumeResponse } from "./types";
import { FormData as customFormData } from "./types";
import { userRefresh } from "./user";

// put /resume/:email
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
  console.log(`Updated state to database`);
};

// get /resume/:resumeId
const getResumeDetails = async (): Promise<customFormData> => {
  const response = await axios.get(constructServerUrlFromPath(`/resume`));
  return response.data as customFormData;
};

export { updateResumeDetails, getResumeDetails };

// post /extract/resume
export const extractResume = async (
  data: extractResumeRequest,
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
): Promise<GenerateAiGetResumeResponse | undefined> => {
  const response = await axios.get(
    constructServerUrlFromPath(`/resume/ai/generate`),
    {
      params: data,
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
}
