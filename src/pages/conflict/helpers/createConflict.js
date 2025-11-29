import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const createConflict = async ({ slug, ...payload }) => {
  if (!slug) throw new Error("Slug is required for creating LAT");

  const apiResponse = await apiService({
    endpoint: `${endpoints.createConflict}/${slug}`,
    method: "POST",
    data: payload,
    headers: { "Content-Type": "application/json" },
  });

  console.log("✅ Create LAT API Response:", apiResponse);
  return apiResponse;
};

export const updateConflict = async (id, data) => {
  try {
    if (!id) throw new Error("ID is required for updating Section");

    const apiResponse = await apiService({
      endpoint: `${endpoints.updateConflict}/update/${id}`,
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
