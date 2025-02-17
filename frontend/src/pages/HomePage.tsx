import React, { useState } from 'react';
import SearchBar from '../components/SearchBar';
import JobFilters from '../components/JobFilters';
import JobList from '../components/JobList';
import { JobData } from '../types/api';
import { constructServerUrlFromPath, toaster } from '../utils/helper';
import axios from 'axios';

const HomePage: React.FC = () => {
  const [jobs, setJobs] = useState<JobData[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<JobData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [filters, setFilters] = useState({
    is_remote: false,
    job_type: '',
    salary_min: 0,
    salary_max: 0,
  });

  const handleSearch = async (params: {
    city: string;
    country_code: string;
    country: string;
    job_title: string;
    recruiters: string;
  }) => {
    setLoading(true);
    try {
      const response = await axios.get(constructServerUrlFromPath('/jobs'), { params });
      const data = response.data as JobData[];
      setJobs(data);
      const jobsFiltered = data.filter(job => {
        return (
          (!filters.is_remote || job.is_remote) &&
          (!filters.job_type || job.job_type === filters.job_type) &&
          (!filters.salary_min || job.min_amount >= filters.salary_min) &&
          (!filters.salary_max || job.max_amount <= filters.salary_max)
        );
      });
      setFilteredJobs(jobsFiltered);
    } catch (error) {
      toaster.error('Error fetching jobs. Please try again later.');
    } finally {
      setLoading(false);
      toaster.success('Jobs fetched successfully');
    }
  };

  const handleFilterChange = (newFilters: any) => {
    setLoading(true);
    setFilters({...filters, ...newFilters});
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
    setLoading(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Job Search</h1>
      <SearchBar onSearch={handleSearch} />
      <div className="flex flex-col md:flex-row gap-6 mt-6">
        <div className="w-full md:w-1/4">
          <JobFilters onChange={handleFilterChange} filters={filters} />
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

export default HomePage;