import React, { useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { X } from "lucide-react";
import { Badge } from "../ui/badge";

export interface SkillsCardProps {
  data: string[];
  updateData: (data: string[]) => void;
}

const SkillsCard: React.FC<SkillsCardProps> = ({ data, updateData }) => {
  const [newSkill, setNewSkill] = useState("");

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSkill.trim() && !data.includes(newSkill.trim())) {
      updateData([...data, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    updateData(data.filter((skill) => skill !== skillToRemove));
  };

  // Some common skills for suggestions
  const skillSuggestions = [
    "JavaScript",
    "TypeScript",
    "React",
    "Node.js",
    "Python",
    "Java",
    "SQL",
    "Management",
    "Leadership",
    "Communication",
    "Project Management",
    "Marketing",
    "Sales",
    "Customer Service",
    "UX/UI Design",
    "Data Analysis",
  ];

  const addSuggestion = (skill: string) => {
    if (!data.includes(skill)) {
      updateData([...data, skill]);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleAddSkill} className="flex space-x-2">
        <Input
          placeholder="Add a skill..."
          value={newSkill}
          onChange={(e) => setNewSkill(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" variant="jobify">
          Add
        </Button>
      </form>

      <div className="flex flex-wrap gap-2 mt-4">
        {data.map((skill) => (
          <Badge
            key={skill}
            variant="secondary"
            className="pl-3 pr-2 py-1.5 flex items-center"
          >
            {skill}
            <Button
              variant="ghost"
              size="icon"
              className="h-4 w-4 ml-1 hover:bg-transparent"
              onClick={() => handleRemoveSkill(skill)}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        ))}

        {data.length === 0 && (
          <p className="text-sm text-gray-500">
            No skills added yet. Add your top skills to help employers find you.
          </p>
        )}
      </div>

      {data.length < 10 && (
        <div className="mt-6">
          <p className="text-sm font-medium mb-2">Popular skills:</p>
          <div className="flex flex-wrap gap-2">
            {skillSuggestions
              .filter((skill) => !data.includes(skill))
              .slice(0, 8)
              .map((skill) => (
                <Badge
                  key={skill}
                  variant="outline"
                  className="cursor-pointer hover:bg-gray-100"
                  onClick={() => addSuggestion(skill)}
                >
                  + {skill}
                </Badge>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillsCard;
