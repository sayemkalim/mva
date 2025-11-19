import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const createAccidentInfo = async ({ slug, data }) => {
  try {
    console.log("🚀 Sending data to API:", data);

    const apiResponse = await apiService({
      endpoint: `${endpoints.createAccidentInfo}/save/${slug}`,
      method: "POST",
      data: data,
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("✅ API Response:", apiResponse);
    return apiResponse;
  } catch (error) {
    console.error("❌ Error creating createAccidentInfo info:", error);
    throw error;
  }
};
