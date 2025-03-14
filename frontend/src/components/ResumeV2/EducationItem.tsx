import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { useState } from "react";
import ConfirmationModal from "../ConfirmationModal";
import { Education } from "../OnBoarding/EducationCard";

interface EducationItemProps {
  education: Education;
  index: number;
  onChange: (index: number, field: string, value: string) => void;
  onRemove: () => void;
}

const EducationItem = ({
  education,
  index,
  onChange,
  onRemove,
}: EducationItemProps) => {
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  return (
    <>
      <Card key={index} className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium">Institution</label>
            <input
              type="text"
              className="w-full p-2 border rounded"
              value={education.school}
              onChange={(e) => onChange(index, "school", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium">Degree</label>
            <input
              type="text"
              className="w-full p-2 border rounded"
              value={education.degree}
              onChange={(e) => onChange(index, "degree", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium">Field of Study</label>
            <input
              type="text"
              className="w-full p-2 border rounded"
              value={education.fieldOfStudy}
              onChange={(e) => onChange(index, "fieldOfStudy", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium">Grade</label>
            <input
              type="text"
              className="w-full p-2 border rounded"
              value={education.grade}
              onChange={(e) => onChange(index, "grade", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium">Start Date</label>
            <input
              type="text"
              className="w-full p-2 border rounded"
              value={education.startDate}
              onChange={(e) => onChange(index, "startDate", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium">End Date</label>
            <input
              type="text"
              className="w-full p-2 border rounded"
              value={education.endDate}
              onChange={(e) => onChange(index, "endDate", e.target.value)}
            />
          </div>
          <div className="mt-4 flex justify-end md:col-span-2">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowRemoveModal(true)}
            >
              Remove
            </Button>
          </div>
        </div>
      </Card>
      {showRemoveModal && (
        <ConfirmationModal
          onRemove={onRemove}
          setShowRemoveModal={setShowRemoveModal}
          confirmationMessage="Are you sure you want to remove this education?"
        />
      )}
    </>
  );
};

export default EducationItem;
