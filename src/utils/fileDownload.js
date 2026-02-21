export const MIME_TO_EXTENSION = {
    "application/pdf": "pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
    "application/msword": "doc",
    "application/vnd.ms-excel": "xls",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
};

export const downloadFile = (data, headers, defaultFileName) => {
    console.log("downloadFile called with:", { data, headers, defaultFileName });

    const getHeader = (h, key) => {
        if (!h) return null;
        if (typeof h.get === "function") return h.get(key);
        // Try both lowercase and original
        return h[key.toLowerCase()] || h[key];
    };

    const contentType = getHeader(headers, "content-type");
    const contentDisposition = getHeader(headers, "content-disposition");
    console.log("Headers parsed:", { contentType, contentDisposition });

    const blob = data instanceof Blob ? data : new Blob([data], { type: contentType });
    console.log("Blob created:", blob);

    const extension = MIME_TO_EXTENSION[contentType?.toLowerCase()] || null;
    let fileName = defaultFileName;

    if (contentDisposition) {
        // Better regex for Content-Disposition
        const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
        const matches = filenameRegex.exec(contentDisposition);
        if (matches != null && matches[1]) {
            fileName = matches[1].replace(/['"]/g, '');
            console.log("FileName extracted from disposition:", fileName);
        }
    }

    // If we still don't have an extension but we know it from MIME type
    if (extension && !fileName.toLowerCase().endsWith(`.${extension}`)) {
        fileName = `${fileName}.${extension}`;
        console.log("Extension added to fileName:", fileName);
    }

    // Fallback for PDF if type matches
    if (!fileName.includes('.') && contentType === 'application/pdf') {
        fileName = `${fileName}.pdf`;
    }

    console.log("Triggering download for:", fileName);

    try {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", fileName);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        console.log("Download triggered successfully");
    } catch (err) {
        console.error("Error in downloadFile execution:", err);
    }
};
