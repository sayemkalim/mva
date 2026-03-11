import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const fetchPsychologicalList = async (slug, params) => {
  try {
    let endpoint = `${endpoints.psychologicalList}/${slug}`;

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
    console.error("Error fetching psychological list:", error);
    throw error;
  }
};
