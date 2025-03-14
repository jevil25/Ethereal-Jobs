import { Button } from "../../components/ui/button";
import { Plus } from "lucide-react";
import CertificationItem from "./CertificationItem";
import { Certification } from "../OnBoarding/CertificationCard";
import { FormData } from "@/api/types";

interface CertificationTabProps {
  certifications: Certification[];
  updateResumeSection: <K extends keyof FormData>(
    section: K,
    data: FormData[K],
  ) => void;
}

const CertificationTab = ({
  certifications,
  updateResumeSection,
}: CertificationTabProps) => {
  const addCertification = () => {
    const newCertification = {
      id: "",
      name: "",
      description: "",
      credentialUrl: "",
    };
    updateResumeSection("certifications", [
      ...certifications,
      newCertification,
    ]);
  };

  const handleCertificationChange = (
    index: number,
    field: keyof Certification,
    value: string,
  ) => {
    const updatedCertifications = [...certifications];
    updatedCertifications[index] = {
      ...updatedCertifications[index],
      [field]: value,
    };
    updateResumeSection("certifications", updatedCertifications);
  };

  const removeCertification = (index: number) => {
    const updatedCertifications = [...certifications];
    updatedCertifications.splice(index, 1);
    updateResumeSection("certifications", updatedCertifications);
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Certifications</h2>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1"
          onClick={addCertification}
        >
          <Plus size={16} /> Add
        </Button>
      </div>

      {certifications.length === 0 ? (
        <p className="text-gray-500 text-center py-4">
          No certifications added yet.
        </p>
      ) : (
        <div className="space-y-6">
          {certifications.map((certification, index) => (
            <CertificationItem
              key={index}
              certification={certification}
              index={index}
              onChange={handleCertificationChange}
              onRemove={() => removeCertification(index)}
            />
          ))}
        </div>
      )}
    </>
  );
};

export default CertificationTab;
