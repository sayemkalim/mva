import { apiService } from "@/api/api_service/apiService";

export const fetchInvoiceWriteOff = async (invoiceId) => {
  const { response, error } = await apiService({
    endpoint: `api/v2/file/accounting/invoice-write-off/list/${invoiceId}`,
    method: "GET",
  });

  if (error) {
    throw new Error("Failed to fetch write-off data");
  }

  return response;
};
