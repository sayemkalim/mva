import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const fetchSent = async (page = 1) => {
  try {
    const apiResponse = await apiService({
      endpoint: `${endpoints.sent}?page=${page}`,
    });

    console.log("Sent API response:", apiResponse);
    return apiResponse;
  } catch (error) {
    console.error("Error fetching Sent:", error);
    throw error;
  }
};
