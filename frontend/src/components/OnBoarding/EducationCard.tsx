import React, { useState } from 'react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { X, Plus } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { CalendarForm } from '../ui/calendar';

export interface Education {
  id: string;
  school: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string;
  current: boolean;
  grade?: string;
}

interface EducationCardProps {
  data: Education[];
  updateData: (data: Education[]) => void;
}

const EducationCard: React.FC<EducationCardProps> = ({ data, updateData }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newEducation, setNewEducation] = useState<Education>({
    id: '',
    school: '',
    degree: '',
    fieldOfStudy: '',
    startDate: '',
    endDate: '',
    current: false,
    grade: '',
  });

  const handleStartDateChange = (date: Date | undefined) => {
    if (!date) return;
    const offset = date.getTimezoneOffset();
    date = new Date(date.getTime() - (offset * 60 * 1000));
    setNewEducation({
      ...newEducation,
      startDate: date.toISOString().split('T')[0],
    });
  }

  const handleEndDateChange = (date: Date | undefined) => {
    if (!date) return;
    const offset = date.getTimezoneOffset();
    date = new Date(date.getTime() - (offset * 60 * 1000));
    setNewEducation({
      ...newEducation,
      endDate: date.toISOString().split('T')[0],
    });
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewEducation({
      ...newEducation,
      [name]: value,
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setNewEducation({
      ...newEducation,
      [name]: value,
    });
  };

  const handleCheckboxChange = (checked: boolean) => {
    setNewEducation({
      ...newEducation,
      current: checked,
      endDate: checked ? '' : newEducation.endDate,
    });
  };

  const addEducation = () => {
    if (newEducation.school && newEducation.degree) {
      const educationToAdd = {
        ...newEducation,
        id: Date.now().toString(),
      };
      updateData([...data, educationToAdd]);
      setNewEducation({
        id: '',
        school: '',
        degree: '',
        fieldOfStudy: '',
        startDate: '',
        endDate: '',
        current: false,
        grade: '',
      });
      setIsAdding(false);
    }
  };

  const removeEducation = (id: string) => {
    updateData(data.filter(item => item.id !== id));
  };

  return (
    <div className="space-y-4">
      {data.length > 0 && (
        <div className="space-y-4">
          {data.map((edu) => (
            <Card key={edu.id} className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-6 w-6"
                onClick={() => removeEducation(edu.id)}
              >
                <X className="h-4 w-4" />
              </Button>
              <CardContent className="pt-6">
                <div className="font-medium">{edu.school}</div>
                <div className="text-sm text-gray-500">
                  {edu.degree}{edu.fieldOfStudy ? `, ${edu.fieldOfStudy}` : ''}
                </div>
                <div className="text-xs text-gray-400">
                  {edu.startDate} - {edu.current ? 'Present' : edu.endDate}
                </div>
                {edu.grade && (
                  <div className="mt-1 text-xs text-gray-500">Grade: {edu.grade}</div>
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
          Add Education
        </Button>
      ) : (
        <div className="space-y-4 border p-4 rounded-lg">
          <div className="space-y-2">
            <Label htmlFor="school">School</Label>
            <Input
              id="school"
              name="school"
              placeholder="e.g., Stanford University"
              value={newEducation.school}
              onChange={handleChange}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="degree">Degree</Label>
            <Select
              onValueChange={(value) => handleSelectChange('degree', value)}
              value={newEducation.degree}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select degree" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="High School Diploma">High School Diploma</SelectItem>
                <SelectItem value="Associate's Degree">Associate's Degree</SelectItem>
                <SelectItem value="Bachelor's Degree">Bachelor's Degree</SelectItem>
                <SelectItem value="Master's Degree">Master's Degree</SelectItem>
                <SelectItem value="Doctorate">Doctorate</SelectItem>
                <SelectItem value="Certificate">Certificate</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="fieldOfStudy">Field of Study</Label>
            <Input
              id="fieldOfStudy"
              name="fieldOfStudy"
              placeholder="e.g., Computer Science"
              value={newEducation.fieldOfStudy}
              onChange={handleChange}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <CalendarForm
                value={newEducation.startDate ? new Date(newEducation.startDate) : undefined}
                setValue={handleStartDateChange}
                disabled={newEducation.current}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <CalendarForm
                value={newEducation.endDate ? new Date(newEducation.endDate) : undefined}
                setValue={handleEndDateChange}
                disabled={newEducation.current}
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="current" 
              checked={newEducation.current}
              onCheckedChange={handleCheckboxChange}
            />
            <Label htmlFor="current" className="text-sm font-normal">
              I'm currently studying here
            </Label>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="grade">Grade (optional)</Label>
            <Input
              id="grade"
              name="grade"
              placeholder="e.g., 3.8 GPA"
              value={newEducation.grade}
              onChange={handleChange}
            />
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsAdding(false)}>
              Cancel
            </Button>
            <Button variant="jobify" onClick={addEducation}>
              Add Education
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EducationCard;
