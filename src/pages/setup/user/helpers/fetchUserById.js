import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const fetchUserById = async (id) => {
  // Try with /show/{id} format first, if that doesn't work the endpoint may need adjustment
  const response = await apiService({
    endpoint: `${endpoints.showUser}/${id}`,
    method: "GET",
  });
  return response;
};
