import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Loader2,
  ChevronRight,
  Check,
  ChevronsUpDown,
} from "lucide-react";
import { toast } from "sonner";
import { fetchInsuranceBySlug } from "../helpers/fetchInsuranceBySlug";
import { getABMeta } from "../helpers/fetchABMeta";
import { createInsurance } from "../helpers/createInsurance";
import { Navbar2 } from "@/components/navbar2";
import Billing from "@/components/billing";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";

function SearchableDropdown({
  value,
  onValueChange,
  options = [],
  placeholder = "Select",
  label = "Search",
  popoverKey,
  popoverOpen,
  setPopoverOpen,
}) {
  const selected = options.find((o) => String(o.id) === String(value)) || null;
  const isOpen = !!(popoverOpen && popoverOpen[popoverKey]);

  const handleSelect = (id) => {
    const val = id?.toString?.() ?? id;
    if (onValueChange) onValueChange(val);
    if (setPopoverOpen && popoverKey) {
      setPopoverOpen((prev = {}) => ({ ...prev, [popoverKey]: false }));
    }
  };

  return (
    <Popover
      open={isOpen}
      onOpenChange={(open) =>
        setPopoverOpen &&
        setPopoverOpen(open ? { [popoverKey]: true } : {})
      }
    >
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className="w-full justify-between font-normal bg-card h-9 text-sm "
          type="button"
        >
          {selected ? selected.name : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-60" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0"
        align="start"
      >
        <Command>
          <CommandInput placeholder={label.toLowerCase()} />
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup>
            <CommandItem
              value=""
              onSelect={() => handleSelect("")}
              className="italic text-muted-foreground"
            >
              <Check
                className={`mr-2 h-4 w-4 ${!value ? "opacity-100" : "opacity-0"
                  }`}
              />
              None
            </CommandItem>
            {options.map((opt) => (
              <CommandItem
                key={opt.id}
                value={opt.name}
                onSelect={() => handleSelect(opt.id)}
              >
                <Check
                  className={`mr-2 h-4 w-4 ${String(value) === String(opt.id)
                    ? "opacity-100"
                    : "opacity-0"
                    }`}
                />
                {opt.name}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
export default function Insurance() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const {
    data: apiResponse,
    isLoading: isLoadingMetadata,
    error: metadataError,
    isError: isMetadataError,
  } = useQuery({
    queryKey: ["insuranceMeta"],
    queryFn: getABMeta,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
  const metadata = apiResponse?.response || {};
  const { data: insuranceData, isLoading: isLoadingInsurance } = useQuery({
    queryKey: ["insurance", slug],
    queryFn: async () => {
      if (!slug) return null;

      try {
        const data = await fetchInsuranceBySlug(slug);
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
    mutationFn: createInsurance,
    onSuccess: (data) => {
      const resp = data?.response;
      if (resp?.Apistatus === false) {
        toast.error(resp?.message || "Validation failed");
        return;
      }
      toast.success(resp?.message || "Insurance information saved successfully!");
    },
    onError: (error) => {
      console.error("Mutation Error:", error);
      const errorData = error.response?.data;
      if (errorData?.Apistatus === false) {
        toast.error(errorData?.message || "Validation failed");
      } else {
        toast.error(errorData?.message || "Failed to save information. Please try again.");
      }
    },
  });

  const [formData, setFormData] = useState({
    policy_holder_same_as_applicant: false,
    name: "",
    type_of_ownership_id: null,
    insurance_company: "",
    address: {
      unit_number: "",
      street_number: "",
      street_name: "",
      city: "",
      province: "",
      postal_code: "",
      country: "Canada",
    },
    policy_no: "",
    claim_no: "",
  });
  const [popoverOpen, setPopoverOpen] = useState({});

  useEffect(() => {
    if (!slug) {
      toast.error("Invalid URL - Slug not found!");
      navigate("/dashboard/workstation");
    }
  }, [slug, navigate]);
  useEffect(() => {
    if (formData.policy_holder_same_as_applicant && !formData.name) {
      const workstationData = localStorage.getItem("workstationData");

      if (workstationData) {
        try {
          const parsedData = JSON.parse(workstationData);
          const currentApplicant = parsedData.find(
            (item) => item.slug === slug
          );

          if (currentApplicant && currentApplicant.name) {
            setFormData((prev) => ({
              ...prev,
              name: currentApplicant.name,
            }));
          }
        } catch (error) {
          console.error("Error loading applicant name:", error);
        }
      }
    }
  }, [formData.policy_holder_same_as_applicant, slug]);

  useEffect(() => {
    if (insuranceData) {
      console.log("📝 Populating form with existing data:", insuranceData);

      setFormData({
        policy_holder_same_as_applicant:
          insuranceData.policy_holder_same_as_applicant || false,
        name: insuranceData.name || "",
        type_of_ownership_id: insuranceData.type_of_ownership_id || null,
        insurance_company: insuranceData.insurance_company || "",
        address: {
          unit_number: insuranceData.address?.unit_number || "",
          street_number: insuranceData.address?.street_number || "",
          street_name: insuranceData.address?.street_name || "",
          city: insuranceData.address?.city || "",
          province: insuranceData.address?.province || "",
          postal_code: insuranceData.address?.postal_code || "",
          country: insuranceData.address?.country || "Canada",
        },
        policy_no: insuranceData.policy_no || "",
        claim_no: insuranceData.claim_no || "",
      });

      //   toast.success("Data loaded successfully!");
    } else {
      console.log("📝 No existing data - showing empty form");
    }
  }, [insuranceData]);

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
    setFormData((prev) => {
      const numericValue = value === "" ? null : Number(value);
      const finalValue = prev[name] === numericValue ? null : numericValue;
      return { ...prev, [name]: finalValue };
    });
  };
  const handleCheckboxChange = (checked) => {
    if (checked) {
      let applicantName = "";
      const workstationData = localStorage.getItem("workstationData");

      if (workstationData) {
        try {
          const parsedData = JSON.parse(workstationData);
          const currentApplicant = parsedData.find(
            (item) => item.slug === slug
          );

          if (currentApplicant && currentApplicant.name) {
            applicantName = currentApplicant.name;
          }
        } catch (error) {
          console.error("Error parsing workstation data:", error);
          toast.error("Failed to retrieve applicant information");
        }
      }

      setFormData((prev) => ({
        ...prev,
        policy_holder_same_as_applicant: true,
        name: applicantName || "",
        type_of_ownership_id: null,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        policy_holder_same_as_applicant: false,
        name: "",
      }));
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    const isAddressFilled = (address) => {
      return Object.values(address).some(
        (value) => value && value.trim() !== ""
      );
    };
    const payload = {
      policy_holder_same_as_applicant: formData.policy_holder_same_as_applicant,
      name: formData.name || null,
      type_of_ownership_id: formData.type_of_ownership_id || null,
      insurance_company: formData.insurance_company || null,
      address: isAddressFilled(formData.address) ? formData.address : null,
      policy_no: formData.policy_no || null,
      claim_no: formData.claim_no || null,
    };

    console.log(
      "📤 Submitting Insurance Payload:",
      JSON.stringify(payload, null, 2)
    );

    createMutation.mutate({
      slug: slug,
      data: payload,
    });
  };
  if (isLoadingMetadata || isLoadingInsurance) {
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
            onClick={() => queryClient.invalidateQueries(["insuranceMeta"])}
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
  const getSelectedOptionName = (fieldValue, optionsArray) => {
    if (!fieldValue || !optionsArray) return "";
    const option = optionsArray.find((opt) => opt.id === fieldValue);
    return option ? option.name : "";
  };

  return (
    <div className="min-h-screen bg-muted">
      <Navbar2 />
      <Billing />

      {/* Breadcrumb */}
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
          <span className="text-foreground font-medium">Insurance</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        <div className="bg-card rounded-lg shadow-sm border p-8">
          <h1 className="text-2xl font-bold mb-8 text-foreground uppercase">
            Insurance Information
          </h1>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Policy Holder Information Section */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-foreground">
                Policy Holder Information
              </h2>
              <div className="flex items-center space-x-2 p-4 bg-accent/50 rounded-lg border border-border">
                <Checkbox
                  id="policy_holder_same_as_applicant"
                  checked={formData.policy_holder_same_as_applicant}
                  onCheckedChange={handleCheckboxChange}
                />
                <Label
                  htmlFor="policy_holder_same_as_applicant"
                  className="text-accent-foreground font-medium cursor-pointer"
                >
                  Policy Holder Same as Applicant
                </Label>
              </div>


              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Name Field - ✅ h-9 */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-foreground font-medium">
                    Name{" "}
                    {formData.policy_holder_same_as_applicant && (
                      <span className="text-blue-600 text-sm">
                        (Auto-filled)
                      </span>
                    )}
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter name"
                    readOnly={formData.policy_holder_same_as_applicant}
                    className={`h-9 bg-muted border-input ${formData.policy_holder_same_as_applicant
                      ? "cursor-not-allowed opacity-75"
                      : ""
                      }`}
                  />
                </div>

                {!formData.policy_holder_same_as_applicant && (
                  <div className="space-y-2">
                    <Label
                      htmlFor="type_of_ownership_id"
                      className="text-foreground font-medium"
                    >
                      Type of Ownership
                    </Label>
                    <SearchableDropdown
                      popoverKey="type_of_ownership"
                      popoverOpen={popoverOpen}
                      setPopoverOpen={setPopoverOpen}
                      value={formData.type_of_ownership_id?.toString() || ""}
                      onValueChange={(value) =>
                        handleSelectChange("type_of_ownership_id", value)
                      }
                      options={metadata?.insurance_type_of_ownership || []}
                      placeholder="Select type"
                      label="Type of ownership"
                    />
                  </div>
                )}

                {/* Insurance Company - ✅ h-9 */}
                <div className="space-y-2">
                  <Label
                    htmlFor="insurance_company"
                    className="text-foreground font-medium"
                  >
                    Insurance Company
                  </Label>
                  <Input
                    id="insurance_company"
                    name="insurance_company"
                    value={formData.insurance_company}
                    onChange={handleChange}
                    placeholder="TD"
                    className="h-9 bg-muted border-input"
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
                    className="h-9 bg-muted border-input"
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
                    className="h-9 bg-muted border-input"
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
                    className="h-9 bg-muted border-input"
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
                    className="h-9 bg-muted border-input"
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
                    className="h-9 bg-muted border-input"
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
                    className="h-9 bg-muted border-input"
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
                    className="h-9 bg-muted border-input"
                  />
                </div>
              </div>
            </div>

            {/* Policy Details Section */}
            <div className="space-y-6 pt-6 border-t">
              <h2 className="text-xl font-semibold text-foreground">
                Policy Details
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Policy Number - ✅ h-9 */}
                <div className="space-y-2">
                  <Label
                    htmlFor="policy_no"
                    className="text-foreground font-medium"
                  >
                    Policy Number
                  </Label>
                  <Input
                    id="policy_no"
                    name="policy_no"
                    value={formData.policy_no}
                    onChange={handleChange}
                    placeholder="123-xxxx-xxxx"
                    className="h-9 bg-muted border-input"
                  />
                </div>

                {/* Claim Number - ✅ h-9 */}
                <div className="space-y-2">
                  <Label
                    htmlFor="claim_no"
                    className="text-foreground font-medium"
                  >
                    Claim Number
                  </Label>
                  <Input
                    id="claim_no"
                    name="claim_no"
                    value={formData.claim_no}
                    onChange={handleChange}
                    placeholder="123-xxxx-xxxx"
                    className="h-9 bg-muted border-input"
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
