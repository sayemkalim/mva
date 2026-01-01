import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const createEmail = async (emailData) => {
  try {
    console.log("Creating email with data:", emailData);
    const formData = new FormData();

    // From field (required)
    if (emailData.from) {
      formData.append("from", emailData.from);
    }

    // To field as array
    if (emailData.to) {
      // Support both string and array formats
      const toArray = Array.isArray(emailData.to) 
        ? emailData.to 
        : emailData.to.split(",").map(email => email.trim()).filter(email => email);
      
      toArray.forEach((email) => {
        formData.append("to[]", email);
      });
    }

    // CC field as array (optional)
    if (emailData.cc) {
      const ccArray = Array.isArray(emailData.cc)
        ? emailData.cc
        : emailData.cc.split(",").map(email => email.trim()).filter(email => email);
      
      ccArray.forEach((email) => {
        formData.append("cc[]", email);
      });
    }

    // BCC field as array (optional)
    if (emailData.bcc) {
      const bccArray = Array.isArray(emailData.bcc)
        ? emailData.bcc
        : emailData.bcc.split(",").map(email => email.trim()).filter(email => email);
      
      bccArray.forEach((email) => {
        formData.append("bcc[]", email);
      });
    }

    // Subject
    if (emailData.subject) {
      formData.append("subject", emailData.subject);
    }

    // Body
    if (emailData.body) {
      formData.append("body", emailData.body);
    }

    // Attachments as array
    if (emailData.attachments && emailData.attachments.length > 0) {
      emailData.attachments.forEach((file) => {
        formData.append("attachments[]", file);
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
