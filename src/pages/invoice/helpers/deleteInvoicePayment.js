import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const deleteInvoicePayment = async (paymentId) => {
  const response = await apiService({
    endpoint: `${endpoints.invoicePaymentDelete}/${paymentId}`,
    method: "DELETE",
  });
  return response;
};
