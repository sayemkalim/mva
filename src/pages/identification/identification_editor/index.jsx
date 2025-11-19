import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, ChevronRight, X, Plus, Upload, Eye } from "lucide-react";
import { toast } from "sonner";
import { createIdentification } from "../helpers/createIdentification";
import { getIdentificationMeta } from "../helpers/fetchIdentificationMetadata";
import { fetchIdentificationBySlug } from "../helpers/fetchIdentificationBySlug";
import { uploadAttachment } from "../helpers/uploadAttachment";
import { SidebarTrigger } from "@/components/ui/sidebar";

export default function Identification() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    data: apiResponse,
    isLoading: isLoadingMetadata,
    error: metadataError,
    isError: isMetadataError,
  } = useQuery({
    queryKey: ["identificationMeta"],
    queryFn: getIdentificationMeta,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  const metadata = apiResponse?.response || {};

  const { data: identificationData, isLoading: isLoadingIdentification } =
    useQuery({
      queryKey: ["identification", slug],
      queryFn: async () => {
        if (!slug) return null;
        try {
          const data = await fetchIdentificationBySlug(slug);
          return data;
        } catch (error) {
          if (
            error.message?.includes("404") ||
            error.message?.includes("not found")
          ) {
            return null;
          }
          throw error;
        }
      },
      enabled: !!slug,
      staleTime: 5 * 60 * 1000,
      retry: 1,
    });

  const uploadMutation = useMutation({
    mutationFn: uploadAttachment,
    onSuccess: (data, variables) => {
      const attachmentId = data?.response?.attachment_id;
      const { index } = variables;
      if (attachmentId) {
        setIdentifications((prev) =>
          prev.map((item, i) =>
            i === index ? { ...item, attachment_id: attachmentId } : item
          )
        );
        toast.success(`File ${index + 1} uploaded successfully!`);
      }
    },
    onError: () => {
      toast.error("Failed to upload file. Please try again.");
    },
  });

  const createMutation = useMutation({
    mutationFn: createIdentification,
    onSuccess: (apiResponse) => {
      if (apiResponse?.response?.Apistatus) {
        toast.success("Identification saved successfully!");
        // navigate(`/dashboard/workstation/edit/${slug}/employment`);
      }
    },
    onError: () => {
      toast.error("Failed to save identification. Please try again.");
    },
  });

  const [identifications, setIdentifications] = useState([
    {
      attachment_id: null,
      copy_in_file_id: "",
      id_verification_date: "",
      id_verification_by: "",
      identification_type: "",
      identification_country: "",
      identification_number: "",
      file: null,
      fileName: "",
      filePreview: null,
      isDragging: false,
      isUploading: false,
    },
  ]);
  const [previewIndex, setPreviewIndex] = useState(null);

  useEffect(() => {
    if (!slug) {
      toast.error("Invalid URL - Slug not found!");
      navigate("/dashboard/workstation");
    }
  }, [slug, navigate]);

  useEffect(() => {
    if (
      identificationData &&
      Array.isArray(identificationData) &&
      identificationData.length > 0
    ) {
      setIdentifications(
        identificationData.map((item) => ({
          attachment_id: item.attachment_id || null,
          copy_in_file_id: item.copy_in_file_id || "",
          id_verification_date: item.id_verification_date
            ? item.id_verification_date.split("T")[0]
            : "",
          id_verification_by: item.id_verification_by || "",
          identification_type: item.identification_type || "",
          identification_country: item.identification_country || "",
          identification_number: item.identification_number || "",
          file: null,
          fileName: "",
          filePreview: null,
          isDragging: false,
          isUploading: false,
        }))
      );
    }
  }, [identificationData]);

  const handleChange = (index, field, value) => {
    setIdentifications((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const handleSelectChange = (index, field, value) => {
    setIdentifications((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, [field]: Number(value) } : item
      )
    );
  };

  const handleTypeChange = (index, value) => {
    const selectedType = metadata?.type?.find((t) => t.id === Number(value));
    setIdentifications((prev) =>
      prev.map((item, i) =>
        i === index
          ? { ...item, identification_type: selectedType?.name || "" }
          : item
      )
    );
  };

  const handleFileChange = async (index, file) => {
    if (file) {
      if (file.size > 1048576) {
        toast.error("File size must be less than 1MB");
        return;
      }
      const previewUrl = URL.createObjectURL(file);
      setIdentifications((prev) =>
        prev.map((item, i) =>
          i === index
            ? {
                ...item,
                file: file,
                fileName: file.name,
                filePreview: previewUrl,
                isUploading: true,
              }
            : item
        )
      );
      try {
        await uploadMutation.mutateAsync({ file, index });
        setIdentifications((prev) =>
          prev.map((item, i) =>
            i === index ? { ...item, isUploading: false } : item
          )
        );
      } catch (error) {
        setIdentifications((prev) =>
          prev.map((item, i) =>
            i === index
              ? {
                  ...item,
                  file: null,
                  fileName: "",
                  filePreview: null,
                  isUploading: false,
                }
              : item
          )
        );
      }
    }
  };

  const removeFile = (index) => {
    setIdentifications((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              file: null,
              fileName: "",
              filePreview: null,
              attachment_id: null,
            }
          : item
      )
    );
    const fileInput = document.getElementById(`file_${index}`);
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const handleDragEnter = (index, e) => {
    e.preventDefault();
    e.stopPropagation();
    setIdentifications((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, isDragging: true } : item
      )
    );
  };

  const handleDragLeave = (index, e) => {
    e.preventDefault();
    e.stopPropagation();
    setIdentifications((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, isDragging: false } : item
      )
    );
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (index, e) => {
    e.preventDefault();
    e.stopPropagation();
    setIdentifications((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, isDragging: false } : item
      )
    );
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileChange(index, file);
    }
  };

  const addIdentification = () => {
    setIdentifications((prev) => [
      ...prev,
      {
        attachment_id: null,
        copy_in_file_id: "",
        id_verification_date: "",
        id_verification_by: "",
        identification_type: "",
        identification_country: "",
        identification_number: "",
        file: null,
        fileName: "",
        filePreview: null,
        isDragging: false,
        isUploading: false,
      },
    ]);
  };

  const removeIdentification = (index) => {
    if (identifications.length === 1) {
      toast.error("At least one identification is required!");
      return;
    }
    setIdentifications((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const hasValidData = identifications.some(
      (item) =>
        item.identification_type ||
        item.identification_number ||
        item.identification_country
    );
    if (!hasValidData) {
      toast.error("Please fill at least one identification!");
      return;
    }
    if (identifications.some((item) => item.isUploading)) {
      toast.error("Please wait for all files to finish uploading!");
      return;
    }
    const payload = identifications
      .filter(
        (item) =>
          item.identification_type ||
          item.identification_number ||
          item.identification_country
      )
      .map((item) => ({
        attachment_id: item.attachment_id || null,
        copy_in_file_id: item.copy_in_file_id || null,
        id_verification_date: item.id_verification_date || null,
        id_verification_by: item.id_verification_by || null,
        identification_type: item.identification_type || null,
        identification_country: item.identification_country || null,
        identification_number: item.identification_number || null,
      }));
    createMutation.mutate({
      slug: slug,
      data: payload,
    });
  };

  if (isLoadingMetadata || isLoadingIdentification) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading form data...</span>
      </div>
    );
  }

  if (isMetadataError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="text-red-500 text-xl font-semibold">
          Error loading form
        </div>
        <p className="text-gray-600">
          {metadataError?.message || "Invalid response from server"}
        </p>
        <div className="flex gap-4">
          <Button
            onClick={() =>
              queryClient.invalidateQueries(["identificationMeta"])
            }
          >
            Retry
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate("/dashboard/workstation")}
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-6 py-3">
        <div className="flex items-center justify-end gap-6 text-sm">
          <span className="text-gray-700">
            Unpaid: <span className="font-semibold">$ 0</span>
          </span>
          <span className="text-gray-700">
            Unbilled: <span className="font-semibold">$ 0</span>
          </span>
          <span className="text-gray-700">
            Client Funds-Operating: <span className="font-semibold">$ 0</span>
          </span>
          <span className="text-gray-700">
            Client Funds-Trust: <span className="font-semibold">$ 0</span>
          </span>
        </div>
      </div>

      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <SidebarTrigger className="-ml-1" />
          <button
            onClick={() => navigate("/dashboard")}
            className="hover:text-gray-900 transition"
          >
            Dashboard
          </button>
          <ChevronRight className="w-4 h-4" />
          <button
            onClick={() => navigate("/dashboard/workstation")}
            className="hover:text-gray-900 transition"
          >
            Workstation
          </button>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 font-medium">Identification</span>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-7xl">
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <h1 className="text-2xl font-bold mb-8 text-gray-900 uppercase">
            Identification
          </h1>
          <form onSubmit={handleSubmit} className="space-y-8">
            {identifications.map((identification, index) => (
              <div
                key={index}
                className="border border-gray-200 p-6 rounded-lg space-y-6 bg-gray-50"
              >
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-gray-900 text-lg">
                    Identification {index + 1}
                  </h3>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removeIdentification(index)}
                    disabled={identifications.length === 1}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Remove
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Copy in File */}
                  <div className="space-y-2">
                    <Label
                      htmlFor={`copy_in_file_id_${index}`}
                      className="text-gray-700 font-medium"
                    >
                      Copy in File
                    </Label>
                    <Select
                      value={identification.copy_in_file_id?.toString()}
                      onValueChange={(value) =>
                        handleSelectChange(index, "copy_in_file_id", value)
                      }
                    >
                      <SelectTrigger className="w-full h-11 bg-white border-gray-300">
                        <SelectValue placeholder="Select option" />
                      </SelectTrigger>
                      <SelectContent>
                        {metadata?.yes_no_option?.map((option) => (
                          <SelectItem
                            key={option.id}
                            value={option.id.toString()}
                          >
                            {option.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* ID Verification Date */}
                  <div className="space-y-2">
                    <Label
                      htmlFor={`id_verification_date_${index}`}
                      className="text-gray-700 font-medium"
                    >
                      ID Verification Date
                    </Label>
                    <Input
                      id={`id_verification_date_${index}`}
                      type="date"
                      value={identification.id_verification_date}
                      onChange={(e) =>
                        handleChange(
                          index,
                          "id_verification_date",
                          e.target.value
                        )
                      }
                      className="w-full h-9 bg-white border-gray-300"
                    />
                  </div>

                  {/* ID Verification By */}
                  <div className="space-y-2">
                    <Label
                      htmlFor={`id_verification_by_${index}`}
                      className="text-gray-700 font-medium"
                    >
                      ID Verification By
                    </Label>
                    <Input
                      id={`id_verification_by_${index}`}
                      value={identification.id_verification_by}
                      onChange={(e) =>
                        handleChange(
                          index,
                          "id_verification_by",
                          e.target.value
                        )
                      }
                      placeholder="John Doe"
                      className="w-full h-9 bg-white border-gray-300"
                    />
                  </div>

                  {/* Identification Type */}
                  <div className="space-y-2">
                    <Label
                      htmlFor={`identification_type_${index}`}
                      className="text-gray-700 font-medium"
                    >
                      Identification Type
                    </Label>
                    <Select
                      value={
                        metadata?.type
                          ?.find(
                            (t) => t.name === identification.identification_type
                          )
                          ?.id?.toString() || ""
                      }
                      onValueChange={(value) => handleTypeChange(index, value)}
                    >
                      <SelectTrigger className="w-full h-11 bg-white border-gray-300">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {metadata?.type?.map((type) => (
                          <SelectItem key={type.id} value={type.id.toString()}>
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Identification Country */}
                  <div className="space-y-2">
                    <Label
                      htmlFor={`identification_country_${index}`}
                      className="text-gray-700 font-medium"
                    >
                      Country
                    </Label>
                    <Input
                      id={`identification_country_${index}`}
                      value={identification.identification_country}
                      onChange={(e) =>
                        handleChange(
                          index,
                          "identification_country",
                          e.target.value
                        )
                      }
                      placeholder="USA"
                      className="w-full h-9 bg-white border-gray-300"
                    />
                  </div>

                  {/* Identification Number */}
                  <div className="space-y-2">
                    <Label
                      htmlFor={`identification_number_${index}`}
                      className="text-gray-700 font-medium"
                    >
                      Identification Number
                    </Label>
                    <Input
                      id={`identification_number_${index}`}
                      value={identification.identification_number}
                      onChange={(e) =>
                        handleChange(
                          index,
                          "identification_number",
                          e.target.value
                        )
                      }
                      placeholder="A12345678"
                      className="w-full h-9 bg-white border-gray-300"
                    />
                  </div>

                  {/* File Upload with Preview and Download */}
                  <div className="space-y-2 md:col-span-2 lg:col-span-3">
                    <Label className="text-gray-700 font-medium">
                      Upload Document{" "}
                      <span className="text-red-500">(Max 1M)</span>
                      {identification.attachment_id && (
                        <span className="ml-2 text-xs text-green-600">
                          ✓ Uploaded (ID: {identification.attachment_id})
                        </span>
                      )}
                    </Label>
                    <div
                      className={`relative border-2 border-dashed rounded-lg transition-all ${
                        identification.isUploading
                          ? "border-blue-500 bg-blue-50"
                          : identification.isDragging
                          ? "border-blue-500 bg-blue-50"
                          : identification.filePreview
                          ? "border-green-500 bg-green-50/50"
                          : "border-gray-300 bg-white hover:border-gray-400"
                      }`}
                    >
                      <input
                        id={`file_${index}`}
                        type="file"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileChange(index, file);
                        }}
                        accept="image/*,.pdf,.doc,.docx"
                        disabled={identification.isUploading}
                      />

                      {identification.filePreview ? (
                        <div className="relative p-4">
                          {identification.isUploading && (
                            <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-20 rounded-lg">
                              <div className="flex flex-col items-center gap-2">
                                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                                <p className="text-sm text-gray-600">
                                  Uploading...
                                </p>
                              </div>
                            </div>
                          )}

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFile(index);
                            }}
                            className="absolute top-6 right-6 z-10 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors shadow-lg"
                            disabled={identification.isUploading}
                          >
                            <X className="w-5 h-5" />
                          </button>

                          <div className="flex items-center gap-4">
                            <img
                              src={identification.filePreview}
                              alt="Preview"
                              className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200 cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={() => setPreviewIndex(index)}
                            />
                            <div className="flex-1">
                              <p className="font-medium text-sm text-gray-900">
                                {identification.fileName}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {identification.isUploading
                                  ? "Uploading file..."
                                  : "File uploaded successfully"}
                              </p>
                              {identification.attachment_id && (
                                <p className="text-xs text-green-600 mt-1">
                                  Attachment ID: {identification.attachment_id}
                                </p>
                              )}
                              <div className="flex gap-2 mt-2">
                                {/* Download Button */}
                                <a
                                  href={identification.filePreview}
                                  download={identification.fileName}
                                  className="inline-flex items-center px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  Download
                                </a>
                                {/* Preview Button */}
                                <button
                                  type="button"
                                  className="inline-flex items-center px-3 py-1 bg-gray-800 text-white text-xs rounded hover:bg-black"
                                  disabled={identification.isUploading}
                                  onClick={() => setPreviewIndex(index)}
                                >
                                  <Eye className="w-3 h-3 mr-1" /> Preview
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div
                          className="p-8 cursor-pointer"
                          onDragEnter={(e) => handleDragEnter(index, e)}
                          onDragLeave={(e) => handleDragLeave(index, e)}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(index, e)}
                          onClick={() =>
                            document.getElementById(`file_${index}`).click()
                          }
                        >
                          <div className="flex flex-col items-center justify-center gap-4">
                            <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center">
                              <Upload className="w-8 h-8 text-gray-400" />
                            </div>
                            <div className="text-center">
                              <p className="font-medium text-sm text-gray-900">
                                UPLOAD
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                Drag and drop or click to upload
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                Png, Jpg (Max 1MB)
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={addIdentification}
              className="w-full md:w-auto"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Another Identification
            </Button>

            <div className="flex justify-end gap-4 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/dashboard/workstation/edit/${slug}`)}
                disabled={createMutation.isPending || uploadMutation.isPending}
                size="lg"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || uploadMutation.isPending}
                size="lg"
              >
                {createMutation.isPending || uploadMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save & Continue"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Image Preview Modal */}
      <Dialog
        open={previewIndex !== null}
        onOpenChange={() => setPreviewIndex(null)}
      >
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Document Preview</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center p-4">
            {previewIndex !== null &&
              identifications[previewIndex]?.filePreview && (
                <>
                  <img
                    src={identifications[previewIndex].filePreview}
                    alt="Full Preview"
                    className="max-w-full max-h-[70vh] object-contain rounded-lg"
                  />
                  <a
                    href={identifications[previewIndex].filePreview}
                    download={identifications[previewIndex].fileName}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm inline-flex items-center gap-2"
                  >
                    Download {identifications[previewIndex].fileName}
                  </a>
                </>
              )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
