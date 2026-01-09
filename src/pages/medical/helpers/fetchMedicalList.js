import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const fetchMedicalList = async (slug, { search = "" } = {}) => {
  try {
    const params = new URLSearchParams();
    if (search && search.trim()) {
      params.append("search", search);
    }
    const queryString = params.toString();
    const endpoint = queryString
      ? `${endpoints.medicalList}/${slug}?${queryString}`
      : `${endpoints.medicalList}/${slug}`;

    const apiResponse = await apiService({
      endpoint,
    });
    return apiResponse;
  } catch (error) {
    console.error("Error fetching medical list:", error);
    throw error;
  }
};
