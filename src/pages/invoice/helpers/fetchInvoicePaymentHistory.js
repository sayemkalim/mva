import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const fetchInvoicePaymentHistory = async (invoiceId) => {
  try {
    const apiResponse = await apiService({
      endpoint: `${endpoints.invoicePaymentHistory}/${invoiceId}`,
      method: "GET",
    });
    return apiResponse.response;
  } catch (error) {
    console.error("Error fetching invoice details:", error);
    throw error;
  }
};
