import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const fetchInvoicePaymentDetail = async (invoiceId) => {
  const response = await apiService({
    endpoint: `${endpoints.invoicePaymentDetail}/${invoiceId}`,
    method: "GET",
  });
  return response;
};
