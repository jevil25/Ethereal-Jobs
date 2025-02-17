import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { constructServerUrlFromPath } from '../utils/helper';
import Markdown from 'react-markdown';

const JobPage: React.FC = () => {
  const navigate = useNavigate();
  const [job, setJob] = useState<any>();
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchJobData() {
        const path = window.location.pathname;
        const id = path.split('/').pop();
        if (!id) {
            navigate('/');
        } 
        try {
            const jobRequestPath = constructServerUrlFromPath(`/job/${id}/linkedin/profile`);
            const jobResponse = await axios.get(jobRequestPath);
            setJob(jobResponse.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    }
    fetchJobData();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const formatSalary = (min: number, max: number, currency: string) => {
    const formatter = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency || 'INR',
      maximumFractionDigits: 0
    });
    return `${formatter.format(min)} - ${formatter.format(max)}`;
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <button 
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center text-blue-600 hover:text-blue-800"
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
            {job?.company_logo && (
              <img 
                src={job.company_logo} 
                alt={`${job.company} logo`} 
                className="w-16 h-16 object-contain"
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
              Posted: {new Date(job?.date_posted).toLocaleDateString()}
            </span>
            {job?.min_amount && job?.max_amount && (
              <span className="px-3 py-1 border border-gray-300 text-gray-700 rounded-full text-sm">
                {formatSalary(job.min_amount, job.max_amount, job.currency)}
              </span>
            )}
          </div>
        </div>

        {/* Hiring Managers Section */}
        {job?.linkedin_profiles && job.linkedin_profiles.length > 0 && (
          <div className="border-b bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
            <h2 className="text-lg font-semibold mb-4">Contact Hiring Managers</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {job.linkedin_profiles.map((profile: any, index: number) => (
                <a
                  key={index}
                  href={profile.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white p-4 rounded-lg border border-blue-100 hover:border-blue-300 hover:shadow-md transition-all flex flex-col"
                >
                  <div className="font-medium text-blue-600 mb-2">{profile.title}</div>
                  <div className="text-sm text-gray-600">Click to view LinkedIn Profile</div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Job Description */}
        <div className="p-6">
            <div className="prose max-w-none">
                <h2 className="text-xl font-semibold mb-4">Job Description</h2>
                <Markdown>{job?.description}</Markdown>
            </div>
        </div>
      </div>
    </div>
  );
};

export default JobPage;