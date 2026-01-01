import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const getPoliceStationsMeta = async () => {
  try {
    const apiResponse = await apiService({
      endpoint: endpoints.policeStationsMeta,
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    return apiResponse;
  } catch (error) {
    console.error("Error fetching police stations metadata:", error);
    throw error;
  }
};

export const exportPoliceStations = async (filters) => {
  try {
    const apiResponse = await apiService({
      endpoint: endpoints.policeStationsExport,
      method: "POST",
      data: filters,
      headers: {
        "Content-Type": "application/json",
      },
    });

    return apiResponse;
  } catch (error) {
    console.error("Error exporting police stations:", error);
    throw error;
  }
};
