import { Badge } from "../ui/badge";
import { JobData } from "../../types/data";
import { Button } from "../ui/button";
import { MapPin, Calendar, ExternalLink, DollarSign } from "lucide-react";

const JobHeader: React.FC<{ job: JobData }> = ({ job }) => {
  const formatSalary = (min: number, max: number, currency: string) => {
    const formatter = new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency || "INR",
      maximumFractionDigits: 0,
    });
    return `${formatter.format(min)} - ${formatter.format(max)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
  };

  return (
    <div className="bg-white rounded-lg border shadow-md p-6 mb-6">
      {/* Title and Company */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{job?.title}</h1>
          <h2 className="text-lg text-gray-700 font-medium mt-1">{job?.company}</h2>
        </div>
        {job.company_logo && (
          <img
            src={job.company_logo}
            alt={`${job.company} logo`}
            className="h-16 w-16 object-contain"
          />
        )}
      </div>

      {/* Location and Apply Button */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <MapPin className="h-5 w-5 text-gray-500 mr-1" />
          <span className="text-gray-700">{job?.location}</span>
          {job?.is_remote && (
            <Badge variant="secondary" className="ml-2">
              Remote
            </Badge>
          )}
        </div>
        {job?.url && (
          <Button 
            variant="jobify" 
            size="lg" 
            className="px-5 py-2"
            onClick={() => window.open(job.url, '_blank')}
          >
            Apply Now <ExternalLink className="ml-1 h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Additional Information */}
      <div className="flex flex-wrap gap-3 border-t border-gray-100 pt-4">
        {job?.job_type && (
          <Badge variant="secondary" className="px-3 py-1">
            {job.job_type}
          </Badge>
        )}
        
        <Badge variant="outline" className="flex items-center px-3 py-1">
          <Calendar className="h-4 w-4 mr-1" />
          Posted: {formatDate(job?.date_posted as string)}
        </Badge>
        
        {job?.min_amount && job?.max_amount && (
          <Badge variant="outline" className="flex items-center px-3 py-1">
            <DollarSign className="h-4 w-4 mr-1" />
            {formatSalary(job.min_amount, job.max_amount, job.currency)}
          </Badge>
        )}
      </div>
    </div>
  );
};

export default JobHeader;