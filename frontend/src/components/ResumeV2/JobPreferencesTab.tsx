import { useState } from "react";
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";
import { Checkbox } from "../../components/ui/checkbox";
import { Badge } from "../../components/ui/badge";
import { X } from "lucide-react";
import { Button } from "../../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { JobPreferences } from "../OnBoarding/JobPreferencesCard";

interface JobPreferencesTabProps {
  jobPreferences: JobPreferences;
  updateResumeSection: (section: string, data: any) => void;
}

const JobPreferencesTab = ({
  jobPreferences,
  updateResumeSection,
}: JobPreferencesTabProps) => {
  const [newLocation, setNewLocation] = useState("");

  const jobTypeOptions = [
    "Full-time",
    "Part-time",
    "Contract",
    "Temporary",
    "Internship",
    "Freelance",
  ];

  const remoteOptions = [
    { value: "onsite", label: "On-site only" },
    { value: "hybrid", label: "Hybrid (some remote work)" },
    { value: "remote", label: "Fully remote" },
    { value: "flexible", label: "Flexible (open to all options)" },
  ];

  const updateJobPreferences = (newData: Partial<JobPreferences>) => {
    updateResumeSection("jobPreferences", {
      ...jobPreferences,
      ...newData,
    });
  };

  const toggleJobType = (type: string) => {
    if (jobPreferences.jobTypes.includes(type)) {
      updateJobPreferences({
        jobTypes: jobPreferences.jobTypes.filter((t) => t !== type),
      });
    } else {
      updateJobPreferences({
        jobTypes: [...jobPreferences.jobTypes, type],
      });
    }
  };

  const addLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      newLocation.trim() &&
      !jobPreferences.locations.includes(newLocation.trim())
    ) {
      updateJobPreferences({
        locations: [...jobPreferences.locations, newLocation.trim()],
      });
      setNewLocation("");
    }
  };

  const removeLocation = (location: string) => {
    updateJobPreferences({
      locations: jobPreferences.locations.filter((l) => l !== location),
    });
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Job Preferences</h2>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label className="text-base">
            What type of job are you looking for?
          </Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {jobTypeOptions.map((type) => (
              <Badge
                key={type}
                variant={
                  jobPreferences.jobTypes.includes(type) ? "default" : "outline"
                }
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
            <Button type="submit" variant="outline">
              Add
            </Button>
          </form>

          <div className="flex flex-wrap gap-2 mt-2">
            {jobPreferences.locations.map((location) => (
              <Badge
                key={location}
                variant="secondary"
                className="pl-3 pr-2 py-1.5 flex items-center"
              >
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

            {jobPreferences.locations.length === 0 && (
              <p className="text-sm text-gray-500">
                Add locations where you'd like to work
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="remotePreference" className="text-base">
            Remote work preference
          </Label>
          <Select
            value={jobPreferences.remotePreference}
            onValueChange={(value) =>
              updateJobPreferences({ remotePreference: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select your remote work preference" />
            </SelectTrigger>
            <SelectContent>
              {remoteOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="salaryExpectation" className="text-base">
            Expected annual salary
          </Label>
          <Select
            value={jobPreferences.salaryExpectation}
            onValueChange={(value) =>
              updateJobPreferences({ salaryExpectation: value })
            }
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
            checked={jobPreferences.immediateStart}
            onCheckedChange={(checked) =>
              updateJobPreferences({ immediateStart: checked as boolean })
            }
          />
          <Label htmlFor="immediateStart" className="text-sm font-normal">
            I can start immediately
          </Label>
        </div>
      </div>
    </>
  );
};

export default JobPreferencesTab;
