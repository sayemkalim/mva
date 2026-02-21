import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const updateDocument = async (documentId, data) => {
  try {
    const apiResponse = await apiService({
      endpoint: `${endpoints.documentiUpdateDocument}/${documentId}`,
      method: "POST",
      data,
      headers: {
        "Content-Type": "application/json",
      },
    });
    return apiResponse;
  } catch (error) {
    console.error("Error updating document:", error);
    throw error;
  }
};
