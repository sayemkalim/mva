import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const fetchClientCorrespondanceList = async (slug) => {
  try {
    const apiResponse = await apiService({
      endpoint: `${endpoints.clientCorrespondenceList}/${slug}`,
    });

    console.log("ApFull API response:", apiResponse);
    return apiResponse;
  } catch (error) {
    console.error("Error fetching fetchList list:", error);
    throw error;
  }
};
