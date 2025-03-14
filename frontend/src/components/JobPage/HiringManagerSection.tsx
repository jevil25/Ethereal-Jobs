import React from "react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { JobData, LinkedInProfile } from "../../types/data";
import { Linkedin } from "lucide-react";

const LinkedInProfileCard: React.FC<{
  profile: LinkedInProfile;
  index: number;
}> = ({ profile, index }) => (
  <a
    key={index}
    href={profile.profile_url}
    target="_blank"
    rel="noopener noreferrer"
    className="bg-white p-4 rounded-lg border border-blue-100 hover:border-blue-300 hover:shadow-md transition-all flex flex-row items-center gap-3"
  >
    <Linkedin className="h-10 w-10 text-blue-600" />
    <div className="flex flex-col">
      <div className="font-medium text-blue-600 mb-1">{profile.name}</div>
      <div className="text-xs text-gray-600">
        Click to view LinkedIn Profile
      </div>
    </div>
  </a>
);

const HiringManagersSection: React.FC<{
  job: JobData;
  scale: number;
  setScale: React.Dispatch<React.SetStateAction<number>>;
  handleMessageGeneration: (newMessage?: boolean) => void;
}> = ({ job, handleMessageGeneration }) => (
  <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 mb-6 border-blue-100">
    <CardContent className="pt-6">
      <div className="flex items-center mb-4 bg-white p-4 rounded-lg border border-blue-300 shadow-md transition-all w-fit">
        <div className="flex-shrink-0 text-yellow-500">
          <svg
            className="w-6 h-6"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.97a1 1 0 00.95.69h4.18c.969 0 1.371 1.24.588 1.81l-3.392 2.46a1 1 0 00-.364 1.118l1.286 3.97c.3.921-.755 1.688-1.54 1.118l-3.392-2.46a1 1 0 00-1.176 0l-3.392 2.46c-.784.57-1.838-.197-1.54-1.118l1.286-3.97a1 1 0 00-.364-1.118L2.045 9.397c-.783-.57-.38-1.81.588-1.81h4.18a1 1 0 00.95-.69l1.286-3.97z" />
          </svg>
        </div>
        <div className="ml-2 text-gray-600 font-semibold">
          Jobify has gathered these for you!
        </div>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <Button
          variant="outline"
          className="border-blue-500 text-blue-500 hover:bg-blue-50 hover:text-blue-600"
          onClick={() => handleMessageGeneration(false)}
        >
          Get Customized Message
        </Button>
      </div>

      <h2 className="text-lg font-semibold mb-4">
        Contact Hiring Managers from {job.company}
      </h2>
      <p className="text-sm text-gray-600">
        Our backend system has found LinkedIn profiles of hiring managers from{" "}
        {job.company}.
      </p>
      <p className="text-sm text-gray-600 mb-4">
        Note: We do not verify the hiring managers. Please be cautious while
        contacting them.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {job.linkedin_profiles.map((profile, index) => (
          <LinkedInProfileCard key={index} profile={profile} index={index} />
        ))}
      </div>
    </CardContent>
  </Card>
);

export default HiringManagersSection;
