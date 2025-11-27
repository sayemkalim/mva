// helpers/fetchDriverInfoBySlug.js
import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const fetchDriverInfoBySlug = async (slug) => {
  try {
    const apiResponse = await apiService({
      // ✅ apna correct endpoint yahan use karo
      // Example:
      endpoint: `${endpoints.driverInfo}/${slug}`,
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Agar API ne kuch bhi return nahi kiya
    if (!apiResponse) {
      // record nahi mila → empty
      return null;
    }

    // Agar tumhari API meta jaisi hai:
    // { Apistatus: true, data: { ...driverInfo } }
    if (apiResponse.Apistatus === false) {
      // backend ne "fail" diya → empty treat karo, error nahi
      return null;
    }

    // Data alag key me bhi ho sakta hai, isliye safe fallback
    const data =
      apiResponse.data ||
      apiResponse.driver_information ||
      apiResponse.result ||
      apiResponse;

    // Agar data object hi nahi mila → empty treat
    if (!data || (typeof data === "object" && Object.keys(data).length === 0)) {
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error fetching driver info:", error);
    // yahan sirf network / genuine error pe hi throw kar rahe
    throw error;
  }
};
