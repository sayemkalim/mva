import axios from "axios";
import { getItem } from "@/utils/local_storage";
import { BACKEND_URL } from "@/utils/url";
import { endpoints } from "@/api/endpoints";

const MIME_TO_EXTENSION = {
  "application/pdf": "pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  "application/msword": "doc",
  "application/vnd.ms-excel": "xls",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
};

export const downloadInvoice = async (invoiceId) => {
  try {
    const token = getItem("token");

    const response = await axios({
      url: `${BACKEND_URL}/${endpoints.downloadInvoice}/${invoiceId}`,
      method: "GET",
      responseType: "blob",
      headers: {
        Authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true",
      },
    });

    console.log("Invoice download response:", response);

    const blob = response.data;
    const contentType = response.headers["content-type"];
    const contentDisposition = response.headers["content-disposition"];

    console.log("Content-Type:", contentType);
    console.log("Content-Disposition:", contentDisposition);

    const extension = MIME_TO_EXTENSION[contentType];
    
    let fileName = `invoice_${invoiceId}`;
    if (extension) {
        fileName += `.${extension}`;
    }

    if (contentDisposition) {
      const match = contentDisposition.match(/filename="?([^"]+)"?/);
      if (match?.[1]) {
        fileName = match[1];
      }
    }

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();

    // Cleanup
    link.remove();
    window.URL.revokeObjectURL(url);
    
    return response;
  } catch (error) {
    console.error("Error downloading invoice:", error);
    throw error;
  }
};
