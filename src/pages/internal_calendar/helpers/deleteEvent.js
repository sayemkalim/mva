import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const deleteEvent = async (id) => {
  try {
    const apiResponse = await apiService({
      endpoint: `${endpoints.deleteEvent}/${id}`,
      method: "DELETE",
    });
    return apiResponse;
  } catch (error) {
    console.error("Error deleting event:", error);
    throw error;
  }
};

