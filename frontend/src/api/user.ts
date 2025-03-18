import {
  UserSigninRequest,
  UserSigninResponse,
  UserSignupRequest,
  UserSignupResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  ResetPasswordCheckRequest,
  ResetPasswordCheckResponse,
  ResetPasswordUpdateRequest,
  ResetPasswordUpdateResponse,
  sendVerificationEmailRequest,
  sendVerificationEmailResponse,
  verifyEmailRequest,
  verifyEmailResponse,
} from "./types";
import { constructServerUrlFromPath } from "../utils/helper";
import axios from "axios";
import { User } from "../types/data";
import showToast from "../components/ui/toast";

export const userSignup = async (
  params: UserSignupRequest,
): Promise<UserSignupResponse | null> => {
  try {
    const response = await axios.post(
      constructServerUrlFromPath("/user/register"),
      params,
    );
    return response.data as UserSignupResponse;
  } catch (error) {
    showToast("Error signing up. Please try again.", "error");
    return null;
  }
};

export const userSignin = async (
  params: UserSigninRequest,
): Promise<UserSigninResponse | null> => {
  try {
    const response = await axios.post(
      constructServerUrlFromPath("/user/login"),
      params,
    );
    return response.data as UserSigninResponse;
  } catch (error) {
    showToast("Error signing in. Please check your credentials.", "error");
    return null;
  }
};

export const userSignout = async () => {
  try {
    await axios.post(constructServerUrlFromPath("/user/logout"));
    showToast("Successfully signed out.", "success");
  } catch (error) {
    showToast("Error signing out. Please try again.", "error");
  }
};

export const userMe = async () => {
  try {
    const response = await axios.get(constructServerUrlFromPath("/user/me"));
    if (response.data.detail === "user logged in") {
      return {
        user: response.data.user as User,
        needsLogin: false,
      };
    }
    const errorMessage = response.data.detail;
    if (errorMessage == "Token expired") {
      const refresh = await userRefresh();
      if (refresh.status === 200) {
        return {
          user: refresh.data.user as User,
          needsLogin: false,
        };
      }
      return {
        message: "User not found. Please sign in again.",
        needsLogin: true,
      };
    }
    return {
      message: "User not found. Please sign in again.",
      needsLogin: true,
    };
  } catch (error) {
    showToast("Error fetching user details. Please try again.", "error");
    return {
      message: "Error fetching user details.",
      needsLogin: true,
    };
  }
};

export const userRefresh = async () => {
  try {
    return await axios.post(constructServerUrlFromPath("/user/refresh"));
  } catch (error) {
    showToast("Error refreshing session. Please sign in again.", "error");
    throw error;
  }
};

export const sendPasswordResetEmail = async (
  params: ResetPasswordRequest,
): Promise<ResetPasswordResponse | null> => {
  try {
    const response = await axios.post(
      constructServerUrlFromPath("/user/reset-password"),
      params,
    );
    return response.data as ResetPasswordResponse;
  } catch (error) {
    showToast("Error sending password reset email. Please try again.", "error");
    return null;
  }
};

export const checkIfResetPasswordTokenIsValid = async (
  params: ResetPasswordCheckRequest,
): Promise<ResetPasswordCheckResponse | null> => {
  try {
    const response = await axios.post(
      constructServerUrlFromPath(`/user/reset-password/${params.token}/check`),
    );
    return response.data as ResetPasswordCheckResponse;
  } catch (error) {
    showToast("Invalid or expired reset token.", "error");
    return null;
  }
};

export const updatePasswordWithToken = async (
  params: ResetPasswordUpdateRequest,
): Promise<ResetPasswordUpdateResponse | null> => {
  try {
    const response = await axios.post(
      constructServerUrlFromPath(`/user/reset-password/${params.token}/update`),
      params,
    );
    return response.data as ResetPasswordUpdateResponse;
  } catch (error) {
    showToast("Error updating password. Please try again.", "error");
    return null;
  }
};

export const resendVerificationEmail = async (
  request: sendVerificationEmailRequest,
): Promise<sendVerificationEmailResponse | null> => {
  try {
    const response = await axios.post(
      constructServerUrlFromPath(`/user/resend-verification/${request.email}`),
    );
    return response.data as sendVerificationEmailResponse;
  } catch (error) {
    showToast("Error resending verification email. Please try again.", "error");
    return null;
  }
};

export const verifyEmail = async (
  request: verifyEmailRequest,
): Promise<verifyEmailResponse | null> => {
  try {
    const response = await axios.post(
      constructServerUrlFromPath(`/user/verify-email/${request.token}`),
    );
    return response.data as verifyEmailResponse;
  } catch (error) {
    showToast("Error verifying email. Please try again.", "error");
    return null;
  }
};
