import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const saveInvoicePaymentTrust = async (slug, payload) => {
  try {
    const apiResponse = await apiService({
      endpoint: `${endpoints.invoicePaymentSaveTrust}`,
      method: "POST",
      data: payload,
    });
    return apiResponse.response;
  } catch (error) {
    console.error("Error adding cost:", error);
    throw error;
  }
};
