import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Experience } from '../OnBoarding/ExperienceCard';

interface ExperienceItemProps {
    experience: Experience;
    index: number;
    onChange: (index: number, field: keyof Experience, value: string) => void
    onRemove: () => void;
}

const ExperienceItem = ({ experience, index, onChange, onRemove }: ExperienceItemProps) => {
  return (
    <Card className="p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium">Job Title</label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            value={experience.title}
            onChange={(e) => onChange(index, 'title', e.target.value)}
            placeholder="e.g., Software Engineer"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium">Company</label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            value={experience.company}
            onChange={(e) => onChange(index, 'company', e.target.value)}
            placeholder="e.g., Tech Company Inc."
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium">Start Date</label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            value={experience.startDate}
            onChange={(e) => onChange(index, 'startDate', e.target.value)}
            placeholder="e.g., Jan 2020"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium">End Date</label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            value={experience.endDate}
            onChange={(e) => onChange(index, 'endDate', e.target.value)}
            placeholder="e.g., Present"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium">Location</label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            value={experience.location}
            onChange={(e) => onChange(index, 'location', e.target.value)}
            placeholder="e.g., New York, NY"
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <label className="block text-sm font-medium">Description</label>
          <textarea
            className="w-full p-2 border rounded min-h-24"
            value={experience.description}
            onChange={(e) => onChange(index, 'description', e.target.value)}
            placeholder="Describe your responsibilities and achievements..."
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

export default ExperienceItem;