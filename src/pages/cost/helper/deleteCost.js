import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const deleteCost = async (id) => {
  try {
    const apiResponse = await apiService({
      endpoint: `${endpoints.deleteCost}/${id}`,
      method: "DELETE",
    });
    return apiResponse.response;
  } catch (error) {
    console.error("Error deleting cost:", error);
    throw error;
  }
};
