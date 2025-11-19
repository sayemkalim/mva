import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const getSecondaryEhcMeta = async () => {
  try {
    const apiResponse = await apiService({
      endpoint: `${endpoints.secondaryEhcMeta}`,
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    return apiResponse;
  } catch (error) {
    console.error("Error fetching SecondaryEhc meta:", error);
    throw error;
  }
};
