import React, { useEffect, useState } from "react";
import {
  CheckPasswordConditions,
  checkPasswordConditions,
} from "../../utils/auth";

interface PasswordConditionsProps {
  password: string;
  matchPassword?: string;
  passwordMatchCheck?: boolean;
}

const PasswordConditions: React.FC<PasswordConditionsProps> = ({
  password,
  matchPassword = "",
  passwordMatchCheck = false,
}) => {
  const [conditions, setConditions] = useState<CheckPasswordConditions>({
    meetsLength: false,
    hasDigit: false,
    hasLowercase: false,
    hasUppercase: false,
    hasSymbol: false,
    isValid: false,
  });

  useEffect(() => {
    const checkConditions = checkPasswordConditions(password);
    setConditions(checkConditions);
  }, [password]);

  // Prepare base conditions
  const baseConditionsList = [
    {
      key: "meetsLength",
      label: "At least 8 characters",
      isValid: conditions.meetsLength,
    },
    {
      key: "hasDigit",
      label: "Contains a number",
      isValid: conditions.hasDigit,
    },
    {
      key: "hasLowercase",
      label: "Contains lowercase letter",
      isValid: conditions.hasLowercase,
    },
    {
      key: "hasUppercase",
      label: "Contains uppercase letter",
      isValid: conditions.hasUppercase,
    },
    {
      key: "hasSymbol",
      label: "Contains a symbol",
      isValid: conditions.hasSymbol,
    },
  ];

  // Add password match condition if required
  const conditionsList = passwordMatchCheck
    ? [
        ...baseConditionsList,
        {
          key: "passwordMatch",
          label: "Passwords match",
          isValid: password === matchPassword && password.length > 0,
        },
      ]
    : baseConditionsList;

  // Calculate progress
  const validConditionsCount = conditionsList.filter(
    (condition) => condition.isValid,
  ).length;
  const progressPercentage =
    validConditionsCount * (100 / conditionsList.length);

  // Determine progress color
  const progressColor =
    conditions.isValid && (!passwordMatchCheck || password === matchPassword)
      ? "bg-green-500"
      : password.length > 0
        ? "bg-yellow-500"
        : "bg-gray-300";

  if (
    conditions.isValid &&
    (!passwordMatchCheck || password === matchPassword)
  ) {
    return null;
  }

  // Render conditions
  return (
    <div className="password-conditions my-2 space-y-2">
      {/* Progress Bar */}
      <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${progressColor} transition-all duration-300`}
          style={{
            width: `${progressPercentage}%`,
          }}
        ></div>
      </div>

      {/* Conditions List */}
      <div className="text-sm">
        <div className="text-gray-600 mb-2 font-medium">
          Password Requirements:
        </div>
        <div className="space-y-1">
          {conditionsList.map((condition) => (
            <div
              key={condition.key}
              className={`flex items-center space-x-2 ${
                condition.isValid ? "text-green-600" : "text-red-600"
              }`}
            >
              <span className="w-5 h-5 flex items-center justify-center">
                {condition.isValid ? (
                  <CheckCircle className="text-green-500" />
                ) : (
                  <XCircle className="text-red-500" />
                )}
              </span>
              <span>{condition.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Mock icons (replace with actual Lucide icons import)
const CheckCircle = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);

const XCircle = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="15" y1="9" x2="9" y2="15"></line>
    <line x1="9" y1="9" x2="15" y2="15"></line>
  </svg>
);

export default PasswordConditions;
