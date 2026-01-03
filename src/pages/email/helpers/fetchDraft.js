import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const fetchDraft = async (page = 1, search = "") => {
  try {
    const apiResponse = await apiService({
      endpoint: endpoints.draft,
      params: { page, search },
    });

    console.log("Inbox API response:", apiResponse);
    return apiResponse;
  } catch (error) {
    console.error("Error fetching Inbox:", error);
    throw error;
  }
};
