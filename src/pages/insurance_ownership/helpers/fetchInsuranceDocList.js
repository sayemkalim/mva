import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const fetchInsuranceDocList = async (slug) => {
  try {
    const apiResponse = await apiService({
      endpoint: `${endpoints.insuranceDocList}/${slug}`,
    });

    console.log("ApFull API response:", apiResponse);
    return apiResponse;
  } catch (error) {
    console.error("Error fetching fetchInsuranceDocList list:", error);
    throw error;
  }
};
