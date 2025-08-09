import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { unsubscribeFromEmails } from "../api/user";
import Navbar from "../components/HomePage/Navbar";
import { Button } from "../components/ui/button";

const UnsubscribePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleUnsubscribe = async () => {
      const token = searchParams.get("token");
      const type = searchParams.get("type");

      if (!token || !type) {
        setError("Invalid unsubscribe link");
        setIsLoading(false);
        return;
      }

      try {
        const response = await unsubscribeFromEmails({ token, type });
        if (!response) {
          setError("An unexpected error occurred. Please try again later.");
          return;
        }

        if (response.is_valid) {
          setSuccessMessage("You have been successfully unsubscribed from reminder emails.");
        } else if (response.is_expired) {
          setError("This unsubscribe link has expired.");
        } else {
          setError(response.message || "Failed to unsubscribe. Please try again.");
        }
      } catch (err) {
        console.error("Unsubscribe error:", err);
        setError("An unexpected error occurred. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    handleUnsubscribe();
  }, [searchParams]);

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          {isLoading ? (
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Processing...</h2>
              <p className="text-gray-600">Please wait while we process your request.</p>
            </div>
          ) : error ? (
            <div>
              <h2 className="text-2xl font-bold mb-4 text-red-600">Error</h2>
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
              <Button
                onClick={() => navigate("/")}
                className="w-full"
                variant="Ethereal Jobs"
              >
                Return to Home
              </Button>
            </div>
          ) : (
            <div>
              <h2 className="text-2xl font-bold mb-4 text-green-600">Unsubscribed Successfully</h2>
              <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                {successMessage}
              </div>
              <Button
                onClick={() => navigate("/")}
                className="w-full"
                variant="Ethereal Jobs"
              >
                Return to Home
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default UnsubscribePage;
