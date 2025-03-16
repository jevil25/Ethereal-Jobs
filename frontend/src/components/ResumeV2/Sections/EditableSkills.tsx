import React, { useState, useEffect } from "react";
import EditableText from "./EditableText";

interface EditableSkillsProps {
  skills: string[];
  diffInfo: {
    added?: string[];
    removed?: string[];
    unchanged: string[];
  };
  isOptimized: boolean;
  onUpdate?: (skills: string[], isOptimized: boolean) => void;
}

const EditableSkills: React.FC<EditableSkillsProps> = ({
  skills,
  diffInfo,
  isOptimized,
  onUpdate,
}) => {
  const [newSkill, setNewSkill] = useState("");
  const [localSkills, setLocalSkills] = useState<string[]>(skills);

  console.log(diffInfo)

  // Synchronize local state with incoming props
  useEffect(() => {
    setLocalSkills(skills);
  }, [skills, diffInfo]);

  const handleAddSkill = () => {
    if (newSkill.trim() && !localSkills.includes(newSkill.trim())) {
      const updatedSkills = [...localSkills, newSkill.trim()];
      setLocalSkills(updatedSkills);
      setNewSkill("");

      if (onUpdate) {
        onUpdate(updatedSkills, isOptimized);
      }
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    const updatedSkills = localSkills.filter(
      (skill) => skill !== skillToRemove,
    );
    setLocalSkills(updatedSkills);

    if (onUpdate) {
      onUpdate(updatedSkills, isOptimized);
    }
  };

  const handleUpdateSkill = (oldSkill: string, newSkillValue: string) => {
    if (newSkillValue.trim() && !localSkills.includes(newSkillValue.trim())) {
      const updatedSkills = localSkills.map((skill) =>
        skill === oldSkill ? newSkillValue.trim() : skill,
      );
      setLocalSkills(updatedSkills);

      if (onUpdate) {
        onUpdate(updatedSkills, isOptimized);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddSkill();
    }
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-3">
        {/* Unchanged skills */}
        {diffInfo.unchanged.map((skill, index) => (
          <div
            key={`unchanged-${index}`}
            className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full flex items-center"
          >
            <div className="mr-2">
              <EditableText
                initialValue={skill}
                onSave={(newValue) => handleUpdateSkill(skill, newValue)}
              />
            </div>
            <button
              onClick={() => handleRemoveSkill(skill)}
              className="text-gray-500 hover:text-red-500"
            >
              ×
            </button>
          </div>
        ))}

        {/* Added skills - only shown in optimized view */}
        {isOptimized &&
          diffInfo.added &&
          diffInfo.added.map((skill, index) => (
            <div
              key={`added-${index}`}
              className="bg-green-100 text-green-800 px-3 py-1 rounded-full flex items-center"
            >
              <div className="mr-2">
                <EditableText
                  initialValue={skill}
                  onSave={(newValue) => handleUpdateSkill(skill, newValue)}
                />
              </div>
              <button
                onClick={() => handleRemoveSkill(skill)}
                className="text-gray-500 hover:text-red-500"
              >
                ×
              </button>
            </div>
          ))}

        {/* Removed skills - only shown in original view */}
        {!isOptimized &&
          diffInfo.removed &&
          diffInfo.removed.map((skill, index) => (
            <div
              key={`removed-${index}`}
              className="bg-red-100 text-red-800 px-3 py-1 rounded-full flex items-center line-through"
            >
              <div className="mr-2">
                <EditableText
                  initialValue={skill}
                  onSave={(newValue) => handleUpdateSkill(skill, newValue)}
                />
              </div>
              <button
                onClick={() => handleRemoveSkill(skill)}
                className="text-gray-500 hover:text-red-500"
              >
                ×
              </button>
            </div>
          ))}
      </div>

      {/* Add new skill input */}
      <div className="flex">
        <input
          type="text"
          value={newSkill}
          onChange={(e) => setNewSkill(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add a new skill"
          className="flex-grow p-2 border border-gray-300 rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleAddSkill}
          className="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600 focus:outline-none"
        >
          Add
        </button>
      </div>
    </div>
  );
};

export default EditableSkills;