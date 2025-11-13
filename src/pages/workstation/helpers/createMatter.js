import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const createMatter = async (matterData) => {
  try {
    const apiResponse = await apiService({
      endpoint: `${endpoints.createMatter}`, // ya jo bhi tumhara endpoint hai
      method: "POST",
      data: matterData,
      headers: {
        "Content-Type": "application/json",
      },
    });

    return apiResponse;
  } catch (error) {
    console.error("Error creating matter:", error);
    throw error;
  }
};
