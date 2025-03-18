import React, { useEffect, useState, useRef } from "react";
import SearchBar from "../components/jobs/SearchBar";
import JobFilters from "../components/jobs/JobFilters";
import JobList from "../components/jobs/JobList";
import { JobData } from "../types/data";
import { getJobs } from "../api/jobs";
import { toaster } from "../utils/helper";
import { useSearchParams } from "react-router-dom";

const JobSearch: React.FC = () => {
  const [, setSearchParams] = useSearchParams();
  const [results_wanted, setResultsWanted] = useState<number>(10);
  const [increaseCounter, setIncreaseCounter] = useState<number>(0);
  const [jobs, setJobs] = useState<JobData[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<JobData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [lastSearchParams, setLastSearchParams] = useState<any>(null);
  const [filters, setFilters] = useState({
    is_remote: false,
    job_type: "",
    salary_min: 0,
    salary_max: 0,
  });
  const jobTypes = ["Full-time", "Part-time", "Internship"];

  const searchTimeout = useRef<number>(null);

  const handleSearch = async (params: {
    city: string;
    country_code: string;
    country: string;
    job_title: string;
    recruiters: string;
    job_type: string;
    results_wanted?: number;
  }) => {
    setIncreaseCounter(increaseCounter + 10);
    if (!params.job_title) {
      toaster.error("Please enter a job title");
      return;
    }

    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    searchTimeout.current = setTimeout(async () => {
      setSearchParams((oldParams) => {
        const newParams = new URLSearchParams(oldParams);
        newParams.set("city", params.city);
        newParams.set("country_code", params.country_code);
        newParams.set("country", params.country);
        newParams.set("job_title", params.job_title);
        newParams.set("recruiters", params.recruiters);
        newParams.set("job_type", params.job_type);
        newParams.set("results_wanted", results_wanted.toString());
        return newParams.toString();
      });

      // Reset state for new search
      setJobs([]);
      setFilteredJobs([]);
      setHasMore(true);
      setResultsWanted(10);
      setLastSearchParams(params);

      try {
        setLoading(true);
        params.results_wanted = results_wanted;
        const data = await getJobs(params);
        
        // Check if we've reached the end of available jobs
        if (data.length < results_wanted) {
          setHasMore(false);
        } else {
          setHasMore(true);
        }
        
        setJobs(data);
        const jobsFiltered = data.filter(
          (job) =>
            (!filters.salary_min || job.min_amount >= filters.salary_min) &&
            (!filters.salary_max || job.max_amount <= filters.salary_max),
        );
        const uniqueJobs = jobsFiltered.filter(
          (job, index, self) =>
            index ===
            self.findIndex(
              (t) =>
                t.title === job.title &&
                t.company === job.company &&
                t.date_posted === job.date_posted,
            ),
        );
        setFilteredJobs(uniqueJobs);
        setLoading(false);
      } catch (error) {
        setLoading(false);
        toaster.error(`Error fetching jobs. Please try again later: ${error}`);
      } finally {
        toaster.success("Jobs fetched successfully");
      }
    }, 300);
  };

  const handleLoadMore = async (newResultsWanted: number) => {
    if (!lastSearchParams || loading || !hasMore) return;
    
    setLoading(true);
    setResultsWanted(newResultsWanted);
    
    try {
      const params = { ...lastSearchParams, results_wanted: newResultsWanted };
      const data = await getJobs(params);
      
      // Check if we've reached the end
      if (data.length < newResultsWanted) {
        setHasMore(false);
      }
      
      setJobs(data);
      const jobsFiltered = data.filter(
        (job) =>
          (!filters.salary_min || job.min_amount >= filters.salary_min) &&
          (!filters.salary_max || job.max_amount <= filters.salary_max),
      );
      setFilteredJobs(jobsFiltered);
    } catch (error) {
      toaster.error(`Error loading more jobs: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (
    newFilters: Partial<{
      is_remote: boolean;
      job_type: string;
      salary_min: number;
      salary_max: number;
    }>,
  ) => {
    if (newFilters.job_type == "All Types") {
      newFilters.job_type = "";
    }
    setFilters({ ...filters, ...newFilters });
    const overAllFilters = { ...filters, ...newFilters };
    const stringifiedFilters = {
      ...overAllFilters,
      is_remote: overAllFilters.is_remote.toString(),
      salary_min: overAllFilters.salary_min.toString(),
      salary_max: overAllFilters.salary_max.toString(),
    };
    setSearchParams(new URLSearchParams(stringifiedFilters).toString());
    const jobsFiltered = jobs.filter((job) => {
      const res =
        (!overAllFilters.is_remote || job.is_remote) &&
        (!overAllFilters.job_type || job.job_type === overAllFilters.job_type) &&
        (!overAllFilters.salary_min || job.min_amount >= overAllFilters.salary_min) &&
        (!overAllFilters.salary_max || job.max_amount <= overAllFilters.salary_max);
      return res;
    });
    setFilteredJobs(jobsFiltered);
  };

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const job_type = searchParams.get("job_type") || "";
    setFilters({
      is_remote: searchParams.get("is_remote") === "true",
      job_type,
      salary_min: Number(searchParams.get("salary_min")) || 0,
      salary_max: Number(searchParams.get("salary_max")) || 0,
    });
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 mt-12 md:mt-18">
      <h1 className="text-3xl font-bold mb-6">Job Search</h1>
      <SearchBar onSearch={handleSearch} filters={filters} />
      <div className="flex flex-col md:flex-row gap-6 mt-6">
        <div className="w-full md:w-1/4">
          <JobFilters
            onChange={handleFilterChange}
            filters={filters}
            jobTypes={jobTypes}
          />
        </div>
        <div className="w-full md:w-3/4">
          <JobList
            jobs={filteredJobs} 
            loading={loading} 
            onLoadMore={handleLoadMore} 
            hasMore={hasMore} 
          />
        </div>
      </div>
    </div>
  );
};

export default JobSearch;