import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const updateUser = async (id, data) => {
  const response = await apiService({
    endpoint: `${endpoints.updateUser}/${id}`,
    method: "POST",
    data,
    // Don't set Content-Type for FormData - browser sets it automatically with boundary
  });
  return response;
};
