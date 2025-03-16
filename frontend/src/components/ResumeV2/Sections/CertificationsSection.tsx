import { DiffSection } from "../DiffSection";
import { Certification } from "../../OnBoarding/CertificationCard";
import EditableText from "./EditableText";
import { compareData } from "../compareUtils";

interface CertificationsSectionProps {
  certifications: Certification[];
  certificationsDiff: ReturnType<typeof compareData.compareObjectArrays<Certification>>;
  isOptimized: boolean;
  onUpdate: (index: number, field: keyof Certification, value: string) => void;
}

export const CertificationsSection: React.FC<CertificationsSectionProps> = ({
  certifications,
  certificationsDiff,
  isOptimized,
  onUpdate,
}) => {
  const renderCertification = (
    certification: Certification,
    status: "unchanged" | "added" | "removed" | "modified",
    index: number,
  ) => (
    <>
      <div className="flex flex-col space-y-2">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="text-lg font-semibold">
              <EditableText
                initialValue={certification.name}
                onSave={(v: string) => onUpdate(index, "name", v)}
              />
            </h3>
          </div>
        </div>
        
        {certification.credentialUrl && (
          <p className="text-gray-600 text-sm flex items-center">
            <span className="mr-1">🔗</span>
            <EditableText
              initialValue={certification.credentialUrl}
              onSave={(v: string) => onUpdate(index, "credentialUrl", v)}
            />
          </p>
        )}
        
        {certification.description && (
          <div className="text-gray-700 text-sm mt-1">
            <EditableText
              initialValue={certification.description}
              onSave={(v: string) => onUpdate(index, "description", v)}
              multiline={true}
            />
          </div>
        )}
        
        {status === "added" && isOptimized && (
          <div className="text-xs text-green-700 bg-green-50 px-2 py-1 rounded-md self-start mt-1">
            Added in optimized version
          </div>
        )}
        
        {status === "removed" && !isOptimized && (
          <div className="text-xs text-red-700 bg-red-50 px-2 py-1 rounded-md self-start mt-1">
            Removed in original version
          </div>
        )}
      </div>
    </>
  );

  return (
    <DiffSection<Certification>
      title="Certifications"
      items={certifications}
      diffInfo={certificationsDiff}
      isOptimized={isOptimized}
      renderItem={renderCertification}
    />
  );
};