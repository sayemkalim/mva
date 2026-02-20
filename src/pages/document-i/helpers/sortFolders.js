import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const sortFolders = async (items) => {
  try {
    const apiResponse = await apiService({
      endpoint: `${endpoints.sortFolders}`,
      method: "POST",
      data: { items },
    });
    return apiResponse;
  } catch (error) {
    console.error("Error sorting folders:", error);
    throw error;
  }
};