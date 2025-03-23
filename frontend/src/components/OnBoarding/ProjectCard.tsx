import React, { useState } from "react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { X, Plus } from "lucide-react";
import { Card, CardContent, CardFooter } from "../ui/card";
import { Badge } from "../ui/badge";

export interface Project {
  id: string;
  title: string;
  url: string;
  technologies: string[];
  description: string;
}

interface ProjectCardProps {
  data: Project[];
  updateData: (data: Project[]) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ data, updateData }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProject, setCurrentProject] = useState<Project>({
    id: "",
    title: "",
    url: "",
    technologies: [],
    description: "",
  });
  const [editingProject, setEditingProject] = useState<Project>();
  const [newTech, setNewTech] = useState("");

  const resetForm = () => {
    setCurrentProject({
      id: "",
      title: "",
      url: "",
      technologies: [],
      description: "",
    });
    setEditingProject(undefined);
    setIsFormOpen(false);
    setIsEditing(false);
    setNewTech("");
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setCurrentProject({
      ...currentProject,
      [name]: value,
    });
  };

  const handleAddTech = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      newTech.trim() &&
      !currentProject.technologies.includes(newTech.trim())
    ) {
      setCurrentProject({
        ...currentProject,
        technologies: [...currentProject.technologies, newTech.trim()],
      });
      setNewTech("");
    }
  };

  const handleRemoveTech = (techToRemove: string) => {
    setCurrentProject({
      ...currentProject,
      technologies: currentProject.technologies.filter(
        (tech) => tech !== techToRemove,
      ),
    });
  };

  const saveProject = () => {
    if (currentProject.title) {
      if (isEditing) {
        // Update existing project
        updateData(
          data.map((item) =>
            item.id === currentProject.id ? currentProject : item,
          ),
        );
        setEditingProject(undefined);
      } else {
        // Add new project
        const projectToAdd = {
          ...currentProject,
          id: Date.now().toString(),
        };
        updateData([...data, projectToAdd]);
      }
      resetForm();
    }
  };

  const startEditing = (project: Project) => {
    setCurrentProject({ ...project });
    setEditingProject(project);
    setIsEditing(true);
    setIsFormOpen(true);
  };

  const addNew = () => {
    resetForm();
    setIsFormOpen(true);
    setIsEditing(false);
  };

  const removeProject = (id: string) => {
    updateData(data.filter((item) => item.id !== id));
  };

  // Tech suggestions
  const techSuggestions = [
    "React",
    "Angular",
    "Vue.js",
    "Node.js",
    "Express",
    "MongoDB",
    "PostgreSQL",
    "TypeScript",
    "JavaScript",
    "HTML/CSS",
    "Python",
    "Django",
    "Flask",
    "Ruby on Rails",
    "Java",
    "Spring Boot",
  ];

  const addSuggestion = (tech: string) => {
    if (!currentProject.technologies.includes(tech)) {
      setCurrentProject({
        ...currentProject,
        technologies: [...currentProject.technologies, tech],
      });
    }
  };

  const getMissingFields = (exp: Project) => {
    const requiredFields: (keyof Project)[] = [
      "title",
      "technologies",
      "description",
      "url",
    ];
    return requiredFields.filter((field) => !exp[field]);
  };

  return (
    <div className="space-y-4">
      {data.length > 0 && (
        <div className="space-y-4">
          {data
            .filter((value) => value.id != editingProject?.id)
            .map((project) => (
              <Card key={project.id} className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute top-2 left-2"
                  onClick={() => startEditing(project)}
                >
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 h-6 w-6"
                  onClick={() => removeProject(project.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
                <CardContent className="pt-6">
                  <div className="font-medium">{project.title}</div>
                  {project.url && (
                    <div className="text-sm text-blue-500">
                      <a
                        href={project.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {project.url}
                      </a>
                    </div>
                  )}
                  {project.technologies && project.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {project.technologies.map((tech) => (
                        <Badge
                          key={tech}
                          variant="secondary"
                          className="text-xs"
                        >
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  )}
                  {project.description && (
                    <div className="mt-2 text-sm">{project.description}</div>
                  )}
                </CardContent>
                {getMissingFields(project).length > 0 && (
                  <CardFooter className="flex justify-end">
                    <div className="text-xs font-medium text-red-500">
                      Missing fields: {getMissingFields(project).join(", ")}
                    </div>
                  </CardFooter>
                )}
              </Card>
            ))}
        </div>
      )}

      {!isFormOpen ? (
        <Button onClick={addNew} variant="outline" className="w-full">
          <Plus className="mr-2 h-4 w-4" />
          Add Project
        </Button>
      ) : (
        <div className="space-y-4 border p-4 rounded-lg">
          <div className="space-y-2">
            <Label htmlFor="title">Project Title</Label>
            <Input
              id="title"
              name="title"
              placeholder="e.g., Personal Portfolio Website"
              value={currentProject.title}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">Project URL</Label>
            <Input
              id="url"
              name="url"
              placeholder="e.g., https://github.com/username/project"
              value={currentProject.url}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="technologies">Technologies Used</Label>
            <form onSubmit={handleAddTech} className="flex space-x-2">
              <Input
                id="technologies"
                placeholder="e.g., React, Node.js, MongoDB"
                value={newTech}
                onChange={(e) => setNewTech(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" variant="Etheral Jobs" size="sm">
                Add
              </Button>
            </form>

            <div className="flex flex-wrap gap-1 mt-2">
              {currentProject.technologies.map((tech) => (
                <Badge
                  key={tech}
                  variant="secondary"
                  className="pl-3 pr-2 py-1 flex items-center"
                >
                  {tech}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 ml-1 hover:bg-transparent"
                    onClick={() => handleRemoveTech(tech)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>

            {currentProject.technologies.length < 5 && (
              <div className="mt-2">
                <p className="text-xs text-gray-500 mb-1">
                  Suggested technologies:
                </p>
                <div className="flex flex-wrap gap-1">
                  {techSuggestions
                    .filter(
                      (tech) => !currentProject.technologies.includes(tech),
                    )
                    .slice(0, 6)
                    .map((tech) => (
                      <Badge
                        key={tech}
                        variant="outline"
                        className="cursor-pointer hover:bg-gray-100 text-xs"
                        onClick={() => addSuggestion(tech)}
                      >
                        + {tech}
                      </Badge>
                    ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Describe your project, its purpose, and your role..."
              value={currentProject.description}
              onChange={handleChange}
              rows={4}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={resetForm}>
              Cancel
            </Button>
            <Button variant="Etheral Jobs" onClick={saveProject}>
              {isEditing ? "Update Project" : "Add Project"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectCard;
