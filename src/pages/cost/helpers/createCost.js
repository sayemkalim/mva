import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const createCost = async ({ slug, data }) => {
  if (!slug) throw new Error("Slug is required for creating cost");

  try {
    console.log("📤 Sending cost data:", {
      slug,
      endpoint: `${endpoints.createCost}/save/${slug}`,
      payload: data,
    });

    const apiResponse = await apiService({
      endpoint: `${endpoints.createCost}/save/${slug}`,
      method: "POST",
      data: data,
      headers: { "Content-Type": "application/json" },
    });

    console.log("✅ Create Cost API Response:", apiResponse);
    return apiResponse;
  } catch (error) {
    console.error("❌ Create Cost Error:", {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      validationErrors: error.response?.data?.errors,
      errorMessage: error.response?.data?.message,
      fullResponse: error.response?.data,
    });

    // Re-throw to let useMutation handle it
    throw error;
  }
};
