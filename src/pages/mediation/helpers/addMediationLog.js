import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const addMediationLog = async (data) => {
  return await apiService({
    endpoint: endpoints.createMediationLog,
    method: "POST",
    data,
  });
};
