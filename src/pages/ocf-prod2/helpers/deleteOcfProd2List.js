import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const deleteOcfProd2List = async (id) => {
  try {
    const apiResponse = await apiService({
      endpoint: `${endpoints.deleteOcfProd2List}/${id}`,
      method: "DELETE",
    });

    return apiResponse;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
