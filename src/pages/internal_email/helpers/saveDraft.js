import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const saveDraft = async (emailData, slug) => {
    try {
        console.log("Saving draft with data:", emailData);
        const formData = new FormData();

        // From field (required)
        if (emailData.from) {
            formData.append("from", emailData.from);
        }

        // To field as array
        if (emailData.to) {
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
        if (emailData.draft_id) {
            formData.append("draft_id", emailData.draft_id);
        }
        if (slug) {
            formData.append("slug", slug);
        }

        const apiResponse = await apiService({
            endpoint: endpoints.saveDraft,
            method: "POST",
            data: formData,
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return apiResponse;
    } catch (error) {
        throw error;
    }
};
