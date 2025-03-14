import { useState, useEffect, useRef } from "react";
import { userSignin, userSignup, sendPasswordResetEmail } from "../../api/user";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../providers/useAuth";
import { onAuthStateChanged } from "firebase/auth";
import {
  signInWithGoogle,
  auth,
  getUserLogout,
  checkPasswordConditions,
} from "../../utils/auth";
import toast from "react-hot-toast";
import { Provider } from "../../api/types";
import PasswordConditions from "./PasswordConditions";
import ResendVerification from "./ResendVerification";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { PasswordInput } from "../ui/passwordInput";

interface AuthFormsProps {
  isSignIn: boolean;
  setIsSignIn: React.Dispatch<React.SetStateAction<boolean>>;
  onClose: () => void;
  showPleaseLogin?: boolean;
}

const AuthForms: React.FC<AuthFormsProps> = ({
  isSignIn,
  setIsSignIn,
  onClose,
  showPleaseLogin,
}) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [showResendVerification, setShowResendVerification] = useState(false);
  const [resendEmail, setResendEmail] = useState("");

  const { refreshUser } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    setError(null);
  };

  const handleForgetPassword = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      if (!formData.email) {
        setError("Please enter your email address");
        return;
      }

      const param = {
        email: formData.email,
      };
      const response = await sendPasswordResetEmail(param);

      if (response.is_valid && response.is_exists) {
        setSuccessMessage(
          "Password reset link sent to your email. Please check your inbox.",
        );
      } else if (!response.is_exists) {
        setError("User does not exist. Please check your email or sign up.");
      } else {
        setError("Failed to send reset link. Please try again.");
      }
    } catch (err) {
      console.error("Password reset error:", err);
      setError("An unexpected error occurred. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isForgotPassword) {
      return handleForgetPassword(e);
    }

    if (!formData.email) {
      setError("Please enter your email address");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    setError(null);

    const checkPassword = checkPasswordConditions(formData.password);

    try {
      if (isSignIn) {
        const response = await userSignin({
          email: formData.email,
          password: formData.password,
          provider: Provider.Custom,
        });
        if (response.is_valid) {
          setSuccessMessage("Sign in successful!");
          refreshUser();
          setTimeout(() => {
            onClose();
            setFormData({
              email: "",
              password: "",
              name: "",
            });
            if (!response.is_onboarded) {
              navigate("/onboarding");
            }
          }, 1500);
        } else {
          if (!response.is_exists) {
            setError(
              "User does not exist. Please check your email or sign up.",
            );
          } else if (!response.is_verified) {
            setShowResendVerification(true);
            setResendEmail(formData.email);
            setError(
              "Please verify your email before signing in. Check your inbox for the verification link.",
            );
          } else {
            setError(
              "Invalid credentials. Please check your email and password.",
            );
          }
        }
      } else {
        if (!checkPassword.isValid) {
          setError("Password does not meet the criteria");
          setIsLoading(false);
          return;
        }
        const response = await userSignup({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          provider: Provider.Custom,
        });

        if (response.is_created) {
          setSuccessMessage(
            "Account created successfully! We have sent you a verification email. Please check your inbox.",
          );
          setFormData({
            email: "",
            password: "",
            name: "",
          });
        } else if (response.is_exists) {
          setError(
            "User with this email already exists. Please sign in instead.",
          );
        } else {
          setError("Failed to create account. Please try again.");
        }
      }
    } catch (err) {
      console.error("Authentication error:", err);
      setError("An unexpected error occurred. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleForm = () => {
    setIsSignIn(!isSignIn);
    setError(null);
    setSuccessMessage(null);
    setIsForgotPassword(false);
  };

  const handleBackToSignIn = () => {
    setIsForgotPassword(false);
    setError(null);
    setSuccessMessage(null);
  };

  const isSignInRef = useRef(isSignIn);

  useEffect(() => {
    isSignInRef.current = isSignIn; // Update ref whenever state changes
  }, [isSignIn]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("isSignIn", isSignInRef.current); // Now it always gets the latest value!
      console.log("user", user);
      if (isSignInRef.current) {
        if (user) {
          const response = await userSignin({
            email: user.email as string,
            password: "",
            provider: Provider.Google,
          });
          if (response.is_valid) {
            setSuccessMessage("Sign in successful! Redirecting...");
            await getUserLogout();
            // Redirect to homepage after successful login
            setTimeout(() => {
              onClose();
              navigate("/");
            }, 1500);
            refreshUser();
          } else {
            if (!response.is_exists) {
              setError(
                "User does not exist. Please check your email or sign up.",
              );
            } else {
              setError(
                "Invalid credentials. Please check your email and password.",
              );
            }
          }
        }
      } else {
        if (user) {
          console.log("sending request");
          const response = await userSignup({
            email: user.email as string,
            password: "",
            name: user.displayName as string,
            provider: Provider.Google,
          });
          if (response.is_created) {
            setSuccessMessage(
              "Account created successfully! You can now sign in.",
            );
            // Switch to sign in form after successful signup
            setTimeout(() => {
              setIsSignIn(true);
              setSuccessMessage(null);
            }, 2000);
          } else if (response.is_exists) {
            setError(
              "User with this email already exists. Please sign in instead.",
            );
          } else {
            setError("Failed to create account. Please try again.");
          }
        }
      }
      await getUserLogout();
    });

    return () => {
      unsubscribe();
    };
  });

  const handleSignInWithGoogle = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      toast(`Failed to sign in with Google: ${error}`);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-20">
      <div
        className="absolute inset-0 bg-black opacity-50"
        onClick={onClose}
      ></div>

      <div className="bg-white rounded-lg p-8 w-full max-w-md z-30 relative">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {isForgotPassword
            ? "Reset Password"
            : isSignIn
              ? "Sign In to Jobify"
              : "Create an Account"}
        </h2>

        {/* Error message */}
        {error && (
          <div
            className={`${showResendVerification ? "" : "mb-4"} p-3 bg-red-100 border border-red-400 text-red-700 rounded`}
          >
            {error}
          </div>
        )}

        {/* Success message */}
        {successMessage && (
          <div
            className={`${showResendVerification ? "" : "mb-4"} p-3 bg-green-100 border border-green-400 text-green-700 rounded`}
          >
            {successMessage}
          </div>
        )}

        {showResendVerification && (
          <ResendVerification resendEmail={resendEmail} />
        )}

        {showPleaseLogin && (
          <div className="mb-4 p-3 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
            Please sign in/sign up to access this feature.
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Conditional rendering based on current form state */}
          {!isForgotPassword ? (
            <>
              <Button
                type="button"
                variant={"outline"}
                className="w-full text-gray-500 text-sm border-[1px] border-gray-500 relative p-2.5 rounded-full text-poppins flex justify-center items-center text-center gap-2 mb-2 transition-colors"
                onClick={handleSignInWithGoogle}
              >
                <div>
                  <i className="fa-brands fa-google text-lg"></i>
                </div>
                <div className="text-sm">Continue with google</div>
              </Button>

              {!isSignIn && (
                <div className="mb-4">
                  <label htmlFor="name" className="block text-gray-700 mb-2">
                    Name
                  </label>
                  <Input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    placeholder="Your full name"
                    required={!isSignIn}
                    disabled={isLoading}
                  />
                </div>
              )}

              <div className="mb-4">
                <label htmlFor="email" className="block text-gray-700 mb-2">
                  Email
                </label>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="your@email.com"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="mb-6">
                <label htmlFor="password" className="block text-gray-700 mb-2">
                  Password
                </label>
                <PasswordInput
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="••••••••"
                  required
                  disabled={isLoading}
                />
              </div>

              {!isSignIn && formData.password.length > 0 && (
                <PasswordConditions password={formData.password} />
              )}

              <Button
                type="submit"
                className={`w-full py-3 text-white rounded-full transition-colors text-base ${isLoading ? "opacity-70 cursor-not-allowed" : ""}`}
                disabled={isLoading}
                variant={"jobify"}
              >
                {isLoading ? (
                  <span>Processing...</span>
                ) : (
                  <span>{isSignIn ? "Sign In" : "Create Account"}</span>
                )}
              </Button>
            </>
          ) : (
            <>
              <div className="mb-4">
                <label htmlFor="email" className="block text-gray-700 mb-2">
                  Email
                </label>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="your@email.com"
                  required
                  disabled={isLoading}
                />
              </div>

              <Button
                type="submit"
                variant={"jobify"}
                className={`w-full py-3 text-white rounded-full transition-colors ${isLoading ? "opacity-70 cursor-not-allowed" : ""}`}
                disabled={isLoading}
              >
                {isLoading ? "Sending..." : "Send Reset Link"}
              </Button>
            </>
          )}
        </form>

        <div className="mt-4 text-center">
          {!isForgotPassword ? (
            <>
              <p className="text-gray-600">
                {isSignIn
                  ? "Don't have an account?"
                  : "Already have an account?"}
                <Button
                  onClick={toggleForm}
                  variant="link"
                  className="text-base pl-2"
                  disabled={isLoading}
                >
                  {isSignIn ? "Sign Up" : "Sign In"}
                </Button>
              </p>
              {isSignIn && (
                <p className="mt-2 text-gray-600">
                  <Button
                    onClick={() => setIsForgotPassword(true)}
                    variant="link"
                    className="text-base"
                    disabled={isLoading}
                  >
                    Forgot Password?
                  </Button>
                </p>
              )}
            </>
          ) : (
            <p className="text-gray-600">
              <Button
                onClick={handleBackToSignIn}
                variant="link"
                className="text-base"
                disabled={isLoading}
              >
                Back to Sign In
              </Button>
            </p>
          )}
        </div>
        <Button
          className="text-gray-500 hover:text-gray-700 text-sm text-center w-full"
          onClick={onClose}
          variant="link"
          disabled={isLoading}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default AuthForms;
