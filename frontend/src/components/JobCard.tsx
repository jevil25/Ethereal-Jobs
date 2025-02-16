import React from 'react';
import { JobData } from '../types/api';

interface JobCardProps {
  job: JobData;
}

const JobCard: React.FC<JobCardProps> = ({ job }) => {
  const formatSalary = () => {
    if (!job.min_amount && !job.max_amount) return 'Salary not specified';
    
    const formatAmount = (amount: number) => {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: job.currency || 'INR',
        maximumFractionDigits: 0,
      }).format(amount);
    };
    
    if (job.min_amount && job.max_amount) {
      return `${formatAmount(job.min_amount)} - ${formatAmount(job.max_amount)} per ${job.interval || 'month'}`;
    } else if (job.min_amount) {
      return `From ${formatAmount(job.min_amount)} per ${job.interval || 'month'}`;
    } else if (job.max_amount) {
      return `Up to ${formatAmount(job.max_amount)} per ${job.interval || 'month'}`;
    }
  };

  const truncateDescription = (text: string, maxLength: number = 200) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition duration-200">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-semibold mb-1">{job.title}</h2>
          <p className="text-gray-700 mb-1">{job.company}</p>
          <p className="text-gray-600 mb-2">{job.location} {job.is_remote ? '(Remote)' : ''}</p>
        </div>
        {job.company_logo && (
          <img 
            src={job.company_logo} 
            alt={`${job.company} logo`}
            className="h-12 w-12 object-contain"
          />
        )}
      </div>
      
      <p className="text-blue-600 font-medium mb-3">{formatSalary()}</p>
      
      <div className="mb-4">
        <p className="text-gray-700">{truncateDescription(job.description)}</p>
      </div>
      
      <div className="flex flex-wrap gap-2 mb-4">
        {job.job_type && (
          <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded">
            {job.job_type}
          </span>
        )}
        {job.job_level && (
          <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded">
            {job.job_level}
          </span>
        )}
        {job.job_function && (
          <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded">
            {job.job_function}
          </span>
        )}
      </div>
      
      <div className="flex justify-between items-center mt-4">
        <span className="text-sm text-gray-500">
          Posted: {new Date(job.date_posted).toLocaleDateString()}
        </span>
        <a
          href={job.job_url}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition duration-200"
        >
          Apply Now
        </a>
      </div>
    </div>
  );
};

export default JobCard;