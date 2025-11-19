import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const createApplicantInfo = async ({ slug, data }) => {
  try {
    console.log("🚀 Sending data to API:", data);

    const apiResponse = await apiService({
      endpoint: `${endpoints.createApplicantInfo}/save/${slug}`,
      method: "POST",
      data: data, // ✅ Axios automatically handles JSON
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("✅ API Response:", apiResponse);
    return apiResponse;
  } catch (error) {
    console.error("❌ Error creating applicant info:", error);
    throw error;
  }
};
