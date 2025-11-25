import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const createSection = async ({ slug, data }) => {
  try {
    if (!slug) throw new Error("Slug is required for creating Section");

    const apiResponse = await apiService({
      endpoint: `${endpoints.createSection}/save/${slug}`, // slug dynamic
      method: "POST",
      data,
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("✅ Create API Response:", apiResponse);
    return apiResponse;
  } catch (error) {
    console.error("❌ Error creating Section:", error);
    throw error;
  }
};

export const updateSection = async (id, data) => {
  try {
    if (!id) throw new Error("ID is required for updating Section");

    const apiResponse = await apiService({
      endpoint: `${endpoints.updateSection}/update/${id}`,
      method: "POST",
      data,
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("✅ Update API Response:", apiResponse);
    return apiResponse;
  } catch (error) {
    console.error("❌ Error updating Section:", error);
    throw error;
  }
};
