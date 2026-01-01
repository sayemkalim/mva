import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const getVsrMeta = async () => {
  try {
    const apiResponse = await apiService({
      endpoint: endpoints.vsrMeta,
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    return apiResponse;
  } catch (error) {
    console.error("Error fetching VSR metadata:", error);
    throw error;
  }
};

export const exportVsr = async (filters) => {
  try {
    const apiResponse = await apiService({
      endpoint: endpoints.vsrExport,
      method: "POST",
      data: filters,
      headers: {
        "Content-Type": "application/json",
      },
    });

    return apiResponse;
  } catch (error) {
    console.error("Error exporting VSR:", error);
    throw error;
  }
};
