import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";
import { downloadFile } from "@/utils/fileDownload";

export const printOcfProd3 = async (id) => {
  try {
    const apiResponse = await apiService({
      endpoint: `${endpoints.ocfProdPrint6}/${id}`,
      method: "GET",
      responseType: "blob",
    });

    if (apiResponse.response) {
      downloadFile(
        apiResponse.response,
        apiResponse.headers,
        `OCF-6-Production-${id}`
      );
    }

    console.log("Print API response:", apiResponse);
    return apiResponse;
  } catch (error) {
    console.error("Error printing OCF production:", error);
    throw error;
  }
};
