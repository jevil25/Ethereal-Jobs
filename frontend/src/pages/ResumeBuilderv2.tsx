import React, { useRef, useState } from "react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Download, Upload, Menu, BrainCircuit, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "../components/ui/dialog";
import { useAuth } from "../providers/useAuth";
import ResumeTabs from "../components/ResumeV1/ResumeTabs";
import ResumeUploadCard from "../components/OnBoarding/ResumeUploadCard";
import ResumeComparison from "../components/ResumeV2/ResumeComparision";
import { useResumeData } from "../components/ResumeV2/hooks/useResumeData";
import { useResumeUpload } from "../components/ResumeV2/hooks/useResumeUpload";
import { useWindowSize } from "../components/ResumeV2/hooks/useWindowSize";

const ResumeEditor: React.FC = () => {
  // Local UI state
  const [activeTab, setActiveTab] = useState("preview");
  const [editMode] = useState(false);
  const [openUploadResumeModal, setOpenUploadResumeModal] = useState(false);
  const [gettingAiResume, setGettingAiResume] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const controllerRef = useRef(new AbortController());

  // Context hooks
  const { user } = useAuth();

  // Custom hooks
  const {
    resumeData,
    setResumeData,
    generatedResume,
    isLoading,
    saveStatus,
    showGeneratedResume,
    updateResumeSection,
    handlePersonalInfoEdit,
    generateResume,
    downloadRegularResume,
    downloadOptimizedResume,
  } = useResumeData();

  const { resumeFile, isParsing, handleResumeUpload } = useResumeUpload(
    controllerRef.current,
    (data) => setResumeData((prev) => ({ ...prev, ...data })),
  );

  const uploadResume = async (file: File | null) => {
    await handleResumeUpload(file);
  };

  // Handle responsive sidebar
  useWindowSize((width) => {
    if (width < 768) {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true);
    }
  });

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const startResumeGeneration = async (regenerate = false) => {
    try {
      setGettingAiResume(true);
      await generateResume(regenerate);
    } catch (error) {
      console.error("Error during resume generation:", error);
    } finally {
      setGettingAiResume(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg">Loading your resume...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl mt-6 md:mt-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            My Resume
          </h1>
          <p className="text-sm md:text-base text-gray-600">
            Update and customize your professional profile
          </p>
        </div>
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {!editMode && (
            <Button
              variant="default"
              className="flex items-center gap-2 text-xs md:text-sm flex-1 md:flex-none"
              onClick={downloadRegularResume}
            >
              <Download size={16} />
              Download Resume
            </Button>
          )}
          {!editMode && showGeneratedResume && (
            <Button
              variant="default"
              className="flex items-center gap-2 text-xs md:text-sm flex-1 md:flex-none"
              onClick={downloadOptimizedResume}
            >
              <Download size={16} />
              Download Ai Optimized Resume
            </Button>
          )}
          {!editMode && (
            <label htmlFor="resume-upload" className="flex-1 md:flex-none">
              <Button
                variant="jobify"
                className="flex items-center gap-2 text-xs md:text-sm w-full"
                onClick={() => setOpenUploadResumeModal(true)}
              >
                <Upload size={16} />
                Import Resume
              </Button>
            </label>
          )}
          {!editMode && !showGeneratedResume && (
            <Button
              variant="jobify"
              className="flex items-center gap-2 text-xs md:text-sm flex-1 md:flex-none"
              onClick={() => startResumeGeneration(false)}
            >
              <BrainCircuit size={16} />
              Improve Resume
            </Button>
          )}
          {!editMode && showGeneratedResume && (
            <Button
              variant="jobify"
              className="flex items-center gap-2 text-xs md:text-sm flex-1 md:flex-none"
              onClick={() => startResumeGeneration(true)}
            >
              <BrainCircuit size={16} />
              Regenerate Resume
            </Button>
          )}
          {gettingAiResume && (
            <Dialog open={gettingAiResume} onOpenChange={setGettingAiResume}>
              <DialogContent className="sm:max-w-md p-6 bg-white">
                <DialogTitle className="text-lg font-semibold mb-2">
                  Generating Resume
                </DialogTitle>
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                Please wait while we generate your resume...
              </DialogContent>
            </Dialog>
          )}
          {openUploadResumeModal && (
            <Dialog
              open={openUploadResumeModal}
              onOpenChange={setOpenUploadResumeModal}
            >
              <DialogContent className="sm:max-w-md p-6 bg-white">
                <DialogTitle className="text-lg font-semibold mb-2">
                  Upload Resume
                </DialogTitle>
                <DialogClose onClick={() => setOpenUploadResumeModal(false)} />
                <ResumeUploadCard
                  file={resumeFile}
                  isParsing={isParsing}
                  updateFile={uploadResume}
                  controller={controllerRef.current}
                />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-4 md:gap-6 relative">
        {/* Mobile sidebar toggle */}
        {editMode && (
          <div className="md:hidden mb-4">
            <Button
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
              onClick={toggleSidebar}
            >
              <Menu size={16} />
              {sidebarOpen ? "Hide Sections" : "Show Sections"}
            </Button>
          </div>
        )}

        {/* Sidebar for resume sections */}
        {editMode && sidebarOpen && (
          <div className="w-full md:w-64 md:shrink-0">
            <Card className="sticky top-4">
              <CardHeader className="p-4">
                <CardTitle className="text-xl">Resume Sections</CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                <div className="flex flex-col gap-2">
                  {[
                    { id: "personal", label: "Personal Info" },
                    { id: "experience", label: "Experience" },
                    { id: "education", label: "Education" },
                    { id: "skills", label: "Skills" },
                    { id: "projects", label: "Projects" },
                    { id: "certifications", label: "Certifications" },
                    { id: "preferences", label: "Job Preferences" },
                  ].map((section) => (
                    <Button
                      key={section.id}
                      variant={activeTab === section.id ? "default" : "ghost"}
                      className="justify-start"
                      onClick={() => {
                        setActiveTab(section.id);
                        // Auto-close sidebar on mobile after selection
                        if (window.innerWidth < 768) {
                          setSidebarOpen(false);
                        }
                      }}
                    >
                      {section.label}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {!editMode && (
          <div className="mt-4 text-right">
            <span
              className={`text-sm ${
                saveStatus === "saved"
                  ? "text-green-600"
                  : saveStatus === "saving"
                    ? "text-yellow-600"
                    : "text-red-600"
              }`}
            >
              {saveStatus === "saved"
                ? "✓ All changes saved"
                : saveStatus === "saving"
                  ? "Saving changes..."
                  : "Error saving changes"}
            </span>
          </div>
        )}

        <div className="flex-1">
          <Card className="shadow-lg border-0">
            {!editMode ? (
              <ResumeComparison
                name={user?.name}
                originalResume={resumeData}
                optimizedResume={generatedResume}
                updateResumeSection={updateResumeSection}
              />
            ) : (
              <ResumeTabs
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                resumeData={resumeData}
                updateResumeSection={updateResumeSection}
                handlePersonalInfoEdit={handlePersonalInfoEdit}
              />
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ResumeEditor;
