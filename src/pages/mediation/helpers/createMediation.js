import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const createMediation = async ({ slug, data }) => {
  if (!slug) {
    throw new Error("Slug is required to save mediation");
  }

  return await apiService({
    endpoint: `${endpoints.createMediation}/${slug}`,
    method: "POST",
    data,
    headers: {
      "Content-Type": "application/json",
    },
  });
};
