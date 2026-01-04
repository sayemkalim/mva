import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const fetchThreadView = async (threadId, slug) => {
  try {
    const apiResponse = await apiService({
      endpoint: `${endpoints.threadView}/${threadId}`,
      method: "GET",
      params: { slug },
    });
    return apiResponse;
  } catch (error) {
    console.error("Error fetching thread view:", error);
    throw error;
  }
};

