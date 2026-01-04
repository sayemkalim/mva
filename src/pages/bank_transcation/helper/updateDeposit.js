import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const updateDeposit = async (payload, id) => {
  try {
    const apiResponse = await apiService({
      endpoint: `${endpoints.depositUpdate}/${id}`,
      method: "POST",
      data: payload,
    });
    return apiResponse.response;
  } catch (error) {
    console.error("Error updating deposit:", error);
    throw error;
  }
};
