import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const fetchMeta = async () => {
  try {
    const apiResponse = await apiService({
      endpoint: `${endpoints.accidentBenifitMeta}`,
      method: "GET",
    });

    console.log("API Response:", apiResponse);
    return apiResponse?.response;
  } catch (error) {
    console.error("Error fetching dashboard:", error);
    throw error;
  }
};