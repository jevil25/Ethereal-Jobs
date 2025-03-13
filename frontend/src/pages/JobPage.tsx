import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { JobData } from '../types/data';
import { useAppSelector, useSetInitialStore } from "../lib/redux/hooks";
import { selectResume } from "../lib/redux/resumeSlice";
import { selectSettings } from "../lib/redux/settingsSlice";
import { ResumePDF } from '../components/Resume/ResumePDF';
import {
  useRegisterReactPDFFont,
  useRegisterReactPDFHyphenationCallback,
} from "../fonts/hooks";
import { generateLinkedInMessage, getLinkedInProfilesForJob } from '../api/jobs';
import {
  Card,
  CardContent,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Separator } from "../components/ui/separator";
import { ChevronLeft } from "lucide-react";
import MessageDialog from '../components/JobPage/MessageDialog';
import HiringManagersSection from '../components/JobPage/HiringManagerSection';
import JobHeader from '../components/JobPage/JobHeader';
import LoadingSpinner from '../components/LoadingSpinner';

// Main Component
const JobPage: React.FC = () => {
  const navigate = useNavigate();
  const [job, setJob] = useState<JobData>();
  const [loading, setLoading] = useState<boolean>(true);
  const [scale, setScale] = useState(0.8);
  const [generatedMessage, setGeneratedMessage] = useState<string>('');
  const [generatingMessage, setGeneratingMessage] = useState<boolean>(false);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [linkedinName, setLinkedinName] = useState<string>('');
  const [noResumeFound, setNoResumeFound] = useState<boolean>(false);

  const resume = useAppSelector(selectResume);
  const settings = useAppSelector(selectSettings);
  const document = useMemo(
    () => <ResumePDF resume={resume} settings={settings} isPDF={true} />,
    [resume, settings]
  );

  useRegisterReactPDFFont();
  useRegisterReactPDFHyphenationCallback(settings.fontFamily);
  useSetInitialStore(setLoading);

  useEffect(() => {
    async function fetchJobData() {
        setLoading(true);
        const path = decodeURI(window.location.pathname);
        const id = path.split('/').pop();
        if (!id) {
          return navigate('/');
        } 
        try {
            const data = await getLinkedInProfilesForJob(id);
            setJob(data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    }
    fetchJobData();
  }, [navigate]);

  const handleMessageGeneration = async (newMessage: boolean = false) => {
    setLinkedinName(job?.linkedin_profiles[0].name || "");
    setGeneratingMessage(true);
    setModalOpen(true);
    const resumeId = localStorage.getItem("resumeId");
    if (!resumeId) {
      setGeneratingMessage(false);
      setNoResumeFound(true);
      return;
    }

    try {
      if (!newMessage && generatedMessage) {
        setGeneratingMessage(false);
        return;
      }

      const message = await generateLinkedInMessage({
        email: resumeId,
        company: job?.company || "",
        position: job?.title || "",
        newMessage: newMessage,
      });
      setGeneratedMessage(message.message);
      setNoResumeFound(false);
    } catch (error) {
      console.error('Error generating message:', error);
      // toast({
      //   title: "Error",
      //   description: "Failed to generate LinkedIn message. Please try again.",
      //   variant: "destructive",
      // });
    } finally {
      setGeneratingMessage(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container mx-auto py-8 px-4 mt-12 md:mt-18">
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => navigate('/jobs')}
      >
        <ChevronLeft className="h-4 w-4 mr-2" />
        Back to Jobs
      </Button>

      {job && (
        <>
          <Card className="mb-6">
            <CardContent className="pt-6">
              <JobHeader job={job} />
              
              <Separator className="my-6" />
              
              <div className="prose max-w-none">
                <h2 className="text-xl font-semibold mb-4">Job Description</h2>
                <div className="text-gray-700">
                  {/* <Markdown>{job.description}</Markdown> */}
                  <div dangerouslySetInnerHTML={{
                    __html: job.description
                  }}></div>
                </div>
              </div>
            </CardContent>
          </Card>

          {job.linkedin_profiles && job.linkedin_profiles.length > 0 && (
            <HiringManagersSection 
              job={job}
              scale={scale}
              setScale={setScale}
              document={document}
              settings={settings}
              resume={resume}
              handleMessageGeneration={handleMessageGeneration}
            />
          )}

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
          />
        </>
      )}
    </div>
  );
};

export default JobPage;