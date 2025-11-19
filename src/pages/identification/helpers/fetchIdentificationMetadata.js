import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const getIdentificationMeta = async () => {
  try {
    const apiResponse = await apiService({
      endpoint: `${endpoints.identificationMeta}`,
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    return apiResponse;
  } catch (error) {
    console.error("Error fetching Identification meta:", error);
    throw error;
  }
};
