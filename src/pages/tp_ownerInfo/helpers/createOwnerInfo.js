import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const createOwnerInfo = async ({ slug, data }) => {
  try {
    const apiResponse = await apiService({
      endpoint: `${endpoints.createOwnerInfo}/save/${slug}`,
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
