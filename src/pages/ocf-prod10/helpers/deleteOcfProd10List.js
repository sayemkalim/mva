import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const deleteOcfProd10List = async (id) => {
  try {
    const apiResponse = await apiService({
      endpoint: `${endpoints.deleteOcfProd10List}/${id}`,
      method: "DELETE",
    });

    return apiResponse;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
