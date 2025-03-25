import { constructServerUrlFromPath } from "../utils/helper";
import axios from "axios";
import { userRefresh } from "./user";
import showToast from "../components/ui/toast";
import { User } from "../types/data";
import { Feedback, UsageStats } from "./types";


export const getAllUsers = async (): Promise<User[]> => {
    try {
        const response = await axios.get(constructServerUrlFromPath("/admin/users"));
        if (
        response.data &&
        response.data.detail &&
        response.data.detail === "Token expired"
        ) {
        await userRefresh();
        return await axios
            .get(constructServerUrlFromPath("/admin/users"))
            .then((res) => res.data as User[]);
        }
    
        return response.data as User[];
    } catch (error: any) {
        showToast(
        "Error fetching users: " + (error.message || "Unknown error"),
        "error",
        );
        console.error("Error fetching users: " + (error.message || "Unknown error"));
        throw error;
    }
};

export const getFeedbacks = async (): Promise<Feedback[]> => {
    try {
        const response = await axios.get(constructServerUrlFromPath("/admin/feedback"));
        if (
        response.data &&
        response.data.detail &&
        response.data.detail === "Token expired"
        ) {
        await userRefresh();
        return await axios
            .get(constructServerUrlFromPath("/feedback"))
            .then((res) => res.data);
        }
    
        return response.data;
    } catch (error: any) {
        showToast(
        "Error fetching feedback: " + (error.message || "Unknown error"),
        "error",
        );
        console.error("Error fetching feedback: " + (error.message || "Unknown error"));
        throw error;
    }
}

export const getUsageStats = async (): Promise<UsageStats[]> => {
    try {
        const response = await axios.get(constructServerUrlFromPath("/admin/usage-stats"));
        if (
        response.data &&
        response.data.detail &&
        response.data.detail === "Token expired"
        ) {
        await userRefresh();
        return await axios
            .get(constructServerUrlFromPath("admin/usage-stats"))
            .then((res) => res.data);
        }
    
        return response.data;
    } catch (error: any) {
        showToast(
        "Error fetching usage stats: " + (error.message || "Unknown error"),
        "error",
        );
        console.error("Error fetching usage stats: " + (error.message || "Unknown error"));
        throw error;
    }
}
