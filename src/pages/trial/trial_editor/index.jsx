import React, { useState, useEffect, useId, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  FloatingInput,
  FloatingTextarea,
  FloatingWrapper,
} from "@/components/ui/floating-label";
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
import {
  Loader2,
  ChevronRight,
  Check,
  Plus,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { fetchTrialBySlug } from "../helpers/fetchTrialBySlug";
import { createTrial } from "../helpers/createTrial";
import { uploadAttachment } from "@/pages/mediation/helpers/uploadAttachment";
import { fetchABMeta } from "@/pages/mediation/helpers/fetchABMeta";
import { Navbar2 } from "@/components/navbar2";
import Billing from "@/components/billing";

const SearchableSelect = ({
  label,
  options,
  value,
  onChange,
  placeholder,
  defaultName,
}) => {
  const [open, setOpen] = useState(false);
  const selected = options?.find(
    (opt) =>
      String(opt.id) === String(value) || String(opt.name) === String(value),
  );

  return (
    <FloatingWrapper
      label={label}
      hasValue={!!value || !!selected || !!defaultName}
      isFocused={open}
      className="w-full"
    >
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            role="combobox"
            variant="outline"
            className="w-full justify-between h-[52px] bg-transparent border border-input whitespace-nowrap overflow-hidden text-ellipsis px-3"
          >
            {selected ? selected.name : defaultName || ""}
            <ChevronRight className="ml-auto h-4 w-4 shrink-0 rotate-90 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-[300px] p-0 z-[100]">
          <Command>
            <CommandInput
              placeholder={`Search ${label?.toLowerCase() || ""}...`}
            />
            <CommandList>
              <CommandEmpty>No options found.</CommandEmpty>
              <CommandGroup>
                <CommandItem
                  onSelect={() => {
                    onChange("");
                    setOpen(false);
                  }}
                  className="cursor-pointer italic text-muted-foreground"
                >
                  <Check
                    className={`mr-2 h-4 w-4 ${!value ? "opacity-100" : "opacity-0"}`}
                  />
                  None
                </CommandItem>
                {options?.map((opt) => (
                  <CommandItem
                    key={opt.id}
                    onSelect={() => {
                      onChange(opt.id);
                      setOpen(false);
                    }}
                    value={opt.name}
                  >
                    <Check
                      className={`mr-2 h-4 w-4 ${
                        String(value) === String(opt.id)
                          ? "opacity-100"
                          : "opacity-0"
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

const FileUploadField = ({
  label,
  value,
  onChange,
  placeholder,
  defaultName,
  previewUrl,
}) => {
  const [fileName, setFileName] = useState(defaultName || "");
  const [preview, setPreview] = useState(previewUrl || "");
  const [isDragging, setIsDragging] = useState(false);
  const uniqueId = useId();

  useEffect(() => {
    if (defaultName && !fileName) setFileName(defaultName);
  }, [defaultName]);

  useEffect(() => {
    if (previewUrl && !preview) setPreview(previewUrl);
  }, [previewUrl]);

  const uploadMutation = useMutation({
    mutationFn: uploadAttachment,
    onSuccess: (data) => {
      const parsedId =
        data?.response?.attachment_id || data?.response?.id || data?.id;
      const parsedName =
        data?.response?.original_name || data?.original_name || "Uploaded File";
      const parsedPath = data?.response?.path || data?.path || "";

      onChange(parsedId);
      setFileName(parsedName);
      if (parsedPath) {
        setPreview(parsedPath);
      }
    },
    onError: () => {
      toast.error("Failed to upload file.");
      setFileName("");
      setPreview("");
    },
  });

  const handleFileChange = (file) => {
    if (file) {
      setFileName(file.name);
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreview(e.target.result);
        };
        reader.readAsDataURL(file);
      } else {
        setPreview("");
      }
      uploadMutation.mutate(file);
    }
  };

  const fieldId = `file-upload-${label.replace(/\s+/g, "-")}-${uniqueId}`;

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium text-foreground ml-1">{label}</div>
      <div
        className={`relative border-2 border-dashed rounded-lg transition-all overflow-hidden ${
          preview
            ? "border-green-500 bg-green-50/50 h-[100px]"
            : isDragging
              ? "border-primary bg-primary/10 h-[100px]"
              : "border-input bg-muted hover:border-gray-400 hover:bg-gray-100 h-[100px]"
        }`}
        onDragEnter={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setIsDragging(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          const file = e.dataTransfer.files?.[0];
          if (file) handleFileChange(file);
        }}
      >
        <input
          type="file"
          id={fieldId}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileChange(file);
          }}
          accept="image/*,.pdf,.doc,.docx"
        />

        {(uploadMutation.isLoading || uploadMutation.isPending) && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {preview ? (
          <div className="relative h-full flex flex-col items-center justify-center p-1">
            <div className="absolute top-2 right-2 z-10 flex gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange("");
                  setFileName("");
                  setPreview("");
                }}
                className="w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors shadow-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <img
              src={preview}
              alt="Preview"
              className="w-full h-10 object-contain rounded border border-green-300 shadow-sm"
            />
            <p className="text-xs text-muted-foreground mt-2 truncate w-full px-4 text-center">
              {fileName}
            </p>
          </div>
        ) : (
          <div
            className="h-full flex flex-col items-center justify-center cursor-pointer p-2 group"
            onClick={() => document.getElementById(fieldId).click()}
          >
            {value && !preview && fileName ? (
              <>
                <div className="absolute top-2 right-2 z-10 flex gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onChange("");
                      setFileName("");
                      setPreview("");
                    }}
                    className="w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors shadow-md"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <Upload className="w-6 h-6 text-green-500 mb-2" />
                <p className="text-xs font-semibold text-green-600 truncate w-full text-center px-2">
                  {fileName}
                </p>
              </>
            ) : (
              <>
                <Upload className="w-6 h-6 text-gray-400 group-hover:text-primary transition-colors mb-1" />
                <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                  {placeholder || "Upload"}
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default function TrialForm() {
  const { slug } = useParams();
  const queryClient = useQueryClient();

  const { data: metaData } = useQuery({
    queryKey: ["abMetaForTrial"],
    queryFn: fetchABMeta,
    select: (data) => data?.response || {},
  });

  const booleanOptions = Array.isArray(metaData?.yes_no_option)
    ? metaData.yes_no_option
    : [];
  const trialStatusOptions =
    Array.isArray(metaData?.trail_status) && metaData.trail_status.length > 0
      ? metaData.trail_status
      : [
          { id: 617, name: "Not Scheduled" },
          { id: 618, name: "Ready" },
          { id: 619, name: "In Trial" },
          { id: 620, name: "Judgment Released" },
        ];
  const trialDatesOptions =
    Array.isArray(metaData?.trail_dates) && metaData.trail_dates.length > 0
      ? metaData.trail_dates
      : [
          { id: 622, name: "Pre-trial" },
          { id: 623, name: "Start" },
          { id: 624, name: "End" },
          { id: 625, name: "Judgment" },
        ];
  const witnessTypeOptions = Array.isArray(metaData?.trail_type)
    ? metaData.trail_type
    : [];
  const exhibitTypeOptions = Array.isArray(metaData?.trail_type_2)
    ? metaData.trail_type_2
    : [];
  const judgmentEntryOptions = Array.isArray(metaData?.trail_Judgment_entry)
    ? metaData.trail_Judgment_entry
    : [];
  const issuesTrackingOptions = Array.isArray(metaData?.trail_issues_tracking)
    ? metaData.trail_issues_tracking
    : [];
  const offersToSettleOptions = Array.isArray(metaData?.trail_offers_to_settle)
    ? metaData.trail_offers_to_settle
    : [];
  const genericSelectOptions = [];

  const emptyWitness = {
    name: "",
    type_id: "",
    type_name: "",
    medical: "",
    report_served: "",
    will_testify: "",
  };

  const emptyExhibit = {
    type_id: "",
    type_name: "",
    admitted: "",
  };

  const [formData, setFormData] = useState({
    id: "",
    pleadings_closed: "",
    discoveries_completed: "",
    undertakings_satisfied: "",
    expert_reports_served: "",
    mediation_completed: "",
    case_setted_in_mediation_id: "",
    case_setted_in_mediation_name: "",
    aod_sent_to_the_opposing_counsel: "",
    aod_sent_to_the_opposing_counsel_date: "",
    aod_sent_to_the_court: "",
    aod_sent_to_the_court_date: "",
    aod_received_from_the_opposing_counsel: "",
    aod_received_from_the_opposing_counsel_date: "",
    aod_received_from_the_court: "",
    aod_received_from_the_court_date: "",
    expert_witness_reports_attached: "",
    supporting_evidence_attached: "",
    pre_trial_brief_served_date: "",
    pre_trail_date: "",
    form_76D_upload_id: "",
    form_76D_upload_name: "",
    file_trail_records_id: "",
    file_trail_records_name: "",
    pay_trail_fee_id: "",
    pay_trail_fee_name: "",
    amount: "",
    request_trial_date: "",
    motion_to_extend_time_id: "",
    motion_to_extend_time_name: "",
    trail_status_id: "",
    trail_status_name: "",
    trial_dates_id: "",
    trial_dates_name: "",
    witnesses: [],
    exhibits: [],
    issues_tracking_id: "",
    issues_tracking_name: "",
    offers_to_settle_id: "",
    offers_to_settle_name: "",
    judgment_entry_id: "",
    judgment_entry_name: "",
  });

  const { data: trialData, isLoading } = useQuery({
    queryKey: ["trial", slug],
    queryFn: () => fetchTrialBySlug(slug),
    enabled: !!slug,
  });

  const activeTrial = Array.isArray(trialData) ? trialData[0] : trialData;
  const isEditMode = !!activeTrial?.id;

  useEffect(() => {
    if (activeTrial && isEditMode) {
      setFormData({
        id: activeTrial.id || "",
        pleadings_closed: activeTrial.pleadings_closed ?? "",
        discoveries_completed: activeTrial.discoveries_completed ?? "",
        undertakings_satisfied: activeTrial.undertakings_satisfied ?? "",
        expert_reports_served: activeTrial.expert_reports_served ?? "",
        mediation_completed: activeTrial.mediation_completed ?? "",
        case_setted_in_mediation_id:
          activeTrial.case_setted_in_mediation_id || "",
        case_setted_in_mediation_name:
          activeTrial.case_setted_in_mediation?.name || "",
        aod_sent_to_the_opposing_counsel:
          activeTrial.aod_sent_to_the_opposing_counsel ?? "",
        aod_sent_to_the_opposing_counsel_date:
          activeTrial.aod_sent_to_the_opposing_counsel_date || "",
        aod_sent_to_the_court: activeTrial.aod_sent_to_the_court ?? "",
        aod_sent_to_the_court_date:
          activeTrial.aod_sent_to_the_court_date || "",
        aod_received_from_the_opposing_counsel:
          activeTrial.aod_received_from_the_opposing_counsel ?? "",
        aod_received_from_the_opposing_counsel_date:
          activeTrial.aod_received_from_the_opposing_counsel_date || "",
        aod_received_from_the_court:
          activeTrial.aod_received_from_the_court ?? "",
        aod_received_from_the_court_date:
          activeTrial.aod_received_from_the_court_date || "",
        expert_witness_reports_attached:
          activeTrial.expert_witness_reports_attached ?? "",
        supporting_evidence_attached:
          activeTrial.supporting_evidence_attached ?? "",
        pre_trial_brief_served_date:
          activeTrial.pre_trial_brief_served_date || "",
        pre_trail_date: activeTrial.pre_trail_date || "",
        form_76D_upload_id: activeTrial.form_76D_upload_id || "",
        form_76D_upload_name: activeTrial.form_76D_upload?.original_name || "",
        file_trail_records_id: activeTrial.file_trail_records_id || "",
        file_trail_records_name:
          activeTrial.file_trail_records?.original_name || "",
        pay_trail_fee_id: activeTrial.pay_trail_fee_id || "",
        pay_trail_fee_name: activeTrial.pay_trail_fee?.original_name || "",
        amount: activeTrial.amount || "",
        request_trial_date: activeTrial.request_trial_date || "",
        motion_to_extend_time_id: activeTrial.motion_to_extend_time_id || "",
        motion_to_extend_time_name:
          activeTrial.motion_to_extend_time?.original_name || "",
        trail_status_id: activeTrial.trail_status_id || "",
        trail_status_name: activeTrial.trail_status?.name || "",
        trial_dates_id: activeTrial.trial_dates_id || "",
        trial_dates_name: activeTrial.trial_dates?.name || "",
        issues_tracking_id: activeTrial.issues_tracking_id || "",
        issues_tracking_name: activeTrial.issues_tracking?.name || "",
        offers_to_settle_id: activeTrial.offers_to_settle_id || "",
        offers_to_settle_name: activeTrial.offers_to_settle?.name || "",
        judgment_entry_id: activeTrial.judgment_entry_id || "",
        judgment_entry_name: activeTrial.judgment_entry?.name || "",
        witnesses: Array.isArray(activeTrial.witnesses)
          ? activeTrial.witnesses
          : [],
        exhibits: Array.isArray(activeTrial.exhibits)
          ? activeTrial.exhibits
          : [],
      });
    }
  }, [activeTrial, isEditMode]);

  const saveMutation = useMutation({
    mutationFn: createTrial,
    onSuccess: (data) => {
      const resp = data?.response;
      if (resp?.Apistatus === false) {
        toast.error(resp?.message || "Validation failed");
        return;
      }
      toast.success(resp?.message || "Trial data saved successfully!");
      queryClient.invalidateQueries(["trial", slug]);
    },
    onError: (error) => {
      console.error("Mutation Error:", error);
      const errorData = error.response?.data;
      if (errorData?.Apistatus === false) {
        toast.error(errorData?.message || "Validation failed");
      } else {
        toast.error(errorData?.message || "Failed to save trial data");
      }
    },
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!slug) {
      toast.error("Unable to save: File slug is missing");
      return;
    }

    const payload = { ...formData };

    // Enforce boolean data types for array fields
    payload.witnesses = payload.witnesses.map((w) => ({
      ...w,
      medical: w.medical || "",
      report_served: isYes(w.report_served),
      will_testify: isYes(w.will_testify),
    }));

    payload.exhibits = payload.exhibits.map((e) => ({
      ...e,
      admitted: isYes(e.admitted),
    }));

    if (isEditMode && !payload.id) payload.id = activeTrial.id;
    saveMutation.mutate({ slug, data: payload });
  };

  const handleWitnessChange = (index, field, value) => {
    const updated = [...formData.witnesses];
    updated[index][field] = value;
    setFormData({ ...formData, witnesses: updated });
  };

  const addWitness = () => {
    setFormData({
      ...formData,
      witnesses: [...formData.witnesses, { ...emptyWitness }],
    });
  };

  const removeWitness = (index) => {
    const updated = formData.witnesses.filter((_, i) => i !== index);
    setFormData({ ...formData, witnesses: updated });
  };

  const handleExhibitChange = (index, field, value) => {
    const updated = [...formData.exhibits];
    updated[index][field] = value;
    setFormData({ ...formData, exhibits: updated });
  };

  const addExhibit = () => {
    setFormData({
      ...formData,
      exhibits: [...formData.exhibits, { ...emptyExhibit }],
    });
  };

  const removeExhibit = (index) => {
    const updated = formData.exhibits.filter((_, i) => i !== index);
    setFormData({ ...formData, exhibits: updated });
  };

  const isYes = (val) =>
    String(val) === "3" || String(val) === "true" || val === true;
  const isNo = (val) =>
    String(val) === "4" || String(val) === "false" || val === false;

  const showTrialSections = isNo(formData.case_setted_in_mediation_id);
  const [provideWitnesses, setProvideWitnesses] = useState(
    formData.witnesses?.length > 0,
  );
  const [provideExhibits, setProvideExhibits] = useState(
    formData.exhibits?.length > 0,
  );

  useEffect(() => {
    if (formData.witnesses?.length > 0) setProvideWitnesses(true);
    if (formData.exhibits?.length > 0) setProvideExhibits(true);
  }, [formData.witnesses, formData.exhibits]);

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted">
      <Navbar2 />
      <Billing />

      <nav className="bg-card border-b px-6 py-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/dashboard")}
            className="hover:text-foreground transition"
            type="button"
          >
            Dashboard
          </button>
          <ChevronRight className="w-4 h-4" />
          <button
            onClick={() => navigate("/dashboard/workstation")}
            className="hover:text-foreground transition"
            type="button"
          >
            Workstation
          </button>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground font-medium">Trial</span>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-8 max-w-7xl">
        <h1 className="text-2xl font-bold mb-6 text-foreground">
          Trial Details
        </h1>
        <form
          className="bg-card rounded-lg shadow-sm border p-8 space-y-10"
          onSubmit={handleSubmit}
        >
          {/* Section: CHECKLIST */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold">CHECKLIST</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div
                className="flex items-center gap-3 h-[52px] px-4 rounded-xl border border-input bg-card shadow-sm cursor-pointer select-none"
                onClick={(e) => {
                  if (e.target.tagName !== "INPUT") {
                    handleInputChange({
                      target: {
                        name: "pleadings_closed",
                        value: !isYes(formData.pleadings_closed),
                      },
                    });
                  }
                }}
              >
                <input
                  id="pleadings_closed"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-primary shadow-sm focus:ring-primary"
                  checked={isYes(formData.pleadings_closed)}
                  onChange={(e) =>
                    handleInputChange({
                      target: {
                        name: "pleadings_closed",
                        value: e.target.checked,
                      },
                    })
                  }
                />
                <label
                  htmlFor="pleadings_closed"
                  className="font-medium text-sm text-foreground cursor-pointer flex-1"
                >
                  Pleadings Closed
                </label>
              </div>

              <div
                className="flex items-center gap-3 h-[52px] px-4 rounded-xl border border-input bg-card shadow-sm cursor-pointer select-none"
                onClick={(e) => {
                  if (e.target.tagName !== "INPUT") {
                    handleInputChange({
                      target: {
                        name: "discoveries_completed",
                        value: !isYes(formData.discoveries_completed),
                      },
                    });
                  }
                }}
              >
                <input
                  id="discoveries_completed"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-primary shadow-sm focus:ring-primary"
                  checked={isYes(formData.discoveries_completed)}
                  onChange={(e) =>
                    handleInputChange({
                      target: {
                        name: "discoveries_completed",
                        value: e.target.checked,
                      },
                    })
                  }
                />
                <label
                  htmlFor="discoveries_completed"
                  className="font-medium text-sm text-foreground cursor-pointer flex-1"
                >
                  Discoveries Completed
                </label>
              </div>

              <div
                className="flex items-center gap-3 h-[52px] px-4 rounded-xl border border-input bg-card shadow-sm cursor-pointer select-none"
                onClick={(e) => {
                  if (e.target.tagName !== "INPUT") {
                    handleInputChange({
                      target: {
                        name: "undertakings_satisfied",
                        value: !isYes(formData.undertakings_satisfied),
                      },
                    });
                  }
                }}
              >
                <input
                  id="undertakings_satisfied"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-primary shadow-sm focus:ring-primary"
                  checked={isYes(formData.undertakings_satisfied)}
                  onChange={(e) =>
                    handleInputChange({
                      target: {
                        name: "undertakings_satisfied",
                        value: e.target.checked,
                      },
                    })
                  }
                />
                <label
                  htmlFor="undertakings_satisfied"
                  className="font-medium text-sm text-foreground cursor-pointer flex-1"
                >
                  Undertakings Satisfied
                </label>
              </div>

              <div
                className="flex items-center gap-3 h-[52px] px-4 rounded-xl border border-input bg-card shadow-sm cursor-pointer select-none"
                onClick={(e) => {
                  if (e.target.tagName !== "INPUT") {
                    handleInputChange({
                      target: {
                        name: "expert_reports_served",
                        value: !isYes(formData.expert_reports_served),
                      },
                    });
                  }
                }}
              >
                <input
                  id="expert_reports_served"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-primary shadow-sm focus:ring-primary"
                  checked={isYes(formData.expert_reports_served)}
                  onChange={(e) =>
                    handleInputChange({
                      target: {
                        name: "expert_reports_served",
                        value: e.target.checked,
                      },
                    })
                  }
                />
                <label
                  htmlFor="expert_reports_served"
                  className="font-medium text-sm text-foreground cursor-pointer flex-1"
                >
                  Expert Reports Served
                </label>
              </div>

              <div
                className="flex items-center gap-3 h-[52px] px-4 rounded-xl border border-input bg-card shadow-sm cursor-pointer select-none"
                onClick={(e) => {
                  if (e.target.tagName !== "INPUT") {
                    handleInputChange({
                      target: {
                        name: "mediation_completed",
                        value: !isYes(formData.mediation_completed),
                      },
                    });
                  }
                }}
              >
                <input
                  id="mediation_completed"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-primary shadow-sm focus:ring-primary"
                  checked={isYes(formData.mediation_completed)}
                  onChange={(e) =>
                    handleInputChange({
                      target: {
                        name: "mediation_completed",
                        value: e.target.checked,
                      },
                    })
                  }
                />
                <label
                  htmlFor="mediation_completed"
                  className="font-medium text-sm text-foreground cursor-pointer flex-1"
                >
                  Mediation Completed
                </label>
              </div>
            </div>
          </section>

          {/* Section: Case Settled in Mediation */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold">Case Settled in Mediation</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <SearchableSelect
                label="Case Settled"
                options={booleanOptions}
                value={formData.case_setted_in_mediation_id}
                onChange={(v) =>
                  handleInputChange({
                    target: { name: "case_setted_in_mediation_id", value: v },
                  })
                }
                defaultName={formData.case_setted_in_mediation_name}
              />
            </div>
          </section>

          {/* Section: PRE-TRIAL */}
          {showTrialSections && (
            <>
              <section className="space-y-4">
                <h2 className="text-lg font-semibold">PRE-TRIAL</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex flex-col gap-2">
                    <div
                      className="flex items-center gap-3 h-[52px] px-4 rounded-xl border border-input bg-card shadow-sm cursor-pointer select-none"
                      onClick={(e) => {
                        if (e.target.tagName !== "INPUT") {
                          handleInputChange({
                            target: {
                              name: "aod_sent_to_the_opposing_counsel",
                              value: !isYes(
                                formData.aod_sent_to_the_opposing_counsel,
                              ),
                            },
                          });
                        }
                      }}
                    >
                      <input
                        id="aod_sent_to_the_opposing_counsel"
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-primary shadow-sm focus:ring-primary"
                        checked={isYes(
                          formData.aod_sent_to_the_opposing_counsel,
                        )}
                        onChange={(e) =>
                          handleInputChange({
                            target: {
                              name: "aod_sent_to_the_opposing_counsel",
                              value: e.target.checked,
                            },
                          })
                        }
                      />
                      <label
                        htmlFor="aod_sent_to_the_opposing_counsel"
                        className="font-medium text-sm text-foreground cursor-pointer flex-1"
                      >
                        AOD Sent to the Opposing Counsel
                      </label>
                    </div>
                    {isYes(formData.aod_sent_to_the_opposing_counsel) && (
                      <FloatingInput
                        label="AOD Sent Date"
                        type="date"
                        name="aod_sent_to_the_opposing_counsel_date"
                        value={formData.aod_sent_to_the_opposing_counsel_date}
                        onChange={handleInputChange}
                      />
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <div
                      className="flex items-center gap-3 h-[52px] px-4 rounded-xl border border-input bg-card shadow-sm cursor-pointer select-none"
                      onClick={(e) => {
                        if (e.target.tagName !== "INPUT") {
                          handleInputChange({
                            target: {
                              name: "aod_sent_to_the_court",
                              value: !isYes(formData.aod_sent_to_the_court),
                            },
                          });
                        }
                      }}
                    >
                      <input
                        id="aod_sent_to_the_court"
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-primary shadow-sm focus:ring-primary"
                        checked={isYes(formData.aod_sent_to_the_court)}
                        onChange={(e) =>
                          handleInputChange({
                            target: {
                              name: "aod_sent_to_the_court",
                              value: e.target.checked,
                            },
                          })
                        }
                      />
                      <label
                        htmlFor="aod_sent_to_the_court"
                        className="font-medium text-sm text-foreground cursor-pointer flex-1"
                      >
                        AOD Sent to the Court
                      </label>
                    </div>
                    {isYes(formData.aod_sent_to_the_court) && (
                      <FloatingInput
                        label="AOD Filed Date"
                        type="date"
                        name="aod_sent_to_the_court_date"
                        value={formData.aod_sent_to_the_court_date}
                        onChange={handleInputChange}
                      />
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <div
                      className="flex items-center gap-3 h-[52px] px-4 rounded-xl border border-input bg-card shadow-sm cursor-pointer select-none"
                      onClick={(e) => {
                        if (e.target.tagName !== "INPUT") {
                          handleInputChange({
                            target: {
                              name: "aod_received_from_the_opposing_counsel",
                              value: !isYes(
                                formData.aod_received_from_the_opposing_counsel,
                              ),
                            },
                          });
                        }
                      }}
                    >
                      <input
                        id="aod_received_from_the_opposing_counsel"
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-primary shadow-sm focus:ring-primary"
                        checked={isYes(
                          formData.aod_received_from_the_opposing_counsel,
                        )}
                        onChange={(e) =>
                          handleInputChange({
                            target: {
                              name: "aod_received_from_the_opposing_counsel",
                              value: e.target.checked,
                            },
                          })
                        }
                      />
                      <label
                        htmlFor="aod_received_from_the_opposing_counsel"
                        className="font-medium text-sm text-foreground cursor-pointer flex-1"
                      >
                        AOD Received from Opposing Counsel
                      </label>
                    </div>
                    {isYes(formData.aod_received_from_the_opposing_counsel) && (
                      <FloatingInput
                        label="AOD Received Date"
                        type="date"
                        name="aod_received_from_the_opposing_counsel_date"
                        value={
                          formData.aod_received_from_the_opposing_counsel_date
                        }
                        onChange={handleInputChange}
                      />
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <div
                      className="flex items-center gap-3 h-[52px] px-4 rounded-xl border border-input bg-card shadow-sm cursor-pointer select-none"
                      onClick={(e) => {
                        if (e.target.tagName !== "INPUT") {
                          handleInputChange({
                            target: {
                              name: "aod_received_from_the_court",
                              value: !isYes(
                                formData.aod_received_from_the_court,
                              ),
                            },
                          });
                        }
                      }}
                    >
                      <input
                        id="aod_received_from_the_court"
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-primary shadow-sm focus:ring-primary"
                        checked={isYes(formData.aod_received_from_the_court)}
                        onChange={(e) =>
                          handleInputChange({
                            target: {
                              name: "aod_received_from_the_court",
                              value: e.target.checked,
                            },
                          })
                        }
                      />
                      <label
                        htmlFor="aod_received_from_the_court"
                        className="font-medium text-sm text-foreground cursor-pointer flex-1"
                      >
                        AOD Received from the Court
                      </label>
                    </div>
                    {isYes(formData.aod_received_from_the_court) && (
                      <FloatingInput
                        label="AOD Received Court Date"
                        type="date"
                        name="aod_received_from_the_court_date"
                        value={formData.aod_received_from_the_court_date}
                        onChange={handleInputChange}
                      />
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <div
                      className="flex items-center gap-3 h-[52px] px-4 rounded-xl border border-input bg-card shadow-sm cursor-pointer select-none"
                      onClick={(e) => {
                        if (e.target.tagName !== "INPUT") {
                          handleInputChange({
                            target: {
                              name: "expert_witness_reports_attached",
                              value: !isYes(
                                formData.expert_witness_reports_attached,
                              ),
                            },
                          });
                        }
                      }}
                    >
                      <input
                        id="expert_witness_reports_attached"
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-primary shadow-sm focus:ring-primary"
                        checked={isYes(
                          formData.expert_witness_reports_attached,
                        )}
                        onChange={(e) =>
                          handleInputChange({
                            target: {
                              name: "expert_witness_reports_attached",
                              value: e.target.checked,
                            },
                          })
                        }
                      />
                      <label
                        htmlFor="expert_witness_reports_attached"
                        className="font-medium text-sm text-foreground cursor-pointer flex-1"
                      >
                        Expert Witness Reports Attached
                      </label>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <div
                      className="flex items-center gap-3 h-[52px] px-4 rounded-xl border border-input bg-card shadow-sm cursor-pointer select-none"
                      onClick={(e) => {
                        if (e.target.tagName !== "INPUT") {
                          handleInputChange({
                            target: {
                              name: "supporting_evidence_attached",
                              value: !isYes(
                                formData.supporting_evidence_attached,
                              ),
                            },
                          });
                        }
                      }}
                    >
                      <input
                        id="supporting_evidence_attached"
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-primary shadow-sm focus:ring-primary"
                        checked={isYes(formData.supporting_evidence_attached)}
                        onChange={(e) =>
                          handleInputChange({
                            target: {
                              name: "supporting_evidence_attached",
                              value: e.target.checked,
                            },
                          })
                        }
                      />
                      <label
                        htmlFor="supporting_evidence_attached"
                        className="font-medium text-sm text-foreground cursor-pointer flex-1"
                      >
                        Supporting Evidence Attached
                      </label>
                    </div>
                  </div>

                  <FloatingInput
                    label="Pre-Trial Brief Served Date"
                    type="date"
                    name="pre_trial_brief_served_date"
                    value={formData.pre_trial_brief_served_date}
                    onChange={handleInputChange}
                  />
                  <FloatingInput
                    label="Pre-Trial Date"
                    type="date"
                    name="pre_trail_date"
                    value={formData.pre_trail_date}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                  <FileUploadField
                    label="Trial Management Checklist (Form 76D)"
                    value={formData.form_76D_upload_id}
                    onChange={(val) =>
                      handleInputChange({
                        target: { name: "form_76D_upload_id", value: val },
                      })
                    }
                    defaultName={formData.form_76D_upload_name}
                  />
                </div>
              </section>

              {/* Section: TRIAL RECORDS */}
              <section className="space-y-4">
                <h2 className="text-lg font-semibold">TRIAL RECORDS</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex flex-col gap-1">
                    <SearchableSelect
                      label="File Trial Records"
                      options={booleanOptions}
                      value={formData.file_trail_records_id}
                      onChange={(v) =>
                        handleInputChange({
                          target: { name: "file_trail_records_id", value: v },
                        })
                      }
                      defaultName={formData.file_trail_records_name}
                    />
                    {isNo(formData.file_trail_records_id) && (
                      <span className="text-amber-500 text-xs font-medium pl-1 italic flex items-center gap-1">
                        ⚠️ Warning: Trial records must be filed within 5 years
                        of commencement to avoid dismissal.
                      </span>
                    )}
                  </div>
                  <SearchableSelect
                    label="Pay Trial Fee"
                    options={booleanOptions}
                    value={formData.pay_trail_fee_id}
                    onChange={(v) =>
                      handleInputChange({
                        target: { name: "pay_trail_fee_id", value: v },
                      })
                    }
                    defaultName={formData.pay_trail_fee_name}
                  />
                </div>
              </section>

              {/* Section: Trial Request / Status */}
              <section className="space-y-4">
                <h2 className="text-lg font-semibold">
                  Trial Request / Status
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FloatingInput
                    label="Request Trial Date"
                    type="date"
                    name="request_trial_date"
                    value={formData.request_trial_date}
                    onChange={handleInputChange}
                  />
                  <SearchableSelect
                    label="Motion to Extend Time"
                    options={booleanOptions}
                    value={formData.motion_to_extend_time_id}
                    onChange={(v) =>
                      handleInputChange({
                        target: { name: "motion_to_extend_time_id", value: v },
                      })
                    }
                    defaultName={formData.motion_to_extend_time_name}
                  />
                  <SearchableSelect
                    label="Trial Status"
                    options={trialStatusOptions}
                    value={formData.trail_status_id}
                    onChange={(v) =>
                      handleInputChange({
                        target: { name: "trail_status_id", value: v },
                      })
                    }
                    defaultName={formData.trail_status_name}
                  />
                </div>
              </section>

              {/* Section: Trial Dates */}
              <section className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold">Trial Dates</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <SearchableSelect
                    label="Trial Dates"
                    options={trialDatesOptions}
                    value={formData.trial_dates_id}
                    onChange={(v) =>
                      handleInputChange({
                        target: { name: "trial_dates_id", value: v },
                      })
                    }
                    defaultName={formData.trial_dates_name}
                  />
                </div>
              </section>

              {/* Section: Witnesses */}
              <section className="space-y-4">
                <div className="flex gap-4 items-center">
                  <h2 className="text-lg font-semibold mr-4">Witnesses</h2>
                  <label className="flex items-center gap-2 cursor-pointer text-sm font-medium">
                    <input
                      type="checkbox"
                      checked={provideWitnesses}
                      onChange={(e) => setProvideWitnesses(e.target.checked)}
                      className="rounded border-input text-primary focus:ring-primary shadow-sm h-4 w-4"
                    />
                    Provide Multiple Witnesses
                  </label>
                </div>

                {provideWitnesses && (
                  <div className="border border-border rounded-lg p-6 bg-muted/50 transition-all duration-300">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-md font-semibold text-primary">
                        Witness Details
                      </h3>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addWitness}
                      >
                        <Plus className="w-4 h-4 mr-2" /> Add Witness
                      </Button>
                    </div>
                    {formData.witnesses.map((witness, index) => (
                      <div
                        key={index}
                        className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end bg-background p-4 rounded-md border mb-4"
                      >
                        <FloatingInput
                          label="Name"
                          value={witness.name}
                          onChange={(e) =>
                            handleWitnessChange(index, "name", e.target.value)
                          }
                        />
                        <SearchableSelect
                          label="Type"
                          options={witnessTypeOptions}
                          value={witness.type_id}
                          onChange={(v) =>
                            handleWitnessChange(index, "type_id", v)
                          }
                          defaultName={witness.type_name}
                        />
                        <FloatingInput
                          label="Medical"
                          value={witness.medical || ""}
                          onChange={(e) =>
                            handleWitnessChange(
                              index,
                              "medical",
                              e.target.value,
                            )
                          }
                        />
                        <SearchableSelect
                          label="Report Served"
                          options={booleanOptions}
                          value={witness.report_served}
                          onChange={(v) =>
                            handleWitnessChange(index, "report_served", v)
                          }
                        />
                        <SearchableSelect
                          label="Will Testify"
                          options={booleanOptions}
                          value={witness.will_testify}
                          onChange={(v) =>
                            handleWitnessChange(index, "will_testify", v)
                          }
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          className="text-red-500 hover:text-red-700 mt-2 md:mt-0"
                          onClick={() => removeWitness(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Section: Exhibit Management */}
              <section className="space-y-4">
                <div className="flex gap-4 items-center">
                  <h2 className="text-lg font-semibold mr-4">
                    Exhibit Management
                  </h2>
                  <label className="flex items-center gap-2 cursor-pointer text-sm font-medium">
                    <input
                      type="checkbox"
                      checked={provideExhibits}
                      onChange={(e) => setProvideExhibits(e.target.checked)}
                      className="rounded border-input text-primary focus:ring-primary shadow-sm h-4 w-4"
                    />
                    Enter Multiple Exhibits
                  </label>
                </div>

                {provideExhibits && (
                  <div className="border border-border rounded-lg p-6 bg-muted/50 transition-all duration-300">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-md font-semibold text-primary">
                        Exhibit Details
                      </h3>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addExhibit}
                      >
                        <Plus className="w-4 h-4 mr-2" /> Add Exhibit
                      </Button>
                    </div>
                    {formData.exhibits.map((exhibit, index) => (
                      <div
                        key={index}
                        className="flex gap-4 items-center bg-background p-4 rounded-md border mb-4"
                      >
                        <div className="flex-1">
                          <SearchableSelect
                            label="Type"
                            options={exhibitTypeOptions}
                            value={exhibit.type_id}
                            onChange={(v) =>
                              handleExhibitChange(index, "type_id", v)
                            }
                            defaultName={exhibit.type_name}
                          />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          className="text-red-500 hover:text-red-700 mt-2"
                          onClick={() => removeExhibit(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Section: Issues Tracking */}
              <section className="space-y-4">
                <h2 className="text-lg font-semibold">Issues Tracking</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <SearchableSelect
                    label="Select Issue Tracking"
                    options={issuesTrackingOptions}
                    value={formData.issues_tracking_id}
                    onChange={(v) =>
                      handleInputChange({
                        target: { name: "issues_tracking_id", value: v },
                      })
                    }
                    defaultName={formData.issues_tracking_name}
                  />
                </div>
              </section>

              {/* Section: Offers to Settle */}
              <section className="space-y-4">
                <h2 className="text-lg font-semibold">Offers to Settle</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <SearchableSelect
                    label="Offers to Settle Action"
                    options={offersToSettleOptions}
                    value={formData.offers_to_settle_id}
                    onChange={(v) =>
                      handleInputChange({
                        target: { name: "offers_to_settle_id", value: v },
                      })
                    }
                    defaultName={formData.offers_to_settle_name}
                  />
                  <FloatingInput
                    label="Amount ($)"
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                  />
                </div>
              </section>

              {/* Section: Judgment Entry */}
              <section className="space-y-4">
                <h2 className="text-lg font-semibold">Judgment Entry</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <SearchableSelect
                    label="Select Judgment Entry"
                    options={judgmentEntryOptions}
                    value={formData.judgment_entry_id}
                    onChange={(v) =>
                      handleInputChange({
                        target: { name: "judgment_entry_id", value: v },
                      })
                    }
                    defaultName={formData.judgment_entry_name}
                  />
                </div>
              </section>
            </>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-4 border-t pt-6">
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              type="button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                saveMutation.isLoading || saveMutation.isPending || isLoading
              }
            >
              {saveMutation.isLoading || saveMutation.isPending
                ? "Saving..."
                : "Save Trial"}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
