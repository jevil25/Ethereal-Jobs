import React from 'react';

interface OnboardingProgressProps {
  currentStep: number;
  totalSteps: number;
}

const OnboardingProgress: React.FC<OnboardingProgressProps> = ({ currentStep, totalSteps }) => {
  return (
    <div className="w-full mb-8 px-7">
      {/* Step indicator text */}
      <div className="flex justify-between mb-2">
        <p className="text-sm font-medium">
          Step {currentStep} of {totalSteps}
        </p>
        <p className="text-sm text-gray-500">
          {Math.round((currentStep / totalSteps) * 100)}% Complete
        </p>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className="h-full bg-blue-500 transition-all duration-300 ease-in-out"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        />
      </div>

      {/* Step dots */}
      <div className="flex justify-between mt-2">
        {Array.from({ length: totalSteps }, (_, index) => (
          <div 
            key={index} 
            className={`w-4 h-4 rounded-full transition-colors ${
              index + 1 <= currentStep 
                ? 'bg-blue-500' 
                : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default OnboardingProgress;
