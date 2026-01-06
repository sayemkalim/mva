import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const deleteMaster = async (id) => {
  const response = await apiService({
    endpoint: `${endpoints.deleteMaster}/${id}`,
    method: "DELETE",
  });
  return response;
};
