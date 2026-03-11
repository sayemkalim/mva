import { apiService } from "@/api/api_service/apiService";

export const fetchImportList = async (slug) => {
    try {
        const apiResponse = await apiService({
            endpoint: `api/v2/file/production/pre-screen/get/${slug}`,
        });
        return apiResponse;
    } catch (error) {
        console.error("Error fetching import list:", error);
        throw error;
    }
};
