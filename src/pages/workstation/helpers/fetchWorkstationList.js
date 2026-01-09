import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const fetchWorkstationList = async ({ search = "" } = {}) => {
  try {
    const params = new URLSearchParams();
    if (search && search.trim()) {
      params.append("search", search);
    }

    const queryString = params.toString();
    const endpoint = queryString
      ? `${endpoints.workstation_list}?${queryString}`
      : endpoints.workstation_list;

    const apiResponse = await apiService({
      endpoint,
      method: "GET",
    });

    console.log("API response:", apiResponse);
    return apiResponse;
  } catch (error) {
    console.error("Error fetching workstation list:", error);
    throw error;
  }
};
