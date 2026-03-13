import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const createMediation = async ({ slug, data, isEditMode }) => {
  const endpoint = isEditMode
    ? `${endpoints.createMediation}/${slug}`
    : endpoints.createMediation;

  return await apiService({
    endpoint: endpoint,
    method: "POST",
    data,
  });
};
