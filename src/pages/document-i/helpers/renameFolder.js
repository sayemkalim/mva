import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const renameFolder = async (folderId, newName) => {
  try {
    const apiResponse = await apiService({
      endpoint: `${endpoints.documentiRenameFolder}/${folderId}`,
      method: "POST",
      data: { name: newName },
    });
    return apiResponse.data;
  } catch (error) {
    console.error("Error renaming folder:", error);
    throw error;
  }
};
