import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const fetchEventList = async (calendarId) => {
  try {
    if (!calendarId) {
      return { response: { events: [] } };
    }
    
    const apiResponse = await apiService({
      endpoint: `${endpoints.eventList}/${calendarId}`,
      method: "GET",
    });
    return apiResponse;
  } catch (error) {
    console.error("Error fetching event list:", error);
    throw error;
  }
};
