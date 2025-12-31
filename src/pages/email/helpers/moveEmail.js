import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const moveEmail = async (emailId, folder) => {
  try {
    const apiResponse = await apiService({
      endpoint: endpoints.moveEmail,
      method: "POST",
      data: {
        email_id: emailId,
        folder: folder,
      },
    });
    return apiResponse;
  } catch (error) {
    console.error("Error moving email:", error);
    throw error;
  }
};

