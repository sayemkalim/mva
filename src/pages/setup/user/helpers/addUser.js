import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const addUser = async (data) => {
  const response = await apiService({
    endpoint: endpoints.addUser,
    method: "POST",
    data,
  });
  return response;
};
