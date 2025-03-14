import { Button } from "../../components/ui/button";
import { Plus } from "lucide-react";
import EducationItem from "./EducationItem";
import { Education } from "../OnBoarding/EducationCard";
import { FormData } from "@/api/types";

interface EducationTabProps {
  education: Education[];
  updateResumeSection: (<K extends keyof FormData>(
    section: K,
    data: FormData[K],
  ) => void);
}

const EducationTab = ({
  education,
  updateResumeSection,
}: EducationTabProps) => {
  const addEducation = () => {
    const newEdu = {
      id: (education.map((edu) => edu.id).length + 2).toString(),
      school: "",
      degree: "",
      fieldOfStudy: "",
      location: "",
      startDate: "",
      endDate: "",
      description: "",
      current: false,
      grade: "",
    };
    updateResumeSection("education", [newEdu, ...education]);
  };

  const handleEducationChange = (
    index: number,
    field: string,
    value: string,
  ) => {
    const updatedEdu = [...education];
    updatedEdu[index] = { ...updatedEdu[index], [field]: value };
    updateResumeSection("education", updatedEdu);
  };

  const removeEducation = (index: number) => {
    const updatedEdu = [...education];
    updatedEdu.splice(index, 1);
    updateResumeSection("education", updatedEdu);
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Education</h2>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1"
          onClick={addEducation}
        >
          <Plus size={16} /> Add
        </Button>
      </div>

      {education.length === 0 ? (
        <p className="text-gray-500 text-center py-4">
          No education added yet.
        </p>
      ) : (
        <div className="space-y-6">
          {education.map((edu, index) => (
            <EducationItem
              key={index}
              education={edu}
              index={index}
              onChange={handleEducationChange}
              onRemove={() => removeEducation(index)}
            />
          ))}
        </div>
      )}
    </>
  );
};

export default EducationTab;
