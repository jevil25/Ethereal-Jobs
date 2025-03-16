import { DiffSection } from "../DiffSection";
import { Experience } from "../../OnBoarding/ExperienceCard";
import EditableText from "./EditableText";
import { compareData } from "../compareUtils";

interface ExperienceSectionProps {
  experiences: Experience[];
  experienceDiff: ReturnType<
    typeof compareData.compareObjectArrays<Experience>
  >;
  isOptimized: boolean;
  onUpdate: (index: number, field: keyof Experience, value: string) => void;
}

export const ExperienceSection: React.FC<ExperienceSectionProps> = ({
  experiences,
  experienceDiff,
  isOptimized,
  onUpdate,
}) => {
  const renderExperience = (
    exp: Experience,
    status: "unchanged" | "added" | "removed" | "modified",
    index: number,
    originalExp?: Experience,
  ) => {
    let bulletDiff: {
      removed: string[];
      added: string[];
      unchanged: string[];
    } = { unchanged: exp.description.split("\n"), added: [], removed: [] };

    if (status === "modified" && originalExp) {
      bulletDiff = compareData.compareBulletPoints(
        isOptimized ? originalExp.description : exp.description,
        isOptimized ? exp.description : originalExp.description,
      );
    }

    const updateDescription = (i: number, value: string) => {
        const updatedDescription = [...experiences];
        const descriptionArray = updatedDescription[index].description.split("\n");
        descriptionArray[i] = value;
        onUpdate(index, "description", descriptionArray.join("\n"));
    };

    return (
      <>
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold">
              <EditableText
                initialValue={exp.title}
                onSave={(v: string) => onUpdate(index, "title", v)}
              />
            </h3>
            <p className="text-gray-700">
              <EditableText
                initialValue={exp.company}
                onSave={(v: string) => onUpdate(index, "company", v)}
              />
            </p>
          </div>
          <div className="text-gray-600 text-sm">
            <EditableText
              initialValue={exp.startDate}
              onSave={(v: string) => onUpdate(index, "startDate", v)}
            />{" "}
            -
            <EditableText
              initialValue={exp.endDate || "Present"}
              onSave={(v: string) => onUpdate(index, "endDate", v)}
            />
          </div>
        </div>
        <p className="text-gray-600 text-sm">
          <EditableText
            initialValue={exp.location}
            onSave={(v: string) => onUpdate(index, "location", v)}
          />
        </p>
        <ul className="mt-2 list-disc pl-5 text-sm">
          {bulletDiff.unchanged.map((line, i) => (
            <li className="mb-1" key={`unchanged-${i}`}>
              <EditableText
                initialValue={line}
                onSave={(v: string) => updateDescription(i, v)}
              />
            </li>
          ))}
          {status === "modified" &&
            isOptimized &&
            bulletDiff.added.map((line, i) => (
              <li
                className="mb-1 bg-green-50 text-green-800 px-1 rounded"
                key={`added-${i}`}
              >
                +{" "}
                <EditableText
                  initialValue={line}
                  onSave={(v: string) => updateDescription(i, v)}
                />
              </li>
            ))}
          {status === "modified" &&
            !isOptimized &&
            bulletDiff.removed.map((line, i) => (
              <li
                className="mb-1 bg-red-50 text-red-800 px-1 rounded"
                key={`removed-${i}`}
              >
                -{" "}
                <EditableText
                  initialValue={line}
                  onSave={(v: string) => updateDescription(i, v)}
                />
              </li>
            ))}
        </ul>
      </>
    );
  };

  return (
    <DiffSection<Experience>
      title="Work Experience"
      items={experiences}
      diffInfo={experienceDiff}
      isOptimized={isOptimized}
      renderItem={renderExperience}
    />
  );
};
