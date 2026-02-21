import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";
import { downloadFile } from "@/utils/fileDownload";

export const printSocProd = async (id) => {
  try {
    const apiResponse = await apiService({
      endpoint: `${endpoints.socProdPrint}/${id}`,
      method: "GET",
      responseType: "blob",
    });

    if (apiResponse.response) {
      downloadFile(
        apiResponse.response,
        apiResponse.headers,
        `SOC-Draft-${id}`
      );
    }

    console.log("Print API response:", apiResponse);
    return apiResponse;
  } catch (error) {
    console.error("Error printing OCF production:", error);
    throw error;
  }
};
