import React from 'react';

interface OnboardingProgressProps {
  currentStep: number;
  totalSteps: number;
}

const OnboardingProgress: React.FC<OnboardingProgressProps> = ({ currentStep, totalSteps }) => {
  return (
    <div className="w-full px-6 mb-4">
      <div className="relative">
        <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
          <div 
            style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500 transition-all duration-300"
          ></div>
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          {Array.from({ length: totalSteps }).map((_, index) => (
            <div 
              key={index}
              className={`${
                index <= currentStep ? 'text-blue-500 font-medium' : ''
              }`}
            >
              Step {index + 1}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OnboardingProgress;