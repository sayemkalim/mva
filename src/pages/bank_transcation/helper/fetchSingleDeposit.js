import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const fetchSingleDeposit = async (id) => {
  try {
    const apiResponse = await apiService({
      endpoint: `${endpoints.depositShow}/${id}`,
      method: "GET",
    });
    console.log("API Response:", apiResponse?.response);
    return apiResponse.response;
  } catch (error) {
    console.error("Error fetching deposit list:", error);
    throw error;
  }
};
