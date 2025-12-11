import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const createEmail = async (emailData) => {
  try {
    console.log("Creating email with data:", emailData);
    const formData = new FormData();

    formData.append("to", emailData.to);
    formData.append("cc", emailData.cc || "");
    formData.append("bcc", emailData.bcc || "");
    formData.append("subject", emailData.subject);
    formData.append("body", emailData.body);
    if (emailData.attachments && emailData.attachments.length > 0) {
      emailData.attachments.forEach((file, index) => {
        formData.append(`attachments[${index}]`, file);
      });
    }
    const apiResponse = await apiService({
      endpoint: endpoints.createEmail,
      method: "POST",
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    console.log("✅ Email created successfully:", apiResponse);
    return apiResponse;
  } catch (error) {
    console.error("🔥 Error creating email:", error);
    throw error;
  }
};
