import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const fetchOcfProd3List = async (slug) => {
  try {
    const apiResponse = await apiService({
      endpoint: `${endpoints.ocfProd5List}/${slug}`,
    });

    console.log("ApFull API response:", apiResponse);
    return apiResponse;
  } catch (error) {
    console.error("Error fetching workstation list:", error);
    throw error;
  }
};
