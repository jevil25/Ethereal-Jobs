import { UserSigninRequest, UserSigninResponse, UserSignupRequest, UserSignupResponse, ResetPasswordRequest, ResetPasswordResponse, ResetPasswordCheckRequest, ResetPasswordCheckResponse, ResetPasswordUpdateRequest, ResetPasswordUpdateResponse } from "./types";
import { constructServerUrlFromPath } from "../utils/helper";
import axios from 'axios';
import { User } from "../types/data";

// post /user/register
export const userSignup = async (params: UserSignupRequest): Promise<UserSignupResponse> => {
    const response = await axios.post(constructServerUrlFromPath('/user/register'), params);
    return response.data as UserSignupResponse;
}

// post /user/login
export const userSignin = async (params: UserSigninRequest): Promise<UserSigninResponse> => {
    const response = await axios.post(constructServerUrlFromPath('/user/login'), params);
    return response.data as UserSigninResponse;
}

// get /user/logout
export const userSignout = async () => {
    await axios.post(constructServerUrlFromPath('/user/logout'));
}

// get /user/me
export const userMe = async () => {
    const response = await axios.get(constructServerUrlFromPath('/user/me'));
    if (response.data.detail === "user logged in") {
        return {
            user: response.data.user as User,
            needsLogin: false
        }
    }
    const errorMessage = response.data.detail;
    if (errorMessage == "Token expired") {
        const refresh = await userRefresh();
        if (refresh.status === 200) {
            return {
                user: refresh.data.user as User,
                needsLogin: false
            }
        }
        return {
            message: "User not found. Please sign in again.",
            needsLogin: true
        }
    }
    return {
        message: "User not found. Please sign in again.",
        needsLogin: true
    }
}

// post /user/refresh
export const userRefresh = async () => {
    return await axios.post(constructServerUrlFromPath('/user/refresh'));
}

// post /reset-password
export const sendPasswordResetEmail = async (params: ResetPasswordRequest): Promise<ResetPasswordResponse> => {
    const response = await axios.post(constructServerUrlFromPath('/user/reset-password'), params);
    return response.data as ResetPasswordResponse;
}

export const checkIfResetPasswordTokenIsValid = async (params: ResetPasswordCheckRequest): Promise<ResetPasswordCheckResponse> => {
    const response = await axios.post(constructServerUrlFromPath(`/user/reset-password/${params.token}/check`));
    return response.data as ResetPasswordCheckResponse;
}

export const updatePasswordWithToken = async (params: ResetPasswordUpdateRequest): Promise<ResetPasswordUpdateResponse> => {
    const response = await axios.post(constructServerUrlFromPath(`/user/reset-password/${params.token}/update`), params);
    return response.data as ResetPasswordUpdateResponse;
}
