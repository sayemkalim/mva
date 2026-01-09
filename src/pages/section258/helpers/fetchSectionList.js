import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const fetchSectionList = async (slug, { search = "" } = {}) => {
  try {
    const params = new URLSearchParams();
    if (search && search.trim()) {
      params.append("search", search);
    }
    const queryString = params.toString();
    const endpoint = queryString
      ? `${endpoints.section258List}/${slug}?${queryString}`
      : `${endpoints.section258List}/${slug}`;

    const apiResponse = await apiService({
      endpoint,
    });
    return apiResponse;
  } catch (error) {
    console.error("Error fetching section 258 list:", error);
    throw error;
  }
};
