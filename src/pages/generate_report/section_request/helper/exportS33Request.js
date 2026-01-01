import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const exportS33Request = async (filters) => {
  try {
    const apiResponse = await apiService({
      endpoint: endpoints.s33RequestExport,
      method: "POST",
      data: filters,
      headers: {
        "Content-Type": "application/json",
      },
    });

    return apiResponse;
  } catch (error) {
    console.error("Error exporting S33 request:", error);
    throw error;
  }
};
