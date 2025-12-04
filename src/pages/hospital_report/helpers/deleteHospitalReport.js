import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const deleteHospitalReport = async (recordId) => {
  try {
    const apiResponse = await apiService({
      endpoint: `${endpoints.deleteHospitalReport}/${recordId}`,
      method: "DELETE",
    });

    return apiResponse;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
