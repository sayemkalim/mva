import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const fetchEmailById = async (id, slug) => {
  try {

    const apiResponse = await apiService({
      endpoint: `${endpoints.email}/${id}`,
      params: { slug },
    });

    if (!apiResponse) {
      throw new Error("No response received from server");
    }
    if (apiResponse.response === "" || apiResponse.response == null) {
      throw new Error("No data found for this email");
    }
    if (apiResponse.data && typeof apiResponse.data === "object") {

      if (!apiResponse.data.id) {
        throw new Error("Invalid response: missing email ID");
      }
      return apiResponse.data;
    }
    if (
      apiResponse.response &&
      typeof apiResponse.response === "object" &&
      apiResponse.response.email
    ) {
      if (!apiResponse.response.email.id) {
        throw new Error("Invalid response: missing email ID");
      }

      return apiResponse.response.email;
    }
    if (
      apiResponse.response &&
      typeof apiResponse.response === "object" &&
      apiResponse.response.data
    ) {
      if (!apiResponse.response.data.id) {
        throw new Error("Invalid response: missing email ID");
      }

      return apiResponse.response.data;
    }
    if (apiResponse.id) {
      return apiResponse;
    }
    throw new Error("Invalid response structure from server");
  } catch (error) {

    if (error.response) {
      const status = error.response.status;
      switch (status) {
        case 404:
          throw new Error("Email not found");
        case 401:
        case 403:
          throw new Error("Unauthorized access");
        case 500:
          throw new Error("Server error occurred");
        default:
          throw new Error(`Failed to fetch email (Status: ${status})`);
      }
    }

    if (error.message === "Network Error") {
      throw new Error("Network error: Please check your connection");
    }

    throw error;
  }
};
