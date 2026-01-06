import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const fetchAccounts = async (slug) => {
  try {
    const apiResponse = await apiService({
      endpoint: endpoints.accounts,
      method: "GET",
      params: { slug },
    });
    return apiResponse;
  } catch (error) {
    console.error("Error fetching accounts:", error);
    throw error;
  }
};

