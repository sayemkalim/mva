// helpers/fetchMatterBySlug.js
import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const fetchSectionById = async (id) => {
  try {
    console.log("🔍 Fetching matter with slug:", id);
    console.log("📍 API Endpoint:", `${endpoints.section}/${id}`);

    const apiResponse = await apiService({
      endpoint: `${endpoints.matter}/${id}`,
    });
    console.log("✅ API Response received:", apiResponse);
    console.log("📦 Response type:", typeof apiResponse);
    console.log("🔑 Response keys:", Object.keys(apiResponse || {}));
    if (!apiResponse) {
      console.error("❌ apiResponse is null/undefined");
      throw new Error("No response received from server");
    }
    if (apiResponse.data) {
      console.log("✅ Found apiResponse.data:", apiResponse.data);

      // Validate data structure
      if (!apiResponse.data.id) {
        console.error("❌ Missing 'id' in response data:", apiResponse.data);
        throw new Error("Invalid response: missing matter ID");
      }

      return apiResponse.data; // Return just the data object
    }

    // Option 2: Check if response has nested response property
    if (apiResponse.response) {
      console.log("✅ Found apiResponse.response:", apiResponse.response);

      if (!apiResponse.response.id) {
        console.error(
          "❌ Missing 'id' in response.response:",
          apiResponse.response
        );
        throw new Error("Invalid response: missing matter ID");
      }

      return apiResponse.response;
    }

    // Option 3: Response might be the data itself
    if (apiResponse.id && apiResponse.slug) {
      console.log("✅ apiResponse is direct data object");
      return apiResponse;
    }

    // If none of the above, log the structure and throw error
    console.error(
      "❌ Unexpected response structure:",
      JSON.stringify(apiResponse, null, 2)
    );
    throw new Error("Invalid response from server");
  } catch (error) {
    console.error("🔥 Error fetching matter:", error);
    console.error("Error details:", {
      message: error.message,
      response: error.response,
      status: error.response?.status,
      data: error.response?.data,
    });

    // Handle different error scenarios
    if (error.response) {
      const status = error.response.status;

      switch (status) {
        case 404:
          throw new Error("Matter not found");
        case 401:
        case 403:
          throw new Error("Unauthorized access");
        case 500:
          throw new Error("Server error occurred");
        default:
          throw new Error(`Failed to fetch matter (Status: ${status})`);
      }
    }

    // Network error
    if (error.message === "Network Error") {
      throw new Error("Network error: Please check your connection");
    }

    // Re-throw the original error if it's already formatted
    throw error;
  }
};
