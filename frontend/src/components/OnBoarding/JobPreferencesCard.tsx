import React from 'react';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Checkbox } from '../ui/checkbox';
import { Badge } from '../ui/badge';
import { X } from 'lucide-react';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface JobPreferences {
  jobTypes: string[];
  locations: string[];
  remotePreference: string;
  salaryExpectation: string;
  immediateStart: boolean;
}

interface JobPreferencesCardProps {
  data: JobPreferences;
  updateData: (data: JobPreferences) => void;
}

const JobPreferencesCard: React.FC<JobPreferencesCardProps> = ({ data, updateData }) => {
  const [newLocation, setNewLocation] = React.useState('');
  
  const jobTypeOptions = [
    "Full-time", 
    "Part-time", 
    "Contract", 
    "Temporary", 
    "Internship", 
    "Freelance"
  ];
  
  const remoteOptions = [
    { value: "onsite", label: "On-site only" },
    { value: "hybrid", label: "Hybrid (some remote work)" },
    { value: "remote", label: "Fully remote" },
    { value: "flexible", label: "Flexible (open to all options)" }
  ];
  
  const toggleJobType = (type: string) => {
    if (data.jobTypes.includes(type)) {
      updateData({
        ...data,
        jobTypes: data.jobTypes.filter(t => t !== type)
      });
    } else {
      updateData({
        ...data,
        jobTypes: [...data.jobTypes, type]
      });
    }
  };
  
  const addLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (newLocation.trim() && !data.locations.includes(newLocation.trim())) {
      updateData({
        ...data,
        locations: [...data.locations, newLocation.trim()]
      });
      setNewLocation('');
    }
  };
  
  const removeLocation = (location: string) => {
    updateData({
      ...data,
      locations: data.locations.filter(l => l !== location)
    });
  };
  
  const handleRemoteChange = (value: string) => {
    updateData({
      ...data,
      remotePreference: value
    });
  };
  
  const handleSalaryChange = (value: string) => {
    updateData({
      ...data,
      salaryExpectation: value
    });
  };
  
  const handleImmediateStartChange = (checked: boolean) => {
    updateData({
      ...data,
      immediateStart: checked
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label className="text-base">What type of job are you looking for?</Label>
        <div className="flex flex-wrap gap-2 mt-2">
          {jobTypeOptions.map(type => (
            <Badge 
              key={type}
              variant={data.jobTypes.includes(type) ? "default" : "outline"}
              className="cursor-pointer px-3 py-1"
              onClick={() => toggleJobType(type)}
            >
              {type}
            </Badge>
          ))}
        </div>
      </div>
      
      <div className="space-y-2">
        <Label className="text-base">Preferred work location(s)</Label>
        <form onSubmit={addLocation} className="flex space-x-2">
          <Input
            placeholder="Add a location..."
            value={newLocation}
            onChange={(e) => setNewLocation(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" variant="jobify">Add</Button>
        </form>
        
        <div className="flex flex-wrap gap-2 mt-2">
          {data.locations.map((location) => (
            <Badge key={location} variant="secondary" className="pl-3 pr-2 py-1.5 flex items-center">
              {location}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 ml-1 hover:bg-transparent"
                onClick={() => removeLocation(location)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
          
          {data.locations.length === 0 && (
            <p className="text-sm text-gray-500">Add locations where you'd like to work</p>
          )}
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="remotePreference" className="text-base">Remote work preference</Label>
        <Select
          value={data.remotePreference}
          onValueChange={handleRemoteChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select your remote work preference" />
          </SelectTrigger>
          <SelectContent>
            {remoteOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="salaryExpectation" className="text-base">Expected annual salary</Label>
        <Select
          value={data.salaryExpectation}
          onValueChange={handleSalaryChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select your salary expectation" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="negotiable">Negotiable</SelectItem>
            <SelectItem value="30-50k">$30,000 - $50,000</SelectItem>
            <SelectItem value="50-70k">$50,000 - $70,000</SelectItem>
            <SelectItem value="70-90k">$70,000 - $90,000</SelectItem>
            <SelectItem value="90-120k">$90,000 - $120,000</SelectItem>
            <SelectItem value="120-150k">$120,000 - $150,000</SelectItem>
            <SelectItem value="150k+">$150,000+</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex items-center space-x-2">
        <Checkbox 
          id="immediateStart" 
          checked={data.immediateStart}
          onCheckedChange={handleImmediateStartChange}
        />
        <Label htmlFor="immediateStart" className="text-sm font-normal">
          I can start immediately
        </Label>
      </div>
    </div>
  );
};

export default JobPreferencesCard;
