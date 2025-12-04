import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const deletePharmacy = async (recordId) => {
  try {
    const apiResponse = await apiService({
      endpoint: `${endpoints.deletePharmacy}/${recordId}`,
      method: "DELETE",
    });

    return apiResponse;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
