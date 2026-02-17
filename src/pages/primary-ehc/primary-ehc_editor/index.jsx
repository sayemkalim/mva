import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, ChevronRight, ChevronsUpDown, Check } from "lucide-react";
import { toast } from "sonner";
import { getPrimaryEhcMeta } from "../helpers/fetchIPrimaryEhcMetadata";
import { fetchPrimaryEhcBySlug } from "../helpers/fetchPrimaryEhcBySlug";
import { createPrimaryEhc } from "../helpers/createPrimaryEhc";
import { Navbar2 } from "@/components/navbar2";
import { formatPhoneNumber } from "@/lib/utils";
import Billing from "@/components/billing";

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
              <CommandItem
                onSelect={() => onSelect(fieldName, null, popoverKey)}
                className="cursor-pointer flex items-center italic text-muted-foreground"
              >
                <Check
                  className={`mr-2 h-4 w-4 ${!value ? "opacity-100" : "opacity-0"
                    }`}
                />
                None
              </CommandItem>
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
    onSuccess: (data) => {
      const resp = data?.response || data;
      if (resp?.Apistatus === false) {
        toast.error(resp?.message || "Validation failed");
        return;
      }
      toast.success(resp?.message || "Primary EHC information saved successfully!");
    },
    onError: (error) => {
      console.error("Mutation Error:", error);
      const errorData = error.response?.data;
      if (errorData?.Apistatus === false) {
        toast.error(errorData?.message || "Validation failed");
      } else {
        toast.error(errorData?.message || "Failed to save primary EHC information");
      }
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

  const [popoverOpen, setPopoverOpen] = useState({
    status: false,
  });

  useEffect(() => {
    if (!slug) {
      toast.error("Invalid URL - Slug not found!");
      navigate("/dashboard/workstation");
    }
  }, [slug, navigate]);

  useEffect(() => {
    if (primaryEhcData) {
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

  const handleSelectChange = (fieldName, selectedId, popoverKey) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: prev[fieldName] === selectedId ? null : selectedId,
    }));
    setPopoverOpen((p) => ({ ...p, [popoverKey]: false }));
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
        <p className="text-muted-foreground">
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
          <span className="text-foreground font-medium">Primary EHC</span>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-7xl">
        <div className="bg-card rounded-lg shadow-sm border p-8">
          <h1 className="text-2xl font-bold mb-8 text-foreground uppercase">
            Primary EHC Information
          </h1>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information Section */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-foreground">
                Basic Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Which EHC */}
                <div className="space-y-2">
                  <Label
                    htmlFor="which_ehc"
                    className="text-foreground font-medium"
                  >
                    Which EHC
                  </Label>
                  <Input
                    id="which_ehc"
                    name="which_ehc"
                    value={formData.which_ehc}
                    onChange={handleChange}
                    placeholder="Harvard"
                    className="bg-muted border-input"
                  />
                </div>

                {/* Year */}
                <div className="space-y-2">
                  <Label htmlFor="year" className="text-foreground font-medium">
                    Year
                  </Label>
                  <Input
                    id="year"
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    placeholder="2000"
                    className="bg-muted border-input"
                  />
                </div>

                {/* Status - Searchable Dropdown */}
                <div className="space-y-2">
                  <Label
                    htmlFor="status_id"
                    className="text-foreground font-medium"
                  >
                    Status
                  </Label>

                  <SearchableDropdown
                    value={formData.status_id}
                    options={metadata.status || []}
                    onSelect={handleSelectChange}
                    placeholder="Select status"
                    popoverKey="status"
                    fieldName="status_id"
                    popoverOpen={popoverOpen}
                    setPopoverOpen={setPopoverOpen}
                  />
                </div>

                {/* Insurance Co */}
                <div className="space-y-2">
                  <Label
                    htmlFor="insurance_co"
                    className="text-foreground font-medium"
                  >
                    Insurance Company
                  </Label>
                  <Input
                    id="insurance_co"
                    name="insurance_co"
                    value={formData.insurance_co}
                    onChange={handleChange}
                    placeholder="M"
                    className="bg-muted border-input"
                  />
                </div>

                {/* Ref Initial */}
                <div className="space-y-2">
                  <Label
                    htmlFor="ref_initail"
                    className="text-foreground font-medium"
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
                    className="bg-muted border-input"
                  />
                </div>

                {/* Claim Form */}
                <div className="space-y-2">
                  <Label
                    htmlFor="claim_form"
                    className="text-foreground font-medium"
                  >
                    Claim Form
                  </Label>
                  <Input
                    id="claim_form"
                    name="claim_form"
                    value={formData.claim_form}
                    onChange={handleChange}
                    placeholder="M"
                    className="bg-muted border-input"
                  />
                </div>
              </div>
            </div>

            {/* Contact Information Section */}
            <div className="space-y-6 pt-6 border-t">
              <h2 className="text-xl font-semibold text-foreground">
                Contact Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Telephone */}
                <div className="space-y-2">
                  <Label
                    htmlFor="telephone"
                    className="text-foreground font-medium"
                  >
                    Telephone
                  </Label>
                  <Input
                    id="telephone"
                    name="telephone"
                    value={formData.telephone}
                    onChange={(e) => setFormData(prev => ({ ...prev, telephone: formatPhoneNumber(e.target.value) }))}
                    placeholder="(888) 888-8888"
                    className="bg-muted border-input"
                  />
                </div>

                {/* Extension */}
                <div className="space-y-2">
                  <Label htmlFor="ext" className="text-foreground font-medium">
                    Extension
                  </Label>
                  <Input
                    id="ext"
                    name="ext"
                    value={formData.ext}
                    onChange={handleChange}
                    placeholder="1"
                    className="bg-muted border-input"
                  />
                </div>

                {/* Fax */}
                <div className="space-y-2">
                  <Label htmlFor="fax" className="text-foreground font-medium">
                    Fax
                  </Label>
                  <Input
                    id="fax"
                    name="fax"
                    value={formData.fax}
                    onChange={(e) => setFormData(prev => ({ ...prev, fax: formatPhoneNumber(e.target.value) }))}
                    placeholder="(888) 888-8888"
                    className="bg-muted border-input"
                  />
                </div>
              </div>
            </div>

            {/* Address Section */}
            <div className="space-y-6 pt-6 border-t">
              <h2 className="text-xl font-semibold text-foreground">Address</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label className="text-foreground font-medium">
                    Unit Number
                  </Label>
                  <Input
                    value={formData.address.unit_number}
                    onChange={(e) =>
                      handleAddressChange("unit_number", e.target.value)
                    }
                    placeholder="5B"
                    className="bg-muted border-input"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground font-medium">
                    Street Number
                  </Label>
                  <Input
                    value={formData.address.street_number}
                    onChange={(e) =>
                      handleAddressChange("street_number", e.target.value)
                    }
                    placeholder="221"
                    className="bg-muted border-input"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground font-medium">
                    Street Name
                  </Label>
                  <Input
                    value={formData.address.street_name}
                    onChange={(e) =>
                      handleAddressChange("street_name", e.target.value)
                    }
                    placeholder="King Street West"
                    className="bg-muted border-input"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground font-medium">City</Label>
                  <Input
                    value={formData.address.city}
                    onChange={(e) =>
                      handleAddressChange("city", e.target.value)
                    }
                    placeholder="Toronto"
                    className="bg-muted border-input"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground font-medium">Province</Label>
                  <Input
                    value={formData.address.province}
                    onChange={(e) =>
                      handleAddressChange("province", e.target.value)
                    }
                    placeholder="Ontario"
                    className="bg-muted border-input"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground font-medium">
                    Postal Code
                  </Label>
                  <Input
                    value={formData.address.postal_code}
                    onChange={(e) =>
                      handleAddressChange("postal_code", e.target.value)
                    }
                    placeholder="M5H 1K5"
                    className="bg-muted border-input"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground font-medium">Country</Label>
                  <Input
                    value={formData.address.country}
                    onChange={(e) =>
                      handleAddressChange("country", e.target.value)
                    }
                    placeholder="Canada"
                    className="bg-muted border-input"
                  />
                </div>
              </div>
            </div>

            {/* Reference Information Section */}
            <div className="space-y-6 pt-6 border-t">
              <h2 className="text-xl font-semibold text-foreground">
                Reference Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="ref_first_name"
                    className="text-foreground font-medium"
                  >
                    First Name
                  </Label>
                  <Input
                    id="ref_first_name"
                    name="ref_first_name"
                    value={formData.ref_first_name}
                    onChange={handleChange}
                    placeholder="f"
                    className="bg-muted border-input"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="ref_last_name"
                    className="text-foreground font-medium"
                  >
                    Last Name
                  </Label>
                  <Input
                    id="ref_last_name"
                    name="ref_last_name"
                    value={formData.ref_last_name}
                    onChange={handleChange}
                    placeholder="l"
                    className="bg-muted border-input"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="ref_pgroup_no"
                    className="text-foreground font-medium"
                  >
                    Group Number
                  </Label>
                  <Input
                    id="ref_pgroup_no"
                    name="ref_pgroup_no"
                    value={formData.ref_pgroup_no}
                    onChange={handleChange}
                    placeholder=""
                    className="bg-muted border-input"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="ref_idcard_no"
                    className="text-foreground font-medium"
                  >
                    ID Card Number
                  </Label>
                  <Input
                    id="ref_idcard_no"
                    name="ref_idcard_no"
                    value={formData.ref_idcard_no}
                    onChange={handleChange}
                    placeholder="(000)-000-0000"
                    className="bg-muted border-input"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="ref_patient_id"
                    className="text-foreground font-medium"
                  >
                    Patient ID
                  </Label>
                  <Input
                    id="ref_patient_id"
                    name="ref_patient_id"
                    value={formData.ref_patient_id}
                    onChange={handleChange}
                    placeholder="1"
                    className="bg-muted border-input"
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
                  className="text-foreground font-medium cursor-pointer"
                >
                  Policyholder Same as Patient
                </Label>
              </div>

              {!formData.ref_policyholder_same && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-6 border-l-2 border-gray-200">
                  <div className="space-y-2">
                    <Label
                      htmlFor="ref_first_name_1"
                      className="text-foreground font-medium"
                    >
                      Policyholder First Name
                    </Label>
                    <Input
                      id="ref_first_name_1"
                      name="ref_first_name_1"
                      value={formData.ref_first_name_1}
                      onChange={handleChange}
                      placeholder="First Name"
                      className="bg-muted border-input"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="ref_last_name_1"
                      className="text-foreground font-medium"
                    >
                      Policyholder Last Name
                    </Label>
                    <Input
                      id="ref_last_name_1"
                      name="ref_last_name_1"
                      value={formData.ref_last_name_1}
                      onChange={handleChange}
                      placeholder="Last Name"
                      className="bg-muted border-input"
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
