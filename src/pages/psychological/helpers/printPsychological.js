import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";
import { downloadFile } from "@/utils/fileDownload";

export const printPsychological = async (id) => {
  try {
    const apiResponse = await apiService({
      endpoint: `${endpoints.psychologicalPrint}/${id}`,
      method: "GET",
      responseType: "blob",
    });

    if (apiResponse.raw) {
      downloadFile(
        apiResponse.response,
        apiResponse.raw.headers,
        `OCF-1-Production-${id}`
      );
    }

    console.log("Print API response:", apiResponse);
    return apiResponse;
  } catch (error) {
    console.error("Error printing OCF production:", error);
    throw error;
  }
};
