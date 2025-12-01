import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const deleteInsuranceDoc = async (id) => {
  try {
    const apiResponse = await apiService({
      endpoint: `${endpoints.deleteInsuranceDoc}/${id}`,
      method: "DELETE",
    });

    return apiResponse;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
