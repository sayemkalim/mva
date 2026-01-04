import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const fetchList = async (slug, page = 1, per_page = 25) => {
  try {
    const apiResponse = await apiService({
      endpoint: `${endpoints.accountList}/${slug}`,
      method: "GET",
      params: { page, per_page },
    });
    console.log("API Response:", apiResponse);
    return apiResponse?.response;
  } catch (error) {
    console.error("Error fetching cost list:", error);
    throw error;
  }
};
