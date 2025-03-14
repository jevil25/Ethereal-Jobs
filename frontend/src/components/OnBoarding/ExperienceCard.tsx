import React, { useState } from "react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { X, Plus } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { CalendarForm } from "../ui/calendar";

export interface Experience {
  id: string;
  company: string;
  title: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

interface ExperienceCardProps {
  data: Experience[];
  updateData: (data: Experience[]) => void;
}

const ExperienceCard: React.FC<ExperienceCardProps> = ({
  data,
  updateData,
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentExperience, setCurrentExperience] = useState<Experience>({
    id: "",
    company: "",
    title: "",
    location: "",
    startDate: "",
    endDate: "",
    current: false,
    description: "",
  });
  const [editingExperience, setEditingExperience] = useState<Experience>();

  const resetForm = () => {
    setCurrentExperience({
      id: "",
      company: "",
      title: "",
      location: "",
      startDate: "",
      endDate: "",
      current: false,
      description: "",
    });
    setEditingExperience(undefined);
    setIsFormOpen(false);
    setIsEditing(false);
  };

  const handleDateChange = (
    field: "startDate" | "endDate",
    date: Date | undefined,
  ) => {
    if (!date) return;
    const offset = date.getTimezoneOffset();
    date = new Date(date.getTime() - offset * 60 * 1000);
    setCurrentExperience({
      ...currentExperience,
      [field]: date.toISOString().split("T")[0],
    });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setCurrentExperience({
      ...currentExperience,
      [name]: value,
    });
  };

  const handleCheckboxChange = (checked: boolean) => {
    setCurrentExperience({
      ...currentExperience,
      current: checked,
      endDate: checked ? "" : currentExperience.endDate,
    });
  };

  const saveExperience = () => {
    if (currentExperience.company && currentExperience.title) {
      if (isEditing) {
        // Update existing experience
        updateData(
          data.map((item) =>
            item.id === currentExperience.id ? currentExperience : item,
          ),
        );
        setEditingExperience(undefined);
      } else {
        // Add new experience
        const experienceToAdd = {
          ...currentExperience,
          id: Date.now().toString(),
        };
        updateData([...data, experienceToAdd]);
      }
      resetForm();
    }
  };

  const startEditing = (experience: Experience) => {
    setCurrentExperience({ ...experience });
    setEditingExperience(experience);
    setIsEditing(true);
    setIsFormOpen(true);
  };

  const addNew = () => {
    resetForm();
    setIsFormOpen(true);
    setIsEditing(false);
  };

  const removeExperience = (id: string) => {
    updateData(data.filter((item) => item.id !== id));
  };

  return (
    <div className="space-y-4">
      {data.length > 0 && (
        <div className="space-y-4">
          {data
            .filter((value) => value.id != editingExperience?.id)
            .map((exp) => (
              <Card key={exp.id} className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute top-2 left-2"
                  onClick={() => startEditing(exp)}
                >
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 h-6 w-6"
                  onClick={() => removeExperience(exp.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
                <CardContent className="pt-6">
                  <div className="font-medium">{exp.title}</div>
                  <div className="text-sm text-gray-500">{exp.company}</div>
                  {exp.location && (
                    <div className="text-sm text-gray-500">{exp.location}</div>
                  )}
                  <div className="text-xs text-gray-400">
                    {exp.startDate} - {exp.current ? "Present" : exp.endDate}
                  </div>
                  {exp.description && (
                    <div className="mt-2 text-sm">{exp.description}</div>
                  )}
                </CardContent>
              </Card>
            ))}
        </div>
      )}

      {!isFormOpen ? (
        <Button onClick={addNew} variant="outline" className="w-full">
          <Plus className="mr-2 h-4 w-4" />
          Add Work Experience
        </Button>
      ) : (
        <div className="space-y-4 border p-4 rounded-lg">
          <div className="space-y-2">
            <Label htmlFor="title">Job Title</Label>
            <Input
              id="title"
              name="title"
              placeholder="e.g., Software Engineer"
              value={currentExperience.title}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company">Company</Label>
            <Input
              id="company"
              name="company"
              placeholder="e.g., Acme Inc."
              value={currentExperience.company}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              name="location"
              placeholder="e.g., San Francisco, CA"
              value={currentExperience.location}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <CalendarForm
                value={
                  currentExperience.startDate
                    ? new Date(currentExperience.startDate)
                    : undefined
                }
                setValue={(date) => handleDateChange("startDate", date)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <CalendarForm
                value={
                  currentExperience.endDate
                    ? new Date(currentExperience.endDate)
                    : undefined
                }
                setValue={(date) => handleDateChange("endDate", date)}
                disabled={currentExperience.current}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="current"
              checked={currentExperience.current}
              onCheckedChange={handleCheckboxChange}
            />
            <Label htmlFor="current" className="text-sm font-normal">
              I currently work here
            </Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Describe your responsibilities and achievements..."
              value={currentExperience.description}
              onChange={handleChange}
              rows={4}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={resetForm}>
              Cancel
            </Button>
            <Button variant="jobify" onClick={saveExperience}>
              {isEditing ? "Update Experience" : "Add Experience"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExperienceCard;
