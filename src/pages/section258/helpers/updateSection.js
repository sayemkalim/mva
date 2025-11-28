import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const updateSection = async ({ payload, id }) => {
  try {
    const apiResponse = await apiService({
      endpoint: `${endpoints.updateSection}/update/${id}`,
      method: "Post",
      data: payload,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return apiResponse;
  } catch (error) {
    console.error(error);
  }
};
