import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const deleteInvoice = async (id) => {
  try {
    const apiResponse = await apiService({
      endpoint: `${endpoints.deleteThirdPartyInvoice}/${id}`,
      method: "DELETE",
    });
    return apiResponse.response;
  } catch (error) {
    console.error("Error deleting third party invoice:", error);
    throw error;
  }
};