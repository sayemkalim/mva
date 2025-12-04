import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const deleteStatutory = async (recordId) => {
  try {
    const apiResponse = await apiService({
      endpoint: `${endpoints.deleteStatutory}/${recordId}`,
      method: "DELETE",
    });

    return apiResponse;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
