import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import PersonalInfoCard from '../components/OnBoarding/personalInfoCard';
import ExperienceCard, { Experience } from '../components/OnBoarding/experienceCard';
import EducationCard, { Education } from '../components/OnBoarding/educationCard';
import SkillsCard, { SkillsCardProps } from '../components/OnBoarding/skillsCard';
import JobPreferencesCard from '../components/OnBoarding/JobPreferencesCard';
import ResumeUploadCard from '../components/OnBoarding/ResumeUploadCard';
import OnboardingProgress from '../components/OnBoarding/progess';

const OnboardingFlow: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    personalInfo: {
      headline: '',
      location: '',
      phone: '',
      website: '',
    },
    experience: [] as Experience[],
    education: [] as Education[],
    skills: [] as SkillsCardProps['data'],
    jobPreferences: {
      jobTypes: [] as string[],
      locations: [] as string[],
      remotePreference: '',
      salaryExpectation: '',
      immediateStart: false,
    },
    resumeFile: null as File | null,
  });

  const steps = [
    {
      title: 'Personal Information',
      description: 'Tell us about yourself',
      component: (
        <PersonalInfoCard
          data={formData.personalInfo}
          updateData={(data) => setFormData({ ...formData, personalInfo: data })}
        />
      ),
    },
    {
      title: 'Work Experience',
      description: 'Add your work history',
      component: (
        <ExperienceCard
          data={formData.experience}
          updateData={(data) => setFormData({ ...formData, experience: data })}
        />
      ),
    },
    {
      title: 'Education',
      description: 'Add your educational background',
      component: (
        <EducationCard
          data={formData.education}
          updateData={(data) => setFormData({ ...formData, education: data })}
        />
      ),
    },
    {
      title: 'Skills',
      description: 'List your professional skills',
      component: (
        <SkillsCard
          data={formData.skills}
          updateData={(data) => setFormData({ ...formData, skills: data })}
        />
      ),
    },
    {
      title: 'Job Preferences',
      description: 'What kind of job are you looking for?',
      component: (
        <JobPreferencesCard
          data={formData.jobPreferences}
          updateData={(data) => setFormData({ ...formData, jobPreferences: data })}
        />
      ),
    },
    {
      title: 'Resume Upload',
      description: 'Or upload your resume for automatic parsing',
      component: (
        <ResumeUploadCard
          file={formData.resumeFile}
          updateFile={(file) => setFormData({ ...formData, resumeFile: file })}
        />
      ),
    },
  ];

  const onComplete = () => {
    console.log('Onboarding complete!');
};

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Submit data and complete onboarding
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    // Here you would submit the form data to your backend
    console.log('Submitting form data:', formData);
    
    // Call the onComplete callback to finish onboarding
    onComplete();
    
    // Navigate to dashboard or profile page
    navigate('/dashboard');
  };

  const handleSkip = () => {
    // Skip to the final step - resume upload
    setCurrentStep(steps.length - 1);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <Card className="w-full max-w-xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">{steps[currentStep].title}</CardTitle>
          <CardDescription>{steps[currentStep].description}</CardDescription>
        </CardHeader>
        
        <OnboardingProgress currentStep={currentStep} totalSteps={steps.length} />
        
        <CardContent className="p-6">
          {steps[currentStep].component}
        </CardContent>
        
        <CardFooter className="flex justify-between p-6 pt-0">
          <div>
            {currentStep > 0 && (
              <Button
                onClick={handlePrevious}
                variant="outline"
                className="mr-2"
              >
                Previous
              </Button>
            )}
            
            {currentStep < steps.length - 1 && currentStep !== 0 && (
              <Button 
                onClick={handleSkip}
                variant="ghost"
              >
                Skip to Resume Upload
              </Button>
            )}
          </div>
          
          <Button
            onClick={handleNext}
            variant="jobify"
            className="ml-auto"
          >
            {currentStep === steps.length - 1 ? 'Complete' : 'Next'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default OnboardingFlow;