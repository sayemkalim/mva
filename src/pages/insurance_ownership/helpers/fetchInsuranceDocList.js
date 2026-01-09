import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const fetchInsuranceDocList = async (slug, { search = "" } = {}) => {
  try {
    const params = new URLSearchParams();
    if (search && search.trim()) {
      params.append("search", search);
    }
    const queryString = params.toString();
    const endpoint = queryString
      ? `${endpoints.insuranceDocList}/${slug}?${queryString}`
      : `${endpoints.insuranceDocList}/${slug}`;

    const apiResponse = await apiService({
      endpoint,
    });
    return apiResponse;
  } catch (error) {
    console.error("Error fetching insurance document list:", error);
    throw error;
  }
};
