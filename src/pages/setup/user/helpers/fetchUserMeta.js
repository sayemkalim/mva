import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const fetchUserMeta = async () => {
  const response = await apiService({
    endpoint: endpoints.userMeta,
    method: "GET",
  });
  return response;
};
