import React from "react";
import { Card, CardContent } from "../ui/card";
import ViewToggle from "./ViewToggle";
import ResumeContent from "./ResumeContent";
import { compareData } from "./compareUtils";
import { FormData } from "../../api/types";

interface ResumeComparisonProps {
  name: string | undefined;
  originalResume: FormData;
  optimizedResume: FormData;
  updateResumeSection: <K extends keyof FormData>(
    section: K,
    data: FormData[K],
    isOptimized: boolean,
  ) => void;
}

const ResumeComparison = ({
  name,
  originalResume,
  optimizedResume,
  updateResumeSection,
}: ResumeComparisonProps) => {
  const [viewMode, setViewMode] = React.useState<
    "split" | "optimized" | "original"
  >("split");

  // Pre-compute all diffs to pass to the ResumeContent component
  const diffs = React.useMemo(() => {
    return {
      skillsDiff: compareData.compareArrays(
        originalResume.skills,
        optimizedResume.skills,
      ),
      experienceDiff: compareData.compareObjectArrays(
        originalResume.experience,
        optimizedResume.experience,
        (item) => `${item.company}-${item.title}`,
      ),
      educationDiff: compareData.compareObjectArrays(
        originalResume.education,
        optimizedResume.education,
        (item) => `${item.school}-${item.degree}`,
      ),
      projectsDiff: compareData.compareObjectArrays(
        originalResume.projects,
        optimizedResume.projects,
        (item) => item.title,
      ),
      certificationsDiff: compareData.compareObjectArrays(
        originalResume.certifications,
        optimizedResume.certifications,
        (item) => item.name,
      ),
    };
  }, [originalResume, optimizedResume]);

  return (
    <div className="font-sans">
      <ViewToggle viewMode={viewMode} setViewMode={setViewMode} />

      <Card className="shadow-md">
        <CardContent className="p-0">
          {viewMode === "split" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
              <div>
                <h2 className="text-xl font-bold mb-4 flex items-center">
                  <span className="mr-2 p-1 bg-gray-200 rounded-full">
                    <span className="block h-4 w-4 rounded-full bg-gray-500"></span>
                  </span>
                  Original Resume
                </h2>
                <div className="border border-gray-300 rounded-lg overflow-hidden shadow-sm">
                  <ResumeContent
                    name={name}
                    resumeData={originalResume}
                    diffs={diffs}
                    isOptimized={false}
                    updateResumeSection={updateResumeSection}
                  />
                </div>
              </div>
              <div>
                <h2 className="text-xl font-bold mb-4 flex items-center">
                  <span className="mr-2 p-1 bg-green-200 rounded-full">
                    <span className="block h-4 w-4 rounded-full bg-green-500"></span>
                  </span>
                  Optimized Resume
                </h2>
                <div className="border border-gray-300 rounded-lg overflow-hidden shadow-sm">
                  <ResumeContent
                    name={name}
                    resumeData={optimizedResume}
                    diffs={diffs}
                    isOptimized={true}
                    updateResumeSection={updateResumeSection}
                  />
                </div>
              </div>
            </div>
          ) : viewMode === "optimized" ? (
            <div className="p-4">
              <div className="mb-6">
                <h2 className="text-xl font-bold mb-3">Optimized Resume</h2>
                <div className="flex items-center space-x-6 mb-4">
                  <div className="flex items-center">
                    <span className="mr-2 p-1 bg-green-200 rounded-full">
                      <span className="block h-3 w-3 rounded-full bg-green-500"></span>
                    </span>
                    <span className="text-sm">Added</span>
                  </div>
                  <div className="flex items-center">
                    <span className="mr-2 p-1 bg-blue-200 rounded-full">
                      <span className="block h-3 w-3 rounded-full bg-blue-500"></span>
                    </span>
                    <span className="text-sm">Modified</span>
                  </div>
                </div>
              </div>
              <div className="border rounded-lg overflow-hidden">
                <ResumeContent
                  name={name}
                  resumeData={optimizedResume}
                  diffs={diffs}
                  isOptimized={true}
                  updateResumeSection={updateResumeSection}
                />
              </div>
            </div>
          ) : (
            <div className="p-4">
              <div className="mb-6">
                <h2 className="text-xl font-bold mb-3">Original Resume</h2>
                <div className="flex items-center space-x-6 mb-4">
                  <div className="flex items-center">
                    <span className="mr-2 p-1 bg-red-200 rounded-full">
                      <span className="block h-3 w-3 rounded-full bg-red-500"></span>
                    </span>
                    <span className="text-sm">Removed</span>
                  </div>
                  <div className="flex items-center">
                    <span className="mr-2 p-1 bg-blue-200 rounded-full">
                      <span className="block h-3 w-3 rounded-full bg-blue-500"></span>
                    </span>
                    <span className="text-sm">Modified</span>
                  </div>
                </div>
              </div>
              <div className="border rounded-lg overflow-hidden">
                <ResumeContent
                    name={name}
                    resumeData={originalResume}
                    diffs={diffs}
                    isOptimized={false}
                    updateResumeSection={updateResumeSection}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ResumeComparison;
