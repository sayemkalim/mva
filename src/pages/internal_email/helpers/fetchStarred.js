import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const fetchStarred = async (page = 1, search = "", slug) => {
    try {
        const apiResponse = await apiService({
            endpoint: endpoints.starredEmail,
            params: { page, search, slug },
            method: "GET",
        });
        return apiResponse;
    } catch (error) {
        console.error("Error fetching Starred:", error);
        throw error;
    }
};