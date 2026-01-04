import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const fetchTrash = async (page = 1, search = "", slug) => {
  try {
    const apiResponse = await apiService({
      endpoint: endpoints.trashList,
      params: { page, search, slug },
      method: "GET",
    });
    return apiResponse;
  } catch (error) {
    console.error("Error fetching Trash:", error);
    throw error;
  }
};

