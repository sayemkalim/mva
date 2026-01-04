import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const createAccount = async (accountData, slug) => {
  try {
    const apiResponse = await apiService({
      endpoint: endpoints.accounts,
      method: "POST",
      data: { ...accountData, slug },
    });
    return apiResponse;
  } catch (error) {
    console.error("Error creating account:", error);
    throw error;
  }
};

