import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const deleteFolder = async (folderId) => {
  try {
    const apiResponse = await apiService({
      endpoint: `${endpoints.documentiDeleteFolder}/${folderId}`,
      method: "DELETE",
    });
    return apiResponse.data;
  } catch (error) {
    console.error("Error deleting folder:", error);
    throw error;
  }
};
