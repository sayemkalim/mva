import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { FloatingInput, FloatingWrapper } from "@/components/ui/floating-label";
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
import { Loader2, ChevronRight, ChevronsUpDown, Check } from "lucide-react";
import { toast } from "sonner";
import { getRepresentativeReferralMeta } from "../helpers/fetchIRepresentativeReferralMetadata";
import { fetchRepresentReferralBySlug } from "../helpers/fetchRepresentativeReferralBySlug";
import { createRepresentativeReferral } from "../helpers/createRepresentativeReferral";
import { Navbar2 } from "@/components/navbar2";
import { formatPhoneNumber } from "@/lib/utils";
import Billing from "@/components/billing";

const SearchableDropdown = ({
  label,
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
    <FloatingWrapper label={label} hasValue={!!selectedOption} isFocused={!!popoverOpen[popoverKey]}>
      <Popover
        open={popoverOpen[popoverKey]}
        onOpenChange={(open) =>
          setPopoverOpen(open ? { [popoverKey]: true } : {})
        }
      >
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            className="w-full justify-between font-normal h-[52px] bg-transparent border border-input"
            type="button"
          >
            {selectedOption ? selectedOption.name : ""}
            <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
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
    </FloatingWrapper>
  );
};

export default function RepresentativeReferral() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    data: apiResponse,
    isLoading: isLoadingMetadata,
    error: metadataError,
    isError: isMetadataError,
  } = useQuery({
    queryKey: ["representativeReferralMeta"],
    queryFn: getRepresentativeReferralMeta,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  const metadata = apiResponse?.response || {};

  const {
    data: representativeReferralData,
    isLoading: isLoadingRepresentativeReferral,
  } = useQuery({
    queryKey: ["representativeReferral", slug],
    queryFn: async () => {
      if (!slug) return null;
      try {
        const data = await fetchRepresentReferralBySlug(slug);
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
    mutationFn: createRepresentativeReferral,
    onSuccess: (data) => {
      const resp = data?.response || data;
      if (resp?.Apistatus === false) {
        toast.error(resp?.message || "Validation failed");
        return;
      }
      toast.success(resp?.message || "Representative & Referral information saved successfully!");
    },
    onError: (error) => {
      console.error("Mutation Error:", error);
      const errorData = error.response?.data;
      if (errorData?.Apistatus === false) {
        toast.error(errorData?.message || "Validation failed");
      } else {
        toast.error(errorData?.message || "Failed to save information");
      }
    },
  });

  const [formData, setFormData] = useState({
    last_name: "",
    first_name: "",
    middle_name: "",
    initial: "",
    representative_address: {
      unit_number: "",
      street_number: "",
      street_name: "",
      city: "",
      province: "",
      postal_code: "",
      country: "",
    },
    relationship_applicant_id: null,
    telephone: "",
    ext: "",
    fax: "",
    email: "",
    referral_type_id: null,
    referral_name: "",
    referral_address: {
      unit_number: "",
      street_number: "",
      street_name: "",
      city: "",
      province: "",
      postal_code: "",
      country: "",
    },
    referral_telephone: "",
    referral_ext: "",
    referral_fax: "",
    referral_email: "",
  });

  const [popoverOpen, setPopoverOpen] = useState({
    relationship: false,
    referralType: false,
  });

  useEffect(() => {
    if (!slug) {
      toast.error("Invalid URL - Slug not found!");
      navigate("/dashboard/workstation");
    }
  }, [slug, navigate]);

  useEffect(() => {
    if (representativeReferralData) {
      setFormData({
        last_name: representativeReferralData.last_name || "",
        first_name: representativeReferralData.first_name || "",
        middle_name: representativeReferralData.middle_name || "",
        initial: representativeReferralData.initial || "",
        representative_address: {
          unit_number:
            representativeReferralData.representative_address?.unit_number ||
            "",
          street_number:
            representativeReferralData.representative_address?.street_number ||
            "",
          street_name:
            representativeReferralData.representative_address?.street_name ||
            "",
          city: representativeReferralData.representative_address?.city || "",
          province:
            representativeReferralData.representative_address?.province || "",
          postal_code:
            representativeReferralData.representative_address?.postal_code ||
            "",
          country:
            representativeReferralData.representative_address?.country || "",
        },
        relationship_applicant_id:
          representativeReferralData.relationship_applicant_id || null,
        telephone: representativeReferralData.telephone || "",
        ext: representativeReferralData.ext || "",
        fax: representativeReferralData.fax || "",
        email: representativeReferralData.email || "",

        referral_type_id: representativeReferralData.referral_type_id || null,
        referral_name: representativeReferralData.referral_name || "",
        referral_address: {
          unit_number:
            representativeReferralData.referral_address?.unit_number || "",
          street_number:
            representativeReferralData.referral_address?.street_number || "",
          street_name:
            representativeReferralData.referral_address?.street_name || "",
          city: representativeReferralData.referral_address?.city || "",
          province: representativeReferralData.referral_address?.province || "",
          postal_code:
            representativeReferralData.referral_address?.postal_code || "",
          country: representativeReferralData.referral_address?.country || "",
        },
        referral_telephone: representativeReferralData.referral_telephone || "",
        referral_ext: representativeReferralData.referral_ext || "",
        referral_fax: representativeReferralData.referral_fax || "",
        referral_email: representativeReferralData.referral_email || "",
      });
    }
  }, [representativeReferralData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddressChange = (addressType, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [addressType]: {
        ...prev[addressType],
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isAddressFilled = (address) =>
      Object.values(address).some((value) => value && value.trim() !== "");

    const payload = {
      last_name: formData.last_name || null,
      first_name: formData.first_name || null,
      middle_name: formData.middle_name || null,
      initial: formData.initial || null,
      representative_address: isAddressFilled(formData.representative_address)
        ? formData.representative_address
        : null,
      relationship_applicant_id: formData.relationship_applicant_id || null,
      telephone: formData.telephone || null,
      ext: formData.ext || null,
      fax: formData.fax || null,
      email: formData.email || null,

      referral_type_id: formData.referral_type_id || null,
      referral_name: formData.referral_name || null,
      referral_address: isAddressFilled(formData.referral_address)
        ? formData.referral_address
        : null,
      referral_telephone: formData.referral_telephone || null,
      referral_ext: formData.referral_ext || null,
      referral_fax: formData.referral_fax || null,
      referral_email: formData.referral_email || null,
    };

    createMutation.mutate({
      slug: slug,
      data: payload,
    });
  };

  if (isLoadingMetadata || isLoadingRepresentativeReferral) {
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
            onClick={() =>
              queryClient.invalidateQueries(["representativeReferralMeta"])
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
          <span className="text-foreground font-medium">
            Representative & Referral
          </span>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-7xl">
        <div className="bg-card rounded-lg shadow-sm border p-8">
          <h1 className="text-2xl font-bold mb-8 text-foreground uppercase">
            Representative & Referral Information
          </h1>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Representative Information */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-foreground">
                Representative Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* All inputs + searchable dropdown for relationship */}
                {/* Last Name */}
                                  <FloatingInput
                    label="Last Name"
                    id="last_name"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                  />

                {/* First Name */}
                                  <FloatingInput
                    label="First Name"
                    id="first_name"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                  />

                {/* Middle Name */}
                                  <FloatingInput
                    label="Middle Name"
                    id="middle_name"
                    name="middle_name"
                    value={formData.middle_name}
                    onChange={handleChange}
                  />

                {/* Initial */}
                                  <FloatingInput
                    label="Initial"
                    id="initial"
                    name="initial"
                    value={formData.initial}
                    onChange={handleChange}
                  />

                {/* Relationship to Applicant */}
                                  <SearchableDropdown
                    label="Relationship to Applicant"
                    value={formData.relationship_applicant_id}
                    options={metadata.relationshipt_applicant || []}
                    onSelect={handleSelectChange}
                    placeholder="Select relationship"
                    popoverKey="relationship"
                    fieldName="relationship_applicant_id"
                    popoverOpen={popoverOpen}
                    setPopoverOpen={setPopoverOpen}
                  />

                {/* Telephone */}
                                  <FloatingInput
                    label="Telephone"
                    id="telephone"
                    name="telephone"
                    value={formData.telephone}
                    onChange={(e) => setFormData(prev => ({ ...prev, telephone: formatPhoneNumber(e.target.value) }))}
                  />

                {/* Extension */}
                                  <FloatingInput
                    label="Extension"
                    id="ext"
                    name="ext"
                    value={formData.ext}
                    onChange={handleChange}
                  />

                {/* Fax */}
                                  <FloatingInput
                    label="Fax"
                    id="fax"
                    name="fax"
                    value={formData.fax}
                    onChange={(e) => setFormData(prev => ({ ...prev, fax: formatPhoneNumber(e.target.value) }))}
                  />

                {/* Email */}
                <div className="lg:col-span-2">
                  <FloatingInput
                    label="Email"
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Nested Representative Address */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-foreground">
                  Representative Address
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Unit Number */}
                                      <FloatingInput
                      label="Unit Number"
                      value={formData.representative_address.unit_number}
                      onChange={(e) =>
                        handleAddressChange(
                          "representative_address",
                          "unit_number",
                          e.target.value
                        )
                      }
                    />

                  {/* Street Number */}
                                      <FloatingInput
                      label="Street Number"
                      value={formData.representative_address.street_number}
                      onChange={(e) =>
                        handleAddressChange(
                          "representative_address",
                          "street_number",
                          e.target.value
                        )
                      }
                    />

                  {/* Street Name */}
                                      <FloatingInput
                      label="Street Name"
                      value={formData.representative_address.street_name}
                      onChange={(e) =>
                        handleAddressChange(
                          "representative_address",
                          "street_name",
                          e.target.value
                        )
                      }
                    />

                  {/* City */}
                                      <FloatingInput
                      label="City"
                      value={formData.representative_address.city}
                      onChange={(e) =>
                        handleAddressChange(
                          "representative_address",
                          "city",
                          e.target.value
                        )
                      }
                    />

                  {/* Province */}
                                      <FloatingInput
                      label="Province"
                      value={formData.representative_address.province}
                      onChange={(e) =>
                        handleAddressChange(
                          "representative_address",
                          "province",
                          e.target.value
                        )
                      }
                    />

                  {/* Postal Code */}
                                      <FloatingInput
                      label="Postal Code"
                      value={formData.representative_address.postal_code}
                      onChange={(e) =>
                        handleAddressChange(
                          "representative_address",
                          "postal_code",
                          e.target.value
                        )
                      }
                    />

                  {/* Country */}
                                      <FloatingInput
                      label="Country"
                      value={formData.representative_address.country}
                      onChange={(e) =>
                        handleAddressChange(
                          "representative_address",
                          "country",
                          e.target.value
                        )
                      }
                    />
                </div>
              </div>
            </div>

            {/* Referral Information */}
            <div className="space-y-6 pt-6 border-t">
              <h2 className="text-xl font-semibold text-foreground">
                Referral Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Referral Type */}
                                  <SearchableDropdown
                    label="Referral Type"
                    value={formData.referral_type_id}
                    options={metadata.type || []}
                    onSelect={handleSelectChange}
                    placeholder="Select type"
                    popoverKey="referralType"
                    fieldName="referral_type_id"
                    popoverOpen={popoverOpen}
                    setPopoverOpen={setPopoverOpen}
                  />

                {/* Referral Name */}
                                  <FloatingInput
                    label="Referral Name"
                    id="referral_name"
                    name="referral_name"
                    value={formData.referral_name}
                    onChange={handleChange}
                  />

                {/* Referral Telephone */}
                                  <FloatingInput
                    label="Telephone"
                    id="referral_telephone"
                    name="referral_telephone"
                    value={formData.referral_telephone}
                    onChange={(e) => setFormData(prev => ({ ...prev, referral_telephone: formatPhoneNumber(e.target.value) }))}
                  />

                {/* Referral Extension */}
                                  <FloatingInput
                    label="Extension"
                    id="referral_ext"
                    name="referral_ext"
                    value={formData.referral_ext}
                    onChange={handleChange}
                  />

                {/* Referral Fax */}
                                  <FloatingInput
                    label="Fax"
                    id="referral_fax"
                    name="referral_fax"
                    value={formData.referral_fax}
                    onChange={(e) => setFormData(prev => ({ ...prev, referral_fax: formatPhoneNumber(e.target.value) }))}
                  />

                {/* Referral Email */}
                                  <FloatingInput
                    label="Email"
                    id="referral_email"
                    name="referral_email"
                    type="email"
                    value={formData.referral_email}
                    onChange={handleChange}
                  />
              </div>

              {/* Nested Referral Address */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-foreground">
                  Referral Address
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Unit Number */}
                                      <FloatingInput
                      label="Unit Number"
                      value={formData.referral_address.unit_number}
                      onChange={(e) =>
                        handleAddressChange(
                          "referral_address",
                          "unit_number",
                          e.target.value
                        )
                      }
                    />

                  {/* Street Number */}
                                      <FloatingInput
                      label="Street Number"
                      value={formData.referral_address.street_number}
                      onChange={(e) =>
                        handleAddressChange(
                          "referral_address",
                          "street_number",
                          e.target.value
                        )
                      }
                    />

                  {/* Street Name */}
                                      <FloatingInput
                      label="Street Name"
                      value={formData.referral_address.street_name}
                      onChange={(e) =>
                        handleAddressChange(
                          "referral_address",
                          "street_name",
                          e.target.value
                        )
                      }
                    />

                  {/* City */}
                                      <FloatingInput
                      label="City"
                      value={formData.referral_address.city}
                      onChange={(e) =>
                        handleAddressChange(
                          "referral_address",
                          "city",
                          e.target.value
                        )
                      }
                    />

                  {/* Province */}
                                      <FloatingInput
                      label="Province"
                      value={formData.referral_address.province}
                      onChange={(e) =>
                        handleAddressChange(
                          "referral_address",
                          "province",
                          e.target.value
                        )
                      }
                    />

                  {/* Postal Code */}
                                      <FloatingInput
                      label="Postal Code"
                      value={formData.referral_address.postal_code}
                      onChange={(e) =>
                        handleAddressChange(
                          "referral_address",
                          "postal_code",
                          e.target.value
                        )
                      }
                    />

                  {/* Country */}
                                      <FloatingInput
                      label="Country"
                      value={formData.referral_address.country}
                      onChange={(e) =>
                        handleAddressChange(
                          "referral_address",
                          "country",
                          e.target.value
                        )
                      }
                    />
                </div>
              </div>
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
