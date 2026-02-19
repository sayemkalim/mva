import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const deleteDocument = async (documentId) => {
  try {
    const apiResponse = await apiService({
      endpoint: `${endpoints.documentiDeleteDocument}/${documentId}`,
      method: "DELETE",
    });
    return apiResponse;
  } catch (error) {
    console.error("Error deleting document:", error);
    throw error;
  }
};