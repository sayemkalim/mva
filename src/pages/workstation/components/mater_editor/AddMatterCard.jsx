import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createMatter, updateMatter } from "../../helpers/createMatter";
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
  CommandList,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  X,
  Check,
  ChevronsUpDown,
  Loader2,
  Plus,
  Trash2,
  ChevronRight,
} from "lucide-react";
import { Navbar2 } from "@/components/navbar2";
import { formatPhoneNumber } from "@/lib/utils";
import Billing from "@/components/billing";
import {
  FloatingInput,
  FloatingTextarea,
  FloatingWrapper,
} from "@/components/ui/floating-label";

const AddMatterCard = ({
  metadata,
  initialData = null,
  isEditMode = false,
}) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const baseForm = {
    file_no: "",
    intake_date: "",
    conflict_search_date: "",
    file_status_id: null,
    claim_status_id: [],
    non_engagement_issued_id: [],
    non_engagement_date: {},
    claim_type_id: [],
    mig_status_id: null,
    ab_claim_settlement_approx_id: null,
    tort_claim_settlement_approx_id: null,
    ltd_claim_settlement_approx_id: null,
    property_damage_claim_settlement_approx_id: null,
    dog_bite_claim_settlement_approx_id: null,
    at_fault_id: null,
    category_id: null,
    file_location: "",
    first_party_status_id: null,
    third_party_status_id: null,
    date_of_interview: "",
    interviewed_by_id: null,
    companion_file: "",
    other_mvas: [],
    ab_package_done_id: null,
    date: "",
    by: "",
    initial_meeting_id: null,
    date_2nd: "",
    by_2nd: "",
    memo_review_id: null,
    date_3rd: "",
    file_created: "",
    file_opened_by_id: null,
    assigned_date: "",
    assigned_to_id: null,
    assigned_to_review_id: null,
    assigned_to_paralegal: "",
    assigned_to_legal_counsel_id: null,
    legal_assistant_id: null,
    previous_legal_representative_id: null,
    history: "",
    file_closed: "",
    file_closed_by_id: null,
    storage_date: "",
    sent_by_id: null,
    shredded_date: "",
    shredded_by_id: null,
    previous_counsel_check: false,
    paralegal_name: "",
    firm_name: "",
    counsel_name: "",
    file_number: "",
    work_telephone: "",
    telephone: "",
    ext: "",
    fax: "",
    email: "",
    lawyer_name: "",
    unit_number: "",
    street_number: "",
    street_name: "",
    city: "",
    province: "",
    postal_code: "",
    country: "Canada",
  };

  const [formData, setFormData] = useState(baseForm);
  const [popoverOpen, setPopoverOpen] = useState({});

  useEffect(() => {
    if (isEditMode && initialData) {
      let loadedMVAs = [];
      if (initialData.other_mvas) {
        try {
          loadedMVAs =
            typeof initialData.other_mvas === "string"
              ? JSON.parse(initialData.other_mvas)
              : initialData.other_mvas;
        } catch {
          loadedMVAs = [];
        }
      }
      let initialDates = {};
      if (initialData.non_engagement_date) {
        try {
          const rawDates =
            typeof initialData.non_engagement_date === "string"
              ? JSON.parse(initialData.non_engagement_date)
              : initialData.non_engagement_date;
          if (Array.isArray(rawDates)) {
            rawDates.forEach((obj) => {
              Object.assign(initialDates, obj);
            });
          }
        } catch (e) {
          console.error("Error parsing non_engagement_date:", e);
        }
      }

      console.log(
        "INITIAL DATA previous_counsel_check RAW:",
        initialData.previous_counsel_check,
      );
      console.log(
        "INITIAL DATA previous_counsel_check CONVERTED:",
        !!initialData.previous_counsel_check,
      );
      setFormData({
        ...baseForm,
        ...initialData,
        non_engagement_issued_id: Array.isArray(
          initialData.non_engagement_issued_id,
        )
          ? initialData.non_engagement_issued_id
          : [],
        claim_status_id: Array.isArray(initialData.claim_status_id)
          ? initialData.claim_status_id
          : [],
        claim_type_id: Array.isArray(initialData.claim_type_id)
          ? initialData.claim_type_id
          : [],
        non_engagement_date: initialDates,
        other_mvas: loadedMVAs,
        previous_counsel_check: !!initialData.previous_counsel_check,
      });
    }
  }, [isEditMode, initialData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleDropdownChange = (fieldName, value, popoverKey) => {
    setFormData((p) => ({
      ...p,
      [fieldName]: p[fieldName] === value ? null : value,
    }));
    setPopoverOpen((p) => ({ ...p, [popoverKey]: false }));
  };

  const toggleMultiSelect = (fieldName, optionId) => {
    setFormData((p) => {
      const arr = p[fieldName] || [];
      if (arr.includes(optionId)) {
        return { ...p, [fieldName]: arr.filter((id) => id !== optionId) };
      }
      return { ...p, [fieldName]: [...arr, optionId] };
    });
  };

  const removeFromMultiSelect = (fieldName, optionId) => {
    setFormData((p) => ({
      ...p,
      [fieldName]: (p[fieldName] || []).filter((id) => id !== optionId),
    }));
  };

  const addMVA = () => {
    setFormData((p) => ({
      ...p,
      other_mvas: [
        ...(p.other_mvas || []),
        { mva_date: "", file_number: "", note: "" },
      ],
    }));
  };

  const removeMVA = (index) => {
    setFormData((p) => {
      const newMVAs = [...(p.other_mvas || [])];
      newMVAs.splice(index, 1);
      return { ...p, other_mvas: newMVAs };
    });
  };

  const handleMVAChange = (index, field, value) => {
    setFormData((p) => {
      const newMVAs = [...(p.other_mvas || [])];
      newMVAs[index] = { ...newMVAs[index], [field]: value };
      return { ...p, other_mvas: newMVAs };
    });
  };

  const mutation = useMutation({
    mutationFn: (data) => {
      if (isEditMode) {
        return updateMatter(initialData.slug, data);
      }
      return createMatter(data);
    },
    onSuccess: (response) => {
      const data = response?.response || response?.data || response;

      if (data?.Apistatus === false) {
        if (data.errors) {
          Object.values(data.errors).forEach((errArray) => {
            errArray.forEach((msg) => toast.error(msg));
          });
        } else {
          toast.error(data.message || "Validation failed");
        }
        return;
      }

      toast.success(
        isEditMode
          ? "Matter updated successfully"
          : "Matter created successfully",
      );
      queryClient.invalidateQueries(["matters"]);
      if (isEditMode) {
        queryClient.invalidateQueries(["matter", initialData.slug]);
      } else {
        const newSlug = data?.slug;
        if (newSlug) {
          navigate(`/dashboard/workstation/edit/${newSlug}`);
        }
      }
    },
    onError: (error) => {
      const errorData = error.response?.data;
      if (errorData?.Apistatus === false && errorData?.errors) {
        Object.values(errorData.errors).forEach((errArray) => {
          errArray.forEach((msg) => toast.error(msg));
        });
      } else {
        toast.error(
          errorData?.message ||
            error?.message ||
            (isEditMode
              ? "Failed to update matter"
              : "Failed to create matter"),
        );
      }
    },
  });

  const getNonEngagementKey = (name) => {
    if (!name) return "";
    const lower = name.toLowerCase();
    if (lower.includes("ab claim")) return "for_ab_claim";
    if (lower.includes("tort claim")) return "for_tort_claim";
    if (lower.includes("ltd claim")) return "for_ltd_claim";
    if (lower.includes("property damage")) return "for_property_damage_claim";
    return lower.replace(/\s+/g, "_");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.file_no?.trim()) {
      toast.error("File Number is required");
      return;
    }

    const payload = { ...formData };
    Object.keys(payload).forEach((key) => {
      if (payload[key] === "") payload[key] = null;
    });

    // Format non_engagement_date as an array of objects, only including those with values
    if (formData.non_engagement_issued_id?.length > 0) {
      const dateArray = [];
      formData.non_engagement_issued_id.forEach((id) => {
        const option = metadata.non_engagement_issued?.find((o) => o.id === id);
        if (option) {
          const key = getNonEngagementKey(option.name);
          const dateVal = formData.non_engagement_date?.[key];
          if (dateVal && dateVal.trim() !== "") {
            dateArray.push({ [key]: dateVal });
          }
        }
      });
      payload.non_engagement_date = dateArray;
    } else {
      payload.non_engagement_date = [];
    }

    const finalPayload = { ...payload };
    finalPayload.previous_counsel_check = formData.previous_counsel_check
      ? 1
      : 0;
    console.log(
      "SUBMITTING PAYLOAD with previous_counsel_check:",
      finalPayload.previous_counsel_check,
    );
    mutation.mutate(payload);
  };

  const SearchableDropdown = ({
    label,
    value,
    options,
    onSelect,
    placeholder,
    popoverKey,
    fieldName,
  }) => {
    const selectedOption = options?.find((opt) => opt.id === value);
    return (
      <FloatingWrapper
        label={label}
        hasValue={!!selectedOption}
        isFocused={!!popoverOpen[popoverKey]}
      >
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
              <CommandInput placeholder="Search..." />
              <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup>
                  <CommandItem
                    onSelect={() => onSelect(fieldName, null, popoverKey)}
                    className="cursor-pointer italic text-muted-foreground"
                  >
                    <Check
                      className={`mr-2 h-4 w-4 ${
                        !value ? "opacity-100" : "opacity-0"
                      }`}
                    />
                    None
                  </CommandItem>
                  {options?.map((opt) => (
                    <CommandItem
                      key={opt.id}
                      value={opt.name}
                      onSelect={() => onSelect(fieldName, opt.id, popoverKey)}
                    >
                      <Check
                        className={`mr-2 h-4 w-4 ${
                          value === opt.id ? "opacity-100" : "opacity-0"
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

  const MultiSelectDropdown = ({
    label,
    selected,
    options,
    onToggle,
    placeholder,
    popoverKey,
    fieldName,
  }) => {
    return (
      <FloatingWrapper
        label={label}
        hasValue={selected.length > 0}
        isFocused={!!popoverOpen[popoverKey]}
      >
        <Popover
          open={popoverOpen[popoverKey]}
          onOpenChange={(open) =>
            setPopoverOpen((p) => ({ ...p, [popoverKey]: open }))
          }
        >
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-between text-left font-normal min-h-[52px] h-auto bg-transparent border border-input py-2"
              type="button"
            >
              <div className="flex flex-wrap gap-1 items-center flex-1">
                {selected.length > 0
                  ? selected.map((id) => {
                      const option = options?.find((opt) => opt.id === id);
                      if (!option) return null;
                      return (
                        <Badge
                          key={id}
                          variant="secondary"
                          className="rounded-sm px-2 font-normal flex items-center gap-1"
                        >
                          {option.name}
                        </Badge>
                      );
                    })
                  : ""}
              </div>
              <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-[var(--radix-popover-trigger-width)] p-0"
            align="start"
          >
            <Command>
              <CommandInput placeholder="Search..." />
              <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup>
                  {options?.map((opt) => (
                    <CommandItem
                      key={opt.id}
                      value={opt.name}
                      onSelect={() => onToggle(fieldName, opt.id)}
                    >
                      <Checkbox
                        checked={selected.includes(opt.id)}
                        className="mr-2"
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

  if (!metadata) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading form metadata...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted">
      <Navbar2 />

      <Billing slug={initialData?.slug} />

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
            {isEditMode ? "Edit Matter" : "Add Matter"}
          </span>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="bg-card rounded-lg shadow-sm border p-8">
          <h1 className="text-2xl font-bold mb-8 text-foreground">
            {isEditMode ? "Edit Matter" : "Add New Matter"}
          </h1>

          <form className="space-y-12" onSubmit={handleSubmit} noValidate>
            <section>
              <h2 className="font-semibold text-xl mb-6 border-b pb-2 uppercase text-foreground">
                File Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FloatingInput
                  label="File Number"
                  id="file_no"
                  name="file_no"
                  value={formData.file_no}
                  onChange={handleInputChange}
                  maxLength={200}
                  required
                />
                <FloatingInput
                  label="Intake Date"
                  type="date"
                  id="intake_date"
                  name="intake_date"
                  value={formData.intake_date}
                  onChange={handleInputChange}
                />
                <FloatingInput
                  label="Conflict Search Date"
                  type="date"
                  id="conflict_search_date"
                  name="conflict_search_date"
                  value={formData.conflict_search_date}
                  onChange={handleInputChange}
                />

                <SearchableDropdown
                  label="File Status"
                  value={formData.file_status_id}
                  onSelect={handleDropdownChange}
                  options={metadata.file_status}
                  placeholder="Select file status"
                  popoverKey="file_status"
                  fieldName="file_status_id"
                />
                <MultiSelectDropdown
                  label="Claim Status"
                  selected={formData.claim_status_id}
                  onToggle={toggleMultiSelect}
                  options={metadata.claim_status}
                  placeholder="Select claim status"
                  popoverKey="claim_status"
                  fieldName="claim_status_id"
                />
                <MultiSelectDropdown
                  label="Non Engagement Issued"
                  selected={formData.non_engagement_issued_id}
                  onToggle={toggleMultiSelect}
                  options={metadata.non_engagement_issued}
                  placeholder="Select non engagement"
                  popoverKey="non_engagement_issued"
                  fieldName="non_engagement_issued_id"
                />

                {formData.non_engagement_issued_id?.length > 0 &&
                  formData.non_engagement_issued_id.map((id) => {
                    const option = metadata.non_engagement_issued?.find(
                      (o) => o.id === id,
                    );
                    if (!option) return null;
                    const key = getNonEngagementKey(option.name);

                    return (
                      <FloatingInput
                        key={id}
                        label={`Non Engagement Date for ${option.name}`}
                        type="date"
                        value={formData.non_engagement_date?.[key] || ""}
                        onChange={(e) => {
                          setFormData((p) => ({
                            ...p,
                            non_engagement_date: {
                              ...p.non_engagement_date,
                              [key]: e.target.value,
                            },
                          }));
                        }}
                      />
                    );
                  })}

                <MultiSelectDropdown
                  label="Claim Type"
                  selected={formData.claim_type_id}
                  onToggle={toggleMultiSelect}
                  options={metadata.claim_type}
                  placeholder="Select claim type"
                  popoverKey="claim_type"
                  fieldName="claim_type_id"
                />
                <SearchableDropdown
                  label="MIG Status"
                  value={formData.mig_status_id}
                  onSelect={handleDropdownChange}
                  options={metadata.mig_status}
                  placeholder="Select MIG status"
                  popoverKey="mig_status"
                  fieldName="mig_status_id"
                />
                <SearchableDropdown
                  label="AB Claim Settlement Approx."
                  value={formData.ab_claim_settlement_approx_id}
                  onSelect={handleDropdownChange}
                  options={metadata.ab_claim_settlement_approx}
                  placeholder="Select AB claim approx."
                  popoverKey="ab_claim_settlement_approx"
                  fieldName="ab_claim_settlement_approx_id"
                />
                <SearchableDropdown
                  label="Tort Claim Settlement Approx."
                  value={formData.tort_claim_settlement_approx_id}
                  onSelect={handleDropdownChange}
                  options={metadata.tort_claim_settlement_approx}
                  placeholder="Select Tort claim approx."
                  popoverKey="tort_claim_settlement_approx"
                  fieldName="tort_claim_settlement_approx_id"
                />
                <SearchableDropdown
                  label="Property Damage Claim Settlement Approx."
                  value={formData.property_damage_claim_settlement_approx_id}
                  onSelect={handleDropdownChange}
                  options={metadata.property_damage_claim_settlem}
                  placeholder="Select property damage approx."
                  popoverKey="property_damage_claim_settlement_approx"
                  fieldName="property_damage_claim_settlement_approx_id"
                />
                <SearchableDropdown
                  label="LTD Claim Settlement Approx."
                  value={formData.ltd_claim_settlement_approx_id}
                  onSelect={handleDropdownChange}
                  options={metadata.ltd_claim_settlement_approx}
                  placeholder="Select LTD claim approx."
                  popoverKey="ltd_claim_settlement_approx"
                  fieldName="ltd_claim_settlement_approx_id"
                />
                <SearchableDropdown
                  label="Dog Bite Claim Settlement Approx."
                  value={formData.dog_bite_claim_settlement_approx_id}
                  onSelect={handleDropdownChange}
                  options={metadata.dog_bite_claim_settlement_approx}
                  placeholder="Select Dog Bite claim approx."
                  popoverKey="dog_bite_claim_settlement_approx"
                  fieldName="dog_bite_claim_settlement_approx_id"
                />

                {/* At Fault - Label+Checkbox pattern: not changed */}
                <div>
                  <label className="block font-medium mb-2 text-foreground">
                    At Fault
                  </label>
                  <div className="flex items-center gap-6 mt-4">
                    {metadata.yes_no_option?.map((opt) => (
                      <div key={opt.id} className="flex items-center gap-2">
                        <Checkbox
                          id={`at_fault_${opt.id}`}
                          checked={formData.at_fault_id === opt.id}
                          onCheckedChange={(checked) => {
                            setFormData((p) => ({
                              ...p,
                              at_fault_id: checked ? opt.id : null,
                            }));
                          }}
                        />
                        <label
                          htmlFor={`at_fault_${opt.id}`}
                          className="text-sm font-medium leading-none cursor-pointer"
                        >
                          {opt.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <SearchableDropdown
                  label="SABS Categories"
                  value={formData.category_id}
                  onSelect={handleDropdownChange}
                  options={metadata.category}
                  placeholder="Select category"
                  popoverKey="category"
                  fieldName="category_id"
                />
                <FloatingInput
                  label="File Location"
                  id="file_location"
                  name="file_location"
                  value={formData.file_location}
                  onChange={handleInputChange}
                  maxLength={200}
                />
                <SearchableDropdown
                  label="First Party Status"
                  value={formData.first_party_status_id}
                  onSelect={handleDropdownChange}
                  options={metadata.first_party_status}
                  placeholder="Select first party status"
                  popoverKey="first_party_status"
                  fieldName="first_party_status_id"
                />
                <SearchableDropdown
                  label="Third Party Status"
                  value={formData.third_party_status_id}
                  onSelect={handleDropdownChange}
                  options={metadata.third_party_status}
                  placeholder="Select third party status"
                  popoverKey="third_party_status"
                  fieldName="third_party_status_id"
                />
              </div>
            </section>

            {/* ===== INTERVIEW INFORMATION SECTION ===== */}
            <section>
              <h2 className="font-semibold text-xl mb-6 border-b pb-2 uppercase text-foreground">
                Interview Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FloatingInput
                  label="Date of Interview"
                  type="date"
                  id="date_of_interview"
                  name="date_of_interview"
                  value={formData.date_of_interview}
                  onChange={handleInputChange}
                />
                <SearchableDropdown
                  label="Interviewed By"
                  value={formData.interviewed_by_id}
                  onSelect={handleDropdownChange}
                  options={metadata.counsel_Interviewer}
                  placeholder="Select interviewer"
                  popoverKey="interviewed_by"
                  fieldName="interviewed_by_id"
                />
                <FloatingInput
                  label="Companion File"
                  id="companion_file"
                  name="companion_file"
                  value={formData.companion_file}
                  onChange={handleInputChange}
                  maxLength={255}
                />
              </div>
            </section>

            {/* ===== OTHER MVAs SECTION ===== */}
            <section>
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-semibold text-xl uppercase text-foreground">
                  Other relted MVA's{" "}
                </h2>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={addMVA}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add MVA
                </Button>
              </div>

              {formData.other_mvas.length === 0 && (
                <p className="text-gray-500 text-center py-4">
                  No MVAs added yet. Click "Add MVA" to add one.
                </p>
              )}

              {formData.other_mvas.map((item, idx) => (
                <div
                  key={idx}
                  className="border border-gray-200 rounded-lg p-6 mb-4 bg-muted"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-foreground">
                      MVA #{idx + 1}
                    </h3>
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      onClick={() => removeMVA(idx)}
                    >
                      <Trash2 className="mr-1 h-4 w-4" /> Remove
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FloatingInput
                      label="MVA Date"
                      type="date"
                      value={item.mva_date}
                      onChange={(e) =>
                        handleMVAChange(idx, "mva_date", e.target.value)
                      }
                    />
                    <FloatingInput
                      label="File Number"
                      value={item.file_number}
                      onChange={(e) =>
                        handleMVAChange(idx, "file_number", e.target.value)
                      }
                      maxLength={255}
                    />
                    <FloatingTextarea
                      label="Note"
                      value={item.note}
                      onChange={(e) =>
                        handleMVAChange(idx, "note", e.target.value)
                      }
                      maxLength={500}
                      rows={3}
                    />
                  </div>
                </div>
              ))}
            </section>

            {/* ===== LEGAL FILE INFORMATION SECTION ===== */}
            <section>
              <h2 className="font-semibold text-xl mb-6 border-b pb-2 uppercase text-foreground">
                Legal File Information
              </h2>

              {/* File Opening Info */}
              <h3 className="font-semibold text-lg mb-4 text-foreground">
                File Opening Info
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <FloatingInput
                  label="File Created"
                  type="date"
                  id="file_created"
                  name="file_created"
                  value={formData.file_created}
                  onChange={handleInputChange}
                />
                <SearchableDropdown
                  label="File Opened By"
                  value={formData.file_opened_by_id}
                  onSelect={handleDropdownChange}
                  options={metadata.users}
                  placeholder="Select user"
                  popoverKey="file_opened_by"
                  fieldName="file_opened_by_id"
                />
              </div>

              {/* Assigned to Info */}
              <h3 className="font-semibold text-lg mb-4 text-foreground">
                Assigned to Info
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <FloatingInput
                  label="Assigned Date"
                  type="date"
                  id="assigned_date"
                  name="assigned_date"
                  value={formData.assigned_date}
                  onChange={handleInputChange}
                />
                <SearchableDropdown
                  label="Assigned To"
                  value={formData.assigned_to_id}
                  onSelect={handleDropdownChange}
                  options={metadata.users}
                  placeholder="Select user"
                  popoverKey="assigned_to"
                  fieldName="assigned_to_id"
                />
                <SearchableDropdown
                  label="Assigned to Review"
                  value={formData.assigned_to_review_id}
                  onSelect={handleDropdownChange}
                  options={metadata.users}
                  placeholder="Select user"
                  popoverKey="assigned_to_review"
                  fieldName="assigned_to_review_id"
                />
                <FloatingInput
                  label="Assigned to Paralegal"
                  id="assigned_to_paralegal"
                  name="assigned_to_paralegal"
                  value={formData.assigned_to_paralegal}
                  onChange={handleInputChange}
                  maxLength={255}
                />
                <SearchableDropdown
                  label="Assigned to Legal Counsel"
                  value={formData.assigned_to_legal_counsel_id}
                  onSelect={handleDropdownChange}
                  options={metadata.counsel_Interviewer}
                  placeholder="Select counsel"
                  popoverKey="assigned_to_legal_counsel"
                  fieldName="assigned_to_legal_counsel_id"
                />
                <SearchableDropdown
                  label="Legal Assistant"
                  value={formData.legal_assistant_id}
                  onSelect={handleDropdownChange}
                  options={metadata.users}
                  placeholder="Select user"
                  popoverKey="legal_assistant"
                  fieldName="legal_assistant_id"
                />
                <SearchableDropdown
                  label="Previous Legal Representative"
                  value={formData.previous_legal_representative_id}
                  onSelect={handleDropdownChange}
                  options={metadata.users}
                  placeholder="Select user"
                  popoverKey="previous_legal_representative"
                  fieldName="previous_legal_representative_id"
                />
                <div className="md:col-span-3">
                  <FloatingTextarea
                    label="History"
                    id="history"
                    name="history"
                    value={formData.history}
                    onChange={handleInputChange}
                    maxLength={1000}
                    rows={4}
                  />
                </div>
              </div>

              {/* File Closing Info */}
              <h3 className="font-semibold text-lg mb-4 text-foreground">
                File Closing Info
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <FloatingInput
                  label="File Closed"
                  type="date"
                  id="file_closed"
                  name="file_closed"
                  value={formData.file_closed}
                  onChange={handleInputChange}
                />
                <SearchableDropdown
                  label="File Closed By"
                  value={formData.file_closed_by_id}
                  onSelect={handleDropdownChange}
                  options={metadata.users}
                  placeholder="Select user"
                  popoverKey="file_closed_by"
                  fieldName="file_closed_by_id"
                />
              </div>

              {/* Folder to Storage */}
              <h3 className="font-semibold text-lg mb-4 text-foreground">
                Folder to Storage
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <FloatingInput
                  label="Storage Date"
                  type="date"
                  id="storage_date"
                  name="storage_date"
                  value={formData.storage_date}
                  onChange={handleInputChange}
                />
                <SearchableDropdown
                  label="Sent By"
                  value={formData.sent_by_id}
                  onSelect={handleDropdownChange}
                  options={metadata.users}
                  placeholder="Select user"
                  popoverKey="sent_by"
                  fieldName="sent_by_id"
                />
              </div>

              {/* File Shredded */}
              <h3 className="font-semibold text-lg mb-4 text-foreground">
                File Shredded
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <FloatingInput
                  label="Shredded Date"
                  type="date"
                  id="shredded_date"
                  name="shredded_date"
                  value={formData.shredded_date}
                  onChange={handleInputChange}
                />
                <SearchableDropdown
                  label="Shredded By"
                  value={formData.shredded_by_id}
                  onSelect={handleDropdownChange}
                  options={metadata.users}
                  placeholder="Select user"
                  popoverKey="shredded_by"
                  fieldName="shredded_by_id"
                />
              </div>
            </section>

            {/* ===== PREVIOUS COUNSEL SECTION ===== */}
            <section>
              <div className="flex items-center space-x-2 mb-6 border-b pb-2">
                <Checkbox
                  id="previous_counsel_check"
                  checked={formData.previous_counsel_check}
                  onCheckedChange={(checked) => {
                    console.log("CHECKBOX CHANGED TO:", checked);
                    setFormData((p) => ({
                      ...p,
                      previous_counsel_check: checked,
                    }));
                  }}
                />
                <label
                  htmlFor="previous_counsel_check"
                  className="font-semibold text-xl uppercase text-foreground cursor-pointer"
                >
                  Previous Counsel
                </label>
              </div>

              {formData.previous_counsel_check && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FloatingInput
                    label="Paralegal Name"
                    id="paralegal_name"
                    name="paralegal_name"
                    value={formData.paralegal_name}
                    onChange={handleInputChange}
                    maxLength={255}
                  />
                  <FloatingInput
                    label="Firm Name"
                    id="firm_name"
                    name="firm_name"
                    value={formData.firm_name}
                    onChange={handleInputChange}
                    maxLength={255}
                  />
                  <FloatingInput
                    label="Counsel Name"
                    id="counsel_name"
                    name="counsel_name"
                    value={formData.counsel_name}
                    onChange={handleInputChange}
                    maxLength={255}
                  />
                  <FloatingInput
                    label="File Number"
                    id="file_number"
                    name="file_number"
                    value={formData.file_number}
                    onChange={handleInputChange}
                    maxLength={255}
                  />
                  <FloatingInput
                    label="Work Telephone"
                    id="work_telephone"
                    name="work_telephone"
                    value={formData.work_telephone}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        work_telephone: formatPhoneNumber(e.target.value),
                      }))
                    }
                    maxLength={255}
                  />
                  <FloatingInput
                    label="Telephone"
                    id="telephone"
                    name="telephone"
                    value={formData.telephone}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        telephone: formatPhoneNumber(e.target.value),
                      }))
                    }
                    maxLength={255}
                  />
                  <FloatingInput
                    label="Ext"
                    id="ext"
                    name="ext"
                    value={formData.ext}
                    onChange={handleInputChange}
                    maxLength={255}
                  />
                  <FloatingInput
                    label="Fax"
                    id="fax"
                    name="fax"
                    value={formData.fax}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        fax: formatPhoneNumber(e.target.value),
                      }))
                    }
                    maxLength={255}
                  />
                  <FloatingInput
                    label="Email"
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    maxLength={255}
                  />
                  <FloatingInput
                    label="Lawyer Name"
                    id="lawyer_name"
                    name="lawyer_name"
                    value={formData.lawyer_name}
                    onChange={handleInputChange}
                    maxLength={255}
                  />
                </div>
              )}
            </section>

            {/* ===== ADDRESS SECTION ===== */}
            {formData.previous_counsel_check && (
              <section>
                {/* <h2 className="font-semibold text-xl mb-6 border-b pb-2 uppercase text-foreground">
                  Address
                </h2> */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <FloatingInput
                    label="Unit Number"
                    id="unit_number"
                    name="unit_number"
                    value={formData.unit_number}
                    onChange={handleInputChange}
                    maxLength={50}
                  />
                  <FloatingInput
                    label="Street Number"
                    id="street_number"
                    name="street_number"
                    value={formData.street_number}
                    onChange={handleInputChange}
                    maxLength={100}
                  />
                  <FloatingInput
                    label="Street Name"
                    id="street_name"
                    name="street_name"
                    value={formData.street_name}
                    onChange={handleInputChange}
                    maxLength={100}
                  />
                  <FloatingInput
                    label="City"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    maxLength={100}
                  />
                  <FloatingInput
                    label="Province"
                    id="province"
                    name="province"
                    value={formData.province}
                    onChange={handleInputChange}
                    maxLength={100}
                  />
                  <FloatingInput
                    label="Postal Code"
                    id="postal_code"
                    name="postal_code"
                    value={formData.postal_code}
                    onChange={handleInputChange}
                    maxLength={50}
                  />
                </div>
              </section>
            )}

            {/* ===== SUBMIT BUTTONS ===== */}
            <div className="flex justify-end gap-4 pt-6 border-t">
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate("/dashboard/workstation")}
                type="button"
                disabled={mutation.isPending}
              >
                Cancel
              </Button>
              <Button size="lg" type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? (
                  <>
                    <Loader2 className="animate-spin h-5 w-5 mr-2" />
                    {isEditMode ? "Updating..." : "Creating..."}
                  </>
                ) : isEditMode ? (
                  "Update Matter"
                ) : (
                  "Create Matter"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddMatterCard;
