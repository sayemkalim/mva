import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const fetchTaskById = async (id) => {
  try {
    const apiResponse = await apiService({
      endpoint: `${endpoints.task}/${id}`,
    });

    if (!apiResponse) {
      throw new Error("No response received from server");
    }
    if (apiResponse.task && typeof apiResponse.task === "object") {
      return apiResponse.task;
    }
    if (
      apiResponse.response &&
      apiResponse.response.task &&
      typeof apiResponse.response.task === "object"
    ) {
      return apiResponse.response.task;
    }

    if (apiResponse.data && typeof apiResponse.data === "object") {
      console.log("Found apiResponse.data:", apiResponse.data);
      return apiResponse.data;
    }

    throw new Error("Invalid response structure from server");
  } catch (error) {
    console.error("🔥 Error fetching task:", error);
    console.error("Error details:", {
      message: error.message,
      response: error.response,
      status: error.response?.status,
      data: error.response?.data,
    });

    if (error.response) {
      const status = error.response.status;
      switch (status) {
        case 404:
          throw new Error("Task not found");
        case 401:
        case 403:
          throw new Error("Unauthorized access");
        case 500:
          throw new Error("Server error occurred");
        default:
          throw new Error(`Failed to fetch task (Status: ${status})`);
      }
    }

    if (error.message === "Network Error") {
      throw new Error("Network error: Please check your connection");
    }

    throw error;
  }
};
export const fetchCommentById = async (id) => {
  try {
    const apiResponse = await apiService({
      endpoint: `${endpoints.comment}/${id}`,
    });

    console.log("📦 Full API Response:", apiResponse);

    if (!apiResponse) {
      throw new Error("No response received from server");
    }

    // ✅ CORRECT PATH: apiResponse.response.data
    if (
      apiResponse.response?.data &&
      Array.isArray(apiResponse.response.data)
    ) {
      console.log("✅ Found comments array:", apiResponse.response.data);
      return apiResponse.response.data;
    }

    // Fallback: Check if data is at root level
    if (Array.isArray(apiResponse.data)) {
      console.log("✅ Found comments at root data:", apiResponse.data);
      return apiResponse.data;
    }

    // Fallback: Check for comments property
    if (Array.isArray(apiResponse.response?.comments)) {
      console.log("✅ Found comments array:", apiResponse.response.comments);
      return apiResponse.response.comments;
    }

    console.error("❌ Unexpected response structure:", apiResponse);
    throw new Error("Invalid response structure from server");
  } catch (error) {
    console.error("🔥 Error fetching comments:", error);
    console.error("Error details:", {
      message: error.message,
      response: error.response,
      status: error.response?.status,
      data: error.response?.data,
    });

    if (error.response) {
      const status = error.response.status;
      switch (status) {
        case 404:
          throw new Error("Comments not found");
        case 401:
        case 403:
          throw new Error("Unauthorized access");
        case 500:
          throw new Error("Server error occurred");
        default:
          throw new Error(`Failed to fetch comments (Status: ${status})`);
      }
    }

    if (error.message === "Network Error") {
      throw new Error("Network error: Please check your connection");
    }

    throw error;
  }
};
