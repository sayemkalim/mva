import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const fetchList = async (slug, page = 1, perPage = 25) => {
  try {
    const apiResponse = await apiService({
      endpoint: `${endpoints.thirdPartyInvoiceList}/${slug}?page=${page}&per_page=${perPage}`,
      method: "GET",
    });
    console.log("API Response:", apiResponse?.response);
    return apiResponse.response;
  } catch (error) {
    console.error("Error fetching third party invoice list:", error);
    throw error;
  }
};
