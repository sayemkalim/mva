import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const unlinkAccount = async (emailId) => {
  try {
    const apiResponse = await apiService({
      endpoint: `${endpoints.unlinkAttachment}/${emailId}`,
      method: "DELETE",
    });
    return apiResponse;
  } catch (error) {
    console.error("Error unlinking account:", error);
    throw error;
  }
};

