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
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { getPrimaryEhcMeta } from "../helpers/fetchIPrimaryEhcMetadata";
import { fetchPrimaryEhcBySlug } from "../helpers/fetchPrimaryEhcBySlug";
import { createPrimaryEhc } from "../helpers/createPrimaryEhc";
import { SidebarTrigger } from "@/components/ui/sidebar";

export default function PrimaryEhc() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const {
    data: apiResponse,
    isLoading: isLoadingMetadata,
    error: metadataError,
    isError: isMetadataError,
  } = useQuery({
    queryKey: ["primaryEhcMeta"],
    queryFn: getPrimaryEhcMeta,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  const metadata = apiResponse?.response || {};

  const { data: primaryEhcData, isLoading: isLoadingPrimaryEhc } = useQuery({
    queryKey: ["primaryEhc", slug],
    queryFn: async () => {
      if (!slug) return null;

      try {
        const data = await fetchPrimaryEhcBySlug(slug);
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
  const createMutation = useMutation({
    mutationFn: createPrimaryEhc,
    onSuccess: (apiResponse) => {
      if (apiResponse?.response?.Apistatus) {
        toast.success("Primary EHC information saved successfully!");
        // navigate(`/dashboard/workstation/edit/${slug}/secondary-ehc`);
      }
    },
    onError: (error) => {
      toast.error("Failed to save information. Please try again.");
    },
  });

  const [formData, setFormData] = useState({
    which_ehc: "",
    year: "",
    status_id: null,
    insurance_co: "",
    ref_initail: "",
    claim_form: "",
    address: {
      unit_number: "",
      street_number: "",
      street_name: "",
      city: "",
      province: "",
      postal_code: "",
      country: "",
    },
    telephone: "",
    ext: "",
    fax: "",
    ref_first_name: "",
    ref_last_name: "",
    ref_pgroup_no: "",
    ref_idcard_no: "",
    ref_patient_id: "",
    ref_policyholder_same: false,
    ref_first_name_1: "",
    ref_last_name_1: "",
  });
  useEffect(() => {
    if (!slug) {
      toast.error("Invalid URL - Slug not found!");
      navigate("/dashboard/workstation");
    }
  }, [slug, navigate]);
  useEffect(() => {
    if (primaryEhcData) {
      console.log("📝 Populating form with existing data:", primaryEhcData);

      setFormData({
        which_ehc: primaryEhcData.which_ehc || "",
        year: primaryEhcData.year || "",
        status_id: primaryEhcData.status_id || null,
        insurance_co: primaryEhcData.insurance_co || "",
        ref_initail: primaryEhcData.ref_initail || "",
        claim_form: primaryEhcData.claim_form || "",
        address: {
          unit_number: primaryEhcData.address?.unit_number || "",
          street_number: primaryEhcData.address?.street_number || "",
          street_name: primaryEhcData.address?.street_name || "",
          city: primaryEhcData.address?.city || "",
          province: primaryEhcData.address?.province || "",
          postal_code: primaryEhcData.address?.postal_code || "",
          country: primaryEhcData.address?.country || "",
        },
        telephone: primaryEhcData.telephone || "",
        ext: primaryEhcData.ext || "",
        fax: primaryEhcData.fax || "",
        ref_first_name: primaryEhcData.ref_first_name || "",
        ref_last_name: primaryEhcData.ref_last_name || "",
        ref_pgroup_no: primaryEhcData.ref_pgroup_no || "",
        ref_idcard_no: primaryEhcData.ref_idcard_no || "",
        ref_patient_id: primaryEhcData.ref_patient_id || "",
        ref_policyholder_same: primaryEhcData.ref_policyholder_same || false,
        ref_first_name_1: primaryEhcData.ref_first_name_1 || "",
        ref_last_name_1: primaryEhcData.ref_last_name_1 || "",
      });

      // toast.success("Data loaded successfully!");
    } else {
      console.log("📝 No existing data - showing empty form");
    }
  }, [primaryEhcData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddressChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        [field]: value,
      },
    }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: Number(value),
    }));
  };

  const handleCheckboxChange = (checked) => {
    setFormData((prev) => ({
      ...prev,
      ref_policyholder_same: checked,
      ...(checked && {
        ref_first_name_1: "",
        ref_last_name_1: "",
      }),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isAddressFilled = (address) => {
      return Object.values(address).some(
        (value) => value && value.trim() !== ""
      );
    };
    const payload = {
      which_ehc: formData.which_ehc || null,
      year: formData.year || null,
      status_id: formData.status_id || null,
      insurance_co: formData.insurance_co || null,
      ref_initail: formData.ref_initail || null,
      claim_form: formData.claim_form || null,
      address: isAddressFilled(formData.address) ? formData.address : null,
      telephone: formData.telephone || null,
      ext: formData.ext || null,
      fax: formData.fax || null,
      ref_first_name: formData.ref_first_name || null,
      ref_last_name: formData.ref_last_name || null,
      ref_pgroup_no: formData.ref_pgroup_no || null,
      ref_idcard_no: formData.ref_idcard_no || null,
      ref_patient_id: formData.ref_patient_id || null,
      ref_policyholder_same: formData.ref_policyholder_same,
      ref_first_name_1: formData.ref_first_name_1 || null,
      ref_last_name_1: formData.ref_last_name_1 || null,
    };

    createMutation.mutate({
      slug: slug,
      data: payload,
    });
  };
  if (isLoadingMetadata || isLoadingPrimaryEhc) {
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
            onClick={() => queryClient.invalidateQueries(["primaryEhcMeta"])}
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
      {/* Header with Financial Stats */}
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

      {/* Breadcrumb */}
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
          <span className="text-gray-900 font-medium">Primary EHC</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <h1 className="text-2xl font-bold mb-8 text-gray-900 uppercase">
            Primary EHC Information
          </h1>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information Section */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Basic Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Which EHC */}
                <div className="space-y-2">
                  <Label
                    htmlFor="which_ehc"
                    className="text-gray-700 font-medium"
                  >
                    Which EHC
                  </Label>
                  <Input
                    id="which_ehc"
                    name="which_ehc"
                    value={formData.which_ehc}
                    onChange={handleChange}
                    placeholder="Harvard"
                    className="bg-gray-50 border-gray-300"
                  />
                </div>

                {/* Year */}
                <div className="space-y-2">
                  <Label htmlFor="year" className="text-gray-700 font-medium">
                    Year
                  </Label>
                  <Input
                    id="year"
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    placeholder="2000"
                    className="bg-gray-50 border-gray-300"
                  />
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <Label
                    htmlFor="status_id"
                    className="text-gray-700 font-medium"
                  >
                    Status
                  </Label>
                  <Select
                    value={formData.status_id?.toString() || ""}
                    onValueChange={(value) =>
                      handleSelectChange("status_id", value)
                    }
                  >
                    <SelectTrigger className="bg-gray-50 border-gray-300">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {metadata?.status?.map((option) => (
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

                {/* Insurance Co */}
                <div className="space-y-2">
                  <Label
                    htmlFor="insurance_co"
                    className="text-gray-700 font-medium"
                  >
                    Insurance Company
                  </Label>
                  <Input
                    id="insurance_co"
                    name="insurance_co"
                    value={formData.insurance_co}
                    onChange={handleChange}
                    placeholder="M"
                    className="bg-gray-50 border-gray-300"
                  />
                </div>

                {/* Ref Initial */}
                <div className="space-y-2">
                  <Label
                    htmlFor="ref_initail"
                    className="text-gray-700 font-medium"
                  >
                    Reference Initial
                  </Label>
                  <Input
                    id="ref_initail"
                    name="ref_initail"
                    value={formData.ref_initail}
                    onChange={handleChange}
                    placeholder="M"
                    maxLength={1}
                    className="bg-gray-50 border-gray-300"
                  />
                </div>

                {/* Claim Form */}
                <div className="space-y-2">
                  <Label
                    htmlFor="claim_form"
                    className="text-gray-700 font-medium"
                  >
                    Claim Form
                  </Label>
                  <Input
                    id="claim_form"
                    name="claim_form"
                    value={formData.claim_form}
                    onChange={handleChange}
                    placeholder="M"
                    className="bg-gray-50 border-gray-300"
                  />
                </div>
              </div>
            </div>

            {/* Contact Information Section */}
            <div className="space-y-6 pt-6 border-t">
              <h2 className="text-xl font-semibold text-gray-900">
                Contact Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Telephone */}
                <div className="space-y-2">
                  <Label
                    htmlFor="telephone"
                    className="text-gray-700 font-medium"
                  >
                    Telephone
                  </Label>
                  <Input
                    id="telephone"
                    name="telephone"
                    value={formData.telephone}
                    onChange={handleChange}
                    placeholder="(000)-000-0000"
                    className="bg-gray-50 border-gray-300"
                  />
                </div>

                {/* Extension */}
                <div className="space-y-2">
                  <Label htmlFor="ext" className="text-gray-700 font-medium">
                    Extension
                  </Label>
                  <Input
                    id="ext"
                    name="ext"
                    value={formData.ext}
                    onChange={handleChange}
                    placeholder="1"
                    className="bg-gray-50 border-gray-300"
                  />
                </div>

                {/* Fax */}
                <div className="space-y-2">
                  <Label htmlFor="fax" className="text-gray-700 font-medium">
                    Fax
                  </Label>
                  <Input
                    id="fax"
                    name="fax"
                    value={formData.fax}
                    onChange={handleChange}
                    placeholder="(000)-000-0000"
                    className="bg-gray-50 border-gray-300"
                  />
                </div>
              </div>
            </div>

            {/* Address Section */}
            <div className="space-y-6 pt-6 border-t">
              <h2 className="text-xl font-semibold text-gray-900">Address</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">
                    Unit Number
                  </Label>
                  <Input
                    value={formData.address.unit_number}
                    onChange={(e) =>
                      handleAddressChange("unit_number", e.target.value)
                    }
                    placeholder="5B"
                    className="bg-gray-50 border-gray-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">
                    Street Number
                  </Label>
                  <Input
                    value={formData.address.street_number}
                    onChange={(e) =>
                      handleAddressChange("street_number", e.target.value)
                    }
                    placeholder="221"
                    className="bg-gray-50 border-gray-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">
                    Street Name
                  </Label>
                  <Input
                    value={formData.address.street_name}
                    onChange={(e) =>
                      handleAddressChange("street_name", e.target.value)
                    }
                    placeholder="King Street West"
                    className="bg-gray-50 border-gray-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">City</Label>
                  <Input
                    value={formData.address.city}
                    onChange={(e) =>
                      handleAddressChange("city", e.target.value)
                    }
                    placeholder="Toronto"
                    className="bg-gray-50 border-gray-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">Province</Label>
                  <Input
                    value={formData.address.province}
                    onChange={(e) =>
                      handleAddressChange("province", e.target.value)
                    }
                    placeholder="Ontario"
                    className="bg-gray-50 border-gray-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">
                    Postal Code
                  </Label>
                  <Input
                    value={formData.address.postal_code}
                    onChange={(e) =>
                      handleAddressChange("postal_code", e.target.value)
                    }
                    placeholder="M5H 1K5"
                    className="bg-gray-50 border-gray-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">Country</Label>
                  <Input
                    value={formData.address.country}
                    onChange={(e) =>
                      handleAddressChange("country", e.target.value)
                    }
                    placeholder="Canada"
                    className="bg-gray-50 border-gray-300"
                  />
                </div>
              </div>
            </div>

            {/* Reference Information Section */}
            <div className="space-y-6 pt-6 border-t">
              <h2 className="text-xl font-semibold text-gray-900">
                Reference Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Ref First Name */}
                <div className="space-y-2">
                  <Label
                    htmlFor="ref_first_name"
                    className="text-gray-700 font-medium"
                  >
                    First Name
                  </Label>
                  <Input
                    id="ref_first_name"
                    name="ref_first_name"
                    value={formData.ref_first_name}
                    onChange={handleChange}
                    placeholder="f"
                    className="bg-gray-50 border-gray-300"
                  />
                </div>

                {/* Ref Last Name */}
                <div className="space-y-2">
                  <Label
                    htmlFor="ref_last_name"
                    className="text-gray-700 font-medium"
                  >
                    Last Name
                  </Label>
                  <Input
                    id="ref_last_name"
                    name="ref_last_name"
                    value={formData.ref_last_name}
                    onChange={handleChange}
                    placeholder="l"
                    className="bg-gray-50 border-gray-300"
                  />
                </div>

                {/* Ref Group No */}
                <div className="space-y-2">
                  <Label
                    htmlFor="ref_pgroup_no"
                    className="text-gray-700 font-medium"
                  >
                    Group Number
                  </Label>
                  <Input
                    id="ref_pgroup_no"
                    name="ref_pgroup_no"
                    value={formData.ref_pgroup_no}
                    onChange={handleChange}
                    placeholder=""
                    className="bg-gray-50 border-gray-300"
                  />
                </div>

                {/* Ref ID Card No */}
                <div className="space-y-2">
                  <Label
                    htmlFor="ref_idcard_no"
                    className="text-gray-700 font-medium"
                  >
                    ID Card Number
                  </Label>
                  <Input
                    id="ref_idcard_no"
                    name="ref_idcard_no"
                    value={formData.ref_idcard_no}
                    onChange={handleChange}
                    placeholder="(000)-000-0000"
                    className="bg-gray-50 border-gray-300"
                  />
                </div>

                {/* Ref Patient ID */}
                <div className="space-y-2">
                  <Label
                    htmlFor="ref_patient_id"
                    className="text-gray-700 font-medium"
                  >
                    Patient ID
                  </Label>
                  <Input
                    id="ref_patient_id"
                    name="ref_patient_id"
                    value={formData.ref_patient_id}
                    onChange={handleChange}
                    placeholder="1"
                    className="bg-gray-50 border-gray-300"
                  />
                </div>
              </div>
            </div>

            {/* Policyholder Information Section */}
            <div className="space-y-6 pt-6 border-t">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="ref_policyholder_same"
                  checked={formData.ref_policyholder_same}
                  onCheckedChange={handleCheckboxChange}
                />
                <Label
                  htmlFor="ref_policyholder_same"
                  className="text-gray-700 font-medium cursor-pointer"
                >
                  Policyholder Same as Patient
                </Label>
              </div>

              {!formData.ref_policyholder_same && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-6 border-l-2 border-gray-200">
                  {/* Policyholder First Name */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="ref_first_name_1"
                      className="text-gray-700 font-medium"
                    >
                      Policyholder First Name
                    </Label>
                    <Input
                      id="ref_first_name_1"
                      name="ref_first_name_1"
                      value={formData.ref_first_name_1}
                      onChange={handleChange}
                      placeholder="First Name"
                      className="bg-gray-50 border-gray-300"
                    />
                  </div>

                  {/* Policyholder Last Name */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="ref_last_name_1"
                      className="text-gray-700 font-medium"
                    >
                      Policyholder Last Name
                    </Label>
                    <Input
                      id="ref_last_name_1"
                      name="ref_last_name_1"
                      value={formData.ref_last_name_1}
                      onChange={handleChange}
                      placeholder="Last Name"
                      className="bg-gray-50 border-gray-300"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end gap-4 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/dashboard/workstation/edit/${slug}`)}
                disabled={createMutation.isPending}
                size="lg"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending}
                size="lg"
              >
                {createMutation.isPending ? (
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
    </div>
  );
}
