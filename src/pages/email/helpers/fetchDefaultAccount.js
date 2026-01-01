import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const fetchDefaultAccount = async () => {
  try {
    const apiResponse = await apiService({
      endpoint: endpoints.defaultAccount,
      method: "GET",
    });
    return apiResponse;
  } catch (error) {
    console.error("Error fetching default account:", error);
    throw error;
  }
};

