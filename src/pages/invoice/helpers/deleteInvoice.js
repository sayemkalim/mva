import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const deleteInvoice = async (invoiceId) => {
  const response = await apiService({
    endpoint: `${endpoints.invoiceDelete}/${invoiceId}`,
    method: "DELETE",
  });
  return response;
};
