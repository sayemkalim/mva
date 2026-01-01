import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const exportAdjustersOnFiles = async (filters) => {
  try {
    const apiResponse = await apiService({
      endpoint: endpoints.adjustersOnFilesExport,
      method: "POST",
      data: filters,
      headers: {
        "Content-Type": "application/json",
      },
    });

    return apiResponse;
  } catch (error) {
    console.error("Error exporting adjusters on files:", error);
    throw error;
  }
};
