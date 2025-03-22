import { useState, useEffect, useRef, useCallback } from "react";
import { debounce } from "lodash";
import { FormData } from "../../../api/types";
import {
  updateResumeDetails,
  getResumeDetails,
  getResume,
  generateResume,
  DownloadResume,
  updateGeneratedResume,
} from "../../../api/resume";

export const useResumeData = () => {
  const emptyResumeData: FormData = {
    personalInfo: {
      headline: "",
      location: "",
      phone: "",
      website: "",
      linkedin_url: "",
      github_url: "",
      about_me: "",
    },
    experience: [],
    education: [],
    skills: [],
    projects: [],
    certifications: [],
    jobPreferences: {
      jobTypes: [],
      locations: [],
      remotePreference: "",
      salaryExpectation: "",
      immediateStart: false,
    },
    resumeFile: null,
  };
  const [resumeData, setResumeData] = useState<FormData>(emptyResumeData);

  // AI-generated resume state
  const [generatedResume, setGeneratedResume] =
    useState<FormData>(emptyResumeData);
  const [abortController, setAbortController] =
    useState<AbortController | null>(null);

  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "error">(
    "saved",
  );
  const [showGeneratedResume, setShowGeneratedResume] = useState(false);
  const [isMainResume, setIsMainResume] = useState(true);
  const [jobId, setJobId] = useState<string | undefined>(undefined);
  const prevStateRef = useRef(resumeData);
  const generatedResumeRef = useRef(generatedResume);

  // Fetch regular resume data on mount
  useEffect(() => {
    const fetchResumeData = async () => {
      try {
        setIsLoading(true);
        const data = await getResumeDetails();
        if (!data.no_resume_found) {
          setResumeData(data);
        }
      } catch (error) {
        console.error("Error fetching resume details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResumeData();
  }, []);

  // Fetch generated resume on mount
  useEffect(() => {
    const fetchGeneratedResume = async () => {
      try {
        if (showGeneratedResume) {
          return;
        }
        if (abortController) {
          abortController.abort();
        }
        const abort = new AbortController();
        setAbortController(abort);
        const { signal } = abort;
        const data = await getResume(
          {
            is_main_resume: isMainResume,
            job_id: jobId,
          },
          signal,
        );
        console.log("data", data);
        if (!data?.is_success) {
          setGeneratedResume(emptyResumeData);
          setShowGeneratedResume(false);
          return;
        }
        if (data && data.extracted_data) {
          setGeneratedResume(data.extracted_data);
          setShowGeneratedResume(true);
        }
      } catch (error) {
        console.error("Error fetching generated resume:", error);
      }
    };

    fetchGeneratedResume();
  }, [showGeneratedResume, isMainResume, jobId]);

  // Auto-save when resumeData changes
  useEffect(() => {
    const hasStateChanged =
      JSON.stringify(prevStateRef.current) !== JSON.stringify(resumeData);
    if (!hasStateChanged || isLoading) {
      return;
    }

    const debouncedSave = debounce(async () => {
      setSaveStatus("saving");
      try {
        await updateResumeDetails({ data: resumeData }, false);
        setSaveStatus("saved");
        prevStateRef.current = resumeData;
      } catch (error) {
        console.error("Error updating resume details:", error);
        setSaveStatus("error");
      }
    }, 800);

    debouncedSave();

    return () => {
      debouncedSave.cancel();
    };
  }, [resumeData, isLoading]);

  useEffect(() => {
    const hasStateChanged =
      JSON.stringify(generatedResumeRef.current) !==
      JSON.stringify(generatedResume);
    if (!hasStateChanged || isLoading) {
      return;
    }

    const debouncedSave = debounce(async () => {
      setSaveStatus("saving");
      try {
        const req = {
          is_main_resume: jobId ? false : true,
          data: generatedResume,
          job_id: jobId,
        };
        await updateGeneratedResume(req);
        setSaveStatus("saved");
        generatedResumeRef.current = generatedResume;
      } catch (error) {
        console.error("Error updating resume details:", error);
        setSaveStatus("error");
      }
    }, 800);

    debouncedSave();

    return () => {
      debouncedSave.cancel();
    };
  }, [generatedResume, isLoading]);

  // Resume section update handler
  const updateResumeSection = useCallback(
    <K extends keyof FormData>(
      section: K,
      data: FormData[K],
      isOptimizedResume: boolean,
    ) => {
      console.log("section", section, data);
      console.log("isOptimizedResume", isOptimizedResume);
      if (isOptimizedResume) {
        // Update only the AI-generated resume
        setGeneratedResume((prev) => ({
          ...prev,
          [section]: data,
        }));
      } else {
        // Update only the regular resume
        setResumeData((prev) => ({
          ...prev,
          [section]: data,
        }));
      }
    },
    [],
  );

  // Personal info field update handler
  const handlePersonalInfoEdit = useCallback(
    (
      field: keyof FormData["personalInfo"],
      value: string,
      isOptimizedResume: boolean = false,
    ) => {
      console.log("field", field, value);
      console.log("isOptimizedResume", isOptimizedResume);
      if (isOptimizedResume) {
        setGeneratedResume((prev) => ({
          ...prev,
          personalInfo: {
            ...prev.personalInfo,
            [field]: value,
          },
        }));
      } else {
        setResumeData((prev) => ({
          ...prev,
          personalInfo: {
            ...prev.personalInfo,
            [field]: value,
          },
        }));
      }
    },
    [],
  );

  // Generate AI resume handler
  const handleGenerateResume = useCallback(
    async (
      regenerate = false,
      isMain = true,
      jobId: string | undefined = undefined,
    ) => {
      try {
        const data = await generateResume({
          is_main_resume: isMain,
          regenerate: regenerate,
          job_id: jobId,
        });
        if (data && data.extracted_data) {
          setGeneratedResume(data.extracted_data);
          setShowGeneratedResume(true);
        }
        return data;
      } catch (error) {
        console.error("Error generating resume:", error);
        throw error;
      }
    },
    [],
  );

  // Resume download handlers
  const downloadRegularResume = useCallback(() => {
    DownloadResume({
      optimized: false,
      is_main_resume: true,
    });
  }, []);

  const downloadOptimizedResume = useCallback(() => {
    if (showGeneratedResume) {
      DownloadResume({
        optimized: true,
        is_main_resume: true,
      });
    }
  }, [showGeneratedResume]);

  const refetchResumeData = async () => {
    try {
      setIsLoading(true);
      const data = await getResumeDetails();
      if (!data.no_resume_found) {
        setResumeData(data);
      }
    } catch (error) {
      console.error("Error fetching resume details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    // Resume data
    resumeData,
    generatedResume,

    // State indicators
    isLoading,
    saveStatus,
    showGeneratedResume,

    // set Resume mode
    setIsMainResume,
    setJobId,

    // Data update methods
    updateResumeSection,
    handlePersonalInfoEdit,
    setResumeData,
    setGeneratedResume,
    refetchResumeData,

    // AI resume methods
    generateResume: handleGenerateResume,

    // Download methods
    downloadRegularResume,
    downloadOptimizedResume,
  };
};
