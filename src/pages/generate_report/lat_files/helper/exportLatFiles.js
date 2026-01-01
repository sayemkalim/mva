import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const exportLatFiles = async (filters) => {
  try {
    const apiResponse = await apiService({
      endpoint: endpoints.latFilesExport,
      method: "POST",
      data: filters,
      headers: {
        "Content-Type": "application/json",
      },
    });

    return apiResponse;
  } catch (error) {
    console.error("Error exporting LAT files:", error);
    throw error;
  }
};
