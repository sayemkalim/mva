import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const getApplicantMeta = async () => {
  try {
    const apiResponse = await apiService({
      endpoint: `${endpoints.applicantMeta}`,
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    return apiResponse;
  } catch (error) {
    console.error("Error fetching applicant meta:", error);
    throw error;
  }
};
