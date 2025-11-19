import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createMatter } from "../../helpers/createMatter";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  X,
  Check,
  ChevronsUpDown,
  Loader2,
  Plus,
  Trash2,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const AddMatterCard = ({
  metadata = null,
  initialData = null,
  isEditMode = false,
}) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const getInitialFormData = () => ({
    file_no: "",
    intake_date: "",
    conflict_search_date: "",
    file_status_id: "",
    claim_status_id: "",
    non_engagement_issued_id: [],
    non_engagement_date: "",
    claim_type_id: [],
    mig_status_id: "",
    ab_claim_settlement_approx_id: "",
    tort_claim_settlement_approx_id: "",
    ltd_claim_settlement_approx_id: "",
    property_damage_claim_settlement_approx_id: "",
    at_fault_id: "",
    category_id: "",
    file_location: "",
    first_party_status_id: "",
    third_party_status_id: "",
    date_of_interview: "",
    interviewed_by: "",
    companion_file: "",
    other_mvas: [],
    ab_package_done: "",
    date: "",
    by: "",
    initial_meeting: "",
    date_2nd: "",
    by_2nd: "",
    memo_review: "",
    date_3rd: "",
    file_created: "",
    file_opened_by: "",
    assigned_date: "",
    assigned_to: "",
    assigned_to_review: "",
    assigned_to_paralegal: "",
    assigned_to_legal_counsel: "",
    legal_assistant: "",
    previous_legal_representative: "",
    history: "",
    file_closed: "",
    file_closed_by: "",
    storage_date: "",
    sent_by: "",
    shredded_date: "",
    shredded_by: "",
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
  });

  const [formData, setFormData] = useState(getInitialFormData());
  const [openPopovers, setOpenPopovers] = useState({});

  useEffect(() => {
    if (isEditMode && initialData) {
      let parsedMVAs = [];
      if (initialData.other_mvas) {
        try {
          parsedMVAs =
            typeof initialData.other_mvas === "string"
              ? JSON.parse(initialData.other_mvas)
              : initialData.other_mvas;
        } catch (error) {
          console.error("Error parsing other_mvas:", error);
          parsedMVAs = [];
        }
      }
      setFormData({
        ...getInitialFormData(),
        ...initialData,
        other_mvas: Array.isArray(parsedMVAs) ? parsedMVAs : [],
        non_engagement_issued_id: Array.isArray(
          initialData.non_engagement_issued_id
        )
          ? initialData.non_engagement_issued_id
          : [],
        claim_type_id: Array.isArray(initialData.claim_type_id)
          ? initialData.claim_type_id
          : [],
      });
    }
  }, [isEditMode, initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value, popoverKey) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setOpenPopovers((prev) => ({ ...prev, [popoverKey]: false }));
  };

  const toggleMultiSelect = (fieldName, itemId) => {
    setFormData((prev) => {
      const currentArray = prev[fieldName] || [];
      const isSelected = currentArray.includes(itemId);
      return {
        ...prev,
        [fieldName]: isSelected
          ? currentArray.filter((id) => id !== itemId)
          : [...currentArray, itemId],
      };
    });
  };

  const removeFromMultiSelect = (fieldName, itemId) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: prev[fieldName].filter((id) => id !== itemId),
    }));
  };

  const addMVA = () => {
    setFormData((prev) => ({
      ...prev,
      other_mvas: [
        ...prev.other_mvas,
        { mva_date: "", file_number: "", note: "" },
      ],
    }));
  };

  const removeMVA = (index) => {
    setFormData((prev) => ({
      ...prev,
      other_mvas: prev.other_mvas.filter((_, i) => i !== index),
    }));
  };

  const handleMVAChange = (index, field, value) => {
    setFormData((prev) => {
      const updatedMVAs = [...prev.other_mvas];
      updatedMVAs[index][field] = value;
      return { ...prev, other_mvas: updatedMVAs };
    });
  };

  const saveMutation = useMutation({
    mutationFn: (data) => {
      if (isEditMode) {
        return createMatter(initialData.slug || initialData.id, data);
      } else {
        return createMatter(data);
      }
    },
    onSuccess: (res) => {
      if (res?.response?.message || res?.Apistatus) {
        toast.success(
          res?.message || isEditMode
            ? "Matter updated successfully"
            : "Matter created successfully"
        );
        queryClient.invalidateQueries(["matters"]);
        queryClient.invalidateQueries(["matter", initialData?.slug]);
        navigate("/dashboard/workstation", { replace: true });
      } else {
        toast.error(
          res?.response?.message ||
            res?.message ||
            `Failed to ${isEditMode ? "update" : "create"} matter`
        );
      }
    },
    onError: (error) => {
      console.error("Mutation error:", error);
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          `Failed to ${isEditMode ? "update" : "create"} matter`
      );
    },
    retry: 1,
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.file_no || !formData.file_no.trim()) {
      toast.error("File Number is required");
      return;
    }

    const payload = {
      ...formData,
      non_engagement_issued_id: formData.non_engagement_issued_id || [],
      claim_type_id: formData.claim_type_id || [],
      other_mvas: formData.other_mvas.length > 0 ? formData.other_mvas : [],
    };

    Object.keys(payload).forEach((key) => {
      if (payload[key] === "") {
        payload[key] = null;
      }
    });

    saveMutation.mutate(payload);
  };

  const isSubmitting = saveMutation.isPending;

  if (!metadata) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading form...</span>
      </div>
    );
  }

  const SearchableDropdown = ({
    value,
    onChange,
    options,
    placeholder,
    popoverKey,
    fieldName,
  }) => {
    const selectedOption = options?.find((opt) => opt.id === value);

    return (
      <Popover
        open={openPopovers[popoverKey]}
        onOpenChange={(open) =>
          setOpenPopovers((prev) => ({ ...prev, [popoverKey]: open }))
        }
      >
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            className="w-full justify-between font-normal bg-gray-50"
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
            <CommandInput placeholder="Search..." />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup>
                {options?.map((option) => (
                  <CommandItem
                    key={option.id}
                    value={option.name}
                    onSelect={() => onChange(fieldName, option.id, popoverKey)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === option.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {option.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  };

  const MultiSelectDropdown = ({
    selectedIds,
    onChange,
    options,
    placeholder,
    popoverKey,
    fieldName,
  }) => {
    return (
      <Popover
        open={openPopovers[popoverKey]}
        onOpenChange={(open) =>
          setOpenPopovers((prev) => ({ ...prev, [popoverKey]: open }))
        }
      >
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start text-left font-normal min-h-10 bg-gray-50"
            type="button"
          >
            {selectedIds.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {selectedIds.map((id) => {
                  const item = options?.find((opt) => opt.id === id);
                  return item ? (
                    <Badge key={id} variant="secondary" className="mr-1">
                      {item.name}
                      <X
                        className="ml-1 h-3 w-3 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFromMultiSelect(fieldName, id);
                        }}
                      />
                    </Badge>
                  ) : null;
                })}
              </div>
            ) : (
              placeholder
            )}
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
                {options?.map((item) => (
                  <CommandItem
                    key={item.id}
                    value={item.name}
                    onSelect={() => onChange(fieldName, item.id)}
                  >
                    <Checkbox
                      checked={selectedIds.includes(item.id)}
                      className="mr-2"
                    />
                    {item.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  };

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
          <span className="text-gray-900 font-medium">
            {isEditMode ? "Edit Matter" : "Add Matter"}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <h1 className="text-2xl font-bold mb-8 text-gray-900 uppercase">
            {isEditMode ? "Initial Info Overview" : "Add New Matter"}
          </h1>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* File Details Section */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">
                File Details
              </h2>

              {/* ✅ 3 COLUMNS GRID */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="block text-gray-700 font-medium">
                    File Number <span className="text-red-500">*</span>
                  </label>
                  <Input
                    name="file_no"
                    value={formData.file_no}
                    onChange={handleChange}
                    placeholder="FILE-2025-002"
                    maxLength={200}
                    required
                    className="bg-gray-50 border-gray-300"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-gray-700 font-medium">
                    Intake Date
                  </label>
                  <Input
                    type="date"
                    name="intake_date"
                    value={formData.intake_date}
                    onChange={handleChange}
                    className="bg-gray-50 border-gray-300"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-gray-700 font-medium">
                    Conflict Search Date
                  </label>
                  <Input
                    type="date"
                    name="conflict_search_date"
                    value={formData.conflict_search_date}
                    onChange={handleChange}
                    className="bg-gray-50 border-gray-300"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-gray-700 font-medium">
                    File Status
                  </label>
                  <SearchableDropdown
                    value={formData.file_status_id}
                    onChange={handleSelectChange}
                    options={metadata.file_status}
                    placeholder="Select file status"
                    popoverKey="file_status"
                    fieldName="file_status_id"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-gray-700 font-medium">
                    Claim Status
                  </label>
                  <SearchableDropdown
                    value={formData.claim_status_id}
                    onChange={handleSelectChange}
                    options={metadata.claim_status}
                    placeholder="Select claim status"
                    popoverKey="claim_status"
                    fieldName="claim_status_id"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-gray-700 font-medium">
                    Non-Engagement Issued
                  </label>
                  <MultiSelectDropdown
                    selectedIds={formData.non_engagement_issued_id}
                    onChange={toggleMultiSelect}
                    options={metadata.non_engagement_issued}
                    placeholder="Select non-engagement issued"
                    popoverKey="non_engagement"
                    fieldName="non_engagement_issued_id"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-gray-700 font-medium">
                    Non-Engagement Date
                  </label>
                  <Input
                    type="date"
                    name="non_engagement_date"
                    value={formData.non_engagement_date}
                    onChange={handleChange}
                    className="bg-gray-50 border-gray-300"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-gray-700 font-medium">
                    Claim Type
                  </label>
                  <MultiSelectDropdown
                    selectedIds={formData.claim_type_id}
                    onChange={toggleMultiSelect}
                    options={metadata.claim_type}
                    placeholder="Select claim type"
                    popoverKey="claim_type"
                    fieldName="claim_type_id"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-gray-700 font-medium">
                    MIG Status
                  </label>
                  <SearchableDropdown
                    value={formData.mig_status_id}
                    onChange={handleSelectChange}
                    options={metadata.mig_status}
                    placeholder="Select MIG status"
                    popoverKey="mig_status"
                    fieldName="mig_status_id"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-gray-700 font-medium">
                    AB Claim Settlement Approx
                  </label>
                  <SearchableDropdown
                    value={formData.ab_claim_settlement_approx_id}
                    onChange={handleSelectChange}
                    options={metadata.ab_claim_settlement_approx}
                    placeholder="Select AB claim settlement"
                    popoverKey="ab_claim"
                    fieldName="ab_claim_settlement_approx_id"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-gray-700 font-medium">
                    Tort Claim Settlement Approx
                  </label>
                  <SearchableDropdown
                    value={formData.tort_claim_settlement_approx_id}
                    onChange={handleSelectChange}
                    options={metadata.tort_claim_settlement_approx}
                    placeholder="Select tort claim settlement"
                    popoverKey="tort_claim"
                    fieldName="tort_claim_settlement_approx_id"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-gray-700 font-medium">
                    LTD Claim Settlement Approx
                  </label>
                  <SearchableDropdown
                    value={formData.ltd_claim_settlement_approx_id}
                    onChange={handleSelectChange}
                    options={metadata.ltd_claim_settlement_approx}
                    placeholder="Select LTD claim settlement"
                    popoverKey="ltd_claim"
                    fieldName="ltd_claim_settlement_approx_id"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-gray-700 font-medium">
                    Property Damage Claim Settlement Approx
                  </label>
                  <SearchableDropdown
                    value={formData.property_damage_claim_settlement_approx_id}
                    onChange={handleSelectChange}
                    options={metadata.property_damage_claim_settlement_approx}
                    placeholder="Select property damage claim"
                    popoverKey="property_damage"
                    fieldName="property_damage_claim_settlement_approx_id"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-gray-700 font-medium">
                    At Fault
                  </label>
                  <SearchableDropdown
                    value={formData.at_fault_id}
                    onChange={handleSelectChange}
                    options={metadata.at_fault}
                    placeholder="Select at fault"
                    popoverKey="at_fault"
                    fieldName="at_fault_id"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-gray-700 font-medium">
                    Category
                  </label>
                  <SearchableDropdown
                    value={formData.category_id}
                    onChange={handleSelectChange}
                    options={metadata.category}
                    placeholder="Select category"
                    popoverKey="category"
                    fieldName="category_id"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-gray-700 font-medium">
                    File Location
                  </label>
                  <Input
                    name="file_location"
                    value={formData.file_location}
                    onChange={handleChange}
                    placeholder="Enter file location"
                    maxLength={200}
                    className="bg-gray-50 border-gray-300"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-gray-700 font-medium">
                    First Party Status
                  </label>
                  <SearchableDropdown
                    value={formData.first_party_status_id}
                    onChange={handleSelectChange}
                    options={metadata.first_party_status}
                    placeholder="Select first party status"
                    popoverKey="first_party"
                    fieldName="first_party_status_id"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-gray-700 font-medium">
                    Third Party Status
                  </label>
                  <SearchableDropdown
                    value={formData.third_party_status_id}
                    onChange={handleSelectChange}
                    options={metadata.third_party_status}
                    placeholder="Select third party status"
                    popoverKey="third_party"
                    fieldName="third_party_status_id"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-gray-700 font-medium">
                    Date of Interview
                  </label>
                  <Input
                    type="date"
                    name="date_of_interview"
                    value={formData.date_of_interview}
                    onChange={handleChange}
                    className="bg-gray-50 border-gray-300"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-gray-700 font-medium">
                    Interviewed By
                  </label>
                  <Input
                    name="interviewed_by"
                    value={formData.interviewed_by}
                    onChange={handleChange}
                    placeholder="Enter interviewer name"
                    maxLength={200}
                    className="bg-gray-50 border-gray-300"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-gray-700 font-medium">
                    Companion File
                  </label>
                  <Input
                    name="companion_file"
                    value={formData.companion_file}
                    onChange={handleChange}
                    placeholder="Enter companion file"
                    maxLength={200}
                    className="bg-gray-50 border-gray-300"
                  />
                </div>
              </div>
            </div>

            {/* Other MVAs Section */}
            <div className="space-y-6 pt-6 border-t">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  Other MVAs
                </h2>
                <Button
                  type="button"
                  onClick={addMVA}
                  variant="outline"
                  size="sm"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add MVA
                </Button>
              </div>

              {formData.other_mvas.map((mva, index) => (
                <div
                  key={index}
                  className="border border-gray-200 p-6 rounded-lg space-y-4 bg-gray-50"
                >
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-gray-900">
                      MVA {index + 1}
                    </h3>
                    <Button
                      type="button"
                      onClick={() => removeMVA(index)}
                      variant="destructive"
                      size="sm"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove
                    </Button>
                  </div>

                  {/* ✅ 3 COLUMNS FOR MVA */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="block text-gray-700 font-medium">
                        MVA Date
                      </label>
                      <Input
                        type="date"
                        value={mva.mva_date}
                        onChange={(e) =>
                          handleMVAChange(index, "mva_date", e.target.value)
                        }
                        className="bg-white border-gray-300"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-gray-700 font-medium">
                        File Number
                      </label>
                      <Input
                        value={mva.file_number}
                        onChange={(e) =>
                          handleMVAChange(index, "file_number", e.target.value)
                        }
                        placeholder="FILE-2025-003"
                        maxLength={200}
                        className="bg-white border-gray-300"
                      />
                    </div>

                    <div className="space-y-2 md:col-span-1">
                      <label className="block text-gray-700 font-medium">
                        Note
                      </label>
                      <Textarea
                        value={mva.note}
                        onChange={(e) =>
                          handleMVAChange(index, "note", e.target.value)
                        }
                        placeholder="Enter notes..."
                        rows={1}
                        className="bg-white border-gray-300"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* AB Package Section */}
            <div className="space-y-6 pt-6 border-t">
              <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">
                AB Package
              </h2>

              {/* ✅ 3 COLUMNS */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="block text-gray-700 font-medium">
                    AB Package Done
                  </label>
                  <Input
                    name="ab_package_done"
                    value={formData.ab_package_done}
                    onChange={handleChange}
                    placeholder="Enter AB package status"
                    maxLength={200}
                    className="bg-gray-50 border-gray-300"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-gray-700 font-medium">
                    Date
                  </label>
                  <Input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className="bg-gray-50 border-gray-300"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-gray-700 font-medium">By</label>
                  <Input
                    name="by"
                    value={formData.by}
                    onChange={handleChange}
                    placeholder="Enter name"
                    maxLength={200}
                    className="bg-gray-50 border-gray-300"
                  />
                </div>
              </div>
            </div>

            {/* Meetings Section */}
            <div className="space-y-6 pt-6 border-t">
              <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">
                Meetings
              </h2>

              {/* ✅ 3 COLUMNS */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="block text-gray-700 font-medium">
                    Initial Meeting
                  </label>
                  <Input
                    name="initial_meeting"
                    value={formData.initial_meeting}
                    onChange={handleChange}
                    placeholder="Enter initial meeting details"
                    maxLength={200}
                    className="bg-gray-50 border-gray-300"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-gray-700 font-medium">
                    Date (2nd)
                  </label>
                  <Input
                    type="date"
                    name="date_2nd"
                    value={formData.date_2nd}
                    onChange={handleChange}
                    className="bg-gray-50 border-gray-300"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-gray-700 font-medium">
                    By (2nd)
                  </label>
                  <Input
                    name="by_2nd"
                    value={formData.by_2nd}
                    onChange={handleChange}
                    placeholder="Enter name"
                    maxLength={200}
                    className="bg-gray-50 border-gray-300"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-gray-700 font-medium">
                    Memo Review
                  </label>
                  <Input
                    name="memo_review"
                    value={formData.memo_review}
                    onChange={handleChange}
                    placeholder="Enter memo review"
                    maxLength={200}
                    className="bg-gray-50 border-gray-300"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-gray-700 font-medium">
                    Date (3rd)
                  </label>
                  <Input
                    type="date"
                    name="date_3rd"
                    value={formData.date_3rd}
                    onChange={handleChange}
                    className="bg-gray-50 border-gray-300"
                  />
                </div>
              </div>
            </div>

            {/* File Management Section */}
            <div className="space-y-6 pt-6 border-t">
              <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">
                File Management
              </h2>

              {/* ✅ 3 COLUMNS */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="block text-gray-700 font-medium">
                    File Created
                  </label>
                  <Input
                    type="date"
                    name="file_created"
                    value={formData.file_created}
                    onChange={handleChange}
                    className="bg-gray-50 border-gray-300"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-gray-700 font-medium">
                    File Opened By
                  </label>
                  <Input
                    name="file_opened_by"
                    value={formData.file_opened_by}
                    onChange={handleChange}
                    placeholder="Enter name"
                    maxLength={200}
                    className="bg-gray-50 border-gray-300"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-gray-700 font-medium">
                    Assigned Date
                  </label>
                  <Input
                    type="date"
                    name="assigned_date"
                    value={formData.assigned_date}
                    onChange={handleChange}
                    className="bg-gray-50 border-gray-300"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-gray-700 font-medium">
                    Assigned To
                  </label>
                  <Input
                    name="assigned_to"
                    value={formData.assigned_to}
                    onChange={handleChange}
                    placeholder="Enter name"
                    maxLength={200}
                    className="bg-gray-50 border-gray-300"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-gray-700 font-medium">
                    Assigned To Review
                  </label>
                  <Input
                    name="assigned_to_review"
                    value={formData.assigned_to_review}
                    onChange={handleChange}
                    placeholder="Enter name"
                    maxLength={200}
                    className="bg-gray-50 border-gray-300"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-gray-700 font-medium">
                    Assigned To Paralegal
                  </label>
                  <Input
                    name="assigned_to_paralegal"
                    value={formData.assigned_to_paralegal}
                    onChange={handleChange}
                    placeholder="Enter name"
                    maxLength={200}
                    className="bg-gray-50 border-gray-300"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-gray-700 font-medium">
                    Assigned To Legal Counsel
                  </label>
                  <Input
                    name="assigned_to_legal_counsel"
                    value={formData.assigned_to_legal_counsel}
                    onChange={handleChange}
                    placeholder="Enter name"
                    maxLength={200}
                    className="bg-gray-50 border-gray-300"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-gray-700 font-medium">
                    Legal Assistant
                  </label>
                  <Input
                    name="legal_assistant"
                    value={formData.legal_assistant}
                    onChange={handleChange}
                    placeholder="Enter name"
                    maxLength={200}
                    className="bg-gray-50 border-gray-300"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-gray-700 font-medium">
                    Previous Legal Representative
                  </label>
                  <Input
                    name="previous_legal_representative"
                    value={formData.previous_legal_representative}
                    onChange={handleChange}
                    placeholder="Enter name"
                    maxLength={200}
                    className="bg-gray-50 border-gray-300"
                  />
                </div>

                <div className="space-y-2 md:col-span-3">
                  <label className="block text-gray-700 font-medium">
                    History
                  </label>
                  <Textarea
                    name="history"
                    value={formData.history}
                    onChange={handleChange}
                    placeholder="Enter file history..."
                    rows={3}
                    className="bg-gray-50 border-gray-300"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-gray-700 font-medium">
                    File Closed
                  </label>
                  <Input
                    type="date"
                    name="file_closed"
                    value={formData.file_closed}
                    onChange={handleChange}
                    className="bg-gray-50 border-gray-300"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-gray-700 font-medium">
                    File Closed By
                  </label>
                  <Input
                    name="file_closed_by"
                    value={formData.file_closed_by}
                    onChange={handleChange}
                    placeholder="Enter name"
                    maxLength={200}
                    className="bg-gray-50 border-gray-300"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-gray-700 font-medium">
                    Storage Date
                  </label>
                  <Input
                    type="date"
                    name="storage_date"
                    value={formData.storage_date}
                    onChange={handleChange}
                    className="bg-gray-50 border-gray-300"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-gray-700 font-medium">
                    Sent By
                  </label>
                  <Input
                    name="sent_by"
                    value={formData.sent_by}
                    onChange={handleChange}
                    placeholder="Enter name"
                    maxLength={200}
                    className="bg-gray-50 border-gray-300"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-gray-700 font-medium">
                    Shredded Date
                  </label>
                  <Input
                    type="date"
                    name="shredded_date"
                    value={formData.shredded_date}
                    onChange={handleChange}
                    className="bg-gray-50 border-gray-300"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-gray-700 font-medium">
                    Shredded By
                  </label>
                  <Input
                    name="shredded_by"
                    value={formData.shredded_by}
                    onChange={handleChange}
                    placeholder="Enter name"
                    maxLength={200}
                    className="bg-gray-50 border-gray-300"
                  />
                </div>
              </div>
            </div>

            {/* Previous Legal Representative Section */}
            <div className="space-y-6 pt-6 border-t">
              <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">
                Previous Legal Representative Details
              </h2>

              {/* ✅ 3 COLUMNS */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="block text-gray-700 font-medium">
                    Paralegal Name
                  </label>
                  <Input
                    name="paralegal_name"
                    value={formData.paralegal_name}
                    onChange={handleChange}
                    placeholder="Enter paralegal name"
                    maxLength={200}
                    className="bg-gray-50 border-gray-300"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-gray-700 font-medium">
                    Firm Name
                  </label>
                  <Input
                    name="firm_name"
                    value={formData.firm_name}
                    onChange={handleChange}
                    placeholder="Enter firm name"
                    maxLength={200}
                    className="bg-gray-50 border-gray-300"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-gray-700 font-medium">
                    Counsel Name
                  </label>
                  <Input
                    name="counsel_name"
                    value={formData.counsel_name}
                    onChange={handleChange}
                    placeholder="Enter counsel name"
                    maxLength={200}
                    className="bg-gray-50 border-gray-300"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-gray-700 font-medium">
                    File Number
                  </label>
                  <Input
                    name="file_number"
                    value={formData.file_number}
                    onChange={handleChange}
                    placeholder="Enter file number"
                    maxLength={200}
                    className="bg-gray-50 border-gray-300"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-gray-700 font-medium">
                    Work Telephone
                  </label>
                  <Input
                    name="work_telephone"
                    value={formData.work_telephone}
                    onChange={handleChange}
                    placeholder="(000)-000-0000"
                    maxLength={200}
                    className="bg-gray-50 border-gray-300"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-gray-700 font-medium">
                    Telephone
                  </label>
                  <Input
                    name="telephone"
                    value={formData.telephone}
                    onChange={handleChange}
                    placeholder="(000)-000-0000"
                    maxLength={200}
                    className="bg-gray-50 border-gray-300"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-gray-700 font-medium">
                    Extension
                  </label>
                  <Input
                    name="ext"
                    value={formData.ext}
                    onChange={handleChange}
                    placeholder="123"
                    maxLength={50}
                    className="bg-gray-50 border-gray-300"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-gray-700 font-medium">Fax</label>
                  <Input
                    name="fax"
                    value={formData.fax}
                    onChange={handleChange}
                    placeholder="(000)-000-0000"
                    maxLength={200}
                    className="bg-gray-50 border-gray-300"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-gray-700 font-medium">
                    Email
                  </label>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="email@example.com"
                    maxLength={200}
                    className="bg-gray-50 border-gray-300"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-gray-700 font-medium">
                    Lawyer Name
                  </label>
                  <Input
                    name="lawyer_name"
                    value={formData.lawyer_name}
                    onChange={handleChange}
                    placeholder="Enter lawyer name"
                    maxLength={200}
                    className="bg-gray-50 border-gray-300"
                  />
                </div>
              </div>
            </div>

            {/* Address Section */}
            <div className="space-y-6 pt-6 border-t">
              <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">
                Address
              </h2>

              {/* ✅ 3 COLUMNS */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="block text-gray-700 font-medium">
                    Unit Number
                  </label>
                  <Input
                    name="unit_number"
                    value={formData.unit_number}
                    onChange={handleChange}
                    placeholder="5B"
                    maxLength={50}
                    className="bg-gray-50 border-gray-300"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-gray-700 font-medium">
                    Street Number
                  </label>
                  <Input
                    name="street_number"
                    value={formData.street_number}
                    onChange={handleChange}
                    placeholder="221"
                    maxLength={50}
                    className="bg-gray-50 border-gray-300"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-gray-700 font-medium">
                    Street Name
                  </label>
                  <Input
                    name="street_name"
                    value={formData.street_name}
                    onChange={handleChange}
                    placeholder="King Street West"
                    maxLength={200}
                    className="bg-gray-50 border-gray-300"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-gray-700 font-medium">
                    City
                  </label>
                  <Input
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Toronto"
                    maxLength={100}
                    className="bg-gray-50 border-gray-300"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-gray-700 font-medium">
                    Province
                  </label>
                  <Input
                    name="province"
                    value={formData.province}
                    onChange={handleChange}
                    placeholder="Ontario"
                    maxLength={100}
                    className="bg-gray-50 border-gray-300"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-gray-700 font-medium">
                    Postal Code
                  </label>
                  <Input
                    name="postal_code"
                    value={formData.postal_code}
                    onChange={handleChange}
                    placeholder="M5H 1K5"
                    maxLength={20}
                    className="bg-gray-50 border-gray-300"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-gray-700 font-medium">
                    Country
                  </label>
                  <Input
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    placeholder="Canada"
                    maxLength={100}
                    className="bg-gray-50 border-gray-300"
                  />
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end gap-4 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/dashboard/workstation")}
                disabled={isSubmitting}
                size="lg"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} size="lg">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
