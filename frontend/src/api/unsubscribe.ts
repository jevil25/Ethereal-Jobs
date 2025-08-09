import { constructServerUrlFromPath } from "../utils/helper";
import axios from "axios";
import showToast from "../components/ui/toast";
import { UnsubscribeEmailsRequest, UnsubscribeEmailsResponse } from "./types";

export const unsubscribeFromEmails = async (
  params: UnsubscribeEmailsRequest
): Promise<UnsubscribeEmailsResponse | null> => {
  try {
    const response = await axios.post(
      constructServerUrlFromPath(`/user/unsubscribe/${params.token}?type=${params.type}`),
    );
    return response.data as UnsubscribeEmailsResponse;
  } catch {
    showToast("Error unsubscribing from emails. Please try again.", "error");
    return null;
  }
};
