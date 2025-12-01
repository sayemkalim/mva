import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const fetchMedicalList = async (slug) => {
  try {
    const apiResponse = await apiService({
      endpoint: `${endpoints.medicalList}/${slug}`,
    });

    console.log("ApFull API response:", apiResponse);
    return apiResponse;
  } catch (error) {
    console.error("Error fetching fetchInsuranceDocList list:", error);
    throw error;
  }
};
