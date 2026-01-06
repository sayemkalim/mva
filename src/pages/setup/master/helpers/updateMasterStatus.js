import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const updateMasterStatus = async (id, isActive) => {
  const response = await apiService({
    endpoint: `${endpoints.updateMasterStatus}/${id}`,
    method: "PATCH",
    data: {
      is_active: isActive,
    },
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response;
};
