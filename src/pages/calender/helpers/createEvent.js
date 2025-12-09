import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const createEvent = async (data) => {
  try {
    const apiResponse = await apiService({
      endpoint: `${endpoints.createEvent}`,
      method: "POST",
      data: data,
      headers: {
        "Content-Type": "application/json",
      },
    });
    return apiResponse;
  } catch (error) {
    console.error("Error creating event:", error);
    throw error;
  }
};

export const updateEvent = async (id, data) => {
  try {
    if (!id) throw new Error("ID is required for updating event");

    const apiResponse = await apiService({
      endpoint: `${endpoints.updateEvent}/${id}`,
      method: "POST",
      data,
      headers: {
        "Content-Type": "application/json",
      },
    });
    return apiResponse;
  } catch (error) {
    console.error("Error updating event:", error);
    throw error;
  }
};
