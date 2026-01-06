import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const payBill = async (payload) => {
  try {
    const apiResponse = await apiService({
      endpoint: `${endpoints.payBills}`,
      method: "POST",
      data: payload,
    });
    return apiResponse.response;
  } catch (error) {
    console.error("Error adding third party invoice:", error);
    throw error;
  }
};
