import React from 'react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

export interface PersonalInfoData {
  headline: string;
  location: string;
  phone: string;
  website: string;
}

interface PersonalInfoCardProps {
  data: PersonalInfoData;
  updateData: (data: PersonalInfoData) => void;
}

const PersonalInfoCard: React.FC<PersonalInfoCardProps> = ({ data, updateData }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    updateData({
      ...data,
      [name]: value,
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="headline">Professional Headline</Label>
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
        <Label htmlFor="website">Website or LinkedIn Profile</Label>
        <Input
          id="website"
          name="website"
          type="url"
          placeholder="e.g., https://linkedin.com/in/yourprofile"
          value={data.website}
          onChange={handleChange}
        />
      </div>
    </div>
  );
};

export default PersonalInfoCard;
