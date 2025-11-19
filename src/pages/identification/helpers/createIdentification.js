import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const createIdentification = async ({ slug, data }) => {
  try {
    console.log("🚀 Sending identification data to API:", data);

    const apiResponse = await apiService({
      endpoint: `${endpoints.createIdentification}/save/${slug}`,
      method: "POST",
      data: data,
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("✅ API Response:", apiResponse);
    return apiResponse;
  } catch (error) {
    console.error("❌ Error creating identification:", error);
    throw error;
  }
};
