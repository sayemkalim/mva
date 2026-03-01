import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const createIntake = async ({ slug, data }) => {
  try {
    if (!slug) throw new Error("Slug is required for creating Intake");

    const apiResponse = await apiService({
      endpoint: `${endpoints.createIntake}/save/${slug}`,
      method: "POST",
      data,
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("✅ Create API Response:", apiResponse);
    return apiResponse;
  } catch (error) {
    console.error("❌ Error creating Intake:", error);
    throw error;
  }
};

export const updateIntake = async (id, data) => {
  try {
    if (!id) throw new Error("ID is required for updating Intake");

    const apiResponse = await apiService({
      endpoint: `${endpoints.updateIntake}/update/${id}`,
      method: "POST",
      data,
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("✅ Update API Response:", apiResponse);
    return apiResponse;
  } catch (error) {
    console.error("❌ Error updating Intake:", error);
    throw error;
  }
};
