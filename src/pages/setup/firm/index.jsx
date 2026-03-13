import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { endpoints } from "@/api/endpoints";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiService } from "@/api/api_service/apiService";
import { Navbar2 } from "@/components/navbar2";
import NavbarItem from "@/components/navbar/navbar_item";
import { FloatingInput, FloatingWrapper } from "@/components/ui/floating-label";
import { Building2, Loader2, Save, Upload, X, Eye } from "lucide-react";
import { Label } from "@/components/ui/label";
import { uploadAttachment } from "@/pages/applicantInfo/helpers/uploadAttachment";

const FirmSettings = () => {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    country_code_id: "",
    phone_number: "",
    firm_name: "",
    address: "",
    unit_no: "",
    city: "",
    state: "",
    zip_code: "",
    country: "",
    business_number: "",
    fax_number: "",
    toll_free_number: "",
    website_address: "",
    letter_head_header_id: null,
    letter_head_footer_id: null,
    headerPreview: null,
    footerPreview: null,
    headerFileName: "",
    footerFileName: "",
  });
  const [countryCodeOpen, setCountryCodeOpen] = useState(false);
  const [isDraggingHeader, setIsDraggingHeader] = useState(false);
  const [isDraggingFooter, setIsDraggingFooter] = useState(false);

  const breadcrumbs = [
    { title: "Setup", isNavigation: false },
    { title: "Firm", isNavigation: false },
  ];

  // Fetch firm metadata
  const {
    data: metaData,
    isLoading: isLoadingMeta,
    isError: isMetaError,
  } = useQuery({
    queryKey: ["firmMeta"],
    queryFn: async () => {
      const response = await apiService({
        endpoint: endpoints.firmMeta,
        method: "GET",
      });
      return response?.response || response;
    },
  });

  // Fetch firm data
  const {
    data: firmData,
    isLoading: isLoadingFirm,
    refetch,
  } = useQuery({
    queryKey: ["firmData"],
    queryFn: async () => {
      const response = await apiService({
        endpoint: endpoints.showFirm,
        method: "GET",
      });
      console.log("Firm API Response:", response);
      // The response might be nested or direct, handle both cases
      const data = response?.response || response;
      // console.log("Extracted Firm Data:", data);
      return data;
    },
  });

  const countryCodes = metaData?.country_codes || [];

  // Populate form when firm data loads
  useEffect(() => {
    if (firmData) {
      console.log("Prefilling form with:", firmData);

      // Extract phone number without formatting
      let phoneNumber = firmData.phone_number || "";
      // Remove formatting: "+1 (999) 999-9999" -> "9999999999"
      phoneNumber = phoneNumber.replace(/[\s\(\)\+\-]/g, "");
      // Remove country code if it's at the start
      if (phoneNumber.startsWith("1") && phoneNumber.length > 10) {
        phoneNumber = phoneNumber.substring(1);
      }

      setFormData({
        first_name: firmData.first_name || "",
        last_name: firmData.last_name || "",
        country_code_id: firmData.country_code_id?.toString() || "",
        phone_number: phoneNumber,
        firm_name: firmData.firm_name || "",
        unit_no: firmData.unit_no || "",
        address: firmData.address || "",
        city: firmData.city || "",
        state: firmData.state || "",
        zip_code: firmData.zip_code || "",
        country: firmData.country || "",
        // business_number: firmData.business_number || "",
        fax_number: firmData.fax_number || "",
        toll_free_number: firmData.toll_free_number || "",
        website_address: firmData.website_address || "",
        letter_head_header_id: firmData.letter_head_header_url || null,
        letter_head_footer_id: firmData.letter_head_footer_url || null,
        headerPreview: firmData.letter_head_header_url || null,
        footerPreview: firmData.letter_head_footer_url || null,
        headerFileName: firmData.letter_head_header_url
          ? "Current Header Image"
          : "",
        footerFileName: firmData.letter_head_footer_url
          ? "Current Footer Image"
          : "",
      });
    }
  }, [firmData]);

  const fileUploadMutation = useMutation({
    mutationFn: async ({ file, type }) => {
      const response = await uploadAttachment({ file });
      return { response, type };
    },
    onSuccess: (data) => {
      const { response: apiResponse, type } = data;
      const attachmentId = apiResponse?.response?.attachment_id;
      if (attachmentId) {
        setFormData((prev) => ({
          ...prev,
          [type === "header"
            ? "letter_head_header_id"
            : "letter_head_footer_id"]: attachmentId,
        }));
        toast.success(
          `${type === "header" ? "Header" : "Footer"} uploaded successfully!`,
        );
      } else {
        toast.error(`Failed to retrieve ${type} attachment ID.`);
      }
    },
    onError: (error) => {
      toast.error("Failed to upload image. Please try again.");
      console.error("Upload error:", error);
    },
  });

  const handleFileChange = (file, type) => {
    if (file && file.size > 1024 * 1024) {
      toast.error(`File size must be less than 1MB`);
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (type === "header") {
        setFormData((prev) => ({
          ...prev,
          headerPreview: e.target.result,
          headerFileName: file.name,
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          footerPreview: e.target.result,
          footerFileName: file.name,
        }));
      }
    };
    reader.readAsDataURL(file);

    // Trigger the file upload API immediately
    fileUploadMutation.mutate({ file, type });
  };

  const removeFile = (type) => {
    if (type === "header") {
      setFormData((prev) => ({
        ...prev,
        letter_head_header_id: null,
        headerPreview: null,
        headerFileName: "",
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        letter_head_footer_id: null,
        footerPreview: null,
        footerFileName: "",
      }));
    }
  };

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data) => {
      // Create FormData for multipart/form-data
      const formDataToSend = new FormData();
      Object.keys(data).forEach((key) => {
        if (
          ![
            "headerPreview",
            "footerPreview",
            "headerFileName",
            "footerFileName",
          ].includes(key)
        ) {
          if (
            data[key] !== null &&
            data[key] !== undefined &&
            data[key] !== ""
          ) {
            formDataToSend.append(key, data[key]);
          }
        }
      });

      return apiService({
        endpoint: endpoints.updateFirm,
        method: "POST",
        data: formDataToSend,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    },
    onSuccess: (data) => {
      const apiStatus = data?.Apistatus || data?.response?.Apistatus;
      if (apiStatus === true) {
        const message =
          data?.message ||
          data?.response?.message ||
          "Firm updated successfully!";
        toast.success(message);
        refetch();
      } else {
        const message =
          data?.message || data?.response?.message || "Update failed";
        toast.error(message);
      }
    },
    onError: (error) => {
      console.error("Update error:", error);
      const message =
        error?.response?.data?.message || "Update failed. Please try again.";
      toast.error(message);
    },
  });

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({
      ...formData,
      [id]: value,
    });
  };

  const handleSelectChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const submissionData = {
      ...formData,
      country_code_id: formData.country_code_id
        ? parseInt(formData.country_code_id)
        : undefined,
    };

    updateMutation.mutate(submissionData);
  };

  if (isLoadingMeta || isLoadingFirm) {
    return (
      <div className="flex flex-col gap-4">
        <Navbar2 />
        <NavbarItem title="Firm Settings" breadcrumbs={breadcrumbs} />
        <div className="flex flex-col items-center justify-center gap-4 py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">
            Loading firm settings...
          </p>
        </div>
      </div>
    );
  }

  if (isMetaError) {
    return (
      <div className="flex flex-col gap-4">
        <Navbar2 />
        <NavbarItem title="Firm Settings" breadcrumbs={breadcrumbs} />
        <div className="flex flex-col items-center justify-center gap-4 py-8">
          <p className="text-sm text-red-500">Error loading form metadata</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Navbar2 />
      <NavbarItem title="Firm Settings" breadcrumbs={breadcrumbs} />

      <div className="p-4">
        {/* Debug Info - Remove this in production */}
        {/* {firmData && (
          <Card className="mb-4 bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-sm">Debug: API Data Loaded</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs overflow-auto max-h-40">
                {JSON.stringify(firmData, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )} */}

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Firm Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Personal Information */}
              <div>
                <h3 className="text-sm font-medium mb-4">
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-3">
                    <FloatingInput
                      id="first_name"
                      type="text"
                      label="First Name"
                      value={formData.first_name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="grid gap-3">
                    <FloatingInput
                      id="last_name"
                      type="text"
                      label="Last Name"
                      value={formData.last_name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h3 className="text-sm font-medium mb-4">
                  Contact Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Phone Number with Country Code */}
                  <div className="grid gap-3">
                    <div className="grid grid-cols-5 gap-3">
                      <div className="col-span-2">
                        <FloatingWrapper
                          label="Country Code"
                          required
                          hasValue={!!formData.country_code_id}
                          isFocused={countryCodeOpen}
                        >
                          <Select
                            open={countryCodeOpen}
                            onOpenChange={setCountryCodeOpen}
                            value={formData.country_code_id}
                            onValueChange={(value) =>
                              handleSelectChange("country_code_id", value)
                            }
                          >
                            <SelectTrigger
                              className="w-full bg-transparent border border-input text-sm"
                              style={{ height: "52px" }}
                            >
                              <SelectValue placeholder="" />
                            </SelectTrigger>
                            <SelectContent>
                              {countryCodes.map((country) => (
                                <SelectItem
                                  key={country.id}
                                  value={country.id.toString()}
                                >
                                  {country.code}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FloatingWrapper>
                      </div>
                      <div className="col-span-3">
                        <FloatingInput
                          id="phone_number"
                          type="tel"
                          label="Phone Number"
                          value={formData.phone_number}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-3">
                    <FloatingInput
                      id="fax_number"
                      type="tel"
                      label="Fax Number"
                      value={formData.fax_number}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="grid gap-3">
                    <FloatingInput
                      id="toll_free_number"
                      type="tel"
                      label="Toll Free Number"
                      value={formData.toll_free_number}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="grid gap-3">
                    <FloatingInput
                      id="business_number"
                      type="text"
                      label="Business Number"
                      value={formData.business_number}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              {/* Firm Information */}
              <div>
                <h3 className="text-sm font-medium mb-4">Firm Details</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div className="grid gap-3">
                    <FloatingInput
                      id="firm_name"
                      type="text"
                      label="Firm Name"
                      value={formData.firm_name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="grid gap-3">
                    <FloatingInput
                      id="website_address"
                      type="url"
                      label="Website Address"
                      value={formData.website_address}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div>
                <h3 className="text-sm font-medium mb-4">Address</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-3">
                    <FloatingInput
                      id="unit_no"
                      type="text"
                      label="Unit No."
                      value={formData.unit_no}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="grid gap-3">
                    <FloatingInput
                      id="address"
                      type="text"
                      label="Street Address"
                      value={formData.address}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="grid gap-3">
                    <FloatingInput
                      id="city"
                      type="text"
                      label="City"
                      value={formData.city}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="grid gap-3">
                    <FloatingInput
                      id="state"
                      type="text"
                      label="State/Province"
                      value={formData.state}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="grid gap-3">
                    <FloatingInput
                      id="zip_code"
                      type="text"
                      label="Zip/Postal Code"
                      value={formData.zip_code}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="grid gap-3">
                    <FloatingInput
                      id="country"
                      type="text"
                      label="Country"
                      value={formData.country}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              {/* Letterhead Upload */}
              <div>
                <h3 className="text-sm font-medium mb-4">Letterhead Images</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Header Image */}
                  <div className="space-y-2">
                    <Label className="text-foreground font-medium">
                      Header Image{" "}
                      <span className="text-red-500">(Max 1MB)</span>
                    </Label>
                    <div
                      className={`relative border-2 border-dashed rounded-lg transition-all overflow-hidden ${
                        formData.headerPreview
                          ? "border-green-500 bg-green-50/50 h-[200px]"
                          : isDraggingHeader
                            ? "border-primary bg-primary/10 h-[200px]"
                            : "border-input bg-muted hover:border-gray-400 hover:bg-gray-100 h-[200px]"
                      }`}
                      onDragEnter={(e) => {
                        e.preventDefault();
                        setIsDraggingHeader(true);
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDraggingHeader(true);
                      }}
                      onDragLeave={(e) => {
                        e.preventDefault();
                        setIsDraggingHeader(false);
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDraggingHeader(false);
                        const file = e.dataTransfer.files?.[0];
                        if (file) handleFileChange(file, "header");
                      }}
                    >
                      <input
                        id="letter_head_header_id"
                        type="file"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileChange(file, "header");
                        }}
                        accept="image/*"
                      />
                      {formData.headerPreview ? (
                        <div className="relative h-full flex flex-col items-center justify-center p-1">
                          <div className="absolute top-2 right-2 z-10 flex gap-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeFile("header");
                              }}
                              className="w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors shadow-md"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          <img
                            src={formData.headerPreview}
                            alt="Header Preview"
                            className="w-full h-24 object-contain rounded border border-green-300 shadow-sm"
                          />
                          <p className="text-xs text-muted-foreground mt-2 truncate max-w-full px-4">
                            {formData.headerFileName}
                          </p>
                        </div>
                      ) : (
                        <div
                          className="h-full flex flex-col items-center justify-center cursor-pointer p-4 group"
                          onClick={() =>
                            document
                              .getElementById("letter_head_header_id")
                              .click()
                          }
                        >
                          <Upload className="w-8 h-8 text-gray-400 group-hover:text-primary transition-colors mb-2" />
                          <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                            Upload Header
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            PNG, JPG (Max 1MB)
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Footer Image */}
                  <div className="space-y-2">
                    <Label className="text-foreground font-medium">
                      Footer Image{" "}
                      <span className="text-red-500">(Max 1MB)</span>
                    </Label>
                    <div
                      className={`relative border-2 border-dashed rounded-lg transition-all overflow-hidden ${
                        formData.footerPreview
                          ? "border-green-500 bg-green-50/50 h-[200px]"
                          : isDraggingFooter
                            ? "border-primary bg-primary/10 h-[200px]"
                            : "border-input bg-muted hover:border-gray-400 hover:bg-gray-100 h-[200px]"
                      }`}
                      onDragEnter={(e) => {
                        e.preventDefault();
                        setIsDraggingFooter(true);
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDraggingFooter(true);
                      }}
                      onDragLeave={(e) => {
                        e.preventDefault();
                        setIsDraggingFooter(false);
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDraggingFooter(false);
                        const file = e.dataTransfer.files?.[0];
                        if (file) handleFileChange(file, "footer");
                      }}
                    >
                      <input
                        id="letter_head_footer_id"
                        type="file"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileChange(file, "footer");
                        }}
                        accept="image/*"
                      />
                      {formData.footerPreview ? (
                        <div className="relative h-full flex flex-col items-center justify-center p-1">
                          <div className="absolute top-2 right-2 z-10 flex gap-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeFile("footer");
                              }}
                              className="w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors shadow-md"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          <img
                            src={formData.footerPreview}
                            alt="Footer Preview"
                            className="w-full h-24 object-contain rounded border border-green-300 shadow-sm"
                          />
                          <p className="text-xs text-muted-foreground mt-2 truncate max-w-full px-4">
                            {formData.footerFileName}
                          </p>
                        </div>
                      ) : (
                        <div
                          className="h-full flex flex-col items-center justify-center cursor-pointer p-4 group"
                          onClick={() =>
                            document
                              .getElementById("letter_head_footer_id")
                              .click()
                          }
                        >
                          <Upload className="w-8 h-8 text-gray-400 group-hover:text-primary transition-colors mb-2" />
                          <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                            Upload Footer
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            PNG, JPG (Max 1MB)
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="flex items-center gap-2"
                >
                  {updateMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
};

export default FirmSettings;
