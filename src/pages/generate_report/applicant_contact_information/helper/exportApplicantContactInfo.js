import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const exportApplicantContactInfo = async (filters) => {
  try {
    const apiResponse = await apiService({
      endpoint: endpoints.applicantContactInfo,
      method: "POST",
      data: filters,
      headers: {
        "Content-Type": "application/json",
      },
    });

    return apiResponse;
  } catch (error) {
    console.error("Error exporting applicant contact information:", error);
    throw error;
  }
};
