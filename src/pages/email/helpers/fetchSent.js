import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const fetchSent = async (page = 1, search = "") => {
  try {
    const apiResponse = await apiService({
      endpoint: endpoints.sent,
      params: { page, search },
    });

    console.log("Sent API response:", apiResponse);
    return apiResponse;
  } catch (error) {
    console.error("Error fetching Sent:", error);
    throw error;
  }
};
