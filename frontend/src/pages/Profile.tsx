import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../providers/useAuth";
import { updateName } from "../api/user";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { FormData } from "../api/types";
import { useResumeData } from "../components/ResumeV2/hooks/useResumeData";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import toast from "../components/ui/toast";
import ResumeTabs from "../components/ResumeV1/ResumeTabs";
import { useWindowSize } from "../components/ResumeV2/hooks/useWindowSize";
import { User, Briefcase } from "lucide-react";
import { JobData } from "../types/data";
import { getAppliedJobs } from "../api/jobs";
import JobCard from "../components/jobs/JobCard";

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const [searchParams] = useSearchParams();
  const [name, setName] = useState(user?.name || "");
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("personal");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [appliedJobs, setAppliedJobs] = useState<JobData[]>([]);
  const [activeSection, setActiveSection] = useState<string>("profile");
  const [nameSaveStatus, setNameSaveStatus] = useState<
    "saved" | "saving" | "error"
  >("saved");
  const {
    updateResumeSection,
    handlePersonalInfoEdit,
    saveStatus,
    resumeData,
  } = useResumeData();

  useWindowSize((width) => {
    if (width < 768) {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true);
    }
  });

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam === "application") {
      setActiveSection("jobs");
    }
  }, [searchParams]);

  useEffect(() => {
    const getAppliedJobsData = async () => {
      const jobs = await getAppliedJobs();
      setAppliedJobs(jobs);
    };
    getAppliedJobsData();
  }, []);

  const handleNameChange = async (name: string) => {
    setNameSaveStatus("saving");
    setName(name);
    const user = await updateName(name);
    if (user) {
      setNameSaveStatus("saved");
    } else {
      setNameSaveStatus("error");
    }
  };

  const handleUpdateResumeSection = <K extends keyof FormData>(
    section: K,
    data: FormData[K],
  ) => {
    updateResumeSection(section, data, false);
  };

  const handleSaveName = async () => {
    if (name.trim() !== user?.name) {
      try {
        toast("Name updated successfully.", "success");
      } catch (error) {
        console.error("Error updating name:", error);
        toast("Failed to update name. Please try again.", "error");
      }
    }
    setIsEditing(false);
  };

  const handleDeleteAccount = async () => {
    setIsLoading(true);
    try {
      toast("Account deleted successfully.", "success");
      logout();
    } catch (error) {
      console.error("Error deleting account:", error);
      toast("Failed to delete account. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const renderProfileContent = () => {
    return (
      <>
        <Card className="shadow-sm mb-6">
          <CardHeader className="pb-2">
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">
                  Full Name
                </p>
                {isEditing ? (
                  <Input
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="Enter your name"
                    className="max-w-md"
                  />
                ) : (
                  <p className="text-lg font-semibold">{name}</p>
                )}
              </div>
              <div className="flex justify-end items-start">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={
                    isEditing ? handleSaveName : () => setIsEditing(true)
                  }
                  disabled={isLoading}
                >
                  {isEditing ? "Save" : "Edit Name"}
                </Button>
              </div>
            </div>
            <div className="mt-6">
              <p className="text-sm font-medium text-gray-500 mb-1">
                Email Address
              </p>
              <p className="text-lg">{user?.email}</p>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-1">
            {sidebarOpen && (
              <Card className="shadow-sm">
                <CardHeader className="py-3 px-4">
                  <CardTitle className="text-xl">Resume Sections</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="flex flex-col">
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
                        variant={
                          activeTab === section.id ? "Ethereal Jobs" : "ghost"
                        }
                        className={`justify-start rounded-none text-left py-3 px-4 ${
                          activeTab === section.id
                            ? "text-primary-foreground"
                            : ""
                        }`}
                        onClick={() => {
                          setActiveTab(section.id);
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
            )}
          </div>

          <div className="md:col-span-3">
            {isLoading ? (
              <div className="h-64 flex items-center justify-center">
                <p>Loading job preferences...</p>
              </div>
            ) : resumeData ? (
              <Card className="shadow-sm h-full">
                <CardHeader className="pb-2">
                  <div className="mt-4 text-right">
                    <span
                      className={`text-sm ${
                        saveStatus === "saved" && nameSaveStatus === "saved"
                          ? "text-green-600"
                          : saveStatus === "saving" ||
                              nameSaveStatus === "saving"
                            ? "text-yellow-600"
                            : "text-red-600"
                      }`}
                    >
                      {saveStatus === "saved" && nameSaveStatus === "saved"
                        ? "✓ All changes saved"
                        : saveStatus === "saving" || nameSaveStatus === "saving"
                          ? "Saving changes..."
                          : "Error saving changes"}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ResumeTabs
                    handleNameChange={handleNameChange}
                    activeTab={activeTab}
                    handlePersonalInfoEdit={handlePersonalInfoEdit}
                    resumeData={resumeData}
                    updateResumeSection={handleUpdateResumeSection}
                    setActiveTab={setActiveTab}
                  />
                </CardContent>
              </Card>
            ) : (
              <div className="h-64 flex items-center justify-center">
                <p>No job preferences found. Add some to get started.</p>
              </div>
            )}
          </div>
        </div>
      </>
    );
  };

  const renderJobsContent = () => {
    return (
      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle>Applied Jobs</CardTitle>
        </CardHeader>
        <CardContent>
          {appliedJobs.length === 0 ? (
            <p className="text-gray-600">
              You haven't applied to any jobs yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {appliedJobs &&
                appliedJobs.map((job) => <JobCard key={job.id} job={job} />)}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderDangerZoneContent = () => {
    return (
      <Card className="border-red-200 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-red-600">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            Deleting your account will remove all your personal information,
            resumes, and preferences permanently. This action cannot be undone.
          </p>
          <Button
            variant="destructive"
            onClick={() => setShowDeleteDialog(true)}
            disabled={isLoading}
          >
            Delete Account
          </Button>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="flex flex-col md:flex-row w-full max-w-6xl mx-auto p-4 gap-6 min-h-screen">
      <div className="w-full md:w-64 flex-shrink-0">
        <Card className="shadow-sm sticky top-4">
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-xl">Profile Settings</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="flex flex-col">
              <Button
                variant={activeSection === "profile" ? "Ethereal Jobs" : "ghost"}
                className="justify-start rounded-none text-left py-3 px-4 flex items-center gap-2"
                onClick={() => setActiveSection("profile")}
              >
                <User size={16} />
                Profile & Resume
              </Button>
              <Button
                variant={activeSection === "jobs" ? "Ethereal Jobs" : "ghost"}
                className="justify-start rounded-none text-left py-3 px-4 flex items-center gap-2"
                onClick={() => setActiveSection("jobs")}
              >
                <Briefcase size={16} />
                Applied Jobs
              </Button>
              {/* <Button
                variant={activeSection === "danger" ? "Ethereal Jobs" : "ghost"}
                className="justify-start rounded-none text-left py-3 px-4 flex items-center gap-2"
                onClick={() => setActiveSection("danger")}
              >
                <AlertTriangle size={16} />
                Danger Zone
              </Button> */}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="flex-grow">
        {activeSection === "profile" && renderProfileContent()}
        {activeSection === "jobs" && renderJobsContent()}
        {activeSection === "danger" && renderDangerZoneContent()}
      </div>

      {/* Delete Account Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              account and remove all associated data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {isLoading ? "Deleting..." : "Delete Account"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProfilePage;
