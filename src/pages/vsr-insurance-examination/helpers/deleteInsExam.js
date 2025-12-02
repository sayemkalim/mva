import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const deleteVsrInsuranceExamination = async (id) => {
  try {
    const apiResponse = await apiService({
      endpoint: `${endpoints.deleteVsrInsuranceExamination}/${id}`,
      method: "DELETE",
    });

    return apiResponse;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
