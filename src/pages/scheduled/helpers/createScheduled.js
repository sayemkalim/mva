import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const createScheduled = async ({ slug, data }) => {
  try {
    const apiResponse = await apiService({
      endpoint: `${endpoints.createScheduled}/save/${slug}`,
      method: "POST",
      data: data,
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("✅ API Response:", apiResponse);
    return apiResponse;
  } catch (error) {
    console.error("❌ Error creating :", error);
    throw error;
  }
};
