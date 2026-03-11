import { apiService } from "@/api/api_service/apiService";

export const copyImportedData = async (id, slug) => {
    try {
        const apiResponse = await apiService({
            endpoint: `api/v2/file/production/mva-client-fillable/copy/${id}`,
            method: "GET",
        });
        return apiResponse;
    } catch (error) {
        console.error("Error copying imported data:", error);
        throw error;
    }
};
