import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const createTask = async (data) => {
  try {
    const apiResponse = await apiService({
      endpoint: `${endpoints.createTask}`,
      method: "POST",
      data: data,
      headers: {
        "Content-Type": "application/json",
      },
    });
    return apiResponse;
  } catch (error) {
    console.error("❌ Error creating task:", error);
    console.error("❌ Error Response:", error.response?.data);
    throw error;
  }
};

export const searchContact = async (matterData) => {
  try {
    const apiResponse = await apiService({
      endpoint: `${endpoints.searchContact}`,
      method: "POST",
      data: matterData,
      headers: {
        "Content-Type": "application/json",
      },
    });

    return apiResponse;
  } catch (error) {
    console.error("Error searching contact:", error);
    throw error;
  }
};

export const updateTask = async (id, data) => {
  try {
    if (!id) throw new Error("ID is required for updating Section");

    const apiResponse = await apiService({
      endpoint: `${endpoints.updateTask}/update/${id}`,
      method: "PUT",
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
export const postComment = async (id, data) => {
  try {
    if (!id) throw new Error("ID is required for updating Section");

    const apiResponse = await apiService({
      endpoint: `${endpoints.postComment}/store/${id}`,
      method: "POST",
      data,
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("✅ Post API Response:", apiResponse);
    return apiResponse;
  } catch (error) {
    console.error("❌ Error updating comment:", error);
    throw error;
  }
};
export const updateStatus = async (id, data) => {
  try {
    if (!id) throw new Error("ID is required for updating Section");

    const apiResponse = await apiService({
      endpoint: `${endpoints.updateStatus}/${id}`,
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
