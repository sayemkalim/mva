import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const unlinkInvoice = async (id) => {
  try {
    const apiResponse = await apiService({
      endpoint: `${endpoints.unlinkThirdPartyInvoice}/${id}`,
      method: "DELETE",
    });
    return apiResponse.response;
  } catch (error) {
    console.error("Error updating third party invoice:", error);
    throw error;
  }
};