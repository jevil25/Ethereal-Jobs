import React, { useState, useEffect, useRef } from "react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Pencil, Save, Download, Upload, Menu } from "lucide-react";
import { debounce } from "lodash";
import { FormData } from "../api/types";
import {
  updateResumeDetails,
  getResumeDetails,
  extractResume,
  // generateResume,
  getResume,
} from "../api/resume";
import { useAuth } from "../providers/useAuth";
import MainResume from "../components/ResumeV2/mainResume";
import ResumeTabs from "../components/ResumeV2/ResumeTabs";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";

const ResumeEditor: React.FC = () => {
  const [activeTab, setActiveTab] = useState("preview");
  const [editMode, setEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "error">(
    "saved",
  );
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user } = useAuth();
  const [resumeData, setResumeData] = useState<FormData>({
    personalInfo: {
      headline: "",
      location: "",
      phone: "",
      website: "",
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
  });
  const [generatedResume, setGeneratedResume] = useState<FormData | null>({
    personalInfo: {
      headline: "",
      location: "",
      phone: "",
      website: "",
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
  })
  const prevStateRef = useRef(resumeData);
  const resumeCard = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
    const getGeneratedResume = async () => {
      try {
        const data = await getResume({ 
          is_main_resume: true,
         });
        if (data && data.extracted_data) {
          setGeneratedResume(data.extracted_data);
        }
      } catch (error) {
        console.error("Error fetching generated resume:", error);
      }
    }
    getGeneratedResume();
  });


  const handleResumeUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0] || null;
    if (!file) return;

    try {
      setIsLoading(true);
      const parsedData = await extractResume({ file });

      if (parsedData) {
        setResumeData((prev) => ({
          ...prev,
          ...parsedData,
          resumeFile: file,
        }));
      }
    } catch (error) {
      console.error("Error parsing resume:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateResumeSection = <K extends keyof FormData>(
    section: K,
    data: FormData[K],
  ) => {
    console.log("Updating section:", section, data);
    setResumeData((prev) => ({
      ...prev,
      [section]: data,
    }));
  };

  const handlePersonalInfoEdit = (
    field: keyof FormData["personalInfo"],
    value: string,
  ) => {
    setResumeData((prev) => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        [field]: value,
      },
    }));
  };

  const toggleEditMode = () => {
    setEditMode(!editMode);
    if (!editMode) {
      setActiveTab("personal");
      if (window.innerWidth >= 768) {
        setSidebarOpen(true);
      }
    } else {
      setActiveTab("preview");
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const downloadResume = () => {
    console.log("Downloading resume...");

    if (resumeCard.current) {
      html2canvas(resumeCard.current, { scale: 2 }).then((canvas) => {
        const pdf = new jsPDF("p", "mm", "a4");

        const imgWidth = 210;
        const pageHeight = 297;
        // const imgHeight = (canvas.height * imgWidth) / canvas.width;
        const pageCanvasHeight = (pageHeight * canvas.width) / imgWidth;

        let heightLeft = canvas.height;
        let position = 0;

        while (heightLeft > 0) {
          const canvasPage = document.createElement("canvas");
          canvasPage.width = canvas.width;
          canvasPage.height = Math.min(pageCanvasHeight, heightLeft);

          const context = canvasPage.getContext("2d");
          if (!context) {
            console.error("Could not get canvas context");
            return;
          }
          context.drawImage(
            canvas,
            0,
            position,
            canvas.width,
            canvasPage.height,
            0,
            0,
            canvas.width,
            canvasPage.height,
          );

          const imgData = canvasPage.toDataURL("image/png");
          pdf.addImage(
            imgData,
            "PNG",
            0,
            0,
            imgWidth,
            (canvasPage.height * imgWidth) / canvas.width,
          );

          heightLeft -= pageCanvasHeight;
          position += pageCanvasHeight;

          if (heightLeft > 0) {
            pdf.addPage();
          }
        }

        pdf.save(`${user?.name || "resume"}.pdf`);
      });
    } else {
      console.error("Resume card element not found");
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
          <Button
            variant="outline"
            className="flex items-center gap-2 text-xs md:text-sm flex-1 md:flex-none"
            onClick={toggleEditMode}
          >
            {editMode ? <Save size={16} /> : <Pencil size={16} />}
            {editMode ? "Exit Edit Mode" : "Edit Resume"}
          </Button>
          {!editMode && (
            <Button
              variant="jobify"
              className="flex items-center gap-2 text-xs md:text-sm flex-1 md:flex-none"
              onClick={downloadResume}
            >
              <Download size={16} />
              Download PDF
            </Button>
          )}
          {editMode && (
            <label htmlFor="resume-upload" className="flex-1 md:flex-none">
              <Button
                variant="jobify"
                className="flex items-center gap-2 text-xs md:text-sm w-full"
              >
                <Upload size={16} />
                Import Resume
              </Button>
              <input
                id="resume-upload"
                type="file"
                accept=".pdf,.doc,.docx"
                className="hidden"
                onChange={handleResumeUpload}
              />
            </label>
          )}
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 md:gap-6 relative">
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

        <div className="flex-1">
          <Card className="shadow-lg border-0">
            {!editMode ? (
              <MainResume
                name={user?.name}
                resumeData={resumeData}
                ref={resumeCard}
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

          {/* Save status indicator */}
          {editMode && (
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
          {generatedResume && (
            <MainResume
              name={user?.name}
              resumeData={generatedResume}
              ref={resumeCard}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeEditor;
