import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const fetchVsrInsExamList = async (slug) => {
  try {
    const apiResponse = await apiService({
      endpoint: `${endpoints.vsrInsuranceExaminationList}/${slug}`,
    });

    console.log("ApFull API response:", apiResponse);
    return apiResponse;
  } catch (error) {
    console.error("Error fetching fetchList list:", error);
    throw error;
  }
};
