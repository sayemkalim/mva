import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const sortDocuments = async (documents) => {
  try {
    const apiResponse = await apiService({
        endpoint: `${endpoints.sortDocuments}`,
        method: "POST",
        data: {documents},
    });
    return apiResponse;
  } catch (error) {
    console.error("Error sorting documents:", error);
    throw error;
  }
};