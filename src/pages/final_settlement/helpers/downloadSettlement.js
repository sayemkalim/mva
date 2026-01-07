import axios from "axios";
import { getItem } from "@/utils/local_storage";
import { BACKEND_URL } from "@/utils/url";
import { endpoints } from "@/api/endpoints";

export const downloadSettlement = async (slug) => {
    try {
        const token = getItem("token");
        const response = await axios({
            url: `${BACKEND_URL}/${endpoints.downloadFinalSettlement}/${slug}`,
            method: 'GET',
            responseType: 'blob',
            headers: {
                Authorization: `Bearer ${token}`,
                "ngrok-skip-browser-warning": "true",
            }
        });

        // Create a URL for the blob
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;

        // Try to get filename from headers
        const contentDisposition = response.headers['content-disposition'];
        let fileName = `final_settlement_${slug}.pdf`;
        if (contentDisposition) {
            const fileNameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
            if (fileNameMatch && fileNameMatch.length === 2)
                fileName = fileNameMatch[1];
        }

        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();

        // Cleanup
        link.parentNode.removeChild(link);
        window.URL.revokeObjectURL(url);

        return { success: true };
    } catch (error) {
        console.error("Error downloading final settlement:", error);
        throw error;
    }
};