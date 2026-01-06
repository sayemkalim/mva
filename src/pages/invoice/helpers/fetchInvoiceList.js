import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const fetchInvoiceList = async (slug, page = 1, perPage = 25) => {
  try {
    const apiResponse = await apiService({
      endpoint: `${endpoints.invoiceList}/${slug}?page=${page}&per_page=${perPage}`,
      method: "GET",
    });
    return apiResponse.response;
  } catch (error) {
    console.error("Error fetching invoice list:", error);
    throw error;
  }
};
