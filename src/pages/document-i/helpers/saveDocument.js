import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const saveDocument = async (slug, data) => {
  try {
    const apiResponse = await apiService({
      endpoint: `${endpoints.documentiFolderSave}/${slug}`,
      method: "POST",
      data,
    });
    return apiResponse;
  } catch (error) {
    console.error("Error saving document:", error);
    throw error;
  }
};
