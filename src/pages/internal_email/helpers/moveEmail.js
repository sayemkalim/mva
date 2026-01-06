import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const moveEmail = async (data, slug) => {
  try {
    const apiResponse = await apiService({
      endpoint: `${endpoints.moveEmail}/${data.emailId}`,
      method: "POST",
      data: {
        file_no: data.fileNo,
        slug,
      },
    });
    return apiResponse;
  } catch (error) {
    console.error("Error moving email:", error);
    throw error;
  }
};

