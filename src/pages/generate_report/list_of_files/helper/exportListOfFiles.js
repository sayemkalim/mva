import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const exportListOfFiles = async (filters) => {
  try {
    const apiResponse = await apiService({
      endpoint: endpoints.listOfFile,
      method: "POST",
      data: filters,
      headers: {
        "Content-Type": "application/json",
      },
    });

    return apiResponse;
  } catch (error) {
    console.error("Error exporting list of files:", error);
    throw error;
  }
};