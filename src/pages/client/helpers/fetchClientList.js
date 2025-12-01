import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const fetchClientList = async (slug) => {
  try {
    const apiResponse = await apiService({
      endpoint: `${endpoints.clientList}/${slug}`,
    });

    console.log("ApFull API response:", apiResponse);
    return apiResponse;
  } catch (error) {
    console.error("Error fetching fetchLatList list:", error);
    throw error;
  }
};
