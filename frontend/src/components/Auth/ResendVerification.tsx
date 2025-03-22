import { useState } from "react";
import { resendVerificationEmail } from "../../api/user";

interface ResendVerificationProps {
  resendEmail: string;
  showMessage?: boolean;
}

const ResendVerification = ({
  resendEmail,
  showMessage = true,
}: ResendVerificationProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [cooldownTime, setCooldownTime] = useState(0);

  const handleResendVerification = async () => {
    if (cooldownTime > 0) return;

    try {
      setIsLoading(true);
      setError(null);
      setSuccessMessage(null);

      const response = await resendVerificationEmail({ email: resendEmail });
      if (!response) {
        return setError(
          "An unexpected error occurred. Please try again later.",
        );
      }

      if (response.is_valid) {
        setSuccessMessage(
          "Verification email resent. Please check your inbox.",
        );

        // Start 60-second cooldown
        setCooldownTime(60);
        const cooldownInterval = setInterval(() => {
          setCooldownTime((prevTime) => {
            if (prevTime <= 1) {
              clearInterval(cooldownInterval);
              return 0;
            }
            return prevTime - 1;
          });
        }, 1000);
      } else {
        setError(
          response.message ||
            "Failed to resend verification email. Please try again.",
        );
      }
    } catch (err) {
      console.error("Verification resend error:", err);
      setError("Failed to resend verification email. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="text-gray-600 flex flex-col gap-2 mb-4">
      <div className="flex flex-row items-center gap-2 justify-center">
        <span>
          {showMessage
            ? "Didn't receive the email?"
            : "Resend verification email?"}
        </span>
        <button
          onClick={handleResendVerification}
          className={`text-black font-medium hover:underline focus:outline-none 
            ${
              isLoading || cooldownTime > 0
                ? "opacity-70 cursor-not-allowed"
                : "hover:cursor-pointer"
            }`}
          disabled={isLoading || cooldownTime > 0}
        >
          {isLoading
            ? "Resending..."
            : cooldownTime > 0
              ? `Wait ${cooldownTime}s`
              : "Resend"}
        </button>
      </div>
      {error && <p className="text-red-500">{error}</p>}
      {successMessage && <p className="text-green-500">{successMessage}</p>}
    </div>
  );
};

export default ResendVerification;
