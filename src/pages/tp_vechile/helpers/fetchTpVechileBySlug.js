import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const fetchTpVechileBySlug = async (slug) => {
  try {
    // console.log("🔍 Fetching vehicle with slug:", slug);

    const apiResponse = await apiService({
      endpoint: `${endpoints.tpVechile}/${slug}`,
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    // console.log("🔎 apiResponse RAW ===>", apiResponse);

    if (!apiResponse) {
      return null;
    }
    if (
      typeof apiResponse.response === "string" &&
      apiResponse.response.trim() === ""
    ) {
      return null;
    }
    if (apiResponse.Apistatus === false) {
      return null;
    }
    const data =
      apiResponse.data ||
      apiResponse.vehicle ||
      apiResponse.result ||
      apiResponse.response ||
      apiResponse;

    if (!data || (typeof data === "object" && Object.keys(data).length === 0)) {
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error fetching vehicle info:", error);
    throw error;
  }
};
