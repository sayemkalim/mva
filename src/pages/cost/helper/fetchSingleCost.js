import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const fetchSingleCost = async (id) => {
  try {
    const apiResponse = await apiService({
      endpoint: `${endpoints.singleCost}/${id}`,
      method: "GET",
    });
    return apiResponse.response;
  } catch (error) {
    console.error("Error fetching dashboard:", error);
    throw error;
  }
};
