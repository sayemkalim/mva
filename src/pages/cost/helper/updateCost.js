import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const updateCost = async (payload, id) => {
  try {
    const apiResponse = await apiService({
      endpoint: `${endpoints.updateCost}/${id}`,
      method: "POST",
      data: payload,
    });
    return apiResponse.response;
  } catch (error) {
    console.error("Error updating cost:", error);
    throw error;
  }
};
