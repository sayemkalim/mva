import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const deleteEmail = async (emailId) => {
  try {
    const apiResponse = await apiService({
      endpoint: `${endpoints.deleteEmail}/${emailId}`,
      method: "DELETE",
    });
    return apiResponse;
  } catch (error) {
    console.error("Error deleting email:", error);
    throw error;
  }
};

