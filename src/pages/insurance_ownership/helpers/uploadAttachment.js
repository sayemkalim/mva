import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const uploadAttachment = async ({ file }) => {
  try {
    console.log("🚀 Uploading file:", file.name);

    const formData = new FormData();
    formData.append("file", file);

    const apiResponse = await apiService({
      endpoint: `${endpoints.uploadAttachment}/save`,
      method: "POST",
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    console.log("✅ File Upload Response:", apiResponse);
    return apiResponse;
  } catch (error) {
    console.error("❌ Error uploading file:", error);
    throw error;
  }
};
