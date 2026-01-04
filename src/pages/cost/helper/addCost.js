import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const addCost = async (payload, slug) => {
  try {
    const apiResponse = await apiService({
      endpoint: `${endpoints.addCost}/${slug}`,
      method: "POST",
      data: payload,
    });
    return apiResponse.response;
  } catch (error) {
    console.error("Error adding cost:", error);
    throw error;
  }
};