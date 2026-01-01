import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const exportApplicantInfo = async (filters) => {
  try {
    const apiResponse = await apiService({
      endpoint: endpoints.exportApplicantInfo,
      method: "POST",
      data: filters,
      headers: {
        "Content-Type": "application/json",
      },
    });

    return apiResponse;
  } catch (error) {
    console.error("Error exporting applicant information:", error);
    throw error;
  }
};

export const getExportMetadata = async () => {
  try {
    const apiResponse = await apiService({
      endpoint: endpoints.exportApplicantMeta,
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    return apiResponse;
  } catch (error) {
    console.error("Error fetching export metadata:", error);
    throw error;
  }
};
