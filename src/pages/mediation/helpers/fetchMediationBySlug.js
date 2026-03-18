import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const fetchMediationBySlug = async (slug) => {
  if (!slug) {
    throw new Error("Slug is required to fetch mediation");
  }

  try {
    const apiResponse = await apiService({
      endpoint: `${endpoints.mediationShow}/${slug}`,
      method: "GET",
    });

    if (apiResponse?.data?.response?.data) {
      return apiResponse.data.response.data;
    } else if (apiResponse?.response?.data) {
      return apiResponse.response.data;
    } else if (apiResponse?.data) {
      return apiResponse.data;
    } else if (apiResponse?.response) {
      return apiResponse.response;
    }

    // Fallback: if apiResponse is the direct array or object itself
    return apiResponse;
  } catch (error) {
    console.error("Error fetching mediation:", error);
    throw error;
  }
};
