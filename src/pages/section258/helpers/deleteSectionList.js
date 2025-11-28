import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const deleteSectionList = async (id) => {
  try {
    const apiResponse = await apiService({
      endpoint: `${endpoints.deleteSection258List}/${id}`,
      method: "DELETE",
    });

    return apiResponse;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
