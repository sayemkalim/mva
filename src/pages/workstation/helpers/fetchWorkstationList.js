import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const fetchWorkstationList = async ({
  search = "",
  status = "",
  date = "",
  month = "",
  year = "",
  start_date = "",
  end_date = "",
} = {}) => {
  try {
    const params = new URLSearchParams();
    if (search && search.trim()) {
      params.append("search", search);
    }
    if (status) params.append("status", status);
    if (date) params.append("date", date);
    if (month) params.append("month", month);
    if (year) params.append("year", year);
    if (start_date) params.append("start_date", start_date);
    if (end_date) params.append("end_date", end_date);

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
