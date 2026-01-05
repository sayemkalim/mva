import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const showThirdPartyInvoice = async (id) => {
  try {
    const apiResponse = await apiService({
      endpoint: `${endpoints.thirdPartyInvoiceShow}/${id}`,
      method: "GET",
    });
    console.log("API Response:", apiResponse?.response);
    return apiResponse.response;
  } catch (error) {
    console.error("Error fetching third party invoice list:", error);
    throw error;
  }
};