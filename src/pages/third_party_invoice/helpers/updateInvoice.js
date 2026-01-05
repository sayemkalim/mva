import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const updateInvoice = async (payload, id) => {
  try {
    const apiResponse = await apiService({
      endpoint: `${endpoints.updateThirdPartyInvoice}/${id}`,
      method: "POST",
      data: payload,
    });
    return apiResponse.response;
  } catch (error) {
    console.error("Error updating third party invoice:", error);
    throw error;
  }
};
