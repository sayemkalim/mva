import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const fetchEventMeta = async () => {
  try {
    const apiResponse = await apiService({
      endpoint: `${endpoints.eventMeta}`,
      method: "GET",
    });
    return apiResponse;
  } catch (error) {
    console.error("Error fetching event meta:", error);
    throw error;
  }
};

