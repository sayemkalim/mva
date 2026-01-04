import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const deleteDeposit = async (id) => {
  try {
    const apiResponse = await apiService({
      endpoint: `${endpoints.depositDelete}/${id}`,
      method: "DELETE",
    });
    return apiResponse.response;
  } catch (error) {
    console.error("Error deleting deposit:", error);
    throw error;
  }
};
