import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";


export const fetchbilling = async (slug) => {
    try {
        const apiResponse = await apiService({
            endpoint: `${endpoints.billing}/${slug}`,
            method: "GET",

        });
        console.log("API Response:", apiResponse);
        return apiResponse?.response;
    } catch (error) {
        console.error("Error fetching billing :", error);
        throw error;
    }
}; 