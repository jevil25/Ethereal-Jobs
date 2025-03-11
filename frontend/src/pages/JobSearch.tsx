import React, { useEffect, useState, useRef } from 'react';
import SearchBar from '../components/jobs/SearchBar';
import JobFilters from '../components/jobs/JobFilters';
import JobList from '../components/jobs/JobList';
import { JobData } from '../types/data';
import { getJobs } from '../api/jobs';
import { toaster } from '../utils/helper';
import { useSearchParams } from 'react-router-dom';

const JobSearch: React.FC = () => {
  const [_, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState<JobData[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<JobData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [filters, setFilters] = useState({
    is_remote: false,
    job_type: '',
    salary_min: 0,
    salary_max: 0,
  });
  const jobTypes = ['Full-time', 'Part-time', 'Internship'];

  const searchTimeout = useRef<number>(null);

  const handleSearch = async (params: {
    city: string;
    country_code: string;
    country: string;
    job_title: string;
    recruiters: string;
    job_type: string;
  }) => {
    if (!params.job_title) {
      toaster.error('Please enter a job title');
      return;
    }

    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    searchTimeout.current = setTimeout(async () => {
      setSearchParams((oldParams) => {
        const newParams = new URLSearchParams(oldParams);
        newParams.set('city', params.city);
        newParams.set('country_code', params.country_code);
        newParams.set('country', params.country);
        newParams.set('job_title', params.job_title);
        newParams.set('recruiters', params.recruiters);
        newParams.set('job_type', params.job_type);
        return newParams.toString();
      });

      try {
        setLoading(true);
        const data = await getJobs(params);
        setJobs(data);
        const jobsFiltered = data.filter(job => 
          (!filters.salary_min || job.min_amount >= filters.salary_min) &&
          (!filters.salary_max || job.max_amount <= filters.salary_max)
        );
        setFilteredJobs(jobsFiltered);
        setLoading(false);
      } catch (error) {
        setLoading(false);
        toaster.error('Error fetching jobs. Please try again later.');
      } finally {
        toaster.success('Jobs fetched successfully');
      }
    }, 300);
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters({...filters, ...newFilters});
    const overAllFilters = { ...filters, ...newFilters };
    setSearchParams(new URLSearchParams(overAllFilters).toString());
    const jobsFiltered = jobs.filter(job => {
      const res =  (
        (!newFilters.is_remote || job.is_remote) &&
        (!newFilters.job_type || job.job_type === newFilters.job_type) &&
        (!newFilters.salary_min || job.min_amount >= newFilters.salary_min) &&
        (!newFilters.salary_max || job.max_amount <= newFilters.salary_max)
      );
      return res;
    });
    setFilteredJobs(jobsFiltered);
  };

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const job_type = searchParams.get('job_type') || '';
    setFilters({
      is_remote: searchParams.get('is_remote') === 'true',
      job_type,
      salary_min: Number(searchParams.get('salary_min')) || 0,
      salary_max: Number(searchParams.get('salary_max')) || 0,
    });
  }
  , []);


  return (
    <div className="container mx-auto px-4 py-8 mt-12 md:mt-18">
      <h1 className="text-3xl font-bold mb-6">Job Search</h1>
      <SearchBar onSearch={handleSearch} filters={filters} />
      <div className="flex flex-col md:flex-row gap-6 mt-6">
        <div className="w-full md:w-1/4">
          <JobFilters onChange={handleFilterChange} filters={filters} jobTypes={jobTypes} />
        </div>
        <div className="w-full md:w-3/4">
          {loading ? (
            <div className="flex justify-center items-center h-64 flex-col">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              <p className="text-gray-600 mt-2">Searching from multiple job boards, may take few seconds</p>
            </div>
          ) : (
            <JobList jobs={filteredJobs} />
          )}
        </div>
      </div>
    </div>
  );
};

export default JobSearch;