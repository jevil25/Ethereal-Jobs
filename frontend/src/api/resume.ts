import axios from "axios";
import { constructServerUrlFromPath } from "../utils/helper";
import { ResumeSaveRequest } from "./types";
import { FormData } from "./types";
import { userRefresh } from "./user";

// put /resume/:email
const updateResumeDetails = async (data: ResumeSaveRequest, is_onboarded: boolean): Promise<void> => {
    const data_to_send = {    
        ...data.data,
        is_onboarded: is_onboarded
    }
    const response = await axios.post(constructServerUrlFromPath(`/resume`), data_to_send);
    if (response.data && response.data.detail && response.data.detail === 'Token expired') {
        await userRefresh();
        await axios.post(constructServerUrlFromPath(`/resume`), data_to_send);
    }
    console.log(`Updated state to database`);
}

// get /resume/:resumeId
const getResumeDetails = async (): Promise<FormData> => {
    const response = await axios.get(constructServerUrlFromPath(`/resume`));
    return response.data as FormData;
}

export {
    updateResumeDetails,
    getResumeDetails
}
