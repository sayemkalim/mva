import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const createInvoice = async (slug, data) => {
  const response = await apiService({
    endpoint: `${endpoints.invoiceCreate}/${slug}`,
    method: "POST",
    data: data,
  });
  return response;
};
