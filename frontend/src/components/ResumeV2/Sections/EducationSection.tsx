import { DiffSection } from "../DiffSection";
import { Education } from "../../OnBoarding/EducationCard";
import EditableText from "./EditableText";
import { compareData } from "../compareUtils";

interface EducationSectionProps {
  education: Education[];
  educationDiff: ReturnType<typeof compareData.compareObjectArrays<Education>>;
  isOptimized: boolean;
  onSave: (index: number, field: keyof Education, value: string) => void;
}

export const EducationSection: React.FC<EducationSectionProps> = ({
  education,
  educationDiff,
  isOptimized,
  onSave,
}) => {
  const renderEducation = (
    edu: Education,
    _status: "unchanged" | "added" | "removed" | "modified",
    index: number,
  ) => (
    <>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold">
            <EditableText
              initialValue={edu.degree}
              onSave={(v: string) => onSave(index, "degree", v)}
            />
          </h3>
          <p className="text-gray-700">
            <EditableText
              initialValue={edu.school}
              onSave={(v: string) => onSave(index, "school", v)}
            />
          </p>
        </div>
        <div className="text-gray-600 text-sm">
          <EditableText
            initialValue={edu.startDate}
            onSave={(v: string) => onSave(index, "startDate", v)}
          />{" "}
          -
          <EditableText
            initialValue={edu.endDate || "Present"}
            onSave={(v: string) => onSave(index, "endDate", v)}
          />
        </div>
      </div>
      <p className="text-gray-600 text-sm">
        <EditableText
          initialValue={edu.fieldOfStudy}
          onSave={(v: string) => onSave(index, "fieldOfStudy", v)}
        />
      </p>
      {edu.grade && (
        <p className="mt-2 text-sm">
          <EditableText
            initialValue={edu.grade}
            onSave={(v: string) => onSave(index, "grade", v)}
          />
        </p>
      )}
    </>
  );

  return (
    <DiffSection<Education>
      title="Education"
      items={education}
      diffInfo={educationDiff}
      isOptimized={isOptimized}
      renderItem={renderEducation}
    />
  );
};
