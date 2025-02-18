import type { RootState } from "../../lib/redux/store";
import axios from "axios";
import { constructServerUrlFromPath } from "../../utils/helper";

// Reference: https://dev.to/igorovic/simplest-way-to-persist-redux-state-to-localstorage-e67

const LOCAL_STORAGE_KEY = "open-resume-state";

export const loadStateFromLocalStorage = () => {
  try {
    const stringifiedState = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!stringifiedState) return undefined;
    return JSON.parse(stringifiedState) as RootState;
  } catch (e) {
    return undefined;
  }
};

export const saveStateToLocalStorage = (state: RootState) => {
  try {
    const stringifiedState = JSON.stringify(state);
    localStorage.setItem(LOCAL_STORAGE_KEY, stringifiedState);
  } catch (e) {
    // Ignore
  }
};

export const saveStateToDatabase = async (state: RootState) => {
  try {
    const existingResumeId = localStorage.getItem("resumeId");
    if (!existingResumeId) {  
      const response = await axios.post(constructServerUrlFromPath("/resume/save"), state);
      console.log(`Saved state to database: ${response.data}`);
      const resumeId = response.data.resume_id;
      return localStorage.setItem("resumeId", resumeId);
    }
    await axios.put(constructServerUrlFromPath(`/resume/${existingResumeId}`), state);
  } catch (e) {
    console.log(`Error saving state to database: ${e}`)
  }
};

export const loadStateFromDatabase = async () => {
  try {
    const resumeId = localStorage.getItem("resumeId");
    if (!resumeId) return;
    const response = await axios.get(constructServerUrlFromPath(`/resume/${resumeId}`));
    return response.data as RootState;
  } catch (e) {
    console.log(`Error loading state from database: ${e}`);
    return undefined;
  }
};

export const getHasUsedAppBefore = () => Boolean(loadStateFromDatabase());
