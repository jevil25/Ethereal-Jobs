import React from "react";
import { JobData } from "../../types/data";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import {
  MapPin,
  Briefcase,
  CreditCard,
  Building,
  Clock,
  User,
  Check,
  Star,
  FileText,
  BookOpen,
  BarChart,
  Award
} from "lucide-react";
import { useLocation } from "react-router-dom";
import { Dialog, DialogHeader, DialogContent, DialogTitle, DialogDescription } from "../ui/dialog";
import { applicationStatusUpdate } from "../../api/jobs";
import { ApplicationStatus } from "../../api/types";

interface JobCardProps {
  job: JobData;
  redirect?: boolean;
}

const JobCard: React.FC<JobCardProps> = ({ job, redirect = true} ) => {
  const isJobPage = useLocation().pathname.includes("/job/");
  const [openIsAppliedModal, setOpenIsAppliedModal] = React.useState(false);
  const formatSalary = () => {
    if (!job.min_amount && !job.max_amount && !job.salary_with_currency) return "Salary not specified";

    const formatAmount = (amount: number) => {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: job.currency || "USD",
        maximumFractionDigits: 0,
      }).format(amount);
    };

    if (job.min_amount && job.max_amount) {
      if (job.min_amount === job.max_amount) {
        return `${formatAmount(job.min_amount)}${job.interval ? `/${job.interval}` : ""}`;
      }
      return `${formatAmount(job.min_amount)} - ${formatAmount(job.max_amount)}${job.interval ? `/${job.interval}` : ""}`;
    } else if (job.min_amount) {
      return `From ${formatAmount(job.min_amount)}${job.interval ? `/${job.interval}` : ""}`;
    } else if (job.max_amount) {
      return `Up to ${formatAmount(job.max_amount)}${job.interval ? `/${job.interval}` : ""}`;
    } else {
      return `${job.salary_with_currency}`;
    }
  };

  const redirectToJobPage = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!redirect) return;
    isJobPage ? window.open(job.job_url_direct || job.url) : window.open(`/job/${job.id}`, "_blank");
    if (isJobPage) {
      setOpenIsAppliedModal(true);
      return;
    }
    return window.open(`/job/${job.id}`, "_blank");
  };

  const getTimeAgo = (datePosted: string) => {
    const posted = new Date(datePosted);
    const now = new Date();
    const diffMs = now.getTime() - posted.getTime();
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHrs < 1) return "Just now";
    if (diffHrs < 24) return `${diffHrs}h ago`;
    
    const diffDays = Math.floor(diffHrs / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    
    const diffWeeks = Math.floor(diffDays / 7);
    if (diffWeeks < 4) return `${diffWeeks}w ago`;
    
    return new Date(job.date_posted).toLocaleDateString();
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return "bg-green-100 text-green-700 border-green-200";
    if (score >= 70) return "bg-blue-100 text-blue-700 border-blue-200";
    if (score >= 50) return "bg-yellow-100 text-yellow-700 border-yellow-200";
    return "bg-gray-100 text-gray-700 border-gray-200";
  };

  const getBasedOnJobRequiredYears = (years: number) => {
    if (years === 0) return "Not specified";
    if (years < 1) return "Entry-level";
    if (years < 3) return "Junior";
    if (years < 5) return "Mid-level";
    if (years < 10) return "Senior";
    return "Not specified";
  }
  
  const getScoreLabel = (type: string) => {
    if (type === "tfidf") return "Keywords";
    if (type === "semantic") return "Content";
    if (type === "skill") return "Skills";
    if (type === "experience") return "Experience";
    return "";
  };
  
  const getScoreIcon = (type: string) => {
    if (type === "tfidf") return <FileText className="h-3 w-3" />;
    if (type === "semantic") return <BookOpen className="h-3 w-3" />;
    if (type === "skill") return <BarChart className="h-3 w-3" />;
    if (type === "experience") return <Award className="h-3 w-3" />;
    return null;
  };

  const getApplicationStatusColor = (status: ApplicationStatus) => {
    if (status === ApplicationStatus.Applied) return "bg-green-50 text-green-700 border-green-200";
    if (status === ApplicationStatus.Rejected) return "bg-red-50 text-red-700 border-red-200";
    if (status === ApplicationStatus.Archived) return "bg-gray-50 text-gray-700 border-gray-200";
    if (status === ApplicationStatus.Pending) return "bg-blue-50 text-blue-700 border-blue-200";
    if (status === ApplicationStatus.Interviewing) return "bg-amber-50 text-amber-700 border-amber-200";
    if (status === ApplicationStatus.Offered) return "bg-purple-50 text-purple-700 border-purple-200";
    return "bg-gray-50 text-gray-700 border-gray-200";
  }

  const trackApplicationStatus = async (isApplied: boolean) => {
    const applicationStatus = isApplied ? ApplicationStatus.Applied : ApplicationStatus.Pending
    await applicationStatusUpdate(job.id, applicationStatus);
  }

  return (<>
    <Card className="hover:shadow-md transition-all duration-300 border border-gray-200 overflow-hidden group">
      {/* Header section with company info and match score */}
      <CardHeader className="py-2 px-4 flex items-start justify-between gap-3">
        <div className="flex gap-3 items-center w-full flex-col md:flex-row">
          <div className="flex flex-row w-full">
            {job.company_logo ? (
              <Avatar className="h-10 w-10 rounded-md bg-white p-1 shadow-sm border border-gray-100">
                <AvatarImage src={job.company_logo} alt={`${job.company} logo`} />
                <AvatarFallback className="bg-gray-50 text-gray-600 font-bold text-sm">
                  {job.company.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            ) : (
              <div className="h-10 w-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-md flex items-center justify-center shadow-sm">
                <span className="text-gray-700 font-bold text-sm">
                  {job.company.substring(0, 2).toUpperCase()}
                </span>
              </div>
            )}
          
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-200 line-clamp-1">
                  {job.title}
                </h2>
                {job.is_remote && (
                  <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200 py-0 px-1.5">
                    Remote
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <div className="flex items-center text-gray-700">
                  <Building className="h-3.5 w-3.5 mr-1 text-gray-500" />
                  <p className="font-medium text-sm">{job.company}</p>
                </div>
                
                <div className="flex items-center text-xs text-gray-600">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>{getTimeAgo(job.date_posted)}</span>
                </div>
              </div>
            </div>
          </div>
          {job.application_status !== ApplicationStatus.Pending &&
            <div className="mr-auto md:ml-auto">
              <Badge className={`font-medium text-sm px-2 py-1 min-w-14 text-center ${getApplicationStatusColor(job.application_status)}`}>
                Status: {job.application_status}
              </Badge>
            </div>
          }
        </div>
        
        {/* Highlighted match score */}
        {job.match_score && (
          <Badge className={`font-medium text-sm px-2 py-1 min-w-14 text-center ${getMatchScoreColor(job.match_score)}`}>
            <Star className="h-3 w-3 mr-1 fill-current" /> {job.match_score}% Match Score
          </Badge>
        )}
      </CardHeader>

      <CardContent className="py-2 px-4 space-y-2">
        {/* Key details row - in a compact grid layout */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
          <div className="flex items-center text-gray-700">
            <MapPin className="h-3.5 w-3.5 mr-1 text-gray-500 flex-shrink-0" />
            <span className="font-medium truncate">{job.location}</span>
          </div>
          
          <div className="flex items-center text-gray-700">
            <CreditCard className="h-3.5 w-3.5 mr-1 text-gray-500 flex-shrink-0" />
            <span className="font-medium truncate">{formatSalary()}</span>
          </div>

          <div className="flex items-center text-gray-700">
            <Briefcase className="h-3.5 w-3.5 mr-1 text-gray-500 flex-shrink-0" />
            <span className="font-medium truncate">{job.job_type || "Full-time"}</span>
          </div>
                    
          <div className="flex items-center text-gray-700">
            <User className="h-3.5 w-3.5 mr-1 text-gray-500 flex-shrink-0" />
            <span className="font-medium truncate">{job.job_level || getBasedOnJobRequiredYears(job.job_required_years)}</span>
          </div>
        </div>
        
        {/* Match score details - prominently displayed */}
        {(job.tfidf_similarity !== undefined || 
          job.semantic_similarity !== undefined || 
          job.skill_match_score !== undefined || 
          job.experience_match_score !== undefined) && (
          <div className="flex flex-wrap gap-1.5 mt-1 border-t border-gray-100 pt-2">
            {job.tfidf_similarity !== undefined && (
              <div className="inline-flex items-center text-xs bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                {getScoreIcon("tfidf")}
                <span className="ml-1 text-blue-700 font-medium">{Math.round(job.tfidf_similarity)}% {getScoreLabel("tfidf")}</span>
              </div>
            )}
            
            {job.semantic_similarity !== undefined && (
              <div className="inline-flex items-center text-xs bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100">
                {getScoreIcon("semantic")}
                <span className="ml-1 text-purple-700 font-medium">{Math.round(job.semantic_similarity)}% {getScoreLabel("semantic")}</span>
              </div>
            )}
            
            {job.skill_match_score !== undefined && (
              <div className="inline-flex items-center text-xs bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
                {getScoreIcon("skill")}
                <span className="ml-1 text-green-700 font-medium">{Math.round(job.skill_match_score)}% {getScoreLabel("skill")}</span>
              </div>
            )}
            
            {job.experience_match_score !== undefined && (
              <div className="inline-flex items-center text-xs bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                {getScoreIcon("experience")}
                <span className="ml-1 text-amber-700 font-medium">{Math.round(job.experience_match_score)}% {getScoreLabel("experience")}</span>
              </div>
            )}
          </div>
        )}

        {/* Skills section */}
        <div className="space-y-1.5 flex flex-col md:flex-row justify-center md:items-center">
          <div>
            {job.job_function && (
              <div>
                <Badge variant="outline" className="bg-gray-50 border-gray-200 text-gray-700 font-medium text-xs capitalize">
                  {job.job_function}
                </Badge>
              </div>
            )}
            
            {(job.matched_skills?.length > 0 || job.missing_skills?.length > 0) && (
              <div className="flex flex-wrap gap-1">
                {job.matched_skills && job.matched_skills.map((skill) => (
                  <Badge
                    key={skill}
                    variant="outline"
                    className="bg-green-50 text-green-700 border-green-200 flex items-center gap-0.5 py-0 px-1.5 text-xs capitalize"
                  >
                    <Check className="h-2.5 w-2.5" /> {skill}
                  </Badge>
                ))}
                {job.missing_skills && job.missing_skills.map((skill) => (
                  <Badge
                    key={skill}
                    variant="outline"
                    className="bg-gray-50 text-gray-600 border-gray-200 py-0 px-1.5 text-xs capitalize"
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          <Button
            onClick={(e) => redirectToJobPage(e)}
            variant="default"
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 my-1.5 md:my-0 rounded-md shadow-sm hover:shadow text-sm transition-all duration-200 font-medium md:ml-auto"
          >
            {job.application_status === ApplicationStatus.Pending ? "Apply Now" : "View Details"}
          </Button>
        </div>
      </CardContent>
    </Card>
    {
      openIsAppliedModal && (
        <Dialog
          open={openIsAppliedModal}
          onOpenChange={setOpenIsAppliedModal}
        >
          <DialogContent className="sm:max-w-md p-6">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-gray-900">
                Application Status
              </DialogTitle>
              <DialogDescription className="text-gray-600 mt-1">
                Please confirm if you've submitted an application for this position
              </DialogDescription>
            </DialogHeader>
            
            <div className="flex flex-col sm:flex-row gap-3 mt-6 w-full">
              <Button
                onClick={() => {
                  setOpenIsAppliedModal(false);
                  trackApplicationStatus(true);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow-sm transition-all duration-200 font-medium flex-1"
              >
                Yes, I've Applied
              </Button>
              <Button
                onClick={() => {
                  setOpenIsAppliedModal(false);
                  trackApplicationStatus(false);
                }}
                className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-2 rounded-lg shadow-sm transition-all duration-200 font-medium flex-1"
              >
                Not Yet
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )
    }
    </>);
};

export default JobCard;