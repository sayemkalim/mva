import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const fetchInbox = async (page = 1, search = "", slug) => {
  try {
    const apiResponse = await apiService({
      endpoint: endpoints.inbox,
      params: { page, search, slug },
    });

    console.log("Inbox API response:", apiResponse);
    return apiResponse;
  } catch (error) {
    console.error("Error fetching Inbox:", error);
    throw error;
  }
};
