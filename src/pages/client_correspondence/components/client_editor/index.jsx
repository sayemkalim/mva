import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Loader2,
  ChevronRight,
  Upload,
  X,
  FileText,
  Check,
  ChevronsUpDown,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import { Navbar2 } from "@/components/navbar2";
import Billing from "@/components/billing";
import { uploadAttachment } from "../../helpers/uploadAttachment";
import {
  createClientCorrespondence,
  updateClientCorrespondence,
} from "../../helpers/createClient";
import { getABMeta } from "../../helpers/fetchABMeta";

export default function CorrespondencePage() {
  const { slug, id } = useParams();
  const navigate = useNavigate();

  const {
    data: metaDataRaw,
    isLoading: loadingMeta,
    error: metaError,
  } = useQuery({
    queryKey: ["abMeta"],
    queryFn: getABMeta,
    staleTime: 5 * 60 * 1000,
  });

  const metaData = metaDataRaw?.response;

  const { data: correspondenceData, isLoading: loadingCorrespondence } =
    useQuery({
      queryKey: ["correspondenceData", id],
      queryFn: () => fetchLatById(id),
      enabled: !!id,
      retry: 1,
    });

  const uploadMutation = useMutation({
    mutationFn: uploadAttachment,
    onSuccess: (data) => {
      const attachmentId =
        data?.response?.attachment?.id ||
        data?.attachment?.id ||
        data?.response?.id ||
        data?.id;

      if (attachmentId) {
        setFormData((prev) => ({
          ...prev,
          attachment_id: attachmentId,
        }));
        toast.success("File uploaded successfully!");
      } else {
        toast.error("Upload successful but couldn't get attachment ID");
      }
    },
    onError: (error) => {
      toast.error("Failed to upload file. Please try again.");
      setFile(null);
      setFileName("");
      setFilePreview(null);
    },
  });

  const mutation = useMutation({
    mutationFn: (data) => {
      if (id) {
        return updateClientCorrespondence(id, data);
      } else {
        if (!slug) {
          return Promise.reject(
            new Error("Slug is required for creating Correspondence")
          );
        }
        return createClientCorrespondence({ slug, ...data });
      }
    },
    onSuccess: () => {
      toast.success(
        id
          ? "Correspondence updated successfully!"
          : "Correspondence saved successfully!"
      );
    },
    onError: (err) => {
      toast.error(
        err.message ||
        (id
          ? "Failed to update Correspondence"
          : "Failed to save Correspondence")
      );
    },
  });

  const [formData, setFormData] = useState({
    sr_no: "",
    attachment_id: null,
    matter: "",
    date: "",
    type_id: "",
    description: "",
    action_performed_by_id: "",
    minute: "",
    rate: "",
    status_id: "",
  });

  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [filePreview, setFilePreview] = useState(null);
  const [fileType, setFileType] = useState(null);
  const [timeInput, setTimeInput] = useState("");
  const [openType, setOpenType] = useState(false);
  const [openAction, setOpenAction] = useState(false);
  const [openStatus, setOpenStatus] = useState(false);

  useEffect(() => {
    if (correspondenceData) {
      setFormData({
        sr_no: correspondenceData.sr_no || "",
        attachment_id: correspondenceData.attachment_id || null,
        matter: correspondenceData.matter || "",
        date: correspondenceData.date
          ? correspondenceData.date.split("T")[0]
          : "",
        type_id: correspondenceData.type_id || "",
        description: correspondenceData.description || "",
        action_performed_by_id: correspondenceData.action_performed_by_id || "",
        minute: correspondenceData.minute || "",
        rate: correspondenceData.rate || "",
        status_id: correspondenceData.status_id || "",
      });

      if (correspondenceData.minute) {
        const decimalMinutes = parseFloat(correspondenceData.minute);
        const hours = Math.floor(decimalMinutes / 60);
        const minutes = Math.round(decimalMinutes % 60);
        setTimeInput(
          `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
            2,
            "0"
          )}`
        );
      }

      if (correspondenceData.file_url) {
        setFilePreview(correspondenceData.file_url);
        setFileName(correspondenceData.file_name || "Uploaded file");
        const extension = correspondenceData.file_name
          ?.split(".")
          .pop()
          ?.toLowerCase();
        setFileType(extension);
      }
    }
  }, [correspondenceData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleTimeChange = (e) => {
    const timeValue = e.target.value;
    setTimeInput(timeValue);

    if (timeValue) {
      const [hours, minutes] = timeValue.split(":").map(Number);
      const totalMinutes = hours * 60 + minutes;
      const decimalMinutes = totalMinutes.toFixed(1);

      setFormData((prev) => ({ ...prev, minute: decimalMinutes }));
    } else {
      setFormData((prev) => ({ ...prev, minute: "" }));
    }
  };

  const handleComboboxChange = (name, value) => {
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };

      if (name === "action_performed_by_id" && metaData?.ActionPerformed) {
        const selectedAction = metaData.ActionPerformed.find(
          (action) => action.id === parseInt(value)
        );
        if (selectedAction) {
          updated.rate = selectedAction.rate;
        }
      }

      return updated;
    });
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
    const fileInput = document.getElementById("correspondenceFile");
    if (fileInput) fileInput.value = "";
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !formData.matter ||
      !formData.type_id ||
      !formData.action_performed_by_id ||
      !formData.status_id
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    const payload = {
      sr_no: formData.sr_no,
      attachment_id: formData.attachment_id,
      matter: formData.matter,
      date: formData.date,
      type_id: parseInt(formData.type_id),
      description: formData.description,
      action_performed_by_id: parseInt(formData.action_performed_by_id),
      minute: formData.minute,
      rate: formData.rate,
      status_id: parseInt(formData.status_id),
    };

    mutation.mutate(payload);
  };

  const isImageFile = (type) => {
    return ["jpg", "jpeg", "png", "gif", "webp"].includes(type?.toLowerCase());
  };

  // Get selected label functions
  const getSelectedTypeLabel = () => {
    if (!formData.type_id || !metaData?.correspondence_type)
      return "Select type";
    const selected = metaData.correspondence_type.find(
      (type) => type.id === parseInt(formData.type_id)
    );
    return selected ? selected.name : "Select type";
  };

  const getSelectedActionLabel = () => {
    if (!formData.action_performed_by_id || !metaData?.ActionPerformed)
      return "Select action performed by";
    const selected = metaData.ActionPerformed.find(
      (action) => action.id === parseInt(formData.action_performed_by_id)
    );
    return selected ? selected.name : "Select action performed by";
  };

  const getSelectedStatusLabel = () => {
    if (!formData.status_id || !metaData?.correspondence_status)
      return "Select status";
    const selected = metaData.correspondence_status.find(
      (status) => status.id === parseInt(formData.status_id)
    );
    return selected ? selected.name : "Select status";
  };

  if (loadingCorrespondence || loadingMeta) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading...</span>
      </div>
    );
  }

  if (metaError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-red-500 text-lg">Failed to load metadata</p>
        <p className="text-sm text-muted-foreground mt-2">{metaError?.message}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted">
      <Navbar2 />

      <Billing />

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
            {id ? "Edit Correspondence" : "Add Correspondence"}
          </span>
        </div>
      </nav>

      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-6xl">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-foreground">
          {id ? "Edit Correspondence" : "Add Correspondence"}
        </h1>

        <form
          className="bg-card rounded-lg shadow-sm border p-6 sm:p-8 space-y-6"
          onSubmit={handleSubmit}
        >
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Correspondence Details
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-foreground font-medium">
                  Serial Number
                </Label>
                <Input
                  name="sr_no"
                  value={formData.sr_no}
                  onChange={handleChange}
                  placeholder="Enter serial number"
                  className="h-11"
                  disabled={mutation.isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-foreground font-medium">
                  Matter <span className="text-red-500">*</span>
                </Label>
                <Input
                  name="matter"
                  value={formData.matter}
                  onChange={handleChange}
                  placeholder="Enter matter"
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

              <div className="space-y-2">
                <Label className="text-foreground font-medium">
                  Type <span className="text-red-500">*</span>
                </Label>
                <Popover open={openType} onOpenChange={setOpenType}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openType}
                      className="w-full h-11 justify-between"
                      disabled={mutation.isLoading}
                    >
                      {getSelectedTypeLabel()}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search type..." />
                      <CommandList>
                        <CommandEmpty>No type found.</CommandEmpty>
                        <CommandGroup>
                          {metaData?.correspondence_type?.map((type) => (
                            <CommandItem
                              key={type.id}
                              value={type.name}
                              onSelect={() => {
                                handleComboboxChange(
                                  "type_id",
                                  type.id.toString()
                                );
                                setOpenType(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  formData.type_id === type.id.toString()
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {type.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Action Performed By Combobox */}
              <div className="space-y-2">
                <Label className="text-foreground font-medium">
                  Action Performed By <span className="text-red-500">*</span>
                </Label>
                <Popover open={openAction} onOpenChange={setOpenAction}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openAction}
                      className="w-full h-11 justify-between"
                      disabled={mutation.isLoading}
                    >
                      {getSelectedActionLabel()}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search action..." />
                      <CommandList>
                        <CommandEmpty>No action found.</CommandEmpty>
                        <CommandGroup>
                          {metaData?.ActionPerformed?.map((action) => (
                            <CommandItem
                              key={action.id}
                              value={action.name}
                              onSelect={() => {
                                handleComboboxChange(
                                  "action_performed_by_id",
                                  action.id.toString()
                                );
                                setOpenAction(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  formData.action_performed_by_id ===
                                    action.id.toString()
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {action.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Status Combobox */}
              <div className="space-y-2">
                <Label className="text-foreground font-medium">
                  Status <span className="text-red-500">*</span>
                </Label>
                <Popover open={openStatus} onOpenChange={setOpenStatus}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openStatus}
                      className="w-full h-11 justify-between"
                      disabled={mutation.isLoading}
                    >
                      {getSelectedStatusLabel()}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search status..." />
                      <CommandList>
                        <CommandEmpty>No status found.</CommandEmpty>
                        <CommandGroup>
                          {metaData?.correspondence_status?.map((status) => (
                            <CommandItem
                              key={status.id}
                              value={status.name}
                              onSelect={() => {
                                handleComboboxChange(
                                  "status_id",
                                  status.id.toString()
                                );
                                setOpenStatus(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  formData.status_id === status.id.toString()
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {status.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Minutes Input with Time Icon - FIXED */}
              <div className="space-y-2">
                <Label className="text-foreground font-medium">
                  Time (Hours:Minutes)
                </Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    type="time"
                    value={timeInput}
                    onChange={handleTimeChange}
                    placeholder="00:00"
                    className="h-11 pl-10"
                    disabled={mutation.isLoading}
                  />
                </div>
                {formData.minute && (
                  <p className="text-xs text-gray-500">
                    Total minutes: {formData.minute}
                  </p>
                )}
              </div>

              {/* Rate Input with $ prefix */}
              <div className="space-y-2">
                <Label className="text-foreground font-medium">Rate</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                    $
                  </span>
                  <Input
                    name="rate"
                    type="number"
                    step="0.01"
                    value={formData.rate}
                    onChange={handleChange}
                    placeholder="0.00"
                    className="h-11 pl-7"
                    disabled={mutation.isLoading}
                    readOnly
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Description
            </h2>
            <div className="space-y-2">
              <Label className="text-foreground font-medium">Description</Label>
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter description details"
                rows={4}
                className="resize-none"
                disabled={mutation.isLoading}
              />
            </div>
          </div>

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
                  id="correspondenceFile"
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
                        document.getElementById("correspondenceFile").click();
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
                "Update Correspondence"
              ) : (
                "Save Correspondence"
              )}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
