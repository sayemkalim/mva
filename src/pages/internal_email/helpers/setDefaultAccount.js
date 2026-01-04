import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const setDefaultAccount = async (accountId) => {
  try {
    const apiResponse = await apiService({
      endpoint: `${endpoints.defaultAccount}/${accountId}`,
      method: "GET",
    });
    return apiResponse;
  } catch (error) {
    console.error("Error setting default account:", error);
    throw error;
  }
};
