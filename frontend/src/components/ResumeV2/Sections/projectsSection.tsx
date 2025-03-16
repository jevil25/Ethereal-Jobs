import { DiffSection } from "../DiffSection";
import { Project } from "../../OnBoarding/ProjectCard";
import EditableText from "./EditableText";
import { compareData } from "../compareUtils";
import EditableSkills from "./EditableSkills";

interface ProjectsSectionProps {
  projects: Project[];
  projectsDiff: ReturnType<typeof compareData.compareObjectArrays<Project>>;
  isOptimized: boolean;
  onUpdate: (index: number, field: keyof Project, value: string | string[]) => void;
}

export const ProjectsSection: React.FC<ProjectsSectionProps> = ({
  projects,
  projectsDiff,
  isOptimized,
  onUpdate,
}) => {
  const renderProject = (
    project: Project,
    status: "unchanged" | "added" | "removed" | "modified",
    index: number,
    originalProject?: Project,
  ) => {
    let bulletDiff: {
      removed: string[];
      added: string[];
      unchanged: string[];
    } = { unchanged: project.description.split("\n"), added: [], removed: [] };

    if (status === "modified" && originalProject) {
      bulletDiff = compareData.compareBulletPoints(
        isOptimized ? originalProject.description : project.description,
        isOptimized ? project.description : originalProject.description,
      );
    }

    const updateDescription = (i: number, value: string) => {
        const updatedDescription = [...projects];
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
                initialValue={project.title}
                onSave={(v: string) => onUpdate(index, "title", v)}
              />
            </h3>
          </div>
        </div>
        {project.technologies.length > 0 && (
            <p className="text-gray-600 text-sm">
                <EditableSkills
                    key={Date.now()}
                    diffInfo={{added: [], unchanged: project.technologies}}
                    isOptimized={isOptimized}
                    skills={project.technologies}
                    onUpdate={(technologies: string[]) => onUpdate(index, "technologies", technologies)}
                />
            </p>
        )}
        {project.url && (
          <p className="text-gray-600 text-sm">
            <EditableText
              initialValue={project.url}
              onSave={(v: string) => onUpdate(index, "url", v)}
            />
          </p>
        )}
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
    <DiffSection<Project>
      title="Projects"
      items={projects}
      diffInfo={projectsDiff}
      isOptimized={isOptimized}
      renderItem={renderProject}
    />
  );
};
