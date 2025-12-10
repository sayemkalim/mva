import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const deleteOcfProd3List = async (id) => {
  try {
    const apiResponse = await apiService({
      endpoint: `${endpoints.deleteOcfProd5List}/${id}`,
      method: "DELETE",
    });

    return apiResponse;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
