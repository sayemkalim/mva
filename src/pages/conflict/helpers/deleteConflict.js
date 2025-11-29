import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const deleteConflict = async (id) => {
  try {
    const apiResponse = await apiService({
      endpoint: `${endpoints.deleteConflict}/${id}`,
      method: "DELETE",
    });

    return apiResponse;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
