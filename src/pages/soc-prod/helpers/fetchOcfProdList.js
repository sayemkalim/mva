import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const fetchSocProdList = async (slug, params) => {
  try {
    let endpoint = `${endpoints.socProdList}/${slug}`;

    if (params) {
      const searchParams = new URLSearchParams();
      if (params.page) searchParams.append("page", params.page);
      if (params.per_page) searchParams.append("per_page", params.per_page);
      if (params.search) searchParams.append("search", params.search);
      if (searchParams.toString()) {
        endpoint += `?${searchParams.toString()}`;
      }
    }

    const apiResponse = await apiService({
      endpoint,
    });

    console.log("ApFull API response:", apiResponse);
    return apiResponse;
  } catch (error) {
    console.error("Error fetching SOC production list:", error);
    throw error;
  }
};
