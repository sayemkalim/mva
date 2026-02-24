import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const getSocialMediaPlatforms = async () => {
    try {
        const apiResponse = await apiService({
            endpoint: endpoints.socialMediaPlatforms,
            method: "GET",
        });
        return apiResponse;
    } catch (error) {
        console.error("Error fetching social media platforms:", error);
        throw error;
    }
};
