import React, { useState } from 'react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { X, Plus } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { CalendarForm } from '../ui/calendar';

interface Experience {
  id: string;
  company: string;
  title: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

interface ExperienceCardProps {
  data: Experience[];
  updateData: (data: Experience[]) => void;
}

const ExperienceCard: React.FC<ExperienceCardProps> = ({ data, updateData }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newExperience, setNewExperience] = useState<Experience>({
    id: '',
    company: '',
    title: '',
    location: '',
    startDate: '',
    endDate: '',
    current: false,
    description: '',
  });

  const handleStartDateChange = (date: Date | undefined) => {
    if (!date) return;
    const offset = date.getTimezoneOffset();
    date = new Date(date.getTime() - (offset * 60 * 1000));
    setNewExperience({
      ...newExperience,
      startDate: date.toISOString().split('T')[0],
    });
  };

  const handleEndDateChange = (date: Date | undefined) => {
    if (!date) return;
    const offset = date.getTimezoneOffset();
    date = new Date(date.getTime() - (offset * 60 * 1000));
    setNewExperience({
      ...newExperience,
      endDate: date.toISOString().split('T')[0],
    });
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewExperience({
      ...newExperience,
      [name]: value,
    });
  };

  const handleCheckboxChange = (checked: boolean) => {
    setNewExperience({
      ...newExperience,
      current: checked,
      endDate: checked ? '' : newExperience.endDate,
    });
  };

  const addExperience = () => {
    if (newExperience.company && newExperience.title) {
      const experienceToAdd = {
        ...newExperience,
        id: Date.now().toString(),
      };
      updateData([...data, experienceToAdd]);
      setNewExperience({
        id: '',
        company: '',
        title: '',
        location: '',
        startDate: '',
        endDate: '',
        current: false,
        description: '',
      });
      setIsAdding(false);
    }
  };

  const removeExperience = (id: string) => {
    updateData(data.filter(item => item.id !== id));
  };

  return (
    <div className="space-y-4">
      {data.length > 0 && (
        <div className="space-y-4">
          {data.map((exp) => (
            <Card key={exp.id} className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-6 w-6"
                onClick={() => removeExperience(exp.id)}
              >
                <X className="h-4 w-4" />
              </Button>
              <CardContent className="pt-6">
                <div className="font-medium">{exp.title}</div>
                <div className="text-sm text-gray-500">{exp.company}</div>
                <div className="text-xs text-gray-400">
                  {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                </div>
                {exp.description && (
                  <div className="mt-2 text-sm">{exp.description}</div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isAdding ? (
        <Button
          onClick={() => setIsAdding(true)}
          variant="outline"
          className="w-full"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Work Experience
        </Button>
      ) : (
        <div className="space-y-4 border p-4 rounded-lg">
          <div className="space-y-2">
            <Label htmlFor="title">Job Title</Label>
            <Input
              id="title"
              name="title"
              placeholder="e.g., Software Engineer"
              value={newExperience.title}
              onChange={handleChange}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="company">Company</Label>
            <Input
              id="company"
              name="company"
              placeholder="e.g., Acme Inc."
              value={newExperience.company}
              onChange={handleChange}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              name="location"
              placeholder="e.g., San Francisco, CA"
              value={newExperience.location}
              onChange={handleChange}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <CalendarForm
                value={newExperience.startDate ? new Date(newExperience.startDate) : undefined}
                setValue={handleStartDateChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <CalendarForm
                value={newExperience.endDate ? new Date(newExperience.endDate) : undefined}
                setValue={handleEndDateChange}
                disabled={newExperience.current}
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="current" 
              checked={newExperience.current}
              onCheckedChange={handleCheckboxChange}
            />
            <Label htmlFor="current" className="text-sm font-normal">
              I currently work here
            </Label>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Describe your responsibilities and achievements..."
              value={newExperience.description}
              onChange={handleChange}
              rows={4}
            />
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsAdding(false)}>
              Cancel
            </Button>
            <Button variant="jobify" onClick={addExperience}>
              Add Experience
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExperienceCard;
