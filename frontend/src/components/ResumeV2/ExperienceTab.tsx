import { Button } from "../../components/ui/button";
import { Plus } from "lucide-react";
import ExperienceItem from "./ExperienceItem";
import { Experience } from "../OnBoarding/ExperienceCard";

interface ExperienceTabProps {
  experience: Experience[];
  updateResumeSection: (section: string, data: any) => void;
}

const ExperienceTab = ({
  experience,
  updateResumeSection,
}: ExperienceTabProps) => {
  const addExperience = () => {
    const newExp = {
      id: "",
      title: "",
      company: "",
      location: "",
      startDate: "",
      endDate: "",
      description: "",
      current: false,
      grade: "",
    };
    updateResumeSection("experience", [...experience, newExp]);
  };

  const handleExperienceChange = (
    index: number,
    field: keyof Experience,
    value: string,
  ) => {
    const updatedExp = [...experience];
    updatedExp[index] = {
      ...updatedExp[index],
      [field]: value,
    };
    updateResumeSection("experience", updatedExp);
  };

  const removeExperience = (index: number) => {
    const updatedExp = [...experience];
    updatedExp.splice(index, 1);
    updateResumeSection("experience", updatedExp);
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Work Experience</h2>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1"
          onClick={addExperience}
        >
          <Plus size={16} /> Add
        </Button>
      </div>

      {experience.length === 0 ? (
        <p className="text-gray-500 text-center py-4">
          No work experience added yet.
        </p>
      ) : (
        <div className="space-y-6">
          {experience.map((exp, index) => (
            <ExperienceItem
              key={index}
              experience={exp}
              index={index}
              onChange={handleExperienceChange}
              onRemove={() => removeExperience(index)}
            />
          ))}
        </div>
      )}
    </>
  );
};

export default ExperienceTab;
