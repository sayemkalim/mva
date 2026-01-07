import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const saveFinalSettlement = async (slug, data) => {
    try {
        const apiResponse = await apiService({
            endpoint: `${endpoints.finalSettlementSave}/${slug}`,
            method: 'POST',
            data: data
        });

        console.log("Final Settlement Save response:", apiResponse);
        return apiResponse;
    } catch (error) {
        console.error("Error saving final settlement:", error);
        throw error;
    }
};
