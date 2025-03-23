import React, { useEffect, useState, useRef } from "react";
import JobCard from "./JobCard";
import { JobData } from "../../types/data";

interface JobListProps {
  jobs: JobData[];
  loading: boolean;
  onLoadMore: (results: number) => void;
  hasMore: boolean;
}

const JobList: React.FC<JobListProps> = ({
  jobs,
  loading,
  onLoadMore,
  hasMore,
}) => {
  const [page, setPage] = useState<number>(1);
  const [resultsPerPage] = useState<number>(10);
  const observer = useRef<IntersectionObserver | null>(null);
  const lastJobElementRef = useRef<HTMLDivElement | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>(
    "Please wait while we load the jobs... this may take a few seconds",
  );

  // Function to load more jobs
  const loadMoreJobs = () => {
    if (isLoadingMore || !hasMore || loading) return;

    setIsLoadingMore(true);
    const newPage = page + 1;
    setPage(newPage);

    // Call the onLoadMore prop
    onLoadMore(newPage * resultsPerPage);
  };

  // Reset loading state when jobs array changes (indicating load completed)
  useEffect(() => {
    setIsLoadingMore(false);
  }, [jobs]);

  useEffect(() => {
    // Disconnect previous observer if it exists
    if (observer.current) {
      observer.current.disconnect();
    }

    // Only observe if there are more jobs to load
    if (!hasMore || loading || isLoadingMore) return;

    observer.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          loadMoreJobs();
        }
      },
      { threshold: 0.5 },
    );

    // Observe the last job element
    if (lastJobElementRef.current) {
      observer.current.observe(lastJobElementRef.current);
    }

    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [jobs, hasMore, loading, isLoadingMore, page]);

  useEffect(() => {
    const loadingMessages = [
      "This is taking longer than expected... Please wait",
      "We have found some jobs for you... Comparing with your resume/skills",
      "We are almost there... Just a few more seconds",
    ];
    let index = 0;
    const interval = setInterval(() => {
      if (index === loadingMessages.length) return;
      setLoadingMessage(loadingMessages[index]);
      index = (index + 1) % loadingMessages.length;
    }, 4000);

    return () => clearInterval(interval);
  }, [loading]);

  if (loading && jobs.length === 0) {
    return (
      <div className="flex justify-center items-center py-4 flex-row gap-2">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <div className="transition-all duration-300 ease-in-out">
          {loadingMessage}
        </div>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <h2 className="text-xl font-semibold mb-2">
          {loading ? "Loading jobs..." : "No jobs found"}
        </h2>
        <p className="text-gray-600">Try adjusting your search criteria</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {jobs.map((job, index) => (
        <div
          key={job.id}
          ref={index === jobs.length - 1 ? lastJobElementRef : null}
        >
          <JobCard job={job} />
        </div>
      ))}

      {!loading && !hasMore && jobs.length > 0 && (
        <div className="text-center py-6 bg-gray-50 rounded-lg mt-6">
          <p className="text-gray-600 font-medium">
            You've reached the end of the job listings
          </p>
          <p className="text-sm text-gray-500 mt-1">
            No more jobs match your current search criteria
          </p>
        </div>
      )}
      {(loading || isLoadingMore) && (
        <div className="flex justify-center items-center py-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
    </div>
  );
};

export default JobList;
