import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const createPolice = async ({ slug, ...payload }) => {
  if (!slug) throw new Error("Slug is required for creating");

  const apiResponse = await apiService({
    endpoint: `${endpoints.createPolice}/${slug}`,
    method: "POST",
    data: payload,
    headers: { "Content-Type": "application/json" },
  });

  console.log("✅ Create LAT API Response:", apiResponse);
  return apiResponse;
};

export const updatePolice = async (id, data) => {
  try {
    if (!id) throw new Error("ID is required for updating Section");

    const apiResponse = await apiService({
      endpoint: `${endpoints.updatePolice}/update/${id}`,
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
