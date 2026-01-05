import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const fetchUnbilledList = async (slug) => {
  const response = await apiService({
    endpoint: `${endpoints.invoiceUnbilledList}/${slug}`,
    method: "GET",
  });
  return response;
};
