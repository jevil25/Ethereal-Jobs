import { useState, useEffect } from "react";
import { compareData } from "./compareUtils";
import { FormData } from "../../api/types";
import EditableText from "./Sections/EditableText";
import EditableSkills from "./Sections/EditableSkills";
import { Experience } from "../OnBoarding/ExperienceCard";
import { Education } from "../OnBoarding/EducationCard";
import { Project } from "../OnBoarding/ProjectCard";
import { Certification } from "../OnBoarding/CertificationCard";
import { ExperienceSection } from "./Sections/ExperienceSection";
import { EducationSection } from "./Sections/EducationSection";
import { ProjectsSection } from "./Sections/projectsSection";
import { CertificationsSection } from "./Sections/CertificationsSection";
import toast from "react-hot-toast";

interface ResumeContentProps {
  name: string | undefined;
  resumeData: FormData;
  diffs: {
    skillsDiff: ReturnType<typeof compareData.compareArrays>;
    experienceDiff: ReturnType<
      typeof compareData.compareObjectArrays<Experience>
    >;
    educationDiff: ReturnType<
      typeof compareData.compareObjectArrays<Education>
    >;
    projectsDiff: ReturnType<typeof compareData.compareObjectArrays<Project>>;
    certificationsDiff: ReturnType<
      typeof compareData.compareObjectArrays<Certification>
    >;
  };
  isOptimized: boolean;
  updateResumeSection: <K extends keyof FormData>(
    section: K,
    data: FormData[K],
    isOptimized: boolean,
  ) => void;
}

const ResumeContent = ({
    name,
    resumeData,
    diffs,
    isOptimized,
    updateResumeSection,
}: ResumeContentProps) => {
    const [updatedDiff, setUpdatedDiff] = useState<typeof diffs>({
        skillsDiff: { added: [], removed: [], unchanged: [] },
        experienceDiff: { added: [], removed: [], unchanged: [], modified: [] },
        educationDiff: { added: [], removed: [], unchanged: [], modified: [] },
        projectsDiff: { added: [], removed: [], unchanged: [], modified: [] },
        certificationsDiff: { added: [], removed: [], unchanged: [], modified: [] },
    });

    useEffect(() => {
        setUpdatedDiff(diffs);
    }
    , [diffs]);

    const {
        skillsDiff,
        experienceDiff,
        educationDiff,
        projectsDiff,
        certificationsDiff,
    } = updatedDiff;

    const onSavePersonalInfo = (field: keyof FormData["personalInfo"], value: string) => {
        updateResumeSection("personalInfo", {
            ...resumeData.personalInfo,
            [field]: value,
        }, isOptimized);
    };

    const onSaveExperience = (index: number, field: keyof Experience, value: string) => {
        const updatedExperience = [...resumeData.experience];
        updatedExperience[index] = {
            ...updatedExperience[index],
            [field]: value,
        };
        updateResumeSection("experience", updatedExperience, isOptimized)
    }

    const onSaveEducation = (index: number, field: keyof Education, value: string) => {
        const updatedEducation = [...resumeData.education];
        updatedEducation[index] = {
            ...updatedEducation[index],
            [field]: value,
        };
        updateResumeSection("education", updatedEducation, isOptimized)
    }

    const onSaveProject = (index: number, field: keyof Project, value: string | string[]) => {
        const updatedProjects = [...resumeData.projects];
        updatedProjects[index] = {
            ...updatedProjects[index],
            [field]: value,
        };
        updateResumeSection("projects", updatedProjects, isOptimized)
    }

    const onSaveCertification = (index: number, field: keyof Certification, value: string) => {
        const updatedCertifications = [...resumeData.certifications];
        updatedCertifications[index] = {
            ...updatedCertifications[index],
            [field]: value,
        };
        updateResumeSection("certifications", updatedCertifications, isOptimized)
    }

    const onSaveSkills = (skills: string[]) => {
        updateResumeSection("skills", [...skills], isOptimized);
    }

  return (
    <div className="p-6 bg-white rounded-lg">
      <div className="mb-8 border-b pb-4">
        <h1 className="text-3xl font-bold mb-2">
          <EditableText
            key={Date.now()}
            initialValue={name || ""}
            onSave={(_value: string) => { 
                console.log("Name can only be edited in settings page");
                toast.error("Name can only be edited in settings page") }}
          />
        </h1>
        <p className="text-gray-600 text-lg">
          <EditableText
            key={Date.now()}
            initialValue={
              resumeData.personalInfo.headline || "Professional Resume"
            }
            onSave={(value: string) => {
                onSavePersonalInfo("headline", value);
            }}
          />
        </p>
        <div className="flex flex-wrap gap-3 text-gray-600 text-sm mt-2">
          {resumeData.personalInfo.location && (
            <span className="flex items-center gap-1">
              📍
              <EditableText
                key={Date.now()}
                initialValue={resumeData.personalInfo.location}
                onSave={(value: string) => {
                    onSavePersonalInfo("location", value);
                }}
              />
            </span>
          )}
          {resumeData.personalInfo.phone && (
            <span className="flex items-center gap-1">
              📱
              <EditableText
                key={Date.now()}
                initialValue={resumeData.personalInfo.phone}
                onSave={(value: string) => {
                    onSavePersonalInfo("phone", value);
                }}
              />
            </span>
          )}
          {resumeData.personalInfo.website && (
            <span className="flex items-center gap-1">
              🔗
              <EditableText
                key={Date.now()}
                initialValue={resumeData.personalInfo.website}
                onSave={(value: string) => {
                    onSavePersonalInfo("website", value);
                }}
              />
            </span>
          )}
        </div>
      </div>

      {/* Skills Section with Diff */}
      {resumeData.skills.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-3 text-gray-800">Skills</h2>
          <EditableSkills
            key={Date.now()}
            skills={resumeData.skills}
            diffInfo={
              isOptimized
                ? { added: skillsDiff.added, unchanged: skillsDiff.unchanged }
                : {
                    removed: skillsDiff.removed,
                    unchanged: skillsDiff.unchanged,
                  }
            }
            isOptimized={isOptimized}
            onUpdate={onSaveSkills}
          />
        </div>
      )}
      <ExperienceSection
        experiences={resumeData.experience}
        experienceDiff={experienceDiff}
        isOptimized={isOptimized}
        onUpdate={onSaveExperience}
      />

      <EducationSection
        education={resumeData.education}
        educationDiff={educationDiff}
        isOptimized={isOptimized}
        onSave={onSaveEducation}
        />

        <ProjectsSection
            projects={resumeData.projects}
            projectsDiff={projectsDiff}
            isOptimized={isOptimized}
            onUpdate={onSaveProject}
        />

        <CertificationsSection
            certifications={resumeData.certifications}
            certificationsDiff={certificationsDiff}
            isOptimized={isOptimized}
            onUpdate={onSaveCertification}
        />

      
    </div>
  );
};

export default ResumeContent;
