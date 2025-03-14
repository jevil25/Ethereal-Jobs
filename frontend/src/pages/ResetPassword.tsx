import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  checkIfResetPasswordTokenIsValid,
  updatePasswordWithToken,
} from "../api/user";
import Navbar from "../components/HomePage/Navbar";
import PasswordConditions from "../components/Auth/PasswordConditions";
import { checkPasswordConditions } from "../utils/auth";
import { Button } from "../components/ui/button";
import { PasswordInput } from "../components/ui/passwordInput";

const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState<string | null>(null);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const checkResetToken = async () => {
      const resetToken = searchParams.get("token");
      setToken(resetToken);
      if (resetToken) {
        const response = await checkIfResetPasswordTokenIsValid({
          token: resetToken,
        });
        if (response.is_expired || !response.is_valid) {
          return setError("Reset link has expired. Please request a new one.");
        } else if (response.is_valid) {
          return setError(null);
        }
      }
    };
    checkResetToken();
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    setFormError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFormError(null);

    // Validate inputs
    if (!token) {
      setFormError("Invalid or expired reset link");
      setIsLoading(false);
      return;
    }

    // Validate password match
    if (formData.newPassword !== formData.confirmPassword) {
      setFormError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    // Validate password strength (example criteria)
    if (!checkPasswordConditions(formData.newPassword).isValid) {
      setFormError("Password does not meet requirements");
      setIsLoading(false);
      return;
    }

    try {
      const response = await updatePasswordWithToken({
        token,
        password: formData.newPassword,
      });

      if (response.is_valid) {
        setSuccessMessage("Password reset successfully. Please sign in.");
        setTimeout(() => {
          navigate("/");
        }, 1500);
      } else if (response.is_expired) {
        setFormError(
          response.message || "Failed to reset password. Please try again.",
        );
      } else if (response.message) {
        setFormError(response.message);
      }
    } catch (err) {
      console.error("Password reset error:", err);
      setFormError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // If no reset token is present, show an error
  if (error) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
          <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
            <h2 className="text-2xl font-bold mb-6 text-center text-red-600">
              Invalid Reset Link
            </h2>
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
            <Button
              onClick={() => navigate("/signin")}
              className="w-full py-3 rounded-full transition-colors"
            >
              Go to Sign In
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6 text-center">
            Reset Your Password
          </h2>

          {/* Error message */}
          {formError && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {formError}
            </div>
          )}

          {/* Success message */}
          {successMessage && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="newPassword" className="block text-gray-700 mb-2">
                New Password
              </label>
              <PasswordInput
                id="newPassword"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="Enter new password"
                required
                disabled={isLoading}
              />
            </div>

            <div className="mb-6">
              <label
                htmlFor="confirmPassword"
                className="block text-gray-700 mb-2"
              >
                Confirm New Password
              </label>
              <PasswordInput
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="Confirm new password"
                required
                disabled={isLoading}
              />
            </div>

            {(formData.confirmPassword.length > 0 ||
              formData.newPassword.length > 0) && (
              <PasswordConditions
                password={formData.newPassword}
                passwordMatchCheck={true}
                matchPassword={formData.confirmPassword}
              />
            )}

            <Button
              type="submit"
              className={`w-full py-3 rounded-full hover:bg-gray-800 hover:cursor-pointer transition-colors ${isLoading ? "opacity-70 cursor-not-allowed" : ""}`}
              disabled={isLoading}
              variant={"jobify"}
            >
              {isLoading ? "Resetting..." : "Reset Password"}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-gray-600">
              Remembered your password?{" "}
              <Button
                onClick={() => navigate("/?login=true")}
                className="text-black font-medium hover:underline focus:outline-none hover:cursor-pointer pl-1"
                variant={"link"}
              >
                Sign In
              </Button>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default ResetPasswordPage;
