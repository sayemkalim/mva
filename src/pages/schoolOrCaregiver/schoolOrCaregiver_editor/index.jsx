import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, ChevronRight, ChevronsUpDown, Check, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { fetchSchoolCaregiverBySlug } from "../helpers/fetchSchoolCaregiverBySlug";
import { getSchoolCaregiverMeta } from "../helpers/fetchISchoolCaregiverMetadata";
import { createSchoolorCaregiver } from "../helpers/createSchoolorCaregiver";
import { Navbar2 } from "@/components/navbar2";

/* shadcn-style popover + command for searchable dropdowns */
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import Billing from "@/components/billing";
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
    const val = id == null ? "" : String(id);
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
        setPopoverOpen((p = {}) => ({ ...p, [popoverKey]: open }))
      }
    >
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className="w-full justify-between font-normal bg-muted h-9 text-sm"
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

export default function SchoolCaregiver() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    data: apiResponse,
    isLoading: isLoadingMetadata,
    error: metadataError,
    isError: isMetadataError,
  } = useQuery({
    queryKey: ["schoolCaregiverMeta"],
    queryFn: getSchoolCaregiverMeta,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  const metadata = apiResponse?.response || {};

  const { data: schoolCaregiverData, isLoading: isLoadingSchoolCaregiver } =
    useQuery({
      queryKey: ["schoolCaregiver", slug],
      queryFn: async () => {
        if (!slug) return null;
        try {
          const data = await fetchSchoolCaregiverBySlug(slug);
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
    mutationFn: createSchoolorCaregiver,
    onSuccess: (apiResponse) => {
      if (apiResponse?.response?.Apistatus) {
        toast.success("School/Caregiver information saved successfully!");
      } else {
        const errs = apiResponse?.response?.errors ?? apiResponse?.errors;
        if (errs) {
          console.error("API errors:", errs);
          toast.error("Server returned validation errors. Check console.");
        } else {
          toast.error(apiResponse?.response?.message || "Save failed");
        }
      }
    },
    onError: (error) => {
      console.error("❌ Mutation Error:", error);
      toast.error("Failed to save information. Please try again.");
    },
  });

  const [formData, setFormData] = useState({
    was_full_time_student_id: null,
    school_name: "",
    address: {
      unit_number: "",
      street_number: "",
      street_name: "",
      city: "",
      province: "",
      postal_code: "",
      country: "",
    },
    date_last_attended: "",
    program_and_level: "",
    projected_completion_date: "",
    currently_attending_id: null,
    returned_to_school_id: null,

    caregiving_description: "",
    injuries_prevented_caregiving_id: null,
    returned_to_caregiving_id: null,
    caregiver_name_1: "",
    caregiver_dob_1: "",
    caregiver_disabled_1: null,

    caregiver_name_2: "",
    caregiver_dob_2: "",
    caregiver_disabled_2: null,

    caregiver_name_3: "",
    caregiver_dob_3: "",
    caregiver_disabled_3: null,

    caregiver_name_4: "",
    caregiver_dob_4: "",
    caregiver_disabled_4: null,

    caregiver_name_5: "",
    caregiver_dob_5: "",
    caregiver_disabled_5: null,

    caregiver_name_6: "",
    caregiver_dob_6: "",
    caregiver_disabled_6: null,

    caregiver_name_7: "",
    caregiver_dob_7: "",
    caregiver_disabled_7: null,

    caregiver_name_8: "",
    caregiver_dob_8: "",
    caregiver_disabled_8: null,

    caregiver_name_9: "",
    caregiver_dob_9: "",
    caregiver_disabled_9: null,

    caregiver_name_10: "",
    caregiver_dob_10: "",
    caregiver_disabled_10: null,
  });

  // Number of caregiver forms to show
  const [visibleCaregivers, setVisibleCaregivers] = useState(1);

  const removeCaregiver = (numToRemove) => {
    if (visibleCaregivers <= 1) return;

    setFormData((prev) => {
      const newData = { ...prev };
      // Shift data from higher indices down
      for (let i = numToRemove; i < 10; i++) {
        newData[`caregiver_name_${i}`] = prev[`caregiver_name_${i + 1}`] || "";
        newData[`caregiver_dob_${i}`] = prev[`caregiver_dob_${i + 1}`] || "";
        newData[`caregiver_disabled_${i}`] = prev[`caregiver_disabled_${i + 1}`] || null;
      }
      // Clear the last potential index data
      newData[`caregiver_name_10`] = "";
      newData[`caregiver_dob_10`] = "";
      newData[`caregiver_disabled_10`] = null;
      return newData;
    });

    setVisibleCaregivers((prev) => Math.max(1, prev - 1));
  };

  // parent-managed popover open state
  const [popoverOpen, setPopoverOpen] = useState({});

  useEffect(() => {
    if (!slug) {
      toast.error("Invalid URL - Slug not found!");
      navigate("/dashboard/workstation");
    }
  }, [slug, navigate]);

  // Hydrate only if form appears untouched (prevents overwriting user's edits)
  useEffect(() => {
    if (!schoolCaregiverData) return;

    setFormData((prev) => {
      const userEdited =
        Boolean(prev.school_name) ||
        Boolean(prev.date_last_attended) ||
        Boolean(prev.caregiving_description) ||
        Boolean(prev.address?.city);

      if (userEdited) {
        // preserve user edits
        return prev;
      }

      return {
        was_full_time_student_id:
          schoolCaregiverData.was_full_time_student_id ?? null,
        school_name: schoolCaregiverData.school_name ?? "",
        address: {
          unit_number: schoolCaregiverData.address?.unit_number ?? "",
          street_number: schoolCaregiverData.address?.street_number ?? "",
          street_name: schoolCaregiverData.address?.street_name ?? "",
          city: schoolCaregiverData.address?.city ?? "",
          province: schoolCaregiverData.address?.province ?? "",
          postal_code: schoolCaregiverData.address?.postal_code ?? "",
          country: schoolCaregiverData.address?.country ?? "",
        },
        date_last_attended: schoolCaregiverData.date_last_attended ?? "",
        program_and_level: schoolCaregiverData.program_and_level ?? "",
        projected_completion_date:
          schoolCaregiverData.projected_completion_date ?? "",
        currently_attending_id:
          schoolCaregiverData.currently_attending_id ?? null,
        returned_to_school_id:
          schoolCaregiverData.returned_to_school_id ?? null,

        caregiving_description:
          schoolCaregiverData.caregiving_description ?? "",
        injuries_prevented_caregiving_id:
          schoolCaregiverData.injuries_prevented_caregiving_id ?? null,
        returned_to_caregiving_id:
          schoolCaregiverData.returned_to_caregiving_id ?? null,

        caregiver_name_1: schoolCaregiverData.caregiver_name_1 ?? "",
        caregiver_dob_1: schoolCaregiverData.caregiver_dob_1 ?? "",
        caregiver_disabled_1: schoolCaregiverData.caregiver_disabled_1 ?? null,

        caregiver_name_2: schoolCaregiverData.caregiver_name_2 ?? "",
        caregiver_dob_2: schoolCaregiverData.caregiver_dob_2 ?? "",
        caregiver_disabled_2: schoolCaregiverData.caregiver_disabled_2 ?? null,

        caregiver_name_3: schoolCaregiverData.caregiver_name_3 ?? "",
        caregiver_dob_3: schoolCaregiverData.caregiver_dob_3 ?? "",
        caregiver_disabled_3: schoolCaregiverData.caregiver_disabled_3 ?? null,

        caregiver_name_4: schoolCaregiverData.caregiver_name_4 ?? "",
        caregiver_dob_4: schoolCaregiverData.caregiver_dob_4 ?? "",
        caregiver_disabled_4: schoolCaregiverData.caregiver_disabled_4 ?? null,

        caregiver_name_5: schoolCaregiverData.caregiver_name_5 ?? "",
        caregiver_dob_5: schoolCaregiverData.caregiver_dob_5 ?? "",
        caregiver_disabled_5: schoolCaregiverData.caregiver_disabled_5 ?? null,

        caregiver_name_6: schoolCaregiverData.caregiver_name_6 ?? "",
        caregiver_dob_6: schoolCaregiverData.caregiver_dob_6 ?? "",
        caregiver_disabled_6: schoolCaregiverData.caregiver_disabled_6 ?? null,

        caregiver_name_7: schoolCaregiverData.caregiver_name_7 ?? "",
        caregiver_dob_7: schoolCaregiverData.caregiver_dob_7 ?? "",
        caregiver_disabled_7: schoolCaregiverData.caregiver_disabled_7 ?? null,

        caregiver_name_8: schoolCaregiverData.caregiver_name_8 ?? "",
        caregiver_dob_8: schoolCaregiverData.caregiver_dob_8 ?? "",
        caregiver_disabled_8: schoolCaregiverData.caregiver_disabled_8 ?? null,

        caregiver_name_9: schoolCaregiverData.caregiver_name_9 ?? "",
        caregiver_dob_9: schoolCaregiverData.caregiver_dob_9 ?? "",
        caregiver_disabled_9: schoolCaregiverData.caregiver_disabled_9 ?? null,

        caregiver_name_10: schoolCaregiverData.caregiver_name_10 ?? "",
        caregiver_dob_10: schoolCaregiverData.caregiver_dob_10 ?? "",
        caregiver_disabled_10: schoolCaregiverData.caregiver_disabled_10 ?? null,
      };
    });

    // Update visibleCaregivers based on how many have data
    let lastFilledIndex = 1;
    for (let i = 1; i <= 10; i++) {
      if (schoolCaregiverData[`caregiver_name_${i}`]) {
        lastFilledIndex = i;
      }
    }
    setVisibleCaregivers(Math.min(10, lastFilledIndex + 1));
  }, [schoolCaregiverData]);

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

  // accepts string value from SearchableDropdown; convert to Number or null
  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value === "" ? null : Number(value),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isAddressFilled = (address) =>
      Object.values(address).some((value) => value && value.trim() !== "");
    const payload = {
      was_full_time_student_id: formData.was_full_time_student_id || null,
      school_name: formData.school_name || null,
      address: isAddressFilled(formData.address) ? formData.address : null,
      date_last_attended: formData.date_last_attended || null,
      program_and_level: formData.program_and_level || null,
      projected_completion_date: formData.projected_completion_date || null,
      currently_attending_id: formData.currently_attending_id || null,
      returned_to_school_id: formData.returned_to_school_id || null,

      caregiving_description: formData.caregiving_description || null,
      injuries_prevented_caregiving_id:
        formData.injuries_prevented_caregiving_id || null,
      returned_to_caregiving_id: formData.returned_to_caregiving_id || null,

      caregiver_name_1: formData.caregiver_name_1 || null,
      caregiver_dob_1: formData.caregiver_dob_1 || null,
      caregiver_disabled_1: formData.caregiver_disabled_1 || null,

      caregiver_name_2: formData.caregiver_name_2 || null,
      caregiver_dob_2: formData.caregiver_dob_2 || null,
      caregiver_disabled_2: formData.caregiver_disabled_2 || null,

      caregiver_name_3: formData.caregiver_name_3 || null,
      caregiver_dob_3: formData.caregiver_dob_3 || null,
      caregiver_disabled_3: formData.caregiver_disabled_3 || null,

      caregiver_name_4: formData.caregiver_name_4 || null,
      caregiver_dob_4: formData.caregiver_dob_4 || null,
      caregiver_disabled_4: formData.caregiver_disabled_4 || null,

      caregiver_name_5: formData.caregiver_name_5 || null,
      caregiver_dob_5: formData.caregiver_dob_5 || null,
      caregiver_disabled_5: formData.caregiver_disabled_5 || null,

      caregiver_name_6: formData.caregiver_name_6 || null,
      caregiver_dob_6: formData.caregiver_dob_6 || null,
      caregiver_disabled_6: formData.caregiver_disabled_6 || null,

      caregiver_name_7: formData.caregiver_name_7 || null,
      caregiver_dob_7: formData.caregiver_dob_7 || null,
      caregiver_disabled_7: formData.caregiver_disabled_7 || null,

      caregiver_name_8: formData.caregiver_name_8 || null,
      caregiver_dob_8: formData.caregiver_dob_8 || null,
      caregiver_disabled_8: formData.caregiver_disabled_8 || null,

      caregiver_name_9: formData.caregiver_name_9 || null,
      caregiver_dob_9: formData.caregiver_dob_9 || null,
      caregiver_disabled_9: formData.caregiver_disabled_9 || null,

      caregiver_name_10: formData.caregiver_name_10 || null,
      caregiver_dob_10: formData.caregiver_dob_10 || null,
      caregiver_disabled_10: formData.caregiver_disabled_10 || null,
    };

    console.log(
      "📤 Submitting School/Caregiver Payload:",
      JSON.stringify(payload, null, 2)
    );

    createMutation.mutate({
      slug: slug,
      data: payload,
    });
  };

  if (isLoadingMetadata || isLoadingSchoolCaregiver) {
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
              queryClient.invalidateQueries(["schoolCaregiverMeta"])
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

  // helper alias for yes_no options
  const yesNoOptions = metadata?.yes_no_option || [];

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
          <span className="text-foreground font-medium">School or Caregiver</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        <div className="bg-card rounded-lg shadow-sm border p-8">
          <h1 className="text-2xl font-bold mb-8 text-foreground uppercase">
            School / College or Caregiver Information
          </h1>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* School Information Section */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-foreground">
                School / College Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Was Full Time Student -> searchable */}
                <div className="space-y-2">
                  <Label
                    htmlFor="was_full_time_student_id"
                    className="text-foreground font-medium"
                  >
                    Was Full Time Student
                  </Label>
                  <SearchableDropdown
                    popoverKey="was_full_time_student"
                    popoverOpen={popoverOpen}
                    setPopoverOpen={setPopoverOpen}
                    value={formData.was_full_time_student_id?.toString() ?? ""}
                    onValueChange={(value) =>
                      handleSelectChange("was_full_time_student_id", value)
                    }
                    options={yesNoOptions}
                    placeholder="Select option"
                    label="Was full time student"
                  />
                </div>

                {/* School Name */}
                <div className="space-y-2">
                  <Label
                    htmlFor="school_name"
                    className="text-foreground font-medium"
                  >
                    School / College Name
                  </Label>
                  <Input
                    id="school_name"
                    name="school_name"
                    value={formData.school_name}
                    onChange={handleChange}
                    placeholder="Harvard University"
                    className="bg-muted border-input"
                  />
                </div>

                {/* Date Last Attended */}
                <div className="space-y-2">
                  <Label
                    htmlFor="date_last_attended"
                    className="text-foreground font-medium"
                  >
                    Date Last Attended
                  </Label>
                  <Input
                    id="date_last_attended"
                    name="date_last_attended"
                    type="date"
                    value={formData.date_last_attended}
                    onChange={handleChange}
                    className="bg-muted border-input"
                  />
                </div>

                {/* Program and Level */}
                <div className="space-y-2">
                  <Label
                    htmlFor="program_and_level"
                    className="text-foreground font-medium"
                  >
                    Program and Level
                  </Label>
                  <Input
                    id="program_and_level"
                    name="program_and_level"
                    value={formData.program_and_level}
                    onChange={handleChange}
                    placeholder="Bachelor of Science in Computer Science"
                    className="bg-muted border-input"
                  />
                </div>

                {/* Projected Completion Date */}
                <div className="space-y-2">
                  <Label
                    htmlFor="projected_completion_date"
                    className="text-foreground font-medium"
                  >
                    Projected Completion Date
                  </Label>
                  <Input
                    id="projected_completion_date"
                    name="projected_completion_date"
                    type="date"
                    value={formData.projected_completion_date}
                    onChange={handleChange}
                    className="bg-muted border-input"
                  />
                </div>

                {/* Currently Attending */}
                <div className="space-y-2">
                  <Label
                    htmlFor="currently_attending_id"
                    className="text-foreground font-medium"
                  >
                    Currently Attending
                  </Label>
                  <SearchableDropdown
                    popoverKey="currently_attending"
                    popoverOpen={popoverOpen}
                    setPopoverOpen={setPopoverOpen}
                    value={formData.currently_attending_id?.toString() ?? ""}
                    onValueChange={(value) =>
                      handleSelectChange("currently_attending_id", value)
                    }
                    options={yesNoOptions}
                    placeholder="Select option"
                    label="Currently attending"
                  />
                </div>

                {/* Returned to School */}
                <div className="space-y-2">
                  <Label
                    htmlFor="returned_to_school_id"
                    className="text-foreground font-medium"
                  >
                    Returned to School / College
                  </Label>
                  <SearchableDropdown
                    popoverKey="returned_to_school"
                    popoverOpen={popoverOpen}
                    setPopoverOpen={setPopoverOpen}
                    value={formData.returned_to_school_id?.toString() ?? ""}
                    onValueChange={(value) =>
                      handleSelectChange("returned_to_school_id", value)
                    }
                    options={yesNoOptions}
                    placeholder="Select option"
                    label="Returned to school"
                  />
                </div>
              </div>
            </div>

            {/* School Address Section */}
            <div className="space-y-6 pt-6 border-t">
              <h2 className="text-xl font-semibold text-foreground">
                School / College Address
              </h2>

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

            {/* Caregiving Information Section */}
            <div className="space-y-6 pt-6 border-t">
              <h2 className="text-xl font-semibold text-foreground">
                Caregiving Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Injuries Prevented Caregiving */}
                <div className="space-y-2">
                  <Label
                    htmlFor="injuries_prevented_caregiving_id"
                    className="text-foreground font-medium"
                  >
                    Injuries Prevented Caregiving
                  </Label>
                  <SearchableDropdown
                    popoverKey="injuries_prevented_caregiving"
                    popoverOpen={popoverOpen}
                    setPopoverOpen={setPopoverOpen}
                    value={
                      formData.injuries_prevented_caregiving_id?.toString() ??
                      ""
                    }
                    onValueChange={(value) =>
                      handleSelectChange(
                        "injuries_prevented_caregiving_id",
                        value
                      )
                    }
                    options={yesNoOptions}
                    placeholder="Select option"
                    label="Injuries prevented caregiving"
                  />
                </div>

                {/* Returned to Caregiving */}
                <div className="space-y-2">
                  <Label
                    htmlFor="returned_to_caregiving_id"
                    className="text-foreground font-medium"
                  >
                    Returned to Caregiving
                  </Label>
                  <SearchableDropdown
                    popoverKey="returned_to_caregiving"
                    popoverOpen={popoverOpen}
                    setPopoverOpen={setPopoverOpen}
                    value={formData.returned_to_caregiving_id?.toString() ?? ""}
                    onValueChange={(value) =>
                      handleSelectChange("returned_to_caregiving_id", value)
                    }
                    options={yesNoOptions}
                    placeholder="Select option"
                    label="Returned to caregiving"
                  />
                </div>

                {/* Caregiving Description - Full Width */}
                <div className="space-y-2 md:col-span-2">
                  <Label
                    htmlFor="caregiving_description"
                    className="text-foreground font-medium"
                  >
                    Caregiving Description
                  </Label>
                  <Textarea
                    id="caregiving_description"
                    name="caregiving_description"
                    value={formData.caregiving_description}
                    onChange={handleChange}
                    placeholder="I provided daily care to my grandmother before the accident."
                    rows={3}
                    className="bg-muted border-input"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6 pt-6 border-t">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-foreground">
                  Caregivers
                </h2>
                {visibleCaregivers < 10 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setVisibleCaregivers((prev) => Math.min(10, prev + 1))}
                    className="flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" /> Add Caregiver
                  </Button>
                )}
              </div>

              {[...Array(visibleCaregivers)].map((_, i) => {
                const num = i + 1;
                return (
                  <div
                    key={num}
                    className="border border-gray-200 p-6 rounded-lg space-y-4 "
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-foreground">
                        Caregiver {num}
                      </h3>
                      {visibleCaregivers > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCaregiver(num)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Caregiver Name */}
                      <div className="space-y-2">
                        <Label className="text-foreground font-medium">Name</Label>
                        <Input
                          name={`caregiver_name_${num}`}
                          value={formData[`caregiver_name_${num}`]}
                          onChange={handleChange}
                          placeholder="John Doe"
                          className="bg-card border-input"
                        />
                      </div>

                      {/* Caregiver DOB */}
                      <div className="space-y-2">
                        <Label className="text-foreground font-medium">
                          Date of Birth
                        </Label>
                        <Input
                          type="date"
                          name={`caregiver_dob_${num}`}
                          value={formData[`caregiver_dob_${num}`]}
                          onChange={handleChange}
                          className="bg-card border-input"
                        />
                      </div>

                      {/* Caregiver Disabled */}
                      <div className="space-y-2">
                        <Label className="text-foreground font-medium">
                          Disabled
                        </Label>
                        <SearchableDropdown
                          popoverKey={`caregiver_disabled_${num}`}
                          popoverOpen={popoverOpen}
                          setPopoverOpen={setPopoverOpen}
                          value={
                            formData[`caregiver_disabled_${num}`]?.toString() ??
                            ""
                          }
                          onValueChange={(value) =>
                            handleSelectChange(`caregiver_disabled_${num}`, value)
                          }
                          options={yesNoOptions}
                          placeholder="Select option"
                          label="Disabled"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
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
