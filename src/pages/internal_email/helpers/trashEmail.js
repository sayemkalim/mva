import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const trashEmail = async (emailId, slug) => {
  try {
    const apiResponse = await apiService({
      endpoint: `${endpoints.trashEmail}/${emailId}`,
      method: "POST",
      data: { slug },
    });
    return apiResponse;
  } catch (error) {
    console.error("Error trashing email:", error);
    throw error;
  }
};

