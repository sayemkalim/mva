import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const fetchLatList = async (slug) => {
  try {
    const apiResponse = await apiService({
      endpoint: `${endpoints.latList}/${slug}`,
    });

    console.log("ApFull API response:", apiResponse);
    return apiResponse;
  } catch (error) {
    console.error("Error fetching fetchLatList list:", error);
    throw error;
  }
};
