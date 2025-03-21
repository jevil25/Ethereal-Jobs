import { useState } from 'react';
import { useAuth } from '../providers/useAuth';
import { updateName } from '../api/user';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { FormData } from '../api/types';
import { useResumeData } from '../components/ResumeV2/hooks/useResumeData';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '../components/ui/alert-dialog';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import toast from '../components/ui/toast';
import ResumeTabs from '../components/ResumeV1/ResumeTabs';
import { useWindowSize } from '../components/ResumeV2/hooks/useWindowSize';
import { Menu } from 'lucide-react';

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('personal');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [nameSaveStatus, setNameSaveStatus] = useState<"saved" | "saving" | "error">("saved");
  const { updateResumeSection, handlePersonalInfoEdit, saveStatus, resumeData } = useResumeData();

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

  return (
    <div className="w-full max-w-6xl mx-auto p-4 space-y-6 mt-16 md:mt-32">
      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle>Profile Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-8">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Full Name</p>
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
                onClick={isEditing ? handleSaveName : () => setIsEditing(true)}
                disabled={isLoading}
              >
                {isEditing ? 'Save' : 'Edit Name'}
              </Button>
            </div>
          </div>
          <div className="mt-6">
            <p className="text-sm font-medium text-gray-500 mb-1">Email Address</p>
            <p className="text-lg">{user?.email}</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
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
                      variant={activeTab === section.id ? "Etheral Jobs" : "ghost"}
                      className={`justify-start rounded-none text-left py-3 px-4 ${
                        activeTab === section.id ? "text-primary-foreground" : ""
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
                    : saveStatus === "saving" || nameSaveStatus === "saving"
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

      <Card className="border-red-200 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-red-600">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            Deleting your account will remove all your personal information, resumes, and preferences permanently.
            This action cannot be undone.
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

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your account
              and remove all associated data from our servers.
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