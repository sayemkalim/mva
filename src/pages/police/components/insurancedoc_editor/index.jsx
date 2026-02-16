import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Loader2,
  ChevronRight,
  Upload,
  X,
  FileText,
  Image as ImageIcon,
} from "lucide-react";
import { toast } from "sonner";

import { Navbar2 } from "@/components/navbar2";
import Billing from "@/components/billing";
import { uploadAttachment } from "../../helpers/uploadAttachment";
import { fetchLatById } from "../../helpers/fetchLatById";
import { createPolice, updatePolice } from "../../helpers/createPolice";

export default function PoliceReportPage() {
  const { slug, id } = useParams();
  const navigate = useNavigate();

  const { data: conflictData, isLoading: loadingConflict } = useQuery({
    queryKey: ["conflictSearchData", id],
    queryFn: () => fetchLatById(id),
    enabled: !!id,
    retry: 1,
  });

  const uploadMutation = useMutation({
    mutationFn: uploadAttachment,
    onSuccess: (data) => {
      console.log("✅ Full API Response:", data);
      const attachmentId =
        data?.response?.attachment?.id ||
        data?.attachment?.id ||
        data?.response?.id ||
        data?.id;

      console.log("📌 Extracted attachment_id:", attachmentId);

      if (attachmentId) {
        setFormData((prev) => ({
          ...prev,
          attachment_id: attachmentId,
        }));
        toast.success("File uploaded successfully!");
      } else {
        console.error(
          "❌ Could not extract attachment_id from response:",
          data
        );
        toast.error("Upload successful but couldn't get attachment ID");
      }
    },
    onError: (error) => {
      toast.error("Failed to upload file. Please try again.");
      console.error("❌ Upload error:", error);
      setFile(null);
      setFileName("");
      setFilePreview(null);
    },
  });

  const mutation = useMutation({
    mutationFn: (data) => {
      console.log("Mutation Payload:", data);
      if (id) {
        return updatePolice(id, data);
      } else {
        if (!slug) {
          return Promise.reject(
            new Error(
              "Slug is required for creating Insurance Ownership Document"
            )
          );
        }
        return createPolice({ slug, ...data });
      }
    },
    onSuccess: (data) => {
      const resp = data?.response;
      if (resp?.Apistatus === false) {
        toast.error(resp?.message || "Validation failed");
        return;
      }
      toast.success(
        id
          ? "Police Report updated successfully!"
          : "Police Report saved successfully!"
      );
      // navigate(`/dashboard/workstation/edit/${slug}`);
    },
    onError: (error) => {
      console.error("Mutation Error:", error);
      const errorData = error.response?.data;
      if (errorData?.Apistatus === false) {
        toast.error(errorData?.message || "Validation failed");
      } else {
        toast.error(
          errorData?.message ||
          (id
            ? "Failed to update Police Report"
            : "Failed to save Police Report")
        );
      }
    },
  });

  const [formData, setFormData] = useState({
    name: "",
    attachment_id: null,
    date: "",
    memo: "",
  });

  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [filePreview, setFilePreview] = useState(null);
  const [fileType, setFileType] = useState(null);

  useEffect(() => {
    if (conflictData) {
      setFormData({
        name: conflictData.name || "",
        attachment_id: conflictData.attachment_id || null,
        date: conflictData.date ? conflictData.date.split("T")[0] : "",
        memo: conflictData.memo || "",
      });

      if (conflictData.file_url) {
        setFilePreview(conflictData.file_url);
        setFileName(conflictData.file_name || "Uploaded file");
        const extension = conflictData.file_name
          ?.split(".")
          .pop()
          ?.toLowerCase();
        setFileType(extension);
      }
    }
  }, [conflictData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (selectedFile) => {
    if (selectedFile) {
      if (selectedFile.size > 10485760) {
        toast.error("File size must be less than 10MB");
        return;
      }

      const extension = selectedFile.name.split(".").pop().toLowerCase();
      setFileType(extension);
      const previewUrl = URL.createObjectURL(selectedFile);
      setFile(selectedFile);
      setFileName(selectedFile.name);
      setFilePreview(previewUrl);
      try {
        await uploadMutation.mutateAsync({ file: selectedFile });
      } catch (error) {
        console.error("Upload failed:", error);
      }
    }
  };

  const removeFile = () => {
    if (filePreview && filePreview.startsWith("blob:")) {
      URL.revokeObjectURL(filePreview);
    }
    setFile(null);
    setFileName("");
    setFilePreview(null);
    setFileType(null);
    setFormData((prev) => ({
      ...prev,
      attachment_id: null,
    }));
    const fileInput = document.getElementById("conflictSearchFile");
    if (fileInput) fileInput.value = "";
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name) {
      toast.error("Please enter a name");
      return;
    }

    const payload = {
      name: formData.name,
      attachment_id: formData.attachment_id,
      date: formData.date,
      memo: formData.memo,
    };
    console.log("🚀 Submitted Payload:", payload);
    console.log("📌 Attachment ID in payload:", payload.attachment_id);

    mutation.mutate(payload);
  };

  const isImageFile = (type) => {
    return ["jpg", "jpeg", "png", "gif", "webp"].includes(type?.toLowerCase());
  };

  if (loadingConflict) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted">
      <Navbar2 />

      <Billing />

      {/* Breadcrumb Navigation */}
      <nav className="bg-card border-b px-6 py-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/dashboard")}
            className="hover:text-foreground transition"
            type="button"
          >
            Dashboard
          </button>
          <ChevronRight className="w-4 h-4" />
          <button
            onClick={() => navigate("/dashboard/workstation")}
            className="hover:text-foreground transition"
            type="button"
          >
            Workstation
          </button>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground font-medium">
            {id ? "Edit Police Report" : "Police Report"}
          </span>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-6xl">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-foreground">
          {id ? "Edit Police Report" : "Police Report"}
        </h1>

        <form
          className="bg-card rounded-lg shadow-sm border p-6 sm:p-8 space-y-6"
          onSubmit={handleSubmit}
        >
          {/* Basic Information */}
          <div>
            {/* <h2 className="text-lg font-semibold text-foreground mb-4">
              Search Information
            </h2> */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-foreground font-medium">Name</Label>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter name"
                  className="h-11"
                  required
                  disabled={mutation.isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-foreground font-medium">Date</Label>
                <Input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="h-11"
                  disabled={mutation.isLoading}
                />
              </div>
            </div>
          </div>

          {/* File Upload */}
          <div className="pt-6 border-t">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Attachment
            </h2>
            <div className="space-y-2">
              <Label className="text-foreground font-medium">
                Upload File <span className="text-red-500">(Max 10MB)</span>
              </Label>
              <div
                className={`relative border-2 border-dashed rounded-lg transition-all overflow-hidden ${filePreview
                  ? "border-green-500 bg-green-50/50"
                  : "border-input bg-muted hover:border-gray-400 hover:bg-gray-100"
                  } ${uploadMutation.isLoading
                    ? "pointer-events-none opacity-70"
                    : ""
                  }`}
                style={{ minHeight: "250px" }}
              >
                <input
                  id="conflictSearchFile"
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    const selectedFile = e.target.files?.[0];
                    if (selectedFile) handleFileChange(selectedFile);
                  }}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  disabled={mutation.isLoading || uploadMutation.isLoading}
                />

                {filePreview ? (
                  <div className="relative h-full min-h-[250px] flex flex-col items-center justify-center p-4">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile();
                      }}
                      className="absolute top-3 right-3 z-10 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors shadow-md"
                      disabled={mutation.isLoading || uploadMutation.isLoading}
                    >
                      <X className="w-4 h-4" />
                    </button>

                    {isImageFile(fileType) ? (
                      // Image Preview
                      <div className="flex flex-col items-center gap-3">
                        <div className="relative group">
                          <img
                            src={filePreview}
                            alt="Preview"
                            className="max-h-[180px] max-w-full rounded-lg shadow-md border-2 border-green-500"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-lg transition-colors" />
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-medium text-green-700">
                            Image Uploaded
                          </p>
                          <p className="text-xs text-muted-foreground mt-1 max-w-[200px] truncate">
                            {fileName}
                          </p>
                          {uploadMutation.isLoading && (
                            <p className="text-xs text-blue-600 mt-1 flex items-center gap-1 justify-center">
                              <Loader2 className="w-3 h-3 animate-spin" />
                              Uploading...
                            </p>
                          )}
                        </div>
                      </div>
                    ) : (
                      // Document Preview
                      <div className="flex flex-col items-center justify-center gap-3">
                        <div className="relative">
                          <div className="w-28 h-28 bg-gradient-to-br from-green-100 to-green-200 rounded-xl border-2 border-green-500 shadow-md flex items-center justify-center">
                            <FileText className="w-12 h-12 text-green-600" />
                          </div>
                        </div>

                        <div className="text-center">
                          <p className="text-sm font-medium text-green-700">
                            File Uploaded
                          </p>
                          <p className="text-xs text-muted-foreground mt-1 max-w-[200px] truncate">
                            {fileName}
                          </p>
                          {uploadMutation.isLoading && (
                            <p className="text-xs text-blue-600 mt-1 flex items-center gap-1 justify-center">
                              <Loader2 className="w-3 h-3 animate-spin" />
                              Uploading...
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div
                    className="h-full min-h-[250px] flex flex-col items-center justify-center cursor-pointer p-6 group"
                    onClick={() => {
                      if (!mutation.isLoading && !uploadMutation.isLoading) {
                        document.getElementById("conflictSearchFile").click();
                      }
                    }}
                  >
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center group-hover:from-blue-50 group-hover:to-blue-100 transition-all">
                        <Upload className="w-9 h-9 text-gray-400 group-hover:text-blue-500 transition-colors" />
                      </div>

                      <div className="text-center">
                        <p className="text-base font-semibold text-foreground group-hover:text-blue-600 transition-colors">
                          Upload File
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Drag and drop or click
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          PDF, DOC, DOCX, JPG, PNG - Max 10MB
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Memo */}
          <div className="pt-6 border-t">
            <h2 className="text-lg font-semibold text-foreground mb-4">Memo</h2>
            <div className="space-y-2">
              <Label className="text-foreground font-medium">Memo</Label>
              <Textarea
                name="memo"
                value={formData.memo}
                onChange={handleChange}
                placeholder="Enter memo details"
                rows={4}
                className="resize-none"
                disabled={mutation.isLoading}
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t">
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              type="button"
              className="w-full sm:w-auto"
              disabled={mutation.isLoading || uploadMutation.isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={mutation.isLoading || uploadMutation.isLoading}
              className="w-full sm:w-auto"
            >
              {mutation.isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : id ? (
                "Update Insurance Ownership"
              ) : (
                "Save Insurance Ownership"
              )}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
