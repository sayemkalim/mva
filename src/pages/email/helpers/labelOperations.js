import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const fetchLabels = async ({ account_id, per_page = 25 }) => {
    try {
        const apiResponse = await apiService({
            endpoint: endpoints.labelsList,
            method: "GET",
            params: {
                account_id,
                per_page,
            },
        });
        return apiResponse;
    } catch (error) {
        console.error("Error fetching labels:", error);
        throw error;
    }
};

export const createLabel = async (labelData) => {
    try {
        const apiResponse = await apiService({
            endpoint: endpoints.createLabel,
            method: "POST",
            data: labelData,
        });
        return apiResponse;
    } catch (error) {
        console.error("Error creating label:", error);
        throw error;
    }
};

export const renameLabel = async (id, labelData) => {
    try {
        const apiResponse = await apiService({
            endpoint: `${endpoints.renameLabel}/${id}`,
            method: "PUT",
            data: labelData,
        });
        return apiResponse;
    } catch (error) {
        console.error("Error renaming label:", error);
        throw error;
    }
};

export const deleteLabel = async (id) => {
    try {
        const apiResponse = await apiService({
            endpoint: `${endpoints.deleteLabel}/${id}`,
            method: "DELETE",
        });
        return apiResponse;
    } catch (error) {
        console.error("Error deleting label:", error);
        throw error;
    }
};
