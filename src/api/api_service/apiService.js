import axios from "axios";
import { getItem } from "@/utils/local_storage";
import { BACKEND_URL } from "@/utils/url";

export const apiService = async ({
  endpoint,
  method = "GET",
  data,
  params,
  token: _token,
  headers = {},
  customUrl,
  removeToken = false,
  signal,
  responseType,
}) => {
  try {
    const token = getItem("token");

    const requestHeaders = {
      "ngrok-skip-browser-warning": "true",
      ...headers,
    };

    if (!removeToken && (token || _token)) {
      requestHeaders.Authorization = `Bearer ${_token || token}`;
    }

    const requestObj = {
      url: `${customUrl ? customUrl : BACKEND_URL}/${endpoint}`,
      params,
      method,
      data,
      signal,
      headers: requestHeaders,
      responseType,
    };

    const response = await axios(requestObj);
    return {
      response: response.data,
      headers: response.headers,
      status: response.status,
      raw: response
    };
  } catch (error) {
    console.error(error, "backend endpoint error");
    return { success: false, error: true, ...(error || {}) };
  }
};
