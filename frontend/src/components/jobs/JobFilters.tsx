import React from "react";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

interface FiltersProps {
  show: boolean;
  filters: {
    is_remote: boolean;
    job_type: string;
    salary_min: number;
    salary_max: number;
  };
  onChange: (filters: Partial<FiltersProps["filters"]>) => void;
  jobTypes: string[];
}

const JobFilters: React.FC<FiltersProps> = ({
  show,
  filters,
  onChange,
  jobTypes,
}) => {
  if (!show) {
    return null;
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="remote-filter"
            checked={filters.is_remote}
            onCheckedChange={(checked) =>
              onChange({ is_remote: checked as boolean })
            }
          />
          <Label htmlFor="remote-filter" className="cursor-pointer">
            Remote Only
          </Label>
        </div>

        <div className="space-y-2">
          <Label htmlFor="job-type">Job Type</Label>
          <Select
            value={filters.job_type}
            onValueChange={(value) => onChange({ job_type: value })}
          >
            <SelectTrigger id="job-type">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All Types">All Types</SelectItem>
              {jobTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Salary Range</Label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              placeholder="Min"
              value={filters.salary_min || ""}
              onChange={(e) => onChange({ salary_min: Number(e.target.value) })}
              autoComplete="off"
            />
            <Input
              type="number"
              placeholder="Max"
              value={filters.salary_max || ""}
              onChange={(e) => onChange({ salary_max: Number(e.target.value) })}
              autoComplete="off"
            />
          </div>
        </div>

        <Button
          variant="outline"
          onClick={() =>
            onChange({
              is_remote: false,
              job_type: "",
              salary_min: 0,
              salary_max: 0,
            })
          }
          className="w-full"
        >
          Clear Filters
        </Button>
      </CardContent>
    </Card>
  );
};

export default JobFilters;
