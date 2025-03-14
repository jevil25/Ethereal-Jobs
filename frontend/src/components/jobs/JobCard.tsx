import React from "react";
import { JobData } from "../../types/data";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";

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
      return `${formatAmount(job.min_amount)} - ${formatAmount(job.max_amount)} per ${job.interval || "month"}`;
    } else if (job.min_amount) {
      return `From ${formatAmount(job.min_amount)} per ${job.interval || "month"}`;
    } else if (job.max_amount) {
      return `Up to ${formatAmount(job.max_amount)} per ${job.interval || "month"}`;
    }
  };

  const redirectToJobPage = (e: React.MouseEvent) => {
    e.preventDefault();
    return navigate(`/job/${job.id}`);
  };

  const truncateDescriptionHtml = (
    html: string,
    maxLength: number = 200,
  ): string => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const text = doc.body.textContent || "";

    if (text.length <= maxLength) {
      return html;
    }

    let truncated = "";
    let currentLength = 0;
    let inTag = false;

    for (let i = 0; i < html.length; i++) {
      const char = html[i];

      if (char === "<") {
        inTag = true;
      }

      truncated += char;

      if (!inTag) {
        currentLength++;

        if (currentLength >= maxLength) {
          const remainingHtml = html.slice(i + 1);
          const nextClosingTag = remainingHtml.match(/<\/[^>]+>/);

          if (nextClosingTag) {
            truncated += "..." + nextClosingTag[0];
          } else {
            truncated += "...";
          }
          break;
        }
      }

      if (char === ">") {
        inTag = false;
      }
    }

    return truncated;
  };

  return (
    <Card
      className="hover:shadow-lg transition duration-200"
      onClick={redirectToJobPage}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-semibold mb-1">{job.title}</h2>
            <p className="text-gray-700 mb-1">{job.company}</p>
            <p className="text-gray-600">
              {job.location} {job.is_remote ? "(Remote)" : ""}
            </p>
          </div>
          {job.company_logo ? (
            <Avatar className="h-12 w-12">
              <AvatarImage src={job.company_logo} alt={`${job.company} logo`} />
              <AvatarFallback>
                {job.company.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          ) : null}
        </div>
      </CardHeader>

      <CardContent>
        <p className="text-blue-600 font-medium mb-3">{formatSalary()}</p>

        <div className="mb-4">
          <p
            dangerouslySetInnerHTML={{
              __html: truncateDescriptionHtml(job.description),
            }}
          ></p>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {job.job_type && <Badge variant="secondary">{job.job_type}</Badge>}
          {job.job_level && <Badge variant="secondary">{job.job_level}</Badge>}
          {job.job_function && (
            <Badge variant="secondary">{job.job_function}</Badge>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex justify-between items-center">
        <span className="text-sm text-gray-500">
          Posted: {new Date(job.date_posted).toLocaleDateString()}
        </span>
        <Button onClick={(e) => redirectToJobPage(e)} variant="jobify">
          Apply Now
        </Button>
      </CardFooter>
    </Card>
  );
};

export default JobCard;
