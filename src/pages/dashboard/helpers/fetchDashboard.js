import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const fetchDashboard = async () => {
  try {
    const apiResponse = await apiService({
      endpoint: `${endpoints.dashboard}`,
      method: "GET",
    });

    console.log("Full API response:", apiResponse);
    // const { cases, tasks, todos } = apiResponse.response;

    // console.log("Cases:", cases);
    // console.log("Tasks:", tasks);
    // console.log("Todos:", todos);
    return apiResponse.response;
  } catch (error) {
    console.error("Error fetching dashboard:", error);
    throw error;
  }
};
