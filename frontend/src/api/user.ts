/* eslint-disable @typescript-eslint/no-unused-vars */
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
  UnsubscribeEmailsRequest,
  UnsubscribeEmailsResponse,
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
        user: null,
        message: "User not found. Please sign in again.",
        needsLogin: true,
      };
    } else if (errorMessage == "User not logged in") {
      return {
        user: null,
        message: "User not found. Please sign in again.",
        needsLogin: true,
      };
    }
    return {
      user: null,
      message: "User not found. Please sign in again.",
      needsLogin: true,
    };
  } catch (error) {
    // showToast("Error fetching user details. Please try again.", "error");
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
    console.error("Email verification error:", error);
    return null;
  }
};


export const unsubscribeFromEmails = async (
  params: UnsubscribeEmailsRequest
): Promise<UnsubscribeEmailsResponse | null> => {
  try {
    const response = await axios.post(
      constructServerUrlFromPath(`/user/unsubscribe/${params.token}?type=${params.type}`),
    );
    return response.data as UnsubscribeEmailsResponse;
  } catch (error) {
    showToast("Error unsubscribing from emails. Please try again.", "error");
    return null;
  }
};

// post /user/update-name
export const updateName = async (name: string): Promise<User | undefined> => {
  try {
    const response = await axios.post(
      constructServerUrlFromPath("/user/update-name"),
      { name },
    );
    if (response.data.detail === "Token expired") {
      await userRefresh();
      return await axios
        .post(constructServerUrlFromPath("/user/update-name"), { name })
        .then((res) => res.data.is_success);
    }
    if (response.data.is_updated) {
      return response.data.user;
    }
    return undefined;
  } catch (error) {
    showToast("Error updating name. Please try again.", "error");
    return undefined;
  }
};

// post user/feedback
export const sendFeedback = async (
  page: string,
  message: string,
): Promise<boolean> => {
  try {
    const response = await axios.post(
      constructServerUrlFromPath("/user/feedback"),
      { page, message },
    );
    if (response.data.detail === "Token expired") {
      await userRefresh();
      return await axios
        .post(constructServerUrlFromPath("/user/feedback"), { page, message })
        .then((res) => res.data.is_success);
    }
    return response.data.is_success;
  } catch (error) {
    showToast("Error sending feedback. Please try again.", "error");
    return false;
  }
};
