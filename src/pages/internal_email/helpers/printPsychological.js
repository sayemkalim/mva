import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const printPsychological = async (id, slug) => {
  try {
    const apiResponse = await apiService({
      endpoint: `${endpoints.psychologicalPrint}/${id}`,
      method: "GET",
      params: { slug },
      responseType: "blob",
    });

    const url = window.URL.createObjectURL(new Blob([apiResponse.response]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `OCF-1-Production-${id}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    console.log("Print API response:", apiResponse);
    return apiResponse;
  } catch (error) {
    console.error("Error printing OCF production:", error);
    throw error;
  }
};
