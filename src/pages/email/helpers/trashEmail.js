import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const trashEmail = async (emailId) => {
  try {
    const apiResponse = await apiService({
      endpoint: endpoints.trashEmail,
      method: "POST",
      data: {
        email_id: emailId,
      },
    });
    return apiResponse;
  } catch (error) {
    console.error("Error trashing email:", error);
    throw error;
  }
};

