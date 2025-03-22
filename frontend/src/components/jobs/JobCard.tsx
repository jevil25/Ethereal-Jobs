import React from "react";
import { JobData } from "../../types/data";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import {
  MapPin,
  Briefcase,
  Calendar,
  CreditCard,
  Building,
  ArrowRight,
} from "lucide-react";

interface JobCardProps {
  job: JobData;
}

const JobCard: React.FC<JobCardProps> = ({ job }) => {
  const navigate = useNavigate();

  const formatSalary = () => {
    if (!job.min_amount && !job.max_amount) return "Salary not specified";

    const formatAmount = (amount: number) => {
      return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: job.currency || "INR",
        maximumFractionDigits: 0,
      }).format(amount);
    };

    if (job.min_amount && job.max_amount) {
      if (job.min_amount === job.max_amount) {
        return `${formatAmount(job.min_amount)} ${job.interval || "per month"}`;
      }
      return `${formatAmount(job.min_amount)} - ${formatAmount(job.max_amount)} ${job.interval || "per month"}`;
    } else if (job.min_amount) {
      return `From ${formatAmount(job.min_amount)} ${job.interval || "per month"}`;
    } else if (job.max_amount) {
      return `Up to ${formatAmount(job.max_amount)} ${job.interval || "per month"}`;
    }
  };

  const redirectToJobPage = (e: React.MouseEvent) => {
    e.preventDefault();
    return navigate(`/job/${job.id}`);
  };

  return (
    <Card
      className="hover:shadow-lg transition duration-200"
      onClick={redirectToJobPage}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-semibold mb-1 text-blue-800">
              {job.title}
            </h2>
            <div className="flex items-center text-gray-700 mb-1">
              <Building className="h-4 w-4 mr-1" />
              <p>{job.company}</p>
            </div>
            <div className="flex items-center text-gray-600">
              <MapPin className="h-4 w-4 mr-1" />
              <p>
                {job.location} {job.is_remote ? "🌐 Remote" : ""}
              </p>
            </div>
          </div>
          {job.company_logo ? (
            <Avatar className="h-16 w-16 border-2 border-gray-200">
              <AvatarImage src={job.company_logo} alt={`${job.company} logo`} />
              <AvatarFallback className="bg-blue-100 text-blue-800">
                {job.company.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          ) : (
            <Avatar className="h-16 w-16 bg-blue-100">
              <AvatarFallback className="text-blue-800">
                {job.company.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex items-center text-blue-700 font-medium mb-4">
          <CreditCard className="h-4 w-4 mr-2" />
          <p>{formatSalary()}</p>
        </div>

        <div className="flex flex-wrap gap-2 mb-3">
          {job.job_type && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Briefcase className="h-3 w-3" /> {job.job_type}
            </Badge>
          )}
          {job.job_level && (
            <Badge
              variant="secondary"
              className="bg-blue-100 text-blue-800 hover:bg-blue-200"
            >
              {job.job_level}
            </Badge>
          )}
          {job.job_function && (
            <Badge
              variant="secondary"
              className="bg-gray-100 text-gray-800 hover:bg-gray-200"
            >
              {job.job_function}
            </Badge>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex justify-between items-center pt-2 border-t border-gray-100">
        <span className="text-sm text-gray-500 flex items-center">
          <Calendar className="h-4 w-4 mr-1" />
          Posted: {new Date(job.date_posted).toLocaleDateString()}
        </span>
        <Button
          onClick={(e) => redirectToJobPage(e)}
          variant="Etheral Jobs"
          className="group"
        >
          Apply Now{" "}
          <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default JobCard;
