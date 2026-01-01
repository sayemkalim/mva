import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const fetchAccounts = async () => {
  try {
    const apiResponse = await apiService({
      endpoint: endpoints.accounts,
      method: "GET",
    });
    return apiResponse;
  } catch (error) {
    console.error("Error fetching accounts:", error);
    throw error;
  }
};

