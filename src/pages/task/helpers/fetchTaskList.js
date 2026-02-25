import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const fetchTaskList = async (queryString = "", paginationQuery = "") => {
  try {
    const endpoint = queryString
      ? `${endpoints.filterTasks}?${queryString}&${paginationQuery}`
      : `${endpoints.taskList}?${paginationQuery}`;

    const apiResponse = await apiService({
      endpoint: endpoint,
      method: "GET",
    });

    return apiResponse;
  } catch (error) {
    console.error("Error fetching task list:", error);
    throw error;
  }
};
