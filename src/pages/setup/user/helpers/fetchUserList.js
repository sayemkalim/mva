import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const fetchUserList = async () => {
  const response = await apiService({
    endpoint: endpoints.listUser,
    method: "GET",
  });
  return response;
};
