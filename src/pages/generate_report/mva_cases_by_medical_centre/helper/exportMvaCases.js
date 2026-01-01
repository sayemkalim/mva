import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const getMvaCasesByMedicalCentreMeta = async () => {
  try {
    const apiResponse = await apiService({
      endpoint: endpoints.mvaCasesByMedicalCentreMeta,
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    return apiResponse;
  } catch (error) {
    console.error(
      "Error fetching MVA cases by medical centre metadata:",
      error
    );
    throw error;
  }
};

export const exportVehicleOwnershipInfo = async (filters) => {
  try {
    const apiResponse = await apiService({
      endpoint: endpoints.vehicleOwnershipInfo,
      method: "POST",
      data: filters,
      headers: {
        "Content-Type": "application/json",
      },
    });

    return apiResponse;
  } catch (error) {
    console.error("Error exporting vehicle ownership information:", error);
    throw error;
  }
};
