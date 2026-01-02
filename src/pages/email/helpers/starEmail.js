import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const starEmail = async (emailId) => {
    try {
        const apiResponse = await apiService({
            endpoint: `${endpoints.starEmail}/${emailId}/star`,
            method: "PATCH",
        });
        return apiResponse;
    } catch (error) {
        console.error("Error starring email:", error);
        throw error;
    }
};
