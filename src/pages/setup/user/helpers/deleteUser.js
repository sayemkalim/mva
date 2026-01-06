import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const deleteUser = async (id) => {
  const response = await apiService({
    endpoint: `${endpoints.deleteUser}/${id}`,
    method: "DELETE",
  });
  return response;
};
