import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const fetchMatterMetadata = async () => {
  try {
    const apiResponse = await apiService({
      endpoint: `${endpoints.matterMeta}`,
      method: "GET",
    });

    console.log("Matter Metadata API response:", apiResponse);
    return apiResponse;
  } catch (error) {
    console.error("Error fetching matter metadata:", error);
    throw error;
  }
};
