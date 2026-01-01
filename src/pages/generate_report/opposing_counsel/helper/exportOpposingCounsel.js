import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const exportOpposingCounsel = async (filters) => {
  try {
    const apiResponse = await apiService({
      endpoint: endpoints.opposingCounselExport,
      method: "POST",
      data: filters,
      headers: {
        "Content-Type": "application/json",
      },
    });

    return apiResponse;
  } catch (error) {
    console.error("Error exporting opposing counsel:", error);
    throw error;
  }
};
