import { useState } from "react";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Experience } from "../OnBoarding/ExperienceCard";
import { CalendarForm } from "../ui/calendar";
import ConfirmationModal from "../ConfirmationModal";

interface ExperienceItemProps {
  experience: Experience;
  index: number;
  onChange: (index: number, field: keyof Experience, value: string) => void;
  onRemove: () => void;
}

const ExperienceItem = ({
  experience,
  index,
  onChange,
  onRemove,
}: ExperienceItemProps) => {
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  return (
    <>
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium">Job Title</label>
            <input
              type="text"
              className="w-full p-2 border rounded"
              value={experience.title}
              onChange={(e) => onChange(index, "title", e.target.value)}
              placeholder="e.g., Software Engineer"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium">Company</label>
            <input
              type="text"
              className="w-full p-2 border rounded"
              value={experience.company}
              onChange={(e) => onChange(index, "company", e.target.value)}
              placeholder="e.g., Tech Company Inc."
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium">Start Date</label>
            <CalendarForm
              value={
                experience.startDate
                  ? new Date(experience.startDate)
                  : new Date()
              }
              setValue={(date: Date | undefined) =>
                onChange(index, "startDate", date ? date.toISOString() : "")
              }
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium">End Date</label>
            <CalendarForm
              value={
                experience.endDate ? new Date(experience.endDate) : undefined
              }
              setValue={(date: Date | undefined) =>
                onChange(index, "endDate", date ? date.toISOString() : "")
              }
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium">Location</label>
            <input
              type="text"
              className="w-full p-2 border rounded"
              value={experience.location}
              onChange={(e) => onChange(index, "location", e.target.value)}
              placeholder="e.g., New York, NY"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="block text-sm font-medium">Description</label>
            <textarea
              className="w-full p-2 border rounded min-h-24"
              value={experience.description}
              onChange={(e) => onChange(index, "description", e.target.value)}
              placeholder="Describe your responsibilities and achievements..."
            />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowRemoveModal(true)}
          >
            Remove
          </Button>
        </div>
      </Card>
      {showRemoveModal && (
        <ConfirmationModal
          confirmationMessage="Are you sure you want to remove this experience?"
          onRemove={onRemove}
          setShowRemoveModal={setShowRemoveModal}
        />
      )}
    </>
  );
};

export default ExperienceItem;
