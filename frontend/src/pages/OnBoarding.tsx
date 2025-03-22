import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import PersonalInfoCard from "../components/OnBoarding/PersonalInfoCard";
import ExperienceCard, {
  Experience,
} from "../components/OnBoarding/ExperienceCard";
import EducationCard, {
  Education,
} from "../components/OnBoarding/EducationCard";
import SkillsCard, {
  SkillsCardProps,
} from "../components/OnBoarding/SkillsCard";
import ProjectCard, { Project } from "../components/OnBoarding/ProjectCard";
import CertificationCard, {
  Certification,
} from "../components/OnBoarding/CertificationCard";
import JobPreferencesCard from "../components/OnBoarding/JobPreferencesCard";
import ResumeUploadCard from "../components/OnBoarding/ResumeUploadCard";
import OnboardingProgress from "../components/OnBoarding/Progess";
import { FormData } from "../api/types";
import {
  updateResumeDetails,
  getResumeDetails,
  extractResume,
} from "../api/resume";
import { debounce } from "lodash";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../providers/useAuth";

const OnboardingFlow: React.FC = () => {
  const { refreshUser } = useAuth();
  const controllerRef = useRef(new AbortController());
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(0); // -1 for previous, 1 for next
  const [firstGetDone, setFirstGetDone] = useState(false);
  const [firstStepCheckDone, setFirstStepCheckDone] = useState(false);
  const [isParsingResume, setIsParsingResume] = useState(false);
  const [transitionComplete, setTransitionComplete] = useState(true);
  const [formData, setFormData] = useState<FormData>({
    personalInfo: {
      headline: "",
      location: "",
      phone: "",
      website: "",
      github_url: "",
      linkedin_url: "",
      about_me: "",
    },
    experience: [] as Experience[],
    education: [] as Education[],
    skills: [] as SkillsCardProps["data"],
    projects: [] as Project[],
    certifications: [] as Certification[],
    jobPreferences: {
      jobTypes: [] as string[],
      locations: [] as string[],
      remotePreference: "",
      salaryExpectation: "",
      immediateStart: false,
    },
    resumeFile: null as File | null,
  });
  const prevStateRef = useRef(formData);
  const [searchParams, setSearchParams] = useSearchParams();

  const updateResumeDetail = useCallback(
    async (isOnBoarded: boolean) => {
      await updateResumeDetails({ data: formData }, isOnBoarded);
    },
    [formData],
  );

  const handleResumeUpload = async (file: File | null) => {
    if (!file) {
      // User cancelled file upload
      return;
    }
    setIsParsingResume(true);

    try {
      // Update the formData with the file first
      setFormData((prev) => ({
        ...prev,
        resumeFile: file,
      }));

      controllerRef.current = new AbortController();
      const parsedData = await extractResume({ file }, controllerRef.current);

      if (!parsedData) {
        console.error("Error parsing resume");
        return;
      }

      // Update the form data with the parsed information
      setFormData((prev) => ({
        ...prev,
        ...parsedData,
        resumeFile: file,
      }));

      // Automatically move to the next step with animation
      setDirection(1);
      setTransitionComplete(false);
      setCurrentStep(1);
    } catch (error) {
      console.error("Error parsing resume:", error);
    } finally {
      setIsParsingResume(false);
    }
  };

  const steps = [
    {
      title: "Resume Upload (Optional)",
      description:
        "Upload your resume for automatic parsing or skip to fill in manually",
      component: (
        <ResumeUploadCard
          file={formData.resumeFile}
          updateFile={handleResumeUpload}
          isParsing={isParsingResume}
          controller={controllerRef.current}
        />
      ),
    },
    {
      title: "Personal Information",
      description: "Tell us about yourself",
      component: (
        <PersonalInfoCard
          data={formData.personalInfo}
          updateData={(data) =>
            setFormData({ ...formData, personalInfo: data })
          }
        />
      ),
    },
    {
      title: "Work Experience",
      description: "Add your work history",
      component: (
        <ExperienceCard
          data={formData.experience}
          updateData={(data) => setFormData({ ...formData, experience: data })}
        />
      ),
    },
    {
      title: "Education",
      description: "Add your educational background",
      component: (
        <EducationCard
          data={formData.education}
          updateData={(data) => setFormData({ ...formData, education: data })}
        />
      ),
    },
    {
      title: "Projects",
      description: "Showcase your projects",
      component: (
        <ProjectCard
          data={formData.projects}
          updateData={(data) => setFormData({ ...formData, projects: data })}
        />
      ),
    },
    {
      title: "Certifications",
      description: "Add your certifications",
      component: (
        <CertificationCard
          data={formData.certifications}
          updateData={(data) =>
            setFormData({ ...formData, certifications: data })
          }
        />
      ),
    },
    {
      title: "Skills",
      description: "List your professional skills",
      component: (
        <SkillsCard
          data={formData.skills}
          updateData={(data) => setFormData({ ...formData, skills: data })}
        />
      ),
    },
    {
      title: "Job Preferences",
      description: "What kind of job are you looking for?",
      component: (
        <JobPreferencesCard
          data={formData.jobPreferences}
          updateData={(data) =>
            setFormData({ ...formData, jobPreferences: data })
          }
        />
      ),
    },
  ];

  useEffect(() => {
    const stepNumber = parseInt(searchParams.get("step") || "0");
    if (stepNumber > -1 && stepNumber <= steps.length) {
      setCurrentStep(stepNumber);
    }
    setFirstStepCheckDone(true);
    const getFormData = async () => {
      const data = await getResumeDetails();
      if (data.no_resume_found && data.no_resume_found) {
        return;
      }
      setFormData(data);
      setFirstGetDone(true);
    };
    getFormData();
  }, [searchParams, steps.length]);

  useEffect(() => {
    const hasStateChanged =
      JSON.stringify(prevStateRef.current) !== JSON.stringify(formData);
    if (!hasStateChanged && !firstGetDone) {
      return;
    }
    const debouncedSave = debounce(async () => {
      await updateResumeDetail(false);
      prevStateRef.current = formData;
    }, 500);
    debouncedSave();

    return () => {
      debouncedSave.cancel();
    };
  }, [formData, firstGetDone, updateResumeDetail]);

  useEffect(() => {
    if (!firstStepCheckDone) return;
    setSearchParams({ step: currentStep.toString() });
  }, [currentStep, setSearchParams, firstStepCheckDone]);

  const onComplete = async () => {
    await updateResumeDetail(true);
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setDirection(1);
      setTransitionComplete(false);
      setCurrentStep(currentStep + 1);
    } else {
      // Submit data and complete onboarding
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setDirection(-1);
      setTransitionComplete(false);
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    await onComplete();
    refreshUser();
    navigate("/jobs?onboardingcompleted=true");
  };

  const handleSkip = () => {
    // For resume upload step, just go to next step with animation
    if (currentStep === 0) {
      setDirection(1);
      setTransitionComplete(false);
      setCurrentStep(1);
    }
  };

  // Animation variants
  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 200 : -200,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 200 : -200,
      opacity: 0,
    }),
  };

  // Card header animations
  const headerVariants = {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0, transition: { delay: 0.2 } },
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-xl"
      >
        <Card className="w-full shadow-lg">
          <motion.div
            variants={headerVariants}
            initial="initial"
            animate="animate"
            key={`header-${currentStep}`}
          >
            <CardHeader>
              <CardTitle className="text-2xl font-bold">
                {steps[currentStep].title}
              </CardTitle>
              <CardDescription>
                {steps[currentStep].description}
              </CardDescription>
            </CardHeader>
          </motion.div>

          <OnboardingProgress
            currentStep={currentStep}
            totalSteps={steps.length}
          />

          <CardContent className="p-6 overflow-hidden">
            <AnimatePresence
              mode="wait"
              initial={false}
              custom={direction}
              onExitComplete={() => setTransitionComplete(true)}
            >
              <motion.div
                key={currentStep}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 },
                }}
                className="w-full"
              >
                {steps[currentStep].component}
              </motion.div>
            </AnimatePresence>
          </CardContent>

          <CardFooter className="flex justify-between p-6 pt-0">
            <div>
              {currentStep > 0 && (
                <Button
                  onClick={handlePrevious}
                  variant="outline"
                  className="mr-2"
                  disabled={!transitionComplete || isParsingResume}
                >
                  Previous
                </Button>
              )}
            </div>

            <div className="ml-auto">
              {currentStep === 0 && (
                <Button
                  onClick={handleSkip}
                  variant="outline"
                  className="mr-2"
                  disabled={!transitionComplete || isParsingResume}
                >
                  Skip
                </Button>
              )}

              <Button
                onClick={handleNext}
                variant="Etheral Jobs"
                disabled={!transitionComplete || isParsingResume}
              >
                {currentStep === steps.length - 1 ? "Complete" : "Next"}
              </Button>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default OnboardingFlow;
