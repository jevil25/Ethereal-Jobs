import type { RootState } from "../../lib/redux/store";
import { updateResumeDetails, getResumeDetails } from "../../api/resume";

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
      // const resumeId = await saveResumeDetails({ state });
      // if (!resumeId.email) return;
      // return localStorage.setItem("resumeId", resumeId.email);
    }
    // await updateResumeDetails({ state }, existingResumeId);
  } catch (e) {
    console.log(`Error saving state to database: ${e}`);
  }
};

export const loadStateFromDatabase = async () => {
  try {
    const resumeId = localStorage.getItem("resumeId");
    if (!resumeId) return;
    // const response = await getResumeDetails(resumeId);
    // return response;
  } catch (e) {
    console.log(`Error loading state from database: ${e}`);
    return undefined;
  }
};

export const getHasUsedAppBefore = () => Boolean(loadStateFromDatabase());
