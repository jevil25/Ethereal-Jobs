import { Tabs, TabsContent } from "../../components/ui/tabs";
import PersonalInfoTab from "./PersonalInfoTab";
import ExperienceTab from "./ExperienceTab";
import EducationTab from "./EducationTab";
import SkillsTab from "./SkillsTab";
import { FormData } from "@/api/types";
import ProjectTab from "./ProjectTab";
import CertificationTab from "./CertificationTab";
import JobPreferencesTab from "./JobPreferencesTab";

interface ResumeTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  resumeData: FormData;
  handlePersonalInfoEdit: (
    field: keyof FormData["personalInfo"],
    value: string,
  ) => void;
  updateResumeSection: <K extends keyof FormData>(
    section: K,
    data: FormData[K],
    isOptimizedResume: boolean,
  ) => void;
}

const ResumeTabs = ({
  activeTab,
  setActiveTab,
  resumeData,
  handlePersonalInfoEdit,
  updateResumeSection,
}: ResumeTabsProps) => {
  const handleUpdateResumeSection = <K extends keyof FormData>(
    section: K,
    data: FormData[K],
  ) => {
    updateResumeSection(section, data, false);
  };
  return (
    <Tabs
      defaultValue={activeTab}
      value={activeTab}
      onValueChange={setActiveTab}
    >
      <TabsContent value="preview" className="p-0 m-0">
        {/* Preview tab will show the same content as non-edit mode */}
      </TabsContent>

      <TabsContent value="personal" className="p-6">
        <PersonalInfoTab
          personalInfo={resumeData.personalInfo}
          handlePersonalInfoEdit={handlePersonalInfoEdit}
        />
      </TabsContent>

      <TabsContent value="experience" className="p-6">
        <ExperienceTab
          experience={resumeData.experience}
          updateResumeSection={handleUpdateResumeSection}
        />
      </TabsContent>

      <TabsContent value="education" className="p-6">
        <EducationTab
          education={resumeData.education}
          updateResumeSection={handleUpdateResumeSection}
        />
      </TabsContent>

      <TabsContent value="skills" className="p-6">
        <SkillsTab
          skills={resumeData.skills}
          updateData={(data: string[]) =>
            handleUpdateResumeSection("skills", data)
          }
        />
      </TabsContent>

      <TabsContent value="projects" className="p-6">
        <ProjectTab
          projects={resumeData.projects}
          updateResumeSection={handleUpdateResumeSection}
        />
      </TabsContent>

      <TabsContent value="certifications" className="p-6">
        <CertificationTab
          certifications={resumeData.certifications}
          updateResumeSection={handleUpdateResumeSection}
        />
      </TabsContent>

      <TabsContent value="preferences" className="p-6">
        <JobPreferencesTab
          jobPreferences={resumeData.jobPreferences}
          updateResumeSection={handleUpdateResumeSection}
        />
      </TabsContent>
    </Tabs>
  );
};

export default ResumeTabs;
