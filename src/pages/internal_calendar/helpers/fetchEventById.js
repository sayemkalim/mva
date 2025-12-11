import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const fetchEventById = async (id) => {
  try {
    if (!id) {
      return { response: { event: null } };
    }

    const apiResponse = await apiService({
      endpoint: `${endpoints.eventShow}/${id}`,
      method: "GET",
    });
    return apiResponse;
  } catch (error) {
    console.error("Error fetching event:", error);
    throw error;
  }
};

