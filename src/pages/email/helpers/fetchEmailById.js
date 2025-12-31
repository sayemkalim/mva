import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const fetchEmailById = async (id) => {
  try {
    console.log("🔍 Fetching section with ID:", id);
    console.log("📍 API Endpoint:", `${endpoints.email}/${id}`);

    const apiResponse = await apiService({
      endpoint: `${endpoints.email}/${id}`,
    });

    console.log("✅ API Response received:", apiResponse);
    console.log("📦 Response type:", typeof apiResponse);
    console.log("🔑 Response keys:", Object.keys(apiResponse || {}));

    if (!apiResponse) {
      console.error("❌ apiResponse is null/undefined");
      throw new Error("No response received from server");
    }
    if (apiResponse.response === "" || apiResponse.response == null) {
      console.error("❌ Empty response from server");
      throw new Error("No data found for this section");
    }
    if (apiResponse.data && typeof apiResponse.data === "object") {
      console.log("✅ Found apiResponse.data:", apiResponse.data);

      if (!apiResponse.data.id) {
        console.error("❌ Missing 'id' in response data:", apiResponse.data);
        throw new Error("Invalid response: missing section ID");
      }
      return apiResponse.data;
    }
    if (
      apiResponse.response &&
      typeof apiResponse.response === "object" &&
      apiResponse.response.data
    ) {
      console.log(
        "✅ Found apiResponse.response.data:",
        apiResponse.response.data
      );

      if (!apiResponse.response.data.id) {
        console.error(
          "❌ Missing 'id' in response.response.data:",
          apiResponse.response.data
        );
        throw new Error("Invalid response: missing section ID");
      }

      return apiResponse.response.data;
    }
    if (apiResponse.id) {
      console.log("✅ apiResponse is direct data object");
      return apiResponse;
    }
    console.error(
      "❌ Unexpected response structure:",
      JSON.stringify(apiResponse, null, 2)
    );
    throw new Error("Invalid response structure from server");
  } catch (error) {
    console.error("🔥 Error fetching section:", error);
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
          throw new Error("Section not found");
        case 401:
        case 403:
          throw new Error("Unauthorized access");
        case 500:
          throw new Error("Server error occurred");
        default:
          throw new Error(`Failed to fetch section (Status: ${status})`);
      }
    }

    if (error.message === "Network Error") {
      throw new Error("Network error: Please check your connection");
    }

    throw error;
  }
};
