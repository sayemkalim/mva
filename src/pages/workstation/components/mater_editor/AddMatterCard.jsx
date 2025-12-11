import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createMatter } from "../../helpers/createMatter";
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
    claim_status_id: null,
    non_engagement_issued_id: [],
    non_engagement_date: "",
    claim_type_id: [],
    mig_status_id: null,
    ab_claim_settlement_approx_id: null,
    tort_claim_settlement_approx_id: null,
    ltd_claim_settlement_approx_id: null,
    property_damage_claim_settlement_approx_id: null,
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
      setFormData({
        ...baseForm,
        ...initialData,
        non_engagement_issued_id: Array.isArray(
          initialData.non_engagement_issued_id
        )
          ? initialData.non_engagement_issued_id
          : [],
        claim_type_id: Array.isArray(initialData.claim_type_id)
          ? initialData.claim_type_id
          : [],
        other_mvas: loadedMVAs,
      });
    }
  }, [isEditMode, initialData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleDropdownChange = (fieldName, value, popoverKey) => {
    setFormData((p) => ({ ...p, [fieldName]: value }));
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
        return createMatter(initialData.slug || initialData.id, data);
      }
      return createMatter(data);
    },
    onSuccess: () => {
      toast.success(
        isEditMode
          ? "Matter updated successfully"
          : "Matter created successfully"
      );
      queryClient.invalidateQueries(["matters"]);
      if (isEditMode)
        queryClient.invalidateQueries(["matter", initialData.slug]);
      // navigate("/dashboard/workstation");
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          (isEditMode ? "Failed to update matter" : "Failed to create matter")
      );
    },
  });

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

    mutation.mutate(payload);
  };

  const SearchableDropdown = ({
    value,
    options,
    onSelect,
    placeholder,
    popoverKey,
    fieldName,
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
    );
  };

  const MultiSelectDropdown = ({
    selected,
    options,
    onToggle,
    placeholder,
    popoverKey,
    fieldName,
  }) => {
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
            className="w-full justify-start text-left font-normal min-h-10 bg-gray-50"
            type="button"
          >
            {selected.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {selected.map((id) => {
                  const option = options?.find((opt) => opt.id === id);
                  if (!option) return null;
                  return (
                    <Badge key={id} variant="secondary" className="mr-1">
                      {option.name}
                      <X
                        className="ml-1 h-3 w-3 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFromMultiSelect(fieldName, id);
                        }}
                      />
                    </Badge>
                  );
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
    <div className="min-h-screen bg-gray-50">
      <Navbar2 />

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

      <div className="container mx-auto px-6 py-8 max-w-7xl">
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <h1 className="text-2xl font-bold mb-8 text-gray-900">
            {isEditMode ? "Edit Matter" : "Add New Matter"}
          </h1>

          <form className="space-y-12" onSubmit={handleSubmit} noValidate>
            {/* ===== FILE DETAILS SECTION ===== */}
            <section>
              <h2 className="font-semibold text-xl mb-6 border-b pb-2 uppercase text-gray-800">
                File Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* File Number */}
                <div>
                  <label
                    htmlFor="file_no"
                    className="block font-medium mb-2 text-gray-700"
                  >
                    File Number <span className="text-red-600">*</span>
                  </label>
                  <Input
                    id="file_no"
                    name="file_no"
                    value={formData.file_no}
                    onChange={handleInputChange}
                    maxLength={200}
                    placeholder="Enter file number"
                    required
                    className="bg-gray-50"
                  />
                </div>

                {/* Intake Date */}
                <div>
                  <label
                    htmlFor="intake_date"
                    className="block font-medium mb-2 text-gray-700"
                  >
                    Intake Date
                  </label>
                  <Input
                    type="date"
                    id="intake_date"
                    name="intake_date"
                    value={formData.intake_date}
                    onChange={handleInputChange}
                    className="bg-gray-50"
                  />
                </div>

                {/* Conflict Search Date */}
                <div>
                  <label
                    htmlFor="conflict_search_date"
                    className="block font-medium mb-2 text-gray-700"
                  >
                    Conflict Search Date
                  </label>
                  <Input
                    type="date"
                    id="conflict_search_date"
                    name="conflict_search_date"
                    value={formData.conflict_search_date}
                    onChange={handleInputChange}
                    className="bg-gray-50"
                  />
                </div>

                {/* File Status */}
                <div>
                  <label className="block font-medium mb-2 text-gray-700">
                    File Status
                  </label>
                  <SearchableDropdown
                    value={formData.file_status_id}
                    onSelect={handleDropdownChange}
                    options={metadata.file_status}
                    placeholder="Select file status"
                    popoverKey="file_status"
                    fieldName="file_status_id"
                  />
                </div>

                {/* Claim Status */}
                <div>
                  <label className="block font-medium mb-2 text-gray-700">
                    Claim Status
                  </label>
                  <SearchableDropdown
                    value={formData.claim_status_id}
                    onSelect={handleDropdownChange}
                    options={metadata.claim_status}
                    placeholder="Select claim status"
                    popoverKey="claim_status"
                    fieldName="claim_status_id"
                  />
                </div>

                {/* Non Engagement Issued (Multi-select) */}
                <div>
                  <label className="block font-medium mb-2 text-gray-700">
                    Non Engagement Issued
                  </label>
                  <MultiSelectDropdown
                    selected={formData.non_engagement_issued_id}
                    onToggle={toggleMultiSelect}
                    options={metadata.non_engagement_issued}
                    placeholder="Select non engagement"
                    popoverKey="non_engagement_issued"
                    fieldName="non_engagement_issued_id"
                  />
                </div>

                {/* Non Engagement Date */}
                <div>
                  <label
                    htmlFor="non_engagement_date"
                    className="block font-medium mb-2 text-gray-700"
                  >
                    Non Engagement Date
                  </label>
                  <Input
                    type="date"
                    id="non_engagement_date"
                    name="non_engagement_date"
                    value={formData.non_engagement_date}
                    onChange={handleInputChange}
                    className="bg-gray-50"
                  />
                </div>

                {/* Claim Type (Multi-select) */}
                <div>
                  <label className="block font-medium mb-2 text-gray-700">
                    Claim Type
                  </label>
                  <MultiSelectDropdown
                    selected={formData.claim_type_id}
                    onToggle={toggleMultiSelect}
                    options={metadata.claim_type}
                    placeholder="Select claim type"
                    popoverKey="claim_type"
                    fieldName="claim_type_id"
                  />
                </div>

                {/* MIG Status */}
                <div>
                  <label className="block font-medium mb-2 text-gray-700">
                    MIG Status
                  </label>
                  <SearchableDropdown
                    value={formData.mig_status_id}
                    onSelect={handleDropdownChange}
                    options={metadata.mig_status}
                    placeholder="Select MIG status"
                    popoverKey="mig_status"
                    fieldName="mig_status_id"
                  />
                </div>

                {/* AB Claim Settlement Approx. */}
                <div>
                  <label className="block font-medium mb-2 text-gray-700">
                    AB Claim Settlement Approx.
                  </label>
                  <SearchableDropdown
                    value={formData.ab_claim_settlement_approx_id}
                    onSelect={handleDropdownChange}
                    options={metadata.ab_claim_settlement_approx}
                    placeholder="Select AB claim approx."
                    popoverKey="ab_claim_settlement_approx"
                    fieldName="ab_claim_settlement_approx_id"
                  />
                </div>

                {/* Tort Claim Settlement Approx. */}
                <div>
                  <label className="block font-medium mb-2 text-gray-700">
                    Tort Claim Settlement Approx.
                  </label>
                  <SearchableDropdown
                    value={formData.tort_claim_settlement_approx_id}
                    onSelect={handleDropdownChange}
                    options={metadata.tort_claim_settlement_approx}
                    placeholder="Select Tort claim approx."
                    popoverKey="tort_claim_settlement_approx"
                    fieldName="tort_claim_settlement_approx_id"
                  />
                </div>

                {/* LTD Claim Settlement Approx. */}
                <div>
                  <label className="block font-medium mb-2 text-gray-700">
                    LTD Claim Settlement Approx.
                  </label>
                  <SearchableDropdown
                    value={formData.ltd_claim_settlement_approx_id}
                    onSelect={handleDropdownChange}
                    options={metadata.ltd_claim_settlement_approx}
                    placeholder="Select LTD claim approx."
                    popoverKey="ltd_claim_settlement_approx"
                    fieldName="ltd_claim_settlement_approx_id"
                  />
                </div>

                {/* Property Damage Claim Settlement Approx. */}
                <div>
                  <label className="block font-medium mb-2 text-gray-700">
                    Property Damage Claim Settlement Approx.
                  </label>
                  <SearchableDropdown
                    value={formData.property_damage_claim_settlement_approx_id}
                    onSelect={handleDropdownChange}
                    options={metadata.property_damage_claim_settlem}
                    placeholder="Select property damage approx."
                    popoverKey="property_damage_claim_settlement_approx"
                    fieldName="property_damage_claim_settlement_approx_id"
                  />
                </div>

                {/* At Fault */}
                <div>
                  <label className="block font-medium mb-2 text-gray-700">
                    At Fault
                  </label>
                  <SearchableDropdown
                    value={formData.at_fault_id}
                    onSelect={handleDropdownChange}
                    options={metadata.yes_no_option}
                    placeholder="Select yes or no"
                    popoverKey="at_fault"
                    fieldName="at_fault_id"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block font-medium mb-2 text-gray-700">
                    Category
                  </label>
                  <SearchableDropdown
                    value={formData.category_id}
                    onSelect={handleDropdownChange}
                    options={metadata.category}
                    placeholder="Select category"
                    popoverKey="category"
                    fieldName="category_id"
                  />
                </div>

                {/* File Location */}
                <div>
                  <label
                    htmlFor="file_location"
                    className="block font-medium mb-2 text-gray-700"
                  >
                    File Location
                  </label>
                  <Input
                    id="file_location"
                    name="file_location"
                    value={formData.file_location}
                    onChange={handleInputChange}
                    maxLength={200}
                    placeholder="Enter file location"
                    className="bg-gray-50"
                  />
                </div>

                {/* First Party Status */}
                <div>
                  <label className="block font-medium mb-2 text-gray-700">
                    First Party Status
                  </label>
                  <SearchableDropdown
                    value={formData.first_party_status_id}
                    onSelect={handleDropdownChange}
                    options={metadata.first_party_status}
                    placeholder="Select first party status"
                    popoverKey="first_party_status"
                    fieldName="first_party_status_id"
                  />
                </div>

                {/* Third Party Status */}
                <div>
                  <label className="block font-medium mb-2 text-gray-700">
                    Third Party Status
                  </label>
                  <SearchableDropdown
                    value={formData.third_party_status_id}
                    onSelect={handleDropdownChange}
                    options={metadata.third_party_status}
                    placeholder="Select third party status"
                    popoverKey="third_party_status"
                    fieldName="third_party_status_id"
                  />
                </div>
              </div>
            </section>

            {/* ===== INTERVIEW INFORMATION SECTION ===== */}
            <section>
              <h2 className="font-semibold text-xl mb-6 border-b pb-2 uppercase text-gray-800">
                Interview Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Date of Interview */}
                <div>
                  <label
                    htmlFor="date_of_interview"
                    className="block font-medium mb-2 text-gray-700"
                  >
                    Date of Interview
                  </label>
                  <Input
                    type="date"
                    id="date_of_interview"
                    name="date_of_interview"
                    value={formData.date_of_interview}
                    onChange={handleInputChange}
                    className="bg-gray-50"
                  />
                </div>

                {/* Interviewed By */}
                <div>
                  <label className="block font-medium mb-2 text-gray-700">
                    Interviewed By
                  </label>
                  <SearchableDropdown
                    value={formData.interviewed_by_id}
                    onSelect={handleDropdownChange}
                    options={metadata.counsel_Interviewer}
                    placeholder="Select interviewer"
                    popoverKey="interviewed_by"
                    fieldName="interviewed_by_id"
                  />
                </div>

                {/* Companion File */}
                <div>
                  <label
                    htmlFor="companion_file"
                    className="block font-medium mb-2 text-gray-700"
                  >
                    Companion File
                  </label>
                  <Input
                    id="companion_file"
                    name="companion_file"
                    value={formData.companion_file}
                    onChange={handleInputChange}
                    maxLength={255}
                    placeholder="Enter companion file"
                    className="bg-gray-50"
                  />
                </div>
              </div>
            </section>

            {/* ===== OTHER MVAs SECTION ===== */}
            <section>
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-semibold text-xl uppercase text-gray-800">
                  Other MVAs
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
                  className="border border-gray-200 rounded-lg p-6 mb-4 bg-gray-50"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-gray-900">
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
                    {/* MVA Date */}
                    <div>
                      <label className="block font-medium mb-2 text-gray-700">
                        MVA Date
                      </label>
                      <Input
                        type="date"
                        value={item.mva_date}
                        onChange={(e) =>
                          handleMVAChange(idx, "mva_date", e.target.value)
                        }
                        className="bg-white"
                      />
                    </div>

                    {/* File Number */}
                    <div>
                      <label className="block font-medium mb-2 text-gray-700">
                        File Number
                      </label>
                      <Input
                        value={item.file_number}
                        onChange={(e) =>
                          handleMVAChange(idx, "file_number", e.target.value)
                        }
                        maxLength={255}
                        placeholder="Enter file number"
                        className="bg-white"
                      />
                    </div>

                    {/* Note */}
                    <div>
                      <label className="block font-medium mb-2 text-gray-700">
                        Note
                      </label>
                      <Textarea
                        value={item.note}
                        onChange={(e) =>
                          handleMVAChange(idx, "note", e.target.value)
                        }
                        maxLength={500}
                        placeholder="Enter notes"
                        rows={3}
                        className="bg-white"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </section>

            {/* ===== FILE PROCESSING INFORMATION SECTION ===== */}
            <section>
              <h2 className="font-semibold text-xl mb-6 border-b pb-2 uppercase text-gray-800">
                File Processing Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* AB Package Done */}
                <div>
                  <label className="block font-medium mb-2 text-gray-700">
                    AB Package Done
                  </label>
                  <SearchableDropdown
                    value={formData.ab_package_done_id}
                    onSelect={handleDropdownChange}
                    options={metadata.yes_no_option}
                    placeholder="Select yes or no"
                    popoverKey="ab_package_done"
                    fieldName="ab_package_done_id"
                  />
                </div>

                {/* Date (for AB Package Done) */}
                <div>
                  <label
                    htmlFor="date"
                    className="block font-medium mb-2 text-gray-700"
                  >
                    Date
                  </label>
                  <Input
                    type="date"
                    id="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className="bg-gray-50"
                  />
                </div>

                {/* By (for AB Package Done) */}
                <div>
                  <label
                    htmlFor="by"
                    className="block font-medium mb-2 text-gray-700"
                  >
                    By
                  </label>
                  <Input
                    id="by"
                    name="by"
                    value={formData.by}
                    onChange={handleInputChange}
                    maxLength={255}
                    placeholder="Enter name"
                    className="bg-gray-50"
                  />
                </div>

                {/* Initial Meeting */}
                <div>
                  <label className="block font-medium mb-2 text-gray-700">
                    Initial Meeting
                  </label>
                  <SearchableDropdown
                    value={formData.initial_meeting_id}
                    onSelect={handleDropdownChange}
                    options={metadata.yes_no_option}
                    placeholder="Select yes or no"
                    popoverKey="initial_meeting"
                    fieldName="initial_meeting_id"
                  />
                </div>

                {/* Date (for Initial Meeting) */}
                <div>
                  <label
                    htmlFor="date_2nd"
                    className="block font-medium mb-2 text-gray-700"
                  >
                    Date
                  </label>
                  <Input
                    type="date"
                    id="date_2nd"
                    name="date_2nd"
                    value={formData.date_2nd}
                    onChange={handleInputChange}
                    className="bg-gray-50"
                  />
                </div>

                {/* By (for Initial Meeting) */}
                <div>
                  <label
                    htmlFor="by_2nd"
                    className="block font-medium mb-2 text-gray-700"
                  >
                    By
                  </label>
                  <Input
                    id="by_2nd"
                    name="by_2nd"
                    value={formData.by_2nd}
                    onChange={handleInputChange}
                    maxLength={255}
                    placeholder="Enter name"
                    className="bg-gray-50"
                  />
                </div>

                {/* Memo Review */}
                <div>
                  <label className="block font-medium mb-2 text-gray-700">
                    Memo Review
                  </label>
                  <SearchableDropdown
                    value={formData.memo_review_id}
                    onSelect={handleDropdownChange}
                    options={metadata.yes_no_option}
                    placeholder="Select yes or no"
                    popoverKey="memo_review"
                    fieldName="memo_review_id"
                  />
                </div>

                {/* Date (for Memo Review) */}
                <div>
                  <label
                    htmlFor="date_3rd"
                    className="block font-medium mb-2 text-gray-700"
                  >
                    Date
                  </label>
                  <Input
                    type="date"
                    id="date_3rd"
                    name="date_3rd"
                    value={formData.date_3rd}
                    onChange={handleInputChange}
                    className="bg-gray-50"
                  />
                </div>
              </div>
            </section>

            {/* ===== LEGAL FILE INFORMATION SECTION ===== */}
            <section>
              <h2 className="font-semibold text-xl mb-6 border-b pb-2 uppercase text-gray-800">
                Legal File Information
              </h2>

              {/* File Opening Info */}
              <h3 className="font-semibold text-lg mb-4 text-gray-800">
                File Opening Info
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* File Created */}
                <div>
                  <label
                    htmlFor="file_created"
                    className="block font-medium mb-2 text-gray-700"
                  >
                    File Created
                  </label>
                  <Input
                    type="date"
                    id="file_created"
                    name="file_created"
                    value={formData.file_created}
                    onChange={handleInputChange}
                    className="bg-gray-50"
                  />
                </div>

                {/* File Opened By */}
                <div>
                  <label className="block font-medium mb-2 text-gray-700">
                    File Opened By
                  </label>
                  <SearchableDropdown
                    value={formData.file_opened_by_id}
                    onSelect={handleDropdownChange}
                    options={metadata.users}
                    placeholder="Select user"
                    popoverKey="file_opened_by"
                    fieldName="file_opened_by_id"
                  />
                </div>
              </div>

              {/* Assigned to Info */}
              <h3 className="font-semibold text-lg mb-4 text-gray-800">
                Assigned to Info
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Assigned Date */}
                <div>
                  <label
                    htmlFor="assigned_date"
                    className="block font-medium mb-2 text-gray-700"
                  >
                    Assigned Date
                  </label>
                  <Input
                    type="date"
                    id="assigned_date"
                    name="assigned_date"
                    value={formData.assigned_date}
                    onChange={handleInputChange}
                    className="bg-gray-50"
                  />
                </div>

                {/* Assigned To */}
                <div>
                  <label className="block font-medium mb-2 text-gray-700">
                    Assigned To
                  </label>
                  <SearchableDropdown
                    value={formData.assigned_to_id}
                    onSelect={handleDropdownChange}
                    options={metadata.users}
                    placeholder="Select user"
                    popoverKey="assigned_to"
                    fieldName="assigned_to_id"
                  />
                </div>

                {/* Assigned to Review */}
                <div>
                  <label className="block font-medium mb-2 text-gray-700">
                    Assigned to Review
                  </label>
                  <SearchableDropdown
                    value={formData.assigned_to_review_id}
                    onSelect={handleDropdownChange}
                    options={metadata.users}
                    placeholder="Select user"
                    popoverKey="assigned_to_review"
                    fieldName="assigned_to_review_id"
                  />
                </div>

                {/* Assigned to Paralegal */}
                <div>
                  <label
                    htmlFor="assigned_to_paralegal"
                    className="block font-medium mb-2 text-gray-700"
                  >
                    Assigned to Paralegal
                  </label>
                  <Input
                    id="assigned_to_paralegal"
                    name="assigned_to_paralegal"
                    value={formData.assigned_to_paralegal}
                    onChange={handleInputChange}
                    maxLength={255}
                    placeholder="Enter paralegal name"
                    className="bg-gray-50"
                  />
                </div>

                {/* Assigned to Legal Counsel */}
                <div>
                  <label className="block font-medium mb-2 text-gray-700">
                    Assigned to Legal Counsel
                  </label>
                  <SearchableDropdown
                    value={formData.assigned_to_legal_counsel_id}
                    onSelect={handleDropdownChange}
                    options={metadata.counsel_Interviewer}
                    placeholder="Select counsel"
                    popoverKey="assigned_to_legal_counsel"
                    fieldName="assigned_to_legal_counsel_id"
                  />
                </div>

                {/* Legal Assistant */}
                <div>
                  <label className="block font-medium mb-2 text-gray-700">
                    Legal Assistant
                  </label>
                  <SearchableDropdown
                    value={formData.legal_assistant_id}
                    onSelect={handleDropdownChange}
                    options={metadata.users}
                    placeholder="Select user"
                    popoverKey="legal_assistant"
                    fieldName="legal_assistant_id"
                  />
                </div>

                {/* Previous Legal Representative */}
                <div>
                  <label className="block font-medium mb-2 text-gray-700">
                    Previous Legal Representative
                  </label>
                  <SearchableDropdown
                    value={formData.previous_legal_representative_id}
                    onSelect={handleDropdownChange}
                    options={metadata.users}
                    placeholder="Select user"
                    popoverKey="previous_legal_representative"
                    fieldName="previous_legal_representative_id"
                  />
                </div>

                {/* History */}
                <div className="md:col-span-3">
                  <label
                    htmlFor="history"
                    className="block font-medium mb-2 text-gray-700"
                  >
                    History
                  </label>
                  <Textarea
                    id="history"
                    name="history"
                    value={formData.history}
                    onChange={handleInputChange}
                    maxLength={1000}
                    placeholder="Enter history notes"
                    rows={4}
                    className="bg-gray-50"
                  />
                </div>
              </div>

              {/* File Closing Info */}
              <h3 className="font-semibold text-lg mb-4 text-gray-800">
                File Closing Info
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* File Closed */}
                <div>
                  <label
                    htmlFor="file_closed"
                    className="block font-medium mb-2 text-gray-700"
                  >
                    File Closed
                  </label>
                  <Input
                    type="date"
                    id="file_closed"
                    name="file_closed"
                    value={formData.file_closed}
                    onChange={handleInputChange}
                    className="bg-gray-50"
                  />
                </div>

                {/* File Closed By */}
                <div>
                  <label className="block font-medium mb-2 text-gray-700">
                    File Closed By
                  </label>
                  <SearchableDropdown
                    value={formData.file_closed_by_id}
                    onSelect={handleDropdownChange}
                    options={metadata.users}
                    placeholder="Select user"
                    popoverKey="file_closed_by"
                    fieldName="file_closed_by_id"
                  />
                </div>
              </div>

              {/* Folder to Storage */}
              <h3 className="font-semibold text-lg mb-4 text-gray-800">
                Folder to Storage
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Storage Date */}
                <div>
                  <label
                    htmlFor="storage_date"
                    className="block font-medium mb-2 text-gray-700"
                  >
                    Storage Date
                  </label>
                  <Input
                    type="date"
                    id="storage_date"
                    name="storage_date"
                    value={formData.storage_date}
                    onChange={handleInputChange}
                    className="bg-gray-50"
                  />
                </div>

                {/* Sent By */}
                <div>
                  <label className="block font-medium mb-2 text-gray-700">
                    Sent By
                  </label>
                  <SearchableDropdown
                    value={formData.sent_by_id}
                    onSelect={handleDropdownChange}
                    options={metadata.users}
                    placeholder="Select user"
                    popoverKey="sent_by"
                    fieldName="sent_by_id"
                  />
                </div>
              </div>

              {/* File Shredded */}
              <h3 className="font-semibold text-lg mb-4 text-gray-800">
                File Shredded
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Shredded Date */}
                <div>
                  <label
                    htmlFor="shredded_date"
                    className="block font-medium mb-2 text-gray-700"
                  >
                    Shredded Date
                  </label>
                  <Input
                    type="date"
                    id="shredded_date"
                    name="shredded_date"
                    value={formData.shredded_date}
                    onChange={handleInputChange}
                    className="bg-gray-50"
                  />
                </div>

                {/* Shredded By */}
                <div>
                  <label className="block font-medium mb-2 text-gray-700">
                    Shredded By
                  </label>
                  <SearchableDropdown
                    value={formData.shredded_by_id}
                    onSelect={handleDropdownChange}
                    options={metadata.users}
                    placeholder="Select user"
                    popoverKey="shredded_by"
                    fieldName="shredded_by_id"
                  />
                </div>
              </div>
            </section>

            {/* ===== PREVIOUS COUNSEL SECTION ===== */}
            <section>
              <h2 className="font-semibold text-xl mb-6 border-b pb-2 uppercase text-gray-800">
                Previous Counsel
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Paralegal Name */}
                <div>
                  <label
                    htmlFor="paralegal_name"
                    className="block font-medium mb-2 text-gray-700"
                  >
                    Paralegal Name
                  </label>
                  <Input
                    id="paralegal_name"
                    name="paralegal_name"
                    value={formData.paralegal_name}
                    onChange={handleInputChange}
                    maxLength={255}
                    placeholder="Enter paralegal name"
                    className="bg-gray-50"
                  />
                </div>

                {/* Firm Name */}
                <div>
                  <label
                    htmlFor="firm_name"
                    className="block font-medium mb-2 text-gray-700"
                  >
                    Firm Name
                  </label>
                  <Input
                    id="firm_name"
                    name="firm_name"
                    value={formData.firm_name}
                    onChange={handleInputChange}
                    maxLength={255}
                    placeholder="Enter firm name"
                    className="bg-gray-50"
                  />
                </div>

                {/* Counsel Name */}
                <div>
                  <label
                    htmlFor="counsel_name"
                    className="block font-medium mb-2 text-gray-700"
                  >
                    Counsel Name
                  </label>
                  <Input
                    id="counsel_name"
                    name="counsel_name"
                    value={formData.counsel_name}
                    onChange={handleInputChange}
                    maxLength={255}
                    placeholder="Enter counsel name"
                    className="bg-gray-50"
                  />
                </div>

                {/* File Number */}
                <div>
                  <label
                    htmlFor="file_number"
                    className="block font-medium mb-2 text-gray-700"
                  >
                    File Number
                  </label>
                  <Input
                    id="file_number"
                    name="file_number"
                    value={formData.file_number}
                    onChange={handleInputChange}
                    maxLength={255}
                    placeholder="Enter file number"
                    className="bg-gray-50"
                  />
                </div>

                {/* Work Telephone */}
                <div>
                  <label
                    htmlFor="work_telephone"
                    className="block font-medium mb-2 text-gray-700"
                  >
                    Work Telephone
                  </label>
                  <Input
                    id="work_telephone"
                    name="work_telephone"
                    value={formData.work_telephone}
                    onChange={handleInputChange}
                    maxLength={255}
                    placeholder="(xxx) xxx-xxxx"
                    className="bg-gray-50"
                  />
                </div>

                {/* Telephone */}
                <div>
                  <label
                    htmlFor="telephone"
                    className="block font-medium mb-2 text-gray-700"
                  >
                    Telephone
                  </label>
                  <Input
                    id="telephone"
                    name="telephone"
                    value={formData.telephone}
                    onChange={handleInputChange}
                    maxLength={255}
                    placeholder="(xxx) xxx-xxxx"
                    className="bg-gray-50"
                  />
                </div>

                {/* Ext */}
                <div>
                  <label
                    htmlFor="ext"
                    className="block font-medium mb-2 text-gray-700"
                  >
                    Ext
                  </label>
                  <Input
                    id="ext"
                    name="ext"
                    value={formData.ext}
                    onChange={handleInputChange}
                    maxLength={255}
                    placeholder="Extension"
                    className="bg-gray-50"
                  />
                </div>

                {/* Fax */}
                <div>
                  <label
                    htmlFor="fax"
                    className="block font-medium mb-2 text-gray-700"
                  >
                    Fax
                  </label>
                  <Input
                    id="fax"
                    name="fax"
                    value={formData.fax}
                    onChange={handleInputChange}
                    maxLength={255}
                    placeholder="(xxx) xxx-xxxx"
                    className="bg-gray-50"
                  />
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="block font-medium mb-2 text-gray-700"
                  >
                    Email
                  </label>
                  <Input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    maxLength={255}
                    placeholder="email@example.com"
                    className="bg-gray-50"
                  />
                </div>

                {/* Lawyer Name */}
                <div>
                  <label
                    htmlFor="lawyer_name"
                    className="block font-medium mb-2 text-gray-700"
                  >
                    Lawyer Name
                  </label>
                  <Input
                    id="lawyer_name"
                    name="lawyer_name"
                    value={formData.lawyer_name}
                    onChange={handleInputChange}
                    maxLength={255}
                    placeholder="Enter lawyer name"
                    className="bg-gray-50"
                  />
                </div>
              </div>
            </section>

            {/* ===== ADDRESS SECTION ===== */}
            <section>
              <h2 className="font-semibold text-xl mb-6 border-b pb-2 uppercase text-gray-800">
                Address
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Unit Number */}
                <div>
                  <label
                    htmlFor="unit_number"
                    className="block font-medium mb-2 text-gray-700"
                  >
                    Unit Number
                  </label>
                  <Input
                    id="unit_number"
                    name="unit_number"
                    value={formData.unit_number}
                    onChange={handleInputChange}
                    maxLength={50}
                    placeholder="Enter unit number"
                    className="bg-gray-50"
                  />
                </div>

                {/* Street Number */}
                <div>
                  <label
                    htmlFor="street_number"
                    className="block font-medium mb-2 text-gray-700"
                  >
                    Street Number
                  </label>
                  <Input
                    id="street_number"
                    name="street_number"
                    value={formData.street_number}
                    onChange={handleInputChange}
                    maxLength={100}
                    placeholder="Enter street number"
                    className="bg-gray-50"
                  />
                </div>

                {/* Street Name */}
                <div>
                  <label
                    htmlFor="street_name"
                    className="block font-medium mb-2 text-gray-700"
                  >
                    Street Name
                  </label>
                  <Input
                    id="street_name"
                    name="street_name"
                    value={formData.street_name}
                    onChange={handleInputChange}
                    maxLength={100}
                    placeholder="Enter street name"
                    className="bg-gray-50"
                  />
                </div>

                {/* City */}
                <div>
                  <label
                    htmlFor="city"
                    className="block font-medium mb-2 text-gray-700"
                  >
                    City
                  </label>
                  <Input
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    maxLength={100}
                    placeholder="Enter city"
                    className="bg-gray-50"
                  />
                </div>

                {/* Province */}
                <div>
                  <label
                    htmlFor="province"
                    className="block font-medium mb-2 text-gray-700"
                  >
                    Province
                  </label>
                  <Input
                    id="province"
                    name="province"
                    value={formData.province}
                    onChange={handleInputChange}
                    maxLength={100}
                    placeholder="Enter province"
                    className="bg-gray-50"
                  />
                </div>

                {/* Postal Code */}
                <div>
                  <label
                    htmlFor="postal_code"
                    className="block font-medium mb-2 text-gray-700"
                  >
                    Postal Code
                  </label>
                  <Input
                    id="postal_code"
                    name="postal_code"
                    value={formData.postal_code}
                    onChange={handleInputChange}
                    maxLength={50}
                    placeholder="Enter postal code"
                    className="bg-gray-50"
                  />
                </div>
              </div>
            </section>

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
