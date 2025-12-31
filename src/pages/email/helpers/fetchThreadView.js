import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const fetchThreadView = async (threadId) => {
  try {
    const apiResponse = await apiService({
      endpoint: `${endpoints.threadView}/${threadId}`,
      method: "GET",
    });
    return apiResponse;
  } catch (error) {
    console.error("Error fetching thread view:", error);
    throw error;
  }
};

