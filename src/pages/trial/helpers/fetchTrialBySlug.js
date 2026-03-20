import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const fetchTrialBySlug = async (slug) => {
  try {
    const data = await apiService({
      endpoint: `${endpoints.trialShow}/${slug}`,
      method: "GET",
    });
    return data?.response || {};
  } catch (error) {
    throw error;
  }
};
