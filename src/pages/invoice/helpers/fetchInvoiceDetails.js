import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const fetchInvoiceDetails = async (invoiceId) => {
  try {
    const apiResponse = await apiService({
      endpoint: `${endpoints.invoiceShow}/${invoiceId}`,
      method: "GET",
    });
    return apiResponse.response;
  } catch (error) {
    console.error("Error fetching invoice details:", error);
    throw error;
  }
};
