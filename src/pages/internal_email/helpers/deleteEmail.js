import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const deleteEmail = async (emailId, slug) => {
  try {
    const apiResponse = await apiService({
      endpoint: `${endpoints.deleteEmail}/${emailId}`,
      method: "DELETE",
      params: { slug },
    });
    return apiResponse;
  } catch (error) {
    console.error("Error deleting email:", error);
    throw error;
  }
};

