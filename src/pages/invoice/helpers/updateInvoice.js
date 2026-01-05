import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const updateInvoice = async (invoiceId, data) => {
  const response = await apiService({
    endpoint: `${endpoints.invoiceUpdate}/${invoiceId}`,
    method: "POST",
    data: data,
  });
  return response;
};
