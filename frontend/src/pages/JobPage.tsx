import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Markdown from 'react-markdown';
import { JobData } from '../types/data';
import { useAppSelector, useSetInitialStore } from "../lib/redux/hooks";
import { selectResume } from "../lib/redux/resumeSlice";
import { selectSettings } from "../lib/redux/settingsSlice";
import { ResumePDF } from '../components/Resume/ResumePDF';
import { ResumeControlBarCSR } from '../components/Resume/ResumeControlBar';
import {
  useRegisterReactPDFFont,
  useRegisterReactPDFHyphenationCallback,
} from "../fonts/hooks";
import Dropdown from '../components/DropDown';
import { generateLinkedInMessage, getLinkedInProfilesForJob } from '../api/jobs';

const JobPage: React.FC = () => {
  const navigate = useNavigate();
  const [job, setJob] = useState<JobData>();
  const [loading, setLoading] = useState<boolean>(true);
  const [scale, setScale] = useState(0.8);
  const [generatedMessage, setGeneratedMessage] = useState<string>('');
  const [generatingMessage, setGeneratingMessage] = useState<boolean>(false);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [copyMessage, setCopyMessage] = useState<string>('Copy Message');
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

  const formatSalary = (min: number, max: number, currency: string) => {
    const formatter = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency || 'INR',
      maximumFractionDigits: 0
    });
    return `${formatter.format(min)} - ${formatter.format(max)}`;
  };

  const handleMessageGeneration = async (newMessage:boolean = false) => {
    setLinkedinName(job?.linkedin_profiles[0].name || "");
    setGeneratingMessage(true);
    setModalOpen(true);
    const resumeId = localStorage.getItem("resumeId");
    if (!resumeId) {
      return () => {
        navigate('/resume');
      };
    }
    const params = {
      "resumeId": resumeId,
      "company": job?.company || "",
      "position": job?.title || "",
      "newMessage": newMessage
    }
    const data = await generateLinkedInMessage(params);
    if (data.no_resume_found) {
      setGeneratedMessage('No resume found. Please create a resume first.');
      setNoResumeFound(true);
      setGeneratingMessage(false);
      return;
    }
    setNoResumeFound(false);
    if (data.message) {
      const message = data.message;
      setGeneratedMessage(message);
    }else{
      setGeneratedMessage('Error generating message. Please try again later.');
    }
    setGeneratingMessage(false);
  }

  const reg = new RegExp('\\[[^\\]]*\\]|\\{\\{[^}]*\\}\\}|\\{[^}]*\\}', 'g');

  if (loading || !job) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl md:mt-18 mt-12">
      <button 
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center text-blue-600 hover:text-blue-800 hover:cursor-pointer"
      >
        ← Back to Jobs
      </button>
      
      <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
        {/* Job Header */}
        <div className="border-b p-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">{job?.title}</h1>
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <span>{job?.company}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <span>{job?.location}</span>
              </div>
            </div>
            {job.company_logo && (
              <img 
                src={job.company_logo} 
                alt={`${job.company} logo`}
                className="h-16 w-16 object-contain"
              />
            )}
          </div>
          
          <div className="flex flex-wrap gap-2 mt-4">
            {job?.is_remote && (
              <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                Remote
              </span>
            )}
            {job?.job_type && (
              <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                {job.job_type}
              </span>
            )}
            <span className="px-3 py-1 border border-gray-300 text-gray-700 rounded-full text-sm">
              Posted: {new Date(job?.date_posted as string).toLocaleDateString()}
            </span>
            {job?.min_amount && job?.max_amount && (
              <span className="px-3 py-1 border border-gray-300 text-gray-700 rounded-full text-sm">
                {formatSalary(job.min_amount, job.max_amount, job.currency)}
              </span>
            )}
            {/* apply button */}
            <a 
              href={job.url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-center w-fit hover:bg-blue-700 hover:cursor-pointer"
            >
              Apply Now
            </a>
          </div>
        </div>

        {/* Hiring Managers Section */}
        {job?.linkedin_profiles && job.linkedin_profiles.length > 0 && (
          <div className="border-b bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
            <div className="flex items-center mb-4 bg-white p-4 rounded-lg border border-blue-300 shadow-md transition-all w-fit">
              <div className="flex-shrink-0">
                <svg
                  className="w-6 h-6 text-yellow-500"
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
            {/* 2 buttons one to download resume and one to get customized message */}
            <div className="flex items-center gap-4 mb-4">
              <ResumeControlBarCSR
                scale={scale}
                setScale={setScale}
                documentSize={settings.documentSize}
                document={document}
                fileName={resume.profile.name + " - Resume"}
                showScale={false}
              />
              <button
                className="bg-white text-blue-500 px-4 py-2 rounded-lg border border-blue-500 hover:bg-blue-50 cursor-pointer"
                onClick={() => handleMessageGeneration()}
              >
                Get Customized Message
              </button>
            </div>
            <h2 className="text-lg font-semibold mb-4">Contact Hiring Managers from {job.company}</h2>
            <p className="text-sm text-gray-600">
              Our backend system has found LinkedIn profiles of hiring managers from {job.company}.
            </p>
            <p className="text-sm text-gray-600 mb-4">
              Note: We do not verify the hiring managers. Please be cautious while contacting them.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {job.linkedin_profiles.map((profile, index: number) => (
                <a
                  key={index}
                  href={profile.profile_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white p-4 rounded-lg border border-blue-100 hover:border-blue-300 hover:shadow-md transition-all flex flex-row"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="50" height="50" viewBox="0 0 48 48">
                    <path fill="#0078d4" d="M42,37c0,2.762-2.238,5-5,5H11c-2.761,0-5-2.238-5-5V11c0-2.762,2.239-5,5-5h26c2.762,0,5,2.238,5,5	V37z"></path><path d="M30,37V26.901c0-1.689-0.819-2.698-2.192-2.698c-0.815,0-1.414,0.459-1.779,1.364	c-0.017,0.064-0.041,0.325-0.031,1.114L26,37h-7V18h7v1.061C27.022,18.356,28.275,18,29.738,18c4.547,0,7.261,3.093,7.261,8.274	L37,37H30z M11,37V18h3.457C12.454,18,11,16.528,11,14.499C11,12.472,12.478,11,14.514,11c2.012,0,3.445,1.431,3.486,3.479	C18,16.523,16.521,18,14.485,18H18v19H11z" opacity=".05"></path><path d="M30.5,36.5v-9.599c0-1.973-1.031-3.198-2.692-3.198c-1.295,0-1.935,0.912-2.243,1.677	c-0.082,0.199-0.071,0.989-0.067,1.326L25.5,36.5h-6v-18h6v1.638c0.795-0.823,2.075-1.638,4.238-1.638	c4.233,0,6.761,2.906,6.761,7.774L36.5,36.5H30.5z M11.5,36.5v-18h6v18H11.5z M14.457,17.5c-1.713,0-2.957-1.262-2.957-3.001	c0-1.738,1.268-2.999,3.014-2.999c1.724,0,2.951,1.229,2.986,2.989c0,1.749-1.268,3.011-3.015,3.011H14.457z" opacity=".07"></path><path fill="#fff" d="M12,19h5v17h-5V19z M14.485,17h-0.028C12.965,17,12,15.888,12,14.499C12,13.08,12.995,12,14.514,12	c1.521,0,2.458,1.08,2.486,2.499C17,15.887,16.035,17,14.485,17z M36,36h-5v-9.099c0-2.198-1.225-3.698-3.192-3.698	c-1.501,0-2.313,1.012-2.707,1.99C24.957,25.543,25,26.511,25,27v9h-5V19h5v2.616C25.721,20.5,26.85,19,29.738,19	c3.578,0,6.261,2.25,6.261,7.274L36,36L36,36z"></path>
                  </svg>
                  <div className="flex flex-col">
                    <div className="font-medium text-blue-600 mb-2">{profile.name}</div>
                    <div className="text-xs text-gray-600">Click to view LinkedIn Profile</div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Job Description */}
        <div className="p-6">
            <div className="prose max-w-none">
                <h2 className="text-xl font-semibold mb-4">Job Description</h2>
                <div dangerouslySetInnerHTML={{ __html: job?.description || "" }}></div>
            </div>
        </div>
      </div>
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full md:w-1/2 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Customized Message</h2>
              <button onClick={() => setModalOpen(false)}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-gray-600 hover:text-gray-800"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="prose max-w-none">
              {generatingMessage ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                  <div className="ml-4">Our backend is generating your message, It might take a few seconds please wait....</div>
                </div>
              ) : 
                !noResumeFound ? (  
                <div className='flex flex-col gap-4'>
                    <div className="mb-4">
                      <p className="text-sm text-gray-600">
                        Use the below message to contact the hiring managers from {job?.company} on LinkedIn.
                      </p>
                    </div>
                    <div className="mb-4 bg-white p-4 rounded-lg border border-blue-300 shadow-md transition-all w-fit">
                      <Markdown>{generatedMessage.replace(reg, linkedinName)}</Markdown>
                      <button
                        className=" text-gray-400 hover:text-gray-600 mt-2 px-0.5 py-1 text-xs rounded-lg border-gray-400 border hover:border-gray-600 cursor-pointer"
                        onClick={() => {
                          navigator.clipboard.writeText(generatedMessage.replace(reg, linkedinName));
                          setCopyMessage('Copied!');
                          setTimeout(() => {
                            setCopyMessage('Copy Message');
                          }, 1000);
                        }}
                      >
                        {copyMessage}
                      </button>
                    </div>
                    <button
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-center w-fit"
                      onClick={() => handleMessageGeneration(true)}
                    >
                      Regenerate Message
                    </button>
                    <div>
                      <label htmlFor="linkedinName" className="block text-sm font-medium text-gray-700">
                        Select LinkedIn Name
                      </label>
                    </div>
                    <Dropdown
                      value={linkedinName}
                      list={job?.linkedin_profiles.map((profile) => profile.name) as string[]}
                      onChange={setLinkedinName}
                      selectionText='Select LinkedIn Name'
                      noSelectionText='No Such LinkedIn Name Found'
                    />
                    <a 
                      href={job?.linkedin_profiles.find((profile) => profile.name === linkedinName)?.profile_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg text-center w-fit"
                    >
                      Visit {linkedinName}'s LinkedIn Profile
                    </a>
                  </div>
              ) : (
                <div className="flex flex-col items-center border border-black p-6 rounded-lg shadow-md">
                  <p className="text-red-500 font-semibold mb-4">No resume found. Please create a resume first.</p>
                  <button
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2 rounded-lg transition duration-200"
                    onClick={() => navigate('/resume')}
                  >
                    Create Resume
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
)};

export default JobPage;