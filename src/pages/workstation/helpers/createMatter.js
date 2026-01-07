import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const createMatter = async (matterData) => {
  try {
    const apiResponse = await apiService({
      endpoint: `${endpoints.createMatter}`,
      method: "POST",
      data: matterData,
      headers: {
        "Content-Type": "application/json",
      },
    });

    return apiResponse;
  } catch (error) {
    console.error("Error creating matter:", error);
    throw error;
  }
};
export const updateMatter = async (slug, matterData) => {
  try {
    const apiResponse = await apiService({
      endpoint: `${endpoints.createMatter}/${slug}`,
      method: "POST",
      data: matterData,
      headers: {
        "Content-Type": "application/json",
      },
    });

    return apiResponse;
  } catch (error) {
    console.error("Error updating matter:", error);
    throw error;
  }
};
