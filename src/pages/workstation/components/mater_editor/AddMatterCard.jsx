import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createMatter } from "../../helpers/createMatter";
import { updateMatter } from "../../helpers/updateMatter";
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
import { X, Check, ChevronsUpDown, Loader2, Plus, Trash2 } from "lucide-react";
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
        return updateMatter(initialData.slug || initialData.id, data);
      } else {
        return createMatter(data);
      }
    },
    onSuccess: (res) => {
      if (res?.response?.success || res?.Apistatus) {
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
    console.log("Final Payload:", JSON.stringify(payload, null, 2));
    saveMutation.mutate(payload);
  };

  const isSubmitting = saveMutation.isPending;

  if (!metadata) {
    return (
      <div className="max-w-6xl mx-auto bg-white p-8 rounded-lg shadow">
        <div className="flex items-center justify-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <p className="text-lg">Loading form...</p>
        </div>
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
            className="w-full justify-between font-normal"
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
            className="w-full justify-start text-left font-normal min-h-10"
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
    <form
      onSubmit={handleSubmit}
      className="max-w-6xl mx-auto bg-white p-8 rounded-lg shadow space-y-6"
    >
      <h2 className="text-2xl font-bold mb-6">
        {isEditMode ? "Edit Matter" : "Add New Matter"}
      </h2>

      {/* File Details */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">File Details</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-medium">
              File Number <span className="text-red-500">*</span>
            </label>
            <Input
              name="file_no"
              value={formData.file_no}
              onChange={handleChange}
              placeholder="FILE-2025-002"
              maxLength={200}
              required
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Intake Date</label>
            <Input
              type="date"
              name="intake_date"
              value={formData.intake_date}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">
              Conflict Search Date
            </label>
            <Input
              type="date"
              name="conflict_search_date"
              value={formData.conflict_search_date}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">File Status</label>
            <SearchableDropdown
              value={formData.file_status_id}
              onChange={handleSelectChange}
              options={metadata?.file_status}
              placeholder="Select file status"
              popoverKey="file_status"
              fieldName="file_status_id"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Claim Status</label>
            <SearchableDropdown
              value={formData.claim_status_id}
              onChange={handleSelectChange}
              options={metadata?.claim_status}
              placeholder="Select claim status"
              popoverKey="claim_status"
              fieldName="claim_status_id"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">
              Non Engagement Issued
            </label>
            <MultiSelectDropdown
              selectedIds={formData.non_engagement_issued_id}
              onChange={toggleMultiSelect}
              options={metadata?.non_engagement_issued}
              placeholder="Select options"
              popoverKey="non_engagement"
              fieldName="non_engagement_issued_id"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">
              Non Engagement Date
            </label>
            <Input
              type="date"
              name="non_engagement_date"
              value={formData.non_engagement_date}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">Claim Type</label>
            <MultiSelectDropdown
              selectedIds={formData.claim_type_id}
              onChange={toggleMultiSelect}
              options={metadata?.claim_type}
              placeholder="Select claim types"
              popoverKey="claim_type"
              fieldName="claim_type_id"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">MIG Status</label>
            <SearchableDropdown
              value={formData.mig_status_id}
              onChange={handleSelectChange}
              options={metadata?.mig_status}
              placeholder="Select MIG status"
              popoverKey="mig_status"
              fieldName="mig_status_id"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">
              AB Claim Settlement Approx.
            </label>
            <SearchableDropdown
              value={formData.ab_claim_settlement_approx_id}
              onChange={handleSelectChange}
              options={metadata?.ab_claim_settlement_approx}
              placeholder="Select amount range"
              popoverKey="ab_claim"
              fieldName="ab_claim_settlement_approx_id"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">
              Tort Claim Settlement Approx.
            </label>
            <SearchableDropdown
              value={formData.tort_claim_settlement_approx_id}
              onChange={handleSelectChange}
              options={metadata?.tort_claim_settlement_approx}
              placeholder="Select amount range"
              popoverKey="tort_claim"
              fieldName="tort_claim_settlement_approx_id"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">
              LTD Claim Settlement Approx.
            </label>
            <SearchableDropdown
              value={formData.ltd_claim_settlement_approx_id}
              onChange={handleSelectChange}
              options={metadata?.ltd_claim_settlement_approx}
              placeholder="Select amount range"
              popoverKey="ltd_claim"
              fieldName="ltd_claim_settlement_approx_id"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">
              Property Damage Claim Settlement Approx.
            </label>
            <SearchableDropdown
              value={formData.property_damage_claim_settlement_approx_id}
              onChange={handleSelectChange}
              options={metadata?.property_damage_claim_settlem}
              placeholder="Select amount range"
              popoverKey="property_damage"
              fieldName="property_damage_claim_settlement_approx_id"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">At Fault</label>
            <SearchableDropdown
              value={formData.at_fault_id}
              onChange={handleSelectChange}
              options={metadata?.yes_no_option}
              placeholder="Select option"
              popoverKey="at_fault"
              fieldName="at_fault_id"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Category</label>
            <SearchableDropdown
              value={formData.category_id}
              onChange={handleSelectChange}
              options={metadata?.category}
              placeholder="Select category"
              popoverKey="category"
              fieldName="category_id"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">File Location</label>
            <Input
              name="file_location"
              value={formData.file_location}
              onChange={handleChange}
              placeholder="Enter file location"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">First Party Status</label>
            <SearchableDropdown
              value={formData.first_party_status_id}
              onChange={handleSelectChange}
              options={metadata?.first_party_status}
              placeholder="Select status"
              popoverKey="first_party"
              fieldName="first_party_status_id"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Third Party Status</label>
            <SearchableDropdown
              value={formData.third_party_status_id}
              onChange={handleSelectChange}
              options={metadata?.third_party_status}
              placeholder="Select status"
              popoverKey="third_party"
              fieldName="third_party_status_id"
            />
          </div>
        </div>
      </div>

      {/* Interview Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Interview Information</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-medium">Date of Interview</label>
            <Input
              type="date"
              name="date_of_interview"
              value={formData.date_of_interview}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Interviewed By</label>
            <SearchableDropdown
              value={formData.interviewed_by}
              onChange={handleSelectChange}
              options={metadata?.counsel_Interviewer}
              placeholder="Select interviewer"
              popoverKey="interviewed_by"
              fieldName="interviewed_by"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Companion File</label>
            <Input
              name="companion_file"
              value={formData.companion_file}
              onChange={handleChange}
              placeholder="COMP-2025-009"
              maxLength={255}
            />
          </div>
        </div>
      </div>

      {/* Other MVAs */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Other MVAs</h3>
          <Button type="button" onClick={addMVA} variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add MVA
          </Button>
        </div>

        {formData.other_mvas.map((mva, index) => (
          <div
            key={index}
            className="border p-4 rounded-lg space-y-3 relative bg-gray-50"
          >
            <button
              type="button"
              onClick={() => removeMVA(index)}
              className="absolute top-2 right-2 text-red-500 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block mb-1 text-sm font-medium">
                  MVA Date
                </label>
                <Input
                  type="date"
                  value={mva.mva_date}
                  onChange={(e) =>
                    handleMVAChange(index, "mva_date", e.target.value)
                  }
                />
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium">
                  File Number
                </label>
                <Input
                  value={mva.file_number}
                  onChange={(e) =>
                    handleMVAChange(index, "file_number", e.target.value)
                  }
                  placeholder="MVA-001"
                  maxLength={255}
                />
              </div>

              <div className="md:col-span-1">
                <label className="block mb-1 text-sm font-medium">Note</label>
                <Textarea
                  value={mva.note}
                  onChange={(e) =>
                    handleMVAChange(index, "note", e.target.value)
                  }
                  placeholder="Enter note"
                  maxLength={500}
                  rows={2}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {mva.note.length}/500
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* File Processing Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">File Processing Information</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block mb-1 font-medium">AB Package Done</label>
            <SearchableDropdown
              value={formData.ab_package_done}
              onChange={handleSelectChange}
              options={metadata?.yes_no_option}
              placeholder="Select option"
              popoverKey="ab_package_done"
              fieldName="ab_package_done"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Date</label>
            <Input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">By</label>
            <Input
              name="by"
              value={formData.by}
              onChange={handleChange}
              placeholder="Enter name"
              maxLength={255}
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Initial Meeting</label>
            <SearchableDropdown
              value={formData.initial_meeting}
              onChange={handleSelectChange}
              options={metadata?.yes_no_option}
              placeholder="Select option"
              popoverKey="initial_meeting"
              fieldName="initial_meeting"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Date</label>
            <Input
              type="date"
              name="date_2nd"
              value={formData.date_2nd}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">By</label>
            <Input
              name="by_2nd"
              value={formData.by_2nd}
              onChange={handleChange}
              placeholder="Enter name"
              maxLength={255}
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Memo Review</label>
            <SearchableDropdown
              value={formData.memo_review}
              onChange={handleSelectChange}
              options={metadata?.yes_no_option}
              placeholder="Select option"
              popoverKey="memo_review"
              fieldName="memo_review"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Date</label>
            <Input
              type="date"
              name="date_3rd"
              value={formData.date_3rd}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>

      {/* Legal File Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Legal File Information</h3>

        {/* File Opening Info */}
        <div>
          <h4 className="text-base font-medium mb-3">File Opening Info</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-medium">File Created</label>
              <Input
                type="date"
                name="file_created"
                value={formData.file_created}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">File Opened By</label>
              <SearchableDropdown
                value={formData.file_opened_by}
                onChange={handleSelectChange}
                options={metadata?.users}
                placeholder="Select user"
                popoverKey="file_opened_by"
                fieldName="file_opened_by"
              />
            </div>
          </div>
        </div>

        {/* Assigned to Info */}
        <div>
          <h4 className="text-base font-medium mb-3">Assigned to Info</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-medium">Assigned Date</label>
              <Input
                type="date"
                name="assigned_date"
                value={formData.assigned_date}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">Assigned To</label>
              <SearchableDropdown
                value={formData.assigned_to}
                onChange={handleSelectChange}
                options={metadata?.users}
                placeholder="Select user"
                popoverKey="assigned_to"
                fieldName="assigned_to"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">
                Assigned to Review
              </label>
              <SearchableDropdown
                value={formData.assigned_to_review}
                onChange={handleSelectChange}
                options={metadata?.users}
                placeholder="Select user"
                popoverKey="assigned_to_review"
                fieldName="assigned_to_review"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">
                Assigned to Paralegal
              </label>
              <Input
                name="assigned_to_paralegal"
                value={formData.assigned_to_paralegal}
                onChange={handleChange}
                placeholder="Enter name"
                maxLength={255}
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">
                Assigned to Legal Counsel
              </label>
              <SearchableDropdown
                value={formData.assigned_to_legal_counsel}
                onChange={handleSelectChange}
                options={metadata?.counsel_Interviewer}
                placeholder="Select counsel"
                popoverKey="assigned_to_legal_counsel"
                fieldName="assigned_to_legal_counsel"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">Legal Assistant</label>
              <SearchableDropdown
                value={formData.legal_assistant}
                onChange={handleSelectChange}
                options={metadata?.users}
                placeholder="Select user"
                popoverKey="legal_assistant"
                fieldName="legal_assistant"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">
                Previous Legal Representative
              </label>
              <SearchableDropdown
                value={formData.previous_legal_representative}
                onChange={handleSelectChange}
                options={metadata?.users}
                placeholder="Select user"
                popoverKey="previous_legal_representative"
                fieldName="previous_legal_representative"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block mb-1 font-medium">History</label>
              <Textarea
                name="history"
                value={formData.history}
                onChange={handleChange}
                placeholder="Enter file history"
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* File Closing Info */}
        <div>
          <h4 className="text-base font-medium mb-3">File Closing Info</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-medium">File Closed</label>
              <Input
                type="date"
                name="file_closed"
                value={formData.file_closed}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">File Closed By</label>
              <SearchableDropdown
                value={formData.file_closed_by}
                onChange={handleSelectChange}
                options={metadata?.users}
                placeholder="Select user"
                popoverKey="file_closed_by"
                fieldName="file_closed_by"
              />
            </div>
          </div>
        </div>

        {/* Folder to Storage */}
        <div>
          <h4 className="text-base font-medium mb-3">Folder to Storage</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-medium">Storage Date</label>
              <Input
                type="date"
                name="storage_date"
                value={formData.storage_date}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">Sent By</label>
              <SearchableDropdown
                value={formData.sent_by}
                onChange={handleSelectChange}
                options={metadata?.users}
                placeholder="Select user"
                popoverKey="sent_by"
                fieldName="sent_by"
              />
            </div>
          </div>
        </div>

        {/* File Shredded */}
        <div>
          <h4 className="text-base font-medium mb-3">File Shredded</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-medium">Shredded Date</label>
              <Input
                type="date"
                name="shredded_date"
                value={formData.shredded_date}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">Shredded By</label>
              <SearchableDropdown
                value={formData.shredded_by}
                onChange={handleSelectChange}
                options={metadata?.users}
                placeholder="Select user"
                popoverKey="shredded_by"
                fieldName="shredded_by"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Previous Counsel */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Previous Counsel</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-medium">Paralegal Name</label>
            <Input
              name="paralegal_name"
              value={formData.paralegal_name}
              onChange={handleChange}
              placeholder="Enter name"
              maxLength={255}
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Firm Name</label>
            <Input
              name="firm_name"
              value={formData.firm_name}
              onChange={handleChange}
              placeholder="Enter firm name"
              maxLength={255}
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Counsel Name</label>
            <Input
              name="counsel_name"
              value={formData.counsel_name}
              onChange={handleChange}
              placeholder="Enter counsel name"
              maxLength={255}
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">File Number</label>
            <Input
              name="file_number"
              value={formData.file_number}
              onChange={handleChange}
              placeholder="EX-2025-009"
              maxLength={255}
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Work Telephone</label>
            <Input
              name="work_telephone"
              value={formData.work_telephone}
              onChange={handleChange}
              placeholder="(xxx) xxx-xxxx"
              maxLength={255}
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Telephone</label>
            <Input
              name="telephone"
              value={formData.telephone}
              onChange={handleChange}
              placeholder="(xxx) xxx-xxxx"
              maxLength={255}
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Ext</label>
            <Input
              name="ext"
              value={formData.ext}
              onChange={handleChange}
              placeholder="101"
              maxLength={255}
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Fax</label>
            <Input
              name="fax"
              value={formData.fax}
              onChange={handleChange}
              placeholder="(xxx) xxx-xxxx"
              maxLength={255}
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Email</label>
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="example@domain.com"
              maxLength={255}
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Lawyer Name</label>
            <Input
              name="lawyer_name"
              value={formData.lawyer_name}
              onChange={handleChange}
              placeholder="Enter lawyer name"
              maxLength={255}
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Unit Number</label>
            <Input
              name="unit_number"
              value={formData.unit_number}
              onChange={handleChange}
              placeholder="5B"
              maxLength={50}
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Street Number</label>
            <Input
              name="street_number"
              value={formData.street_number}
              onChange={handleChange}
              placeholder="221"
              maxLength={100}
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Street Name</label>
            <Input
              name="street_name"
              value={formData.street_name}
              onChange={handleChange}
              placeholder="King Street West"
              maxLength={100}
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">City</label>
            <Input
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="Toronto"
              maxLength={100}
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Province</label>
            <Input
              name="province"
              value={formData.province}
              onChange={handleChange}
              placeholder="Ontario"
              maxLength={100}
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Postal Code</label>
            <Input
              name="postal_code"
              value={formData.postal_code}
              onChange={handleChange}
              placeholder="M5H 1K5"
              maxLength={50}
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Country</label>
            <Input
              name="country"
              value={formData.country}
              onChange={handleChange}
              placeholder="Canada"
            />
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate("/dashboard/workstation")}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting} className="flex-1">
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
  );
};

export default AddMatterCard;
