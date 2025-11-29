import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const fetchAodBySlug = async (slug) => {
  try {
    console.log("🔍 Fetching counsel with slug:", slug);
    console.log("📍 API Endpoint:", `${endpoints.aod}/${slug}`);

    const apiResponse = await apiService({
      endpoint: `${endpoints.aod}/${slug}`,
      method: "GET",
    });

    console.log("✅ API Response received:", apiResponse);

    if (!apiResponse) {
      console.error("❌ apiResponse is null/undefined");
      throw new Error("No response received from server");
    }
    let payload = null;

    if (apiResponse.data !== undefined) {
      payload = apiResponse.data;
    } else if (apiResponse.response !== undefined) {
      if (
        apiResponse.response === "" ||
        apiResponse.response === null ||
        (typeof apiResponse.response === "string" &&
          apiResponse.response.trim() === "")
      ) {
        console.log("ℹ️ Empty response from server, no counsel found yet.");
        return null;
      }

      payload = apiResponse.response;
    } else if (apiResponse.id && apiResponse.slug) {
      payload = apiResponse;
    }

    // 2) Agar ab bhi payload nahi mila, to bhi error mat karo, null return karo
    if (!payload) {
      console.log(
        "ℹ️ No counsel data found for this slug. Returning null (create mode)."
      );
      return null;
    }

    console.log("✅ Final parsed counsel payload:", payload);
    return payload;
  } catch (error) {
    console.error("🔥 Error fetching counsel:", error);

    if (error.response) {
      const status = error.response.status;
      switch (status) {
        case 404:
          // same behavior: no record, so null
          console.log("ℹ️ Counsel not found (404). Returning null.");
          return null;
        case 401:
        case 403:
          throw new Error("Unauthorized access");
        case 500:
          throw new Error("Server error occurred");
        default:
          throw new Error(`Failed to fetch counsel (Status: ${status})`);
      }
    }

    if (error.message === "Network Error") {
      throw new Error("Network error: Please check your connection");
    }

    throw error;
  }
};
