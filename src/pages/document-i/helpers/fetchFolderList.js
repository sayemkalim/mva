import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const fetchFolderList = async (slug, { search = "" } = {}) => {
  try {
    const params = new URLSearchParams();
    if (search && search.trim()) {
      params.append("search", search);
    }
    const queryString = params.toString();
    const endpoint = queryString
      ? `${endpoints.documentiFolderList}/${slug}?${queryString}`
      : `${endpoints.documentiFolderList}/${slug}`;

    const apiResponse = await apiService({
      endpoint,
    });
    return apiResponse;
  } catch (error) {
    console.error("Error fetching folder list:", error);
    throw error;
  }
};
