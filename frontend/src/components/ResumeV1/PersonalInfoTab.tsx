import { PersonalInfo, FormData } from "@/api/types";
import { useAuth } from "../../providers/useAuth";
import { useState } from "react";

interface PersonalInfoTabProps {
  handleNameChange: (name: string) => void;
  personalInfo: PersonalInfo;
  handlePersonalInfoEdit: (
    field: keyof FormData["personalInfo"],
    value: string,
  ) => void;
}


const PersonalInfoTab = ({
  handleNameChange,
  personalInfo,
  handlePersonalInfoEdit,
}: PersonalInfoTabProps) => {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || "");

  const handleNameChangeFunc = (value: string) => {
    setName(value);
    handleNameChange(value);
  };

  return (
    <>
      <h2 className="text-xl font-bold mb-4">Personal Information</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="block text-sm font-medium">
            Name
          </label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            value={name}
            onChange={(e) => handleNameChangeFunc(e.target.value)}
            placeholder="e.g., Senior Software Engineer"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium">
            Professional Headline
          </label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            value={personalInfo.headline}
            onChange={(e) => handlePersonalInfoEdit("headline", e.target.value)}
            placeholder="e.g., Senior Software Engineer"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium">Location</label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            value={personalInfo.location}
            onChange={(e) => handlePersonalInfoEdit("location", e.target.value)}
            placeholder="e.g., New York, NY"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium">Phone</label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            value={personalInfo.phone}
            onChange={(e) => handlePersonalInfoEdit("phone", e.target.value)}
            placeholder="e.g., (555) 123-4567"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium">Website/Portfolio</label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            value={personalInfo.website}
            onChange={(e) => handlePersonalInfoEdit("website", e.target.value)}
            placeholder="e.g., https://yourportfolio.com"
          />
        </div>
      </div>
    </>
  );
};

export default PersonalInfoTab;
