import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const starEmail = async (emailId, slug) => {
    try {
        const apiResponse = await apiService({
            endpoint: `${endpoints.starEmail}/${emailId}/star`,
            method: "PATCH",
            params: { slug },
        });
        return apiResponse;
    } catch (error) {
        console.error("Error starring email:", error);
        throw error;
    }
};
