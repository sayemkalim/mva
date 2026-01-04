import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const addDeposit = async (payload, slug) => {
  try {
    const apiResponse = await apiService({
      endpoint: `${endpoints.depositSave}/${slug}`,
      method: "POST",
      data: payload,
    });
    return apiResponse.response;
  } catch (error) {
    console.error("Error adding deposit:", error);
    throw error;
  }
};
