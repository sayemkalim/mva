import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const fetchPayBillsList = async (id) => {
  try {
    const apiResponse = await apiService({
      endpoint: `${endpoints.payBillsList}/${id}`,
      method: "GET",
    });
    console.log("API Response:", apiResponse?.response);
    return apiResponse.response?.data;
  } catch (error) {
    console.error("Error fetching third party invoice list:", error);
    throw error;
  }
};
