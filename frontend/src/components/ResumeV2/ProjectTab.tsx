import { Button } from "../../components/ui/button";
import { Plus } from "lucide-react";
import ProjectItem from "./ProjectItem";
import { Project } from "../OnBoarding/ProjectCard";
import { FormData } from "@/api/types";

interface ProjectTabProps {
  projects: Project[];
  updateResumeSection: (<K extends keyof FormData>(
    section: K,
    data: FormData[K],
  ) => void);
}

const ProjectTab = ({ projects, updateResumeSection }: ProjectTabProps) => {
  const addProject = () => {
    const newProject = {
      id: "",
      title: "",
      url: "",
      technologies: [],
      description: "",
    };
    updateResumeSection("projects", [...projects, newProject]);
  };

  const handleProjectChange = (
    index: number,
    field: keyof Project,
    value: string | string[],
  ) => {
    const updatedProjects = [...projects];
    updatedProjects[index] = {
      ...updatedProjects[index],
      [field]: value,
    };
    updateResumeSection("projects", updatedProjects);
  };

  const removeProject = (index: number) => {
    const updatedProjects = [...projects];
    updatedProjects.splice(index, 1);
    updateResumeSection("projects", updatedProjects);
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Projects</h2>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1"
          onClick={addProject}
        >
          <Plus size={16} /> Add
        </Button>
      </div>

      {projects.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No projects added yet.</p>
      ) : (
        <div className="space-y-6">
          {projects.map((project, index) => (
            <ProjectItem
              key={index}
              project={project}
              index={index}
              onChange={handleProjectChange}
              onRemove={() => removeProject(index)}
            />
          ))}
        </div>
      )}
    </>
  );
};

export default ProjectTab;
