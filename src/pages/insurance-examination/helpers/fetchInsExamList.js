import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const fetchInsExamList = async (slug) => {
  try {
    const apiResponse = await apiService({
      endpoint: `${endpoints.insuranceExaminationList}/${slug}`,
    });

    console.log("ApFull API response:", apiResponse);
    return apiResponse;
  } catch (error) {
    console.error("Error fetching fetchList list:", error);
    throw error;
  }
};
