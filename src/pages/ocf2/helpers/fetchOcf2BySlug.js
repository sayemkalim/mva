import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const fetchOcf2BySlug = async (slug) => {
  try {
    console.log("🔍 Fetching applicant with slug:", slug);
    console.log("📍 API Endpoint:", `${endpoints.ocf2}/${slug}`);

    const apiResponse = await apiService({
      endpoint: `${endpoints.ocf2}/${slug}`,
      method: "GET",
    });

    console.log("✅ API Response received:", apiResponse);

    if (!apiResponse) {
      console.error("❌ apiResponse is null/undefined");
      throw new Error("No response received from server");
    }

    if (apiResponse.data) {
      console.log("✅ Found apiResponse.data:", apiResponse.data);
      return apiResponse.data;
    }

    if (apiResponse.response) {
      console.log("✅ Found apiResponse.response:", apiResponse.response);
      return apiResponse.response;
    }

    if (apiResponse.id && apiResponse.slug) {
      console.log("✅ apiResponse is direct data object");
      return apiResponse;
    }

    console.error(
      "❌ Unexpected response structure:",
      JSON.stringify(apiResponse, null, 2)
    );
    throw new Error("Invalid response from server");
  } catch (error) {
    console.error("🔥 Error fetching applicant:", error);

    if (error.response) {
      const status = error.response.status;
      switch (status) {
        case 404:
          throw new Error("Applicant not found");
        case 401:
        case 403:
          throw new Error("Unauthorized access");
        case 500:
          throw new Error("Server error occurred");
        default:
          throw new Error(`Failed to fetch applicant (Status: ${status})`);
      }
    }

    if (error.message === "Network Error") {
      throw new Error("Network error: Please check your connection");
    }

    throw error;
  }
};
