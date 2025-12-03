import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const createOcf10 = async ({ slug, data }) => {
  try {
    const apiResponse = await apiService({
      endpoint: `${endpoints.createOcf10}/save/${slug}`,
      method: "POST",
      data: data,
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("✅ API Response:", apiResponse);
    return apiResponse;
  } catch (error) {
    console.error("❌ Error creating Employment:", error);
    throw error;
  }
};
