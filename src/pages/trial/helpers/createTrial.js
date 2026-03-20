import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const createTrial = async ({ slug, data }) => {
  try {
    const response = await apiService({
      endpoint: `${endpoints.createTrial}/${slug}`,
      method: "POST",
      data,
    });
    return response;
  } catch (error) {
    throw error;
  }
};
