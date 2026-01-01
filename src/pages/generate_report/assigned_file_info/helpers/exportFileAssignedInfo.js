import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const exportFileAssignedInfo = async (filters) => {
  try {
    const apiResponse = await apiService({
      endpoint: endpoints.fileAssignedInfo,
      method: "POST",
      data: filters,
      headers: {
        "Content-Type": "application/json",
      },
    });

    return apiResponse;
  } catch (error) {
    console.error("Error exporting file assigned information:", error);
    throw error;
  }
};

export const getFileAssignedMetadata = async () => {
  try {
    const apiResponse = await apiService({
      endpoint: endpoints.fileAssignedInfoMeta,
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    return apiResponse;
  } catch (error) {
    console.error("Error fetching file assigned metadata:", error);
    throw error;
  }
};
