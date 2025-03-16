import { useState, useCallback } from "react";
import { extractResume } from "../../../api/resume";
import { FormData } from "../../../api/types";

export const useResumeUpload = (
  controller: AbortController,
  updateResume: (data: Partial<FormData>) => void,
) => {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);

  const handleResumeUpload = useCallback(
    async (file: File | null) => {
      if (!file) return;

      setResumeFile(file);

      try {
        setIsParsing(true);
        const parsedData = await extractResume({ file }, controller);

        if (parsedData) {
          updateResume({
            ...parsedData,
            resumeFile: file,
          });
          return true;
        }
        return false;
      } catch (error) {
        console.error("Error parsing resume:", error);
        return false;
      } finally {
        setIsParsing(false);
      }
    },
    [controller, updateResume],
  );

  return {
    resumeFile,
    isParsing,
    handleResumeUpload,
  };
};
