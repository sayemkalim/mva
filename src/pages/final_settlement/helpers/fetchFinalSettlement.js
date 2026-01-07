import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const fetchFinalSettlement = async (slug) => {
    try {
        const apiResponse = await apiService({
            endpoint: `${endpoints.finalSettlementShow}/${slug}`,
        });

        console.log("Final Settlement API response:", apiResponse);
        return apiResponse;
    } catch (error) {
        console.error("Error fetching final settlement:", error);
        throw error;
    }
};
