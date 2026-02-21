import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";
import { downloadFile } from "@/utils/fileDownload";

export const printOcfProd10 = async (id) => {
  try {
    const apiResponse = await apiService({
      endpoint: `${endpoints.ocfProdPrint10}/${id}`,
      method: "GET",
      responseType: "blob",
    });

    if (apiResponse.response) {
      downloadFile(
        apiResponse.response,
        apiResponse.headers,
        `OCF-10-Production-${id}`
      );
    }

    console.log("Print API response:", apiResponse);
    return apiResponse;
  } catch (error) {
    console.error("Error printing OCF production:", error);
    throw error;
  }
};
