import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const fetchTaskList = async (queryString = "") => {
  try {
    const endpoint = queryString
      ? `${endpoints.filterTasks}?${queryString}`
      : `${endpoints.taskList}`;

    const apiResponse = await apiService({
      endpoint: endpoint,
      method: "GET",
    });

    console.log("Full API response:", apiResponse);
    return apiResponse;
  } catch (error) {
    console.error("Error fetching task list:", error);
    throw error;
  }
};
