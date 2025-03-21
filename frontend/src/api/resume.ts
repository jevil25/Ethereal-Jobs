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
import showToast from "../components/ui/toast";

// put /resume
export const updateResumeDetails = async (
  data: ResumeSaveRequest,
  is_onboarded: boolean,
): Promise<void> => {
  try {
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
  } catch (error) {
    showToast("Failed to update resume details. Please try again.", "error");
  }
};

// get /resume
export const getResumeDetails = async (): Promise<customFormData> => {
  try {
    const response = await axios.get(constructServerUrlFromPath(`/resume`));
    if (response.data.detail === "Token expired") {
      await userRefresh();
      return await axios.get(constructServerUrlFromPath(`/resume`)).then(res => res.data as customFormData);
    }
    return response.data as customFormData;
  } catch (error) {
    showToast("Failed to fetch resume details. Please try again.", "error");
    throw error;
  }
};

// post /extract/resume
export const extractResume = async (
  data: extractResumeRequest,
  controller?: AbortController,
): Promise<customFormData | undefined> => {
  try {
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
    if (response.data.detail === "Token expired") {
      await userRefresh();
      return await axios.post(
        constructServerUrlFromPath(`/extract/resume`),
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          signal: controller?.signal,
        },
      ).then(res => res.data as customFormData);
    }
    if (response.data.is_success) {
      return response.data.extracted_data as customFormData;
    }
    return undefined;
  } catch (error) {
    showToast("Failed to extract resume. Please try again.", "error");
    return undefined;
  }
};

// get /resume/ai/generate
export const getResume = async (
  data: GenerateAiGetResumeRequest,
  signal: AbortSignal,
): Promise<GenerateAiGetResumeResponse | undefined> => {
  try {
    const response = await axios.get(
      constructServerUrlFromPath(`/resume/ai/generate`),
      {
        params: data,
        signal: signal,
      },
    );
    if (response.data.detail === "Token expired") {
      await userRefresh();
      return await axios.get(
        constructServerUrlFromPath(`/resume/ai/generate`),
        {
          params: data,
          signal: signal,
        },
      ).then(res => res.data as GenerateAiGetResumeResponse);
    }
    if (response.data.is_success) {
      return response.data as GenerateAiGetResumeResponse;
    }
    return undefined;
  } catch (error) {
    showToast("Failed to fetch AI-generated resume. Please try again.", "error");
    return undefined;
  }
};

// post /resume/ai/generate
export const generateResume = async (
  data: GenerateAiResumeRequest,
): Promise<GenerateAiResumeResponse | undefined> => {
  try {
    const response = await axios.post(
      constructServerUrlFromPath(`/resume/ai/generate`),
      data,
    );
    if (response.data.detail === "Token expired") {
      await userRefresh();
      return await axios.post(
        constructServerUrlFromPath(`/resume/ai/generate`),
        data,
      ).then(res => res.data as GenerateAiResumeResponse);
    }
    if (response.data.is_success) {
      return response.data as GenerateAiResumeResponse;
    }
    return undefined;
  } catch (error) {
    showToast("Failed to generate AI resume. Please try again.", "error");
    return undefined;
  }
};

// post /resume/ai/update
export const updateGeneratedResume = async (
  data: GenerateAiResumeUpdateRequest,
): Promise<GenerateAiResumeResponse | undefined> => {
  try {
    const response = await axios.post(
      constructServerUrlFromPath(`/resume/ai/update`),
      data,
    );
    if (response.data.detail === "Token expired") {
      await userRefresh();
      return await axios.post(
        constructServerUrlFromPath(`/resume/ai/update`),
        data,
      ).then(res => res.data as GenerateAiResumeResponse);
    }
    if (response.data.is_success) {
      return response.data as GenerateAiResumeResponse;
    }
    return undefined;
  } catch (error) {
    showToast("Failed to update AI-generated resume. Please try again.", "error");
    return undefined;
  }
};

// post /resume/download
export const DownloadResume = async (
  data: DownloadResumeRequest,
): Promise<void> => {
  try {
    let response = await axios.post(
      constructServerUrlFromPath(`/resume/download`),
      data,
      {
        responseType: "blob",
      },
    );
    if (response.data.detail === "Token expired") {
      await userRefresh();
      response = await axios.post(
        constructServerUrlFromPath(`/resume/download`),
        data,
        {
          responseType: "blob",
        },
      );
    }
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "resume.pdf");
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error) {
    showToast("Failed to download resume. Please try again.", "error");
  }
};
