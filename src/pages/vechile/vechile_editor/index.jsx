import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandItem,
  CommandGroup,
} from "@/components/ui/command";
import {
  Loader2,
  ChevronRight,
  Upload,
  X,
  Eye,
  ChevronsUpDown,
  Check,
  Download,
} from "lucide-react";
import { toast } from "sonner";
import { uploadAttachment } from "../helpers/uploadAttachment";
import { getABMeta } from "../helpers/fetchABMeta";
import { fetchVechileBySlug } from "../helpers/fetchVechileBySlug";
import { createVechile } from "../helpers/createVechile";
import { Navbar2 } from "@/components/navbar2";
import { deleteVechile } from "../helpers/deleteVechile";
import Billing from "@/components/billing";

export default function Vehicle() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    data: apiResponse,
    isLoading: isLoadingMetadata,
    error: metadataError,
    isError: isMetadataError,
  } = useQuery({
    queryKey: ["vehicleMeta"],
    queryFn: getABMeta,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  const metadata = apiResponse?.response || {};

  const { data: vehicleData, isLoading: isLoadingVehicle } = useQuery({
    queryKey: ["vehicle", slug],
    queryFn: async () => {
      if (!slug) return null;
      try {
        const data = await fetchVechileBySlug(slug);
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

  // ✅ Upload mutation - automatically uploads when file is selected
  const uploadMutation = useMutation({
    mutationFn: uploadAttachment,
    onSuccess: (data, variables) => {
      const attachmentId =
        data?.response?.attachment_id ||
        data?.response?.id ||
        data?.attachment_id ||
        data?.id;
      const { side } = variables;

      if (attachmentId) {
        setFormData((prev) => ({
          ...prev,
          [`${side}_attachment_id`]: attachmentId,
        }));
        setUploadingImages((prev) => ({ ...prev, [side]: false }));
        toast.success(
          `${side.replace(/_/g, " ")} image uploaded successfully!`
        );
      } else {
        setUploadingImages((prev) => ({ ...prev, [side]: false }));
        toast.error("Failed to upload image - No attachment ID returned");
      }
    },
    onError: (error, variables) => {
      const { side } = variables;
      setUploadingImages((prev) => ({ ...prev, [side]: false }));
      // Clear the failed upload
      setImages((prev) => ({ ...prev, [side]: null }));
      setImagePreviews((prev) => ({ ...prev, [side]: null }));
      toast.error(
        error?.message || "Failed to upload image. Please try again."
      );
    },
  });

  const createMutation = useMutation({
    mutationFn: createVechile,
    onSuccess: (data) => {
      const resp = data?.response || data;
      if (resp?.Apistatus === false) {
        toast.error(resp?.message || "Validation failed");
        return;
      }
      toast.success(resp?.message || "Vehicle information saved successfully!");
    },
    onError: (error) => {
      console.error("Mutation Error:", error);
      const errorData = error.response?.data;
      if (errorData?.Apistatus === false) {
        toast.error(errorData?.message || "Validation failed");
      } else {
        toast.error(errorData?.message || "Failed to save vehicle information");
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => deleteVechile(id),
  });

  const [formData, setFormData] = useState({
    plate_no: "",
    name: "",
    province: "",
    vehicle_year: "",
    vehicle_make: "",
    vehicle_model: "",
    vehicle_color: "",
    driver_licence_same_as_applicant_id: null,
    front_side_attachment_id: null,
    back_side_attachment_id: null,
    left_side_attachment_id: null,
    right_side_attachment_id: null,
  });

  const [images, setImages] = useState({
    front_side: null,
    back_side: null,
    left_side: null,
    right_side: null,
  });

  const [imagePreviews, setImagePreviews] = useState({
    front_side: null,
    back_side: null,
    left_side: null,
    right_side: null,
  });

  const [uploadingImages, setUploadingImages] = useState({
    front_side: false,
    back_side: false,
    left_side: false,
    right_side: false,
  });

  const [previewModal, setPreviewModal] = useState({
    isOpen: false,
    image: null,
    title: "",
  });

  const [popoverOpen, setPopoverOpen] = useState({
    driver_licence_same_as_applicant_id: false,
  });

  useEffect(() => {
    if (!slug) {
      toast.error("Invalid URL - Slug not found!");
      navigate("/dashboard/workstation");
    }
  }, [slug, navigate]);

  // ✅ Backend se data aur images load karna
  useEffect(() => {
    if (vehicleData) {
      setFormData({
        plate_no: vehicleData.plate_no || "",
        name: vehicleData.name || "",
        province: vehicleData.province || "",
        vehicle_year: vehicleData.vehicle_year || "",
        vehicle_make: vehicleData.vehicle_make || "",
        vehicle_model: vehicleData.vehicle_model || "",
        vehicle_color: vehicleData.vehicle_color || "",
        driver_licence_same_as_applicant_id:
          vehicleData.driver_licence_same_as_applicant_id || null,
        front_side_attachment_id: vehicleData.front_side_attachment_id || null,
        back_side_attachment_id: vehicleData.back_side_attachment_id || null,
        left_side_attachment_id: vehicleData.left_side_attachment_id || null,
        right_side_attachment_id: vehicleData.right_side_attachment_id || null,
      });

      // ✅ Image previews load karna backend se
      setImagePreviews({
        front_side: vehicleData.front_side_attachment?.path || null,
        back_side: vehicleData.back_side_attachment?.path || null,
        left_side: vehicleData.left_side_attachment?.path || null,
        right_side: vehicleData.right_side_attachment?.path || null,
      });
    }
  }, [vehicleData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    const numericValue = value === null ? null : Number(value);
    setFormData((prev) => ({
      ...prev,
      [name]: prev[name] === numericValue ? null : numericValue,
    }));
  };

  // ✅ File select hote hi automatic upload
  const handleImageChange = async (side, e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validation
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > 5242880) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    // Set preview
    const previewUrl = URL.createObjectURL(file);
    setImages((prev) => ({ ...prev, [side]: file }));
    setImagePreviews((prev) => ({ ...prev, [side]: previewUrl }));

    // Start upload immediately
    setUploadingImages((prev) => ({ ...prev, [side]: true }));

    try {
      await uploadMutation.mutateAsync({ file, side });
    } catch (error) {
      console.error("Upload error:", error);
    }
  };

  const handleImageRemove = (side) => {
    setImages((prev) => ({ ...prev, [side]: null }));
    setImagePreviews((prev) => ({ ...prev, [side]: null }));
    setFormData((prev) => ({ ...prev, [`${side}_attachment_id`]: null }));

    // Clear file input
    const fileInput = document.getElementById(`file-input-${side}`);
    if (fileInput) {
      fileInput.value = "";
    }

    toast.info(`${side.replace(/_/g, " ")} image removed`);
  };

  const handleImagePreview = (side, label) => {
    if (imagePreviews[side]) {
      setPreviewModal({
        isOpen: true,
        image: imagePreviews[side],
        title: label,
      });
    }
  };

  // ✅ Download function
  const handleImageDownload = (side, label) => {
    if (imagePreviews[side]) {
      const link = document.createElement("a");
      link.href = imagePreviews[side];
      link.download = `${label.replace(/\s+/g, "_")}.png`;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(`${label} download started!`);
    }
  };

  const closePreviewModal = () => {
    setPreviewModal({ isOpen: false, image: null, title: "" });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Check if any images are still uploading
    const isUploading = Object.values(uploadingImages).some((status) => status);
    if (isUploading) {
      toast.error("Please wait for all images to finish uploading!");
      return;
    }

    // ✅ Ensure vehicle_year is string
    const payload = {
      plate_no: formData.plate_no || null,
      name: formData.name || null,
      province: formData.province || null,
      vehicle_year: formData.vehicle_year ? String(formData.vehicle_year) : null,
      vehicle_make: formData.vehicle_make || null,
      vehicle_model: formData.vehicle_model || null,
      vehicle_color: formData.vehicle_color || null,
      driver_licence_same_as_applicant_id:
        formData.driver_licence_same_as_applicant_id || null,
      front_side_attachment_id: formData.front_side_attachment_id || null,
      back_side_attachment_id: formData.back_side_attachment_id || null,
      left_side_attachment_id: formData.left_side_attachment_id || null,
      right_side_attachment_id: formData.right_side_attachment_id || null,
    };

    console.log("📤 Payload:", payload);
    createMutation.mutate({ slug, data: payload });
  };

  const handleDelete = () => {
    if (!slug) return;
    deleteMutation.mutate(slug, {
      onSuccess: () => {
        toast.success("Vehicle deleted successfully!");
        navigate("/dashboard/workstation");
      },
      onError: () => {
        toast.error("Failed to delete vehicle. Please try again.");
      },
    });
  };

  if (isLoadingMetadata || isLoadingVehicle) {
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
        <p className="text-muted-foreground">
          {metadataError?.message || "Invalid response from server"}
        </p>
        <div className="flex gap-4">
          <Button
            onClick={() => queryClient.invalidateQueries(["vehicleMeta"])}
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

  // --- Inline SearchableDropdown component ---
  const SearchableDropdown = ({
    value,
    options,
    onSelect,
    placeholder,
    popoverKey,
    fieldName,
    popoverOpen,
    setPopoverOpen,
  }) => {
    const selectedOption = options?.find((opt) => opt.id === value);

    return (
      <Popover
        open={popoverOpen[popoverKey]}
        onOpenChange={(open) =>
          setPopoverOpen((p) => ({ ...p, [popoverKey]: open }))
        }
      >
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            className="w-full justify-between font-normal bg-muted"
            type="button"
          >
            {selectedOption ? selectedOption.name : placeholder}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[var(--radix-popover-trigger-width)] p-0"
          align="start"
        >
          <Command>
            <CommandInput placeholder="Search..." autoFocus />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup>
                {options?.map((opt) => (
                  <CommandItem
                    key={opt.id}
                    value={opt.name}
                    onSelect={() => onSelect(fieldName, opt.id, popoverKey)}
                    className="cursor-pointer flex items-center"
                  >
                    <Check
                      className={`mr-2 h-4 w-4 ${value === opt.id ? "opacity-100" : "opacity-0"
                        }`}
                    />
                    {opt.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  };

  // ✅ Image Upload Box Component
  const ImageUploadBox = ({ side, label }) => (
    <div className="space-y-2">
      <Label className="text-foreground font-medium">{label}</Label>
      <div className="border-2 border-dashed border-input rounded-lg p-4 bg-muted relative">
        {imagePreviews[side] ? (
          <div className="relative">
            {/* ✅ Uploading Overlay */}
            {uploadingImages[side] && (
              <div className="absolute inset-0 bg-card/90 flex items-center justify-center z-20 rounded-lg">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                  <p className="text-sm text-muted-foreground font-medium">
                    Uploading...
                  </p>
                </div>
              </div>
            )}

            {/* ✅ Action Buttons - Download & Remove */}
            <div className="absolute top-2 right-2 z-10 flex gap-2">
              {/* Download Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleImageDownload(side, label);
                }}
                className="w-8 h-8 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center transition-colors shadow-lg"
                title={`Download ${label}`}
                disabled={uploadingImages[side]}
              >
                <Download className="w-4 h-4" />
              </button>

              {/* Remove Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleImageRemove(side);
                }}
                className="w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors shadow-lg"
                title={`Remove ${label}`}
                disabled={uploadingImages[side]}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Image Preview */}
            <div className="relative group">
              <img
                src={imagePreviews[side]}
                alt={label}
                className="w-full h-48 object-cover rounded-lg cursor-pointer"
                onClick={() => handleImagePreview(side, label)}
              />
              <div
                className="absolute inset-0 bg-black bg-opacity-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                onClick={() => handleImagePreview(side, label)}
              >
                <Eye className="h-12 w-12 text-white" />
              </div>
            </div>

            {/* ✅ Upload Success Message */}
            {formData[`${side}_attachment_id`] && !uploadingImages[side] && (
              <div className="mt-2 text-green-600 text-sm font-medium flex items-center justify-center">
                <span className="mr-1"></span> Uploaded
              </div>
            )}
          </div>
        ) : (
          <label
            htmlFor={`file-input-${side}`}
            className="flex flex-col items-center justify-center h-48 cursor-pointer hover:bg-gray-100 transition rounded-lg"
          >
            <Upload className="h-12 w-12 text-gray-400 mb-2" />
            <span className="text-sm text-gray-500 font-medium">
              Click to select image
            </span>
            <span className="text-xs text-gray-400 mt-1">
              PNG, JPG, JPEG (Max 5MB)
            </span>
            <input
              id={`file-input-${side}`}
              type="file"
              accept="image/png,image/jpeg,image/jpg"
              onChange={(e) => handleImageChange(side, e)}
              className="hidden"
            />
          </label>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-muted">
      <Navbar2 />
      <Billing />

      <div className="bg-card border-b px-6 py-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <button
            onClick={() => navigate("/dashboard")}
            className="hover:text-foreground transition"
          >
            Dashboard
          </button>
          <ChevronRight className="w-4 h-4" />
          <button
            onClick={() => navigate("/dashboard/workstation")}
            className="hover:text-foreground transition"
          >
            Workstation
          </button>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground font-medium">Vehicle</span>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-7xl">
        <div className="bg-card rounded-lg shadow-sm border p-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold text-foreground uppercase">
              Vehicle Information
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Vehicle Details Section */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-foreground">
                Vehicle Details
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Plate Number */}
                <div className="space-y-2">
                  <Label
                    htmlFor="plate_no"
                    className="text-foreground font-medium"
                  >
                    Plate Number
                  </Label>
                  <Input
                    id="plate_no"
                    name="plate_no"
                    type="text"
                    value={formData.plate_no}
                    onChange={handleChange}
                    placeholder="ABCD-123"
                    className="h-9 bg-muted border-input"
                  />
                </div>

                {/* Vehicle Name */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-foreground font-medium">
                    Vehicle Name
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Honda Civic Car"
                    className="h-9 bg-muted border-input"
                  />
                </div>

                {/* Province */}
                <div className="space-y-2">
                  <Label
                    htmlFor="province"
                    className="text-foreground font-medium"
                  >
                    Province
                  </Label>
                  <Input
                    id="province"
                    name="province"
                    type="text"
                    value={formData.province}
                    onChange={handleChange}
                    placeholder="Ontario"
                    className="h-9 bg-muted border-input"
                  />
                </div>

                {/* ✅ Vehicle Year - Fixed to always return string */}
                <div className="space-y-2">
                  <Label
                    htmlFor="vehicle_year"
                    className="text-foreground font-medium"
                  >
                    Year
                  </Label>
                  <Input
                    id="vehicle_year"
                    name="vehicle_year"
                    type="text"
                    value={formData.vehicle_year}
                    onChange={handleChange}
                    placeholder="2022"
                    className="h-9 bg-muted border-input"
                    maxLength={4}
                    pattern="[0-9]*"
                  />
                </div>

                {/* Vehicle Make */}
                <div className="space-y-2">
                  <Label
                    htmlFor="vehicle_make"
                    className="text-foreground font-medium"
                  >
                    Make
                  </Label>
                  <Input
                    id="vehicle_make"
                    name="vehicle_make"
                    type="text"
                    value={formData.vehicle_make}
                    onChange={handleChange}
                    placeholder="Honda"
                    className="h-9 bg-muted border-input"
                  />
                </div>

                {/* Vehicle Model */}
                <div className="space-y-2">
                  <Label
                    htmlFor="vehicle_model"
                    className="text-foreground font-medium"
                  >
                    Model
                  </Label>
                  <Input
                    id="vehicle_model"
                    name="vehicle_model"
                    type="text"
                    value={formData.vehicle_model}
                    onChange={handleChange}
                    placeholder="Civic"
                    className="h-9 bg-muted border-input"
                  />
                </div>

                {/* Vehicle Color */}
                <div className="space-y-2">
                  <Label
                    htmlFor="vehicle_color"
                    className="text-foreground font-medium"
                  >
                    Color
                  </Label>
                  <Input
                    id="vehicle_color"
                    name="vehicle_color"
                    type="text"
                    value={formData.vehicle_color}
                    onChange={handleChange}
                    placeholder="Blue"
                    className="h-9 bg-muted border-input"
                  />
                </div>

                {/* Driver Licence Same as Applicant */}
                <div className="space-y-2">
                  <Label
                    htmlFor="driver_licence_same_as_applicant_id"
                    className="text-foreground font-medium"
                  >
                    Driver Licence Same as Applicant
                  </Label>
                  <SearchableDropdown
                    value={formData.driver_licence_same_as_applicant_id}
                    options={metadata?.yes_no_option || []}
                    onSelect={(fieldName, id, key) => {
                      handleSelectChange(fieldName, id);
                      setPopoverOpen((prev) => ({ ...prev, [key]: false }));
                    }}
                    placeholder="Select option"
                    popoverKey="driver_licence_same_as_applicant_id"
                    fieldName="driver_licence_same_as_applicant_id"
                    popoverOpen={popoverOpen}
                    setPopoverOpen={setPopoverOpen}
                  />
                </div>
              </div>
            </div>

            {/* Vehicle Images Section */}
            <div className="space-y-6 pt-6 border-t">
              <h2 className="text-xl font-semibold text-foreground">
                Vehicle Images
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ImageUploadBox side="front_side" label="Front Side" />
                <ImageUploadBox side="back_side" label="Back Side" />
                <ImageUploadBox side="left_side" label="Left Side" />
                <ImageUploadBox side="right_side" label="Right Side" />
              </div>
            </div>

            {/* Submit Buttons */}
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
      <Dialog open={previewModal.isOpen} onOpenChange={closePreviewModal}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{previewModal.title}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center bg-gray-100 rounded-lg p-4">
            <img
              src={previewModal.image}
              alt={previewModal.title}
              className="max-w-full max-h-[70vh] object-contain rounded-lg"
            />
            {/* Download button in modal */}
            <button
              onClick={() => {
                const link = document.createElement("a");
                link.href = previewModal.image;
                link.download = `${previewModal.title.replace(
                  /\s+/g,
                  "_"
                )}.png`;
                link.target = "_blank";
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

              }}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm inline-flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download {previewModal.title}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
