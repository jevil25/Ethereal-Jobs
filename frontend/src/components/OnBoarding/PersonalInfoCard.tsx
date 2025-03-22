import React from "react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { PersonalInfo } from "../../api/types";
import { Textarea } from "../ui/textarea";

interface PersonalInfoCardProps {
  data: PersonalInfo;
  updateData: (data: PersonalInfo) => void;
}

const PersonalInfoCard: React.FC<PersonalInfoCardProps> = ({
  data,
  updateData,
}) => {
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    updateData({
      ...data,
      [name]: value,
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="about_me">About me</Label>
        <Textarea
          id="about_me"
          name="about_me"
          placeholder="e.g., Highly motivated software engineer with 5+ years of experience"
          value={data.about_me}
          onChange={handleChange}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="headline">Looking for Job Title</Label>
        <Input
          id="headline"
          name="headline"
          placeholder="e.g., Senior Software Engineer with 5+ years experience"
          value={data.headline}
          onChange={handleChange}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          name="location"
          placeholder="e.g., San Francisco, CA"
          value={data.location}
          onChange={handleChange}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          placeholder="e.g., (555) 123-4567"
          value={data.phone}
          onChange={handleChange}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="website">Website</Label>
        <Input
          id="website"
          name="website"
          type="url"
          placeholder="e.g., https://linkedin.com/in/yourprofile"
          value={data.website}
          onChange={handleChange}
        />
      </div>
      {/* make linkedin and guthub */}
      <div className="space-y-2">
        <Label htmlFor="linkedin_url">LinkedIn</Label>
        <Input
          id="linkedin_url"
          name="linkedin_url"
          type="url"
          placeholder="e.g., https://linkedin.com/in/yourprofile"
          value={data.linkedin_url}
          onChange={handleChange}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="github_url">GitHub</Label>
        <Input
          id="github_url"
          name="github_url"
          type="url"
          placeholder="e.g., https://github.com/yourprofile"
          value={data.github_url}
          onChange={handleChange}
        />
      </div>
    </div>
  );
};

export default PersonalInfoCard;
