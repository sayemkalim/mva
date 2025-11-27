import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const deleteOwnerDirector = async (id) => {
  try {
    const apiResponse = await apiService({
      endpoint: `${endpoints.deleteOwnerDirector}/${id}`,
      method: "DELETE",
    });

    return apiResponse;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
