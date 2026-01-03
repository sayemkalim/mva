import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const fetchStarred = async (page = 1, search = "") => {
    try {
        const apiResponse = await apiService({
            endpoint: endpoints.starredEmail,
            params: { page, search },
            method: "GET",
        });
        return apiResponse;
    } catch (error) {
        console.error("Error fetching Starred:", error);
        throw error;
    }
};