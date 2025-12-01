import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const fetchAccountingList = async (slug) => {
  try {
    const apiResponse = await apiService({
      endpoint: `${endpoints.accountinglist}/${slug}`,
    });

    console.log("ApFull API response:", apiResponse);
    return apiResponse;
  } catch (error) {
    console.error("Error fetching fetchAccountingList list:", error);
    throw error;
  }
};
