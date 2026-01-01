import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const getVehicleOwnershipMeta = async () => {
  try {
    const apiResponse = await apiService({
      endpoint: endpoints.vehicleOwnershipMeta,
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    return apiResponse;
  } catch (error) {
    console.error("Error fetching vehicle ownership metadata:", error);
    throw error;
  }
};

export const exportMvaCases = async (filters) => {
  try {
    const apiResponse = await apiService({
      endpoint: endpoints.mvaCasesExport,
      method: "POST",
      data: filters,
      headers: {
        "Content-Type": "application/json",
      },
    });

    return apiResponse;
  } catch (error) {
    console.error("Error exporting MVA cases:", error);
    throw error;
  }
};
