import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const getPrimaryEhcMeta = async () => {
  try {
    const apiResponse = await apiService({
      endpoint: `${endpoints.primaryEhcmeta}`,
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    return apiResponse;
  } catch (error) {
    console.error("Error fetching Employment meta:", error);
    throw error;
  }
};
