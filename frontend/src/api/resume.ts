import axios from "axios";
import { constructServerUrlFromPath } from "../utils/helper";
import { ResumeSaveRequest, ResumeSaveResponse } from "./types";
import { RootState } from "../lib/redux/store";

// post /resume/save
const saveResumeDetails = async (data: ResumeSaveRequest): Promise<ResumeSaveResponse> => {
    const response = await axios.post(constructServerUrlFromPath("/resume/save"), data.state);
    console.log(`Saved state to database: ${response.data}`);
    const email = response.data.email as string;
    return {
        email
    }
}

// put /resume/:existingResumeId
const updateResumeDetails = async (data: ResumeSaveRequest, email: string): Promise<void> => {
    const response = await axios.put(constructServerUrlFromPath(`/resume/${email}`), data.state);
    if (response.status == 201){
        localStorage.setItem('resumeId', response.data.resume_id);
        return console.log(`Created new state in database: ${email}`);
    }
    console.log(`Updated state to database: ${email}`);
}

// get /resume/:resumeId
const getResumeDetails = async (email: string): Promise<RootState> => {
    const response = await axios.get(constructServerUrlFromPath(`/resume/${email}`));
    return response.data as RootState;
}


export {
    saveResumeDetails,
    updateResumeDetails,
    getResumeDetails
}
