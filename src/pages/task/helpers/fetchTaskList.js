import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";
// helpers/fetchTaskList.js
export const fetchTaskList = async () => {
  try {
    const apiResponse = await apiService({
      endpoint: `${endpoints.taskList}`,
      method: "GET",
    });

    console.log("Full API response:", apiResponse); // <-- yeh check kar
    return apiResponse; // <-- yeh return ho raha hai ya nahi
  } catch (error) {
    console.error("Error fetching task list:", error);
    throw error;
  }
};
