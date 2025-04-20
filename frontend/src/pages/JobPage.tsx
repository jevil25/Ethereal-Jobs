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
import LoadingSpinner from "../components/LoadingSpinner";
import { useAuth } from "../providers/useAuth";
import JobCard from "../components/jobs/JobCard";
import { Helmet } from "react-helmet-async";

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

  // Create job posting structured data
  const generateJobPostingSchema = () => {
    if (!job) return null;
    
    return {
      "@context": "https://schema.org",
      "@type": "JobPosting",
      "title": job.title,
      "description": job.description?.replace(/<[^>]*>/g, '').substring(0, 500) + "...",
      "datePosted": job.date_posted,
      "validThrough": new Date(new Date(job.date_posted).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      "employmentType": job.job_type,
      "hiringOrganization": {
        "@type": "Organization",
        "name": job.company,
        "sameAs": job.company_url || "",
        "logo": job.company_logo || ""
      },
      "jobLocation": {
        "@type": "Place",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": job.location
        }
      },
      "applicantLocationRequirements": job.is_remote ? {
        "@type": "Country",
        "name": "Remote"
      } : undefined,
      "baseSalary": (job.min_amount && job.max_amount) ? {
        "@type": "MonetaryAmount",
        "currency": job.currency || "USD",
        "value": {
          "@type": "QuantitativeValue",
          "minValue": job.min_amount,
          "maxValue": job.max_amount,
          "unitText": job.interval || "YEAR"
        }
      } : undefined
    };
  };

  const fetchLinkedInProfiles = async (getNew: boolean) => {
    if (job) {
      setGettingLinkedInProfiles(true);
      const profiles = await getLinkedInProfilesForJob(job.id, getNew);
      if (profiles.is_success) {
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
        job_id: job?.id || "",
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

  // Generate meta description based on job details
  const generateMetaDescription = () => {
    if (!job) return "";
    return `${job.title} job at ${job.company} in ${job.location}${job.is_remote ? ' (Remote)' : ''}. ${job.job_type || 'Full-time'} position with ${job.min_amount && job.max_amount ? `salary range ${job.min_amount}-${job.max_amount} ${job.currency || 'USD'}` : 'competitive compensation'}.`;
  };

  return (
    <>
      {job && (
        <Helmet>
          <title>{`${job.title} at ${job.company} | Ethereal Jobs`}</title>
          <meta name="description" content={generateMetaDescription()} />
          <meta name="keywords" content={`${job.title}, ${job.company}, jobs, career, ${job.is_remote ? 'remote work, ' : ''}${job.job_type || ''}, employment opportunity`} />
          <link rel="canonical" href={`https://www.etherealjobs.com/job/${job.id}`} />
          <meta property="og:title" content={`${job.title} at ${job.company}`} />
          <meta property="og:description" content={generateMetaDescription()} />
          <meta property="og:type" content="website" />
          <meta property="og:url" content={`https://www.etherealjobs.com/job/${job.id}`} />
          {job.company_logo && <meta property="og:image" content={job.company_logo} />}
          <script type="application/ld+json">
            {JSON.stringify(generateJobPostingSchema())}
          </script>
        </Helmet>
      )}
      
      <div className="container mx-auto py-8 px-4">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={(e) => {
            e.preventDefault();
            e.currentTarget.focus();
            history.back();
          }}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Jobs
        </Button>

        {job && (
          <>
            <Card className="mb-6">
              <CardContent className="pt-6">
                <JobCard job={job} />

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
    </>
  );
};

export default JobPage;
