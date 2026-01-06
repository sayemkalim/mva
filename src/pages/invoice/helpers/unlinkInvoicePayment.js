import { apiService } from "@/api/api_service/apiService";

export const unlinkInvoicePayment = async (invoiceId) => {
  const { response, error } = await apiService({
    endpoint: `api/v2/file/accounting/invoice-payments/unlink-payment/${invoiceId}`,
    method: "DELETE",
  });

  if (error) {
    throw new Error("Failed to unlink payment");
  }

  return response;
};
