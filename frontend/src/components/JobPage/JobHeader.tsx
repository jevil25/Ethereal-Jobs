import { Badge } from "../ui/badge";
import { JobData } from "../../types/data";

const JobHeader: React.FC<{ job: JobData }> = ({ job }) => {
  const formatSalary = (min: number, max: number, currency: string) => {
    const formatter = new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency || "INR",
      maximumFractionDigits: 0,
    });
    return `${formatter.format(min)} - ${formatter.format(max)}`;
  };

  return (
    <div className="flex items-start justify-between">
      <div>
        <h1 className="text-2xl font-bold mb-2">{job?.title}</h1>
        <div className="flex items-center gap-2 text-gray-600 mb-2">
          <span>{job?.company}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600 mb-4">
          <span>{job?.location}</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {job?.is_remote && <Badge variant="secondary">Remote</Badge>}
          {job?.job_type && <Badge variant="secondary">{job.job_type}</Badge>}
          <Badge variant="outline">
            Posted: {new Date(job?.date_posted as string).toLocaleDateString()}
          </Badge>
          {job?.min_amount && job?.max_amount && (
            <Badge variant="outline">
              {formatSalary(job.min_amount, job.max_amount, job.currency)}
            </Badge>
          )}
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
  );
};

export default JobHeader;
