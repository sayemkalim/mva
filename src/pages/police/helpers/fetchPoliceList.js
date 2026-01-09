import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const fetchPoliceList = async (slug, { search = "" } = {}) => {
  try {
    const params = new URLSearchParams();
    if (search && search.trim()) {
      params.append("search", search);
    }
    const queryString = params.toString();
    const endpoint = queryString
      ? `${endpoints.policeList}/${slug}?${queryString}`
      : `${endpoints.policeList}/${slug}`;

    const apiResponse = await apiService({
      endpoint,
    });
    return apiResponse;
  } catch (error) {
    console.error("Error fetching police list:", error);
    throw error;
  }
};
