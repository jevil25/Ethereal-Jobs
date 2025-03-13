import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Project } from '../OnBoarding/ProjectCard';

interface ProjectItemProps {
    project: Project;
    index: number;
    onChange: (index: number, field: keyof Project, value: string | string[]) => void;
    onRemove: () => void;
}

const ProjectItem = ({ project, index, onChange, onRemove }: ProjectItemProps) => {
  const handleTechnologiesChange = (value: string) => {
    // Convert comma-separated string to array
    const techArray = value.split(',').map(tech => tech.trim()).filter(tech => tech);
    onChange(index, 'technologies', techArray);
  };

  return (
    <Card className="p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium">Project Title</label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            value={project.title}
            onChange={(e) => onChange(index, 'title', e.target.value)}
            placeholder="e.g., Portfolio Website"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium">Project URL</label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            value={project.url}
            onChange={(e) => onChange(index, 'url', e.target.value)}
            placeholder="e.g., https://myproject.com"
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <label className="block text-sm font-medium">Technologies</label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            value={project.technologies.join(', ')}
            onChange={(e) => handleTechnologiesChange(e.target.value)}
            placeholder="e.g., React, TypeScript, Tailwind (comma separated)"
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <label className="block text-sm font-medium">Description</label>
          <textarea
            className="w-full p-2 border rounded min-h-24"
            value={project.description}
            onChange={(e) => onChange(index, 'description', e.target.value)}
            placeholder="Describe your project, its purpose, and your role in it..."
          />
        </div>
      </div>
      <div className="mt-4 flex justify-end">
        <Button 
          variant="destructive" 
          size="sm"
          onClick={onRemove}
        >
          Remove
        </Button>
      </div>
    </Card>
  );
};

export default ProjectItem;
