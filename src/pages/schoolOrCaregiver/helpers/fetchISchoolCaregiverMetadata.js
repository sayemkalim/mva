import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const getSchoolCaregiverMeta = async () => {
  try {
    const apiResponse = await apiService({
      endpoint: `${endpoints.schoolCaregiverMeta}`,
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    return apiResponse;
  } catch (error) {
    console.error("Error fetching Employment meta:", error);
    throw error;
  }
};
