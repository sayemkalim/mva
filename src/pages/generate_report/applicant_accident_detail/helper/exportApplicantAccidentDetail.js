import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const exportApplicantAccidentDetail = async (filters) => {
  try {
    const apiResponse = await apiService({
      endpoint: endpoints.applicantAccidentDetail,
      method: "POST",
      data: filters,
      headers: {
        "Content-Type": "application/json",
      },
    });

    return apiResponse;
  } catch (error) {
    console.error("Error exporting applicant accident detail:", error);
    throw error;
  }
};
