import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { JobData, LinkedInProfile } from "../types/data";
import {
  generateLinkedInMessage,
  getLinkedInProfilesForJob,
  getJob,
} from "../api/jobs";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Separator } from "../components/ui/separator";
import { ChevronLeft } from "lucide-react";
import MessageDialog from "../components/JobPage/MessageDialog";
import HiringManagersSection from "../components/JobPage/HiringManagerSection";
import JobHeader from "../components/JobPage/JobHeader";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAuth } from "../providers/useAuth";

// Main Component
const JobPage: React.FC = () => {
  const navigate = useNavigate();
  const [job, setJob] = useState<JobData>();
  const [linkedInProfiles, setLinkedInProfiles] = useState<LinkedInProfile[]>(
    [],
  );
  const [gettingLinkedInProfiles, setGettingLinkedInProfiles] =
    useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [generatedMessage, setGeneratedMessage] = useState<string>("");
  const [generatingMessage, setGeneratingMessage] = useState<boolean>(false);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [linkedinName, setLinkedinName] = useState<string>("");
  const [noResumeFound, setNoResumeFound] = useState<boolean>(false);
  const { user } = useAuth();

  useEffect(() => {
    async function fetchJobData() {
      setLoading(true);
      const path = decodeURI(window.location.pathname);
      const id = path.split("/").pop();
      if (!id) {
        return navigate("/");
      }
      try {
        const data = await getJob(id);
        setJob(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchJobData();
  }, [navigate]);

  const fetchLinkedInProfiles = async (getNew: boolean) => {
    if (job) {
      setGettingLinkedInProfiles(true);
      const profiles = await getLinkedInProfilesForJob(job.id, getNew);
      if (profiles.is_success) {
        console.log(profiles.linkedin_profiles);
        setLinkedInProfiles(profiles.linkedin_profiles);
      }
      setGettingLinkedInProfiles(false);
    }
  };

  const handleMessageGeneration = async (newMessage: boolean = false) => {
    if (linkedinName === "" && linkedInProfiles.length === 0) {
      setLinkedinName(
        linkedInProfiles.length > 0 ? linkedInProfiles[0].name || "" : "",
      );
    }
    setGeneratingMessage(true);
    setModalOpen(true);
    try {
      if (!newMessage && generatedMessage) {
        setGeneratingMessage(false);
        return;
      }

      const message = await generateLinkedInMessage({
        email: user?.email || "",
        company: job?.company || "",
        position: job?.title || "",
        newMessage: newMessage,
      });
      setGeneratedMessage(message.message);
      setNoResumeFound(message.no_resume_found ? true : false);
    } catch (error) {
      console.error("Error generating message:", error);
    } finally {
      setGeneratingMessage(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Button variant="ghost" className="mb-6" onClick={() => navigate(-1)}>
        <ChevronLeft className="h-4 w-4 mr-2" />
        Back to Jobs
      </Button>

      {job && (
        <>
          <Card className="mb-6">
            <CardContent className="pt-6">
              <JobHeader job={job} />

              <Separator className="my-6" />

              <HiringManagersSection
                job={job}
                handleMessageGeneration={handleMessageGeneration}
                fetchLinkedInProfiles={fetchLinkedInProfiles}
                linkedInProfiles={linkedInProfiles}
                hasLinkedInProfiles={job.has_linkedIn_profiles}
                gettingLinkedInProfiles={gettingLinkedInProfiles}
              />

              <div className="prose max-w-none">
                <h2 className="text-xl font-semibold mb-4">Job Description</h2>
                <div className="text-gray-700">
                  {/* <Markdown>{job.description}</Markdown> */}
                  <div
                    dangerouslySetInnerHTML={{
                      __html: job.description,
                    }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <MessageDialog
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            generatingMessage={generatingMessage}
            noResumeFound={noResumeFound}
            generatedMessage={generatedMessage}
            linkedinName={linkedinName}
            setLinkedinName={setLinkedinName}
            job={job}
            handleMessageGeneration={handleMessageGeneration}
            navigate={navigate}
            linkedInProfiles={linkedInProfiles}
          />
        </>
      )}
    </div>
  );
};

export default JobPage;
