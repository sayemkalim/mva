import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const deleteTask = async (id) => {
  try {
    const apiResponse = await apiService({
      endpoint: `${endpoints.deleteTask}/${id}`,
      method: "DELETE",
    });

    return apiResponse;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
export const deleteReminder = async (id) => {
  try {
    const apiResponse = await apiService({
      endpoint: `${endpoints.deleteReminder}/${id}`,
      method: "DELETE",
    });

    return apiResponse;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
export const deleteAttachment = async (id) => {
  try {
    const apiResponse = await apiService({
      endpoint: `${endpoints.deleteAttachment}/${id}`,
      method: "DELETE",
    });

    return apiResponse;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
