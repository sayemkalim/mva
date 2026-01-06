import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const saveInvoiceWriteOff = async (payload) => {
  const response = await apiService({
    endpoint: `${endpoints.invoiceWriteOff}`,
    method: "POST",
    data: payload,
  });
  return response;
};

