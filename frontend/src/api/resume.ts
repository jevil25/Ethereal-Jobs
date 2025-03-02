import axios from "axios";
import { constructServerUrlFromPath } from "../utils/helper";
import { ResumeSaveRequest, ResumeSaveResponse } from "./types";
import { RootState } from "../lib/redux/store";

// post /resume/save
const saveResumeDetails = async (data: ResumeSaveRequest): Promise<ResumeSaveResponse> => {
    const response = await axios.post(constructServerUrlFromPath("/resume/save"), data.state);
    console.log(`Saved state to database: ${response.data}`);
    const resumeId = response.data.resume_id as string;
    return {
        resumeId
    }
}

// put /resume/:existingResumeId
const updateResumeDetails = async (data: ResumeSaveRequest, existingResumeId: string): Promise<void> => {
    const response = await axios.put(constructServerUrlFromPath(`/resume/${existingResumeId}`), data.state);
    if (response.status == 201){
        localStorage.setItem('resumeId', response.data.resume_id);
        return console.log(`Created new state in database: ${existingResumeId}`);
    }
    console.log(`Updated state to database: ${existingResumeId}`);
}

// get /resume/:resumeId
const getResumeDetails = async (resumeId: string): Promise<RootState> => {
    const response = await axios.get(constructServerUrlFromPath(`/resume/${resumeId}`));
    return response.data as RootState;
}


export {
    saveResumeDetails,
    updateResumeDetails,
    getResumeDetails
}
