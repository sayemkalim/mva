import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const fetchFolders = async (slug) => {
  try {
    const apiResponse = await apiService({
      endpoint: `${endpoints.documentiGetFolders}/${slug}`,
    });
    return apiResponse;
  } catch (error) {
    console.error("Error fetching folders:", error);
    throw error;
  }
};