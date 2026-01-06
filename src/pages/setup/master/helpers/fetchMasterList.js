import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const fetchMasterList = async (slug) => {
  const response = await apiService({
    endpoint: `${endpoints.masterList}/${slug}`,
    method: "GET",
  });
  
  // Handle error responses from apiService
  if (response?.error || !response?.response) {
    throw new Error(response?.message || "Failed to fetch master list");
  }
  
  return response;
};
