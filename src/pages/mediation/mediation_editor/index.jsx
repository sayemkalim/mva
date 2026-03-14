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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Navbar2 } from "@/components/navbar2";
import Billing from "@/components/billing";
import { formatPhoneNumber } from "@/lib/utils";
import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

import { fetchMediationBySlug } from "../helpers/fetchMediationBySlug";
import { createMediation } from "../helpers/createMediation";
import { addMediationLog } from "../helpers/addMediationLog";
import { fetchABMeta } from "../helpers/fetchABMeta";
import { uploadAttachment } from "../helpers/uploadAttachment";

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

  useEffect(() => {
    if (label.includes("Mediation Status") || label.includes("Conflict")) {
      console.log(
        `[SearchableSelect Debug] ${label} - value:`,
        value,
        "optionsLen:",
        options?.length,
        "selected:",
        selected?.name,
        "default:",
        defaultName,
      );
    }
  }, [value, options, label, selected, defaultName]);

  return (
    <FloatingWrapper
      label={label}
      hasValue={!!value || !!selected || !!defaultName}
      isFocused={open}
      className="max-w-sm"
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

        <PopoverContent className="w-[300px] p-0">
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
      console.log("Upload response payload:", data);

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
            ? "border-green-500 bg-green-50/50 h-[150px]"
            : isDragging
              ? "border-primary bg-primary/10 h-[150px]"
              : "border-input bg-muted hover:border-gray-400 hover:bg-gray-100 h-[150px]"
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

        {uploadMutation.isLoading && (
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
              className="w-full h-20 object-contain rounded border border-green-300 shadow-sm"
            />
            <p className="text-xs text-muted-foreground mt-2 truncate w-full px-4 text-center">
              {fileName}
            </p>
          </div>
        ) : (
          <div
            className="h-full flex flex-col items-center justify-center cursor-pointer p-4 group"
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
                <Upload className="w-8 h-8 text-gray-400 group-hover:text-primary transition-colors mb-2" />
                <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                  {placeholder || "Click or drag to upload"}
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default function MediationForm() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: mediationData, isLoading: loadingMediation } = useQuery({
    queryKey: ["mediation", slug],
    queryFn: () => fetchMediationBySlug(slug),
    enabled: !!slug,
  });

  const specificMediationArray = Array.isArray(mediationData)
    ? mediationData
    : [mediationData].filter(Boolean);
  const activeMediation = specificMediationArray[0];
  const isEditMode = !!activeMediation?.id;
  const id = activeMediation?.id;

  const documentTypeOptions = [
    { id: 609, name: "Medical Records" },
    { id: 610, name: "Income Loss Proof" },
    { id: 611, name: "Expert Reports" },
    { id: 612, name: "Liability Summary" },
    { id: 613, name: "Damage Calculation Sheet" },
    { id: 614, name: "Mediation Brief" },
  ];

  /*
  const { data: metaData } = useQuery({
    queryKey: ["abMetaForMediation"],
    queryFn: fetchABMeta,
    select: (data) => data?.response || {},
  });
  */

  const { data: metaData } = useQuery({
    queryKey: ["abMetaForMediationDynamic"],
    queryFn: fetchABMeta,
    select: (data) => data?.response || {},
  });

  const dynamicDocs = Array.isArray(metaData?.mediation_document_management)
    ? metaData.mediation_document_management
    : [];

  // Combine or conditionally render based on API options availability.
  // Prefer dynamic if available, otherwise fallback.
  const FinalDocumentOptions =
    dynamicDocs.length > 0 ? dynamicDocs : documentTypeOptions;

  const yesNoOptions = Array.isArray(metaData?.yes_no_option)
    ? metaData.yes_no_option
    : [];
  const statusOptions = Array.isArray(
    metaData?.mediation_current_mediation_status,
  )
    ? metaData.mediation_current_mediation_status
    : [];
  const conflictOptions = Array.isArray(metaData?.mediation_conflict_check)
    ? metaData.mediation_conflict_check
    : [];

  const saveMutation = useMutation({
    mutationFn: createMediation,
    onSuccess: (data) => {
      const resp = data?.response;
      if (resp?.Apistatus === false) {
        toast.error(resp?.message || "Validation failed");
        return;
      }
      toast.success(resp?.message || "Mediation data saved!");
      queryClient.invalidateQueries(["mediation", slug]);
    },
    onError: (error) => {
      console.error("Mutation Error:", error);
      const errorData = error.response?.data;
      if (errorData?.Apistatus === false) {
        toast.error(errorData?.message || "Validation failed");
      } else {
        toast.error(errorData?.message || "Failed to save mediation data");
      }
    },
  });

  const logMutation = useMutation({
    mutationFn: addMediationLog,
    onSuccess: (data) => {
      const resp = data?.response || data;
      if (resp?.Apistatus === false) {
        toast.error(resp?.message || "Log validation failed");
        return;
      }
      setShowClientLogForm(false);
      setShowSystemLogForm(false);
      setLogForm({
        logs: "",
        date: new Date().toISOString().split("T")[0],
        time: "",
      });
      queryClient.invalidateQueries(["mediation", slug]);
    },
  });

  const emptyDocument = {
    document_type_id: "",
    document_type_name: "",
    document_id: "",
    document_name: "",
    document_preview: "",
  };

  const [formData, setFormData] = useState({
    id: "",
    mediation_required_id: "",
    mediation_required_name: "",
    mediation_status_id: "",
    mediation_status_name: "",
    mediation_deadline: "",
    notice_served_date: "",
    mediator_selection_date: "",
    mediation_date: "",
    filing_date: "",
    payment_due_date: "",
    contact_details: "",
    fee_rate: "",
    plaintiff: "",
    defendant: "",
    insurance: "",
    conflict_checkthod_id: "",
    conflict_checkthod_name: "",
    date_of_conflict_check: "",
    opening_offer: "",
    counter_offers: "",
    final_settlement_amount: "",
    min_settlement_amount: "",
    max_settlement_amount: "",
    digital_consent_upload_id: "",
    digital_consent_upload_name: "",
    settlement_amount: "",
    minutes_of_settlement_upload_id: "",
    minutes_of_settlement_upload_name: "",
    release_tracking: "",
    payment_tracking: "",
    trust_account_entry: "",
    mediation_report_upload_upload_id: "",
    mediation_report_upload_upload_name: "",
    next_litigation_step: "",
    documents: [],
  });

  const [logForm, setLogForm] = useState({
    logs: "",
    date: new Date().toISOString().split("T")[0],
    time: "",
  });

  const [showClientLogForm, setShowClientLogForm] = useState(false);
  const [showSystemLogForm, setShowSystemLogForm] = useState(false);
  const initialLogIdsRef = useRef(null);
  const recentLogTimesRef = useRef({});

  useEffect(() => {
    if (activeMediation && isEditMode) {
      const selectedMediation = activeMediation;

      if (selectedMediation) {
        console.log("Loaded mediation item from fetch:", selectedMediation);
        setFormData({
          id: selectedMediation.id || "",
          mediation_required_id: selectedMediation.mediation_required_id || "",
          mediation_required_name:
            selectedMediation.mediation_required?.name ||
            selectedMediation.mediation_required ||
            "",
          mediation_status_id: selectedMediation.mediation_status_id || "",
          mediation_status_name:
            selectedMediation.mediation_status?.name ||
            selectedMediation.mediation_status ||
            selectedMediation.mediation_status_name ||
            "",
          mediation_deadline: selectedMediation.mediation_deadline || "",
          notice_served_date: selectedMediation.notice_served_date || "",
          mediator_selection_date:
            selectedMediation.mediator_selection_date || "",
          mediation_date: selectedMediation.mediation_date || "",
          filing_date: selectedMediation.filing_date || "",
          payment_due_date: selectedMediation.payment_due_date || "",
          contact_details: selectedMediation.contact_details || "",
          fee_rate: selectedMediation.fee_rate || "",
          plaintiff: selectedMediation.plaintiff || "",
          defendant: selectedMediation.defendant || "",
          insurance: selectedMediation.insurance || "",
          conflict_checkthod_id: selectedMediation.conflict_checkthod_id || "",
          conflict_checkthod_name:
            selectedMediation.conflict_checkthod?.name ||
            selectedMediation.conflict_checkthod ||
            selectedMediation.conflict_checkthod_name ||
            "",
          date_of_conflict_check:
            selectedMediation.date_of_conflict_check || "",
          opening_offer: selectedMediation.opening_offer || "",
          counter_offers: selectedMediation.counter_offers || "",
          final_settlement_amount:
            selectedMediation.final_settlement_amount || "",
          min_settlement_amount: selectedMediation.min_settlement_amount || "",
          max_settlement_amount: selectedMediation.max_settlement_amount || "",
          digital_consent_upload_id:
            selectedMediation.digital_consent_upload_id || "",
          digital_consent_upload_name:
            selectedMediation.digital_consent_upload?.original_name || "",
          digital_consent_preview:
            selectedMediation.digital_consent_upload?.path || "",
          settlement_amount: selectedMediation.settlement_amount || "",
          minutes_of_settlement_upload_id:
            selectedMediation.minutes_of_settlement_upload_id || "",
          minutes_of_settlement_upload_name:
            selectedMediation.minutes_of_settlement_upload?.original_name || "",
          minutes_of_settlement_preview:
            selectedMediation.minutes_of_settlement_upload?.path || "",
          release_tracking: selectedMediation.release_tracking || "",
          payment_tracking: selectedMediation.payment_tracking || "",
          trust_account_entry: selectedMediation.trust_account_entry || "",
          mediation_report_upload_upload_id:
            selectedMediation.mediation_report_upload_upload_id || "",
          mediation_report_upload_upload_name:
            selectedMediation.mediation_report_upload?.original_name || "",
          mediation_report_preview:
            selectedMediation.mediation_report_upload?.path || "",
          next_litigation_step: selectedMediation.next_litigation_step || "",
          documents: (selectedMediation.documents || []).map((doc) => ({
            ...doc,
            document_id: doc.document_id || doc.attachment?.id || doc.id || "",
          })),
        });
      }
    }
  }, [mediationData, id, isEditMode]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDocChange = (index, field, value) => {
    const updatedDocs = [...formData.documents];
    updatedDocs[index][field] = value;
    setFormData({ ...formData, documents: updatedDocs });
  };

  const addDocument = () => {
    setFormData({
      ...formData,
      documents: [...formData.documents, { ...emptyDocument }],
    });
  };

  const removeDoc = (index) => {
    setFormData((prev) => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index),
    }));
  };

  const handleLogSubmit = (e, type) => {
    e.preventDefault();
    if (!mediationData?.id && !mediationData?.mediation_id) {
      toast.error("Mediation not created yet. Please save mediation first.");
      return;
    }
    logMutation.mutate({
      mediation_id: mediationData.id || mediationData.mediation_id,
      ...logForm,
      type,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = { ...formData };
    if (isEditMode && !payload.id) payload.id = id;

    // Filter out empty rows and format exactly as { document_id, document_type_id } back to the server
    if (payload.documents && payload.documents.length > 0) {
      payload.documents = payload.documents
        .filter((doc) => doc.document_id && doc.document_id !== "")
        .map((doc) => ({
          document_id: doc.document_id,
          document_type_id: doc.document_type_id,
        }));
    }

    saveMutation.mutate({ slug: slug, data: payload, isEditMode });
  };

  const deleteLogMutation = useMutation({
    mutationFn: async (logId) => {
      return await apiService({
        endpoint: `${endpoints.deleteMediation}/${logId}`,
        method: "DELETE",
      });
    },
    onSuccess: (data) => {
      const resp = data?.response || data;
      if (resp?.Apistatus === false) {
        toast.error(resp?.message || "Failed to delete log");
        return;
      }
      toast.success(resp?.message || "Log deleted successfully!");
      queryClient.invalidateQueries(["mediation", slug]);
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Error deleting log");
    },
  });

  // To display past logs dynamically extracting both lists from exactly matched IDs
  const pastLogs = [
    ...(Array.isArray(activeMediation?.system_logs)
      ? activeMediation.system_logs.map((log) => ({
          ...log,
          type: "system",
          logs: log.log_entry,
        }))
      : []),
    ...(Array.isArray(activeMediation?.client_logs)
      ? activeMediation.client_logs.map((log) => ({
          ...log,
          type: "client",
          logs: log.log_entry,
        }))
      : []),
  ].sort((a, b) => (a.id || 0) - (b.id || 0));

  // Track which logs existed initially
  useEffect(() => {
    if (!pastLogs || pastLogs.length === 0) return;

    if (!initialLogIdsRef.current) {
      initialLogIdsRef.current = new Set(
        pastLogs.map((log) => log.id).filter(Boolean),
      );
      return;
    }

    pastLogs.forEach((log) => {
      if (!log.id) return;
      if (
        !initialLogIdsRef.current.has(log.id) &&
        !recentLogTimesRef.current[log.id]
      ) {
        recentLogTimesRef.current[log.id] = Date.now();
      }
    });
  }, [pastLogs]);

  const clientLogs = pastLogs.filter((log) => log.type === "client");
  const systemLogs = pastLogs.filter((log) => log.type === "system");

  const canDeleteLog = (logItem) => {
    const id = logItem.id;
    if (!id) return false;

    const createdAt = recentLogTimesRef.current[id];
    if (!createdAt) return false;

    const diffMs = Date.now() - createdAt;
    return diffMs <= 30 * 60 * 1000;
  };

  const renderLogSection = ({
    title,
    logs,
    showForm,
    setShowForm,
    onSubmit,
  }) => (
    <div className="bg-card rounded-lg shadow-sm border p-6">
      <div className="flex justify-end mb-4">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowForm(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Log
        </Button>
      </div>

      {/* Combined log preview area */}
      {logs.length > 0 && (
        <div className="max-h-[300px] overflow-y-auto pr-1">
          <div className="w-full rounded-md border bg-background text-sm text-foreground px-3 py-2 space-y-3">
            {logs.map((logItem, index) => (
              <div
                key={index}
                className="border-b last:border-b-0 border-border pb-2 last:pb-0 relative group"
              >
                {canDeleteLog(logItem) && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className={`absolute -top-2 right-0 opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 hover:bg-red-50`}
                    onClick={() => deleteLogMutation.mutate(logItem.id)}
                    disabled={deleteLogMutation.isLoading}
                    title="Delete Log"
                  >
                    {deleteLogMutation.isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                )}
                {(logItem.date || logItem.created_at || logItem.time) && (
                  <p className="text-[11px] text-muted-foreground mb-1 pr-6">
                    {(logItem.date || "No date") +
                      (logItem.time ? ` at ${logItem.time}` : "")}
                  </p>
                )}
                <div className="whitespace-pre-wrap text-sm">
                  {logItem.logs}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-md max-w-md">
          <DialogHeader>
            <DialogTitle>Add Log</DialogTitle>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-6 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FloatingInput
                label="Date"
                type="date"
                value={logForm.date}
                onChange={(e) =>
                  setLogForm((p) => ({ ...p, date: e.target.value }))
                }
              />
              <FloatingInput
                label="Time"
                type="time"
                value={logForm.time}
                onChange={(e) =>
                  setLogForm((p) => ({ ...p, time: e.target.value }))
                }
              />
            </div>
            <FloatingTextarea
              label="Log Entry"
              value={logForm.logs}
              onChange={(e) =>
                setLogForm((p) => ({ ...p, logs: e.target.value }))
              }
              rows={3}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={logMutation.isLoading}>
                {logMutation.isLoading ? "Adding Log..." : "Submit Log"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );

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
          <span className="text-foreground font-medium">Mediation</span>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-8 max-w-7xl">
        <h1 className="text-2xl font-bold mb-6 text-foreground">
          Mediation Details
        </h1>
        <form
          className="bg-card rounded-lg shadow-sm border p-8 space-y-10"
          onSubmit={handleSubmit}
        >
          {/* 1. Mediation Status */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold">Mediation Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <SearchableSelect
                label="Mediation Required"
                value={formData.mediation_required_id}
                defaultName={formData.mediation_required_name}
                options={yesNoOptions}
                onChange={(val) =>
                  setFormData({ ...formData, mediation_required_id: val })
                }
                placeholder="Select Yes / No"
              />
              <SearchableSelect
                label="Current Mediation Status"
                value={formData.mediation_status_id}
                defaultName={formData.mediation_status_name}
                options={statusOptions}
                onChange={(val) =>
                  setFormData({ ...formData, mediation_status_id: val })
                }
                placeholder="Select Status"
              />
            </div>
          </section>

          {/* 2. Key Date Tracking */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold">Key Date Tracking</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FloatingInput
                label="Mediation Deadline"
                type="date"
                name="mediation_deadline"
                value={formData.mediation_deadline}
                onChange={handleInputChange}
              />
              <FloatingInput
                label="Notice Served Date"
                type="date"
                name="notice_served_date"
                value={formData.notice_served_date}
                onChange={handleInputChange}
              />
              <FloatingInput
                label="Mediator Selection Date"
                type="date"
                name="mediator_selection_date"
                value={formData.mediator_selection_date}
                onChange={handleInputChange}
              />
              <FloatingInput
                label="Mediation Date"
                type="date"
                name="mediation_date"
                value={formData.mediation_date}
                onChange={handleInputChange}
              />
              <FloatingInput
                label="Filing Date"
                type="date"
                name="filing_date"
                value={formData.filing_date}
                onChange={handleInputChange}
              />
              <FloatingInput
                label="Payment Due Date"
                type="date"
                name="payment_due_date"
                value={formData.payment_due_date}
                onChange={handleInputChange}
              />
            </div>
          </section>

          {/* 3. Mediator Information */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold">Mediator Information</h2>
            <div className="w-full">
              <FloatingTextarea
                label="Contact Details"
                name="contact_details"
                value={formData.contact_details}
                onChange={handleInputChange}
                rows={2}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FloatingInput
                label="Fee Rate"
                name="fee_rate"
                type="number"
                value={formData.fee_rate}
                onChange={handleInputChange}
              />
            </div>
          </section>

          {/* 4. Conflict Check */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold">Conflict Check</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FloatingInput
                label="Plaintiff"
                name="plaintiff"
                value={formData.plaintiff}
                onChange={handleInputChange}
              />
              <FloatingInput
                label="Defendant"
                name="defendant"
                value={formData.defendant}
                onChange={handleInputChange}
              />
              <FloatingInput
                label="Insurance"
                name="insurance"
                value={formData.insurance}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <SearchableSelect
                label="Conflict Check Status"
                value={formData.conflict_checkthod_id}
                defaultName={formData.conflict_checkthod_name}
                options={conflictOptions}
                onChange={(val) =>
                  setFormData({ ...formData, conflict_checkthod_id: val })
                }
                placeholder="Select Status"
              />
              <FloatingInput
                label="Date of Conflict Check"
                type="date"
                name="date_of_conflict_check"
                value={formData.date_of_conflict_check}
                onChange={handleInputChange}
              />
            </div>
          </section>

          {/* 5. Document Management (Pre-Mediation) */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold">
              Document Management (Pre-Mediation)
            </h2>
            <div className="border border-border rounded-lg p-6 bg-muted/50">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-md font-semibold">Documents</h3>
                <Button
                  type="button"
                  onClick={addDocument}
                  variant="outline"
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" /> Add Document
                </Button>
              </div>

              {formData.documents.map((doc, idx) => (
                <div
                  key={idx}
                  className="flex gap-4 items-center mb-4 bg-background p-4 rounded-md border"
                >
                  <div className="flex-1">
                    <SearchableSelect
                      label="Document Type"
                      value={doc.document_type_id}
                      defaultName={
                        doc.document_type_name ||
                        doc.document_type?.name ||
                        doc.document_type ||
                        ""
                      }
                      options={FinalDocumentOptions}
                      onChange={(val) =>
                        handleDocChange(idx, "document_type_id", val)
                      }
                      placeholder="Select Type"
                    />
                  </div>
                  <div className="flex-1">
                    <FileUploadField
                      label="Upload Document"
                      value={doc.document_id}
                      defaultName={
                        doc.document_name ||
                        doc.document?.original_name ||
                        doc.attachment?.original_name ||
                        doc.original_name
                      }
                      previewUrl={
                        doc.document_preview ||
                        doc.document?.path ||
                        doc.attachment?.path ||
                        doc.path ||
                        doc.attachment_url ||
                        doc.document?.attachment_url ||
                        doc.attachment?.attachment_url
                      }
                      onChange={(val) =>
                        handleDocChange(idx, "document_id", val)
                      }
                      placeholder="Attach File"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    className="text-red-500 hover:text-red-700 mt-6"
                    onClick={() => removeDoc(idx)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </section>

          {/* 6. Offer Tracking System (During Mediation) */}
          <section className="space-y-6">
            <h2 className="text-lg font-semibold">
              Offer Tracking System (During Mediation)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FloatingInput
                label="Opening Offer (Plaintiff)"
                name="opening_offer"
                type="number"
                value={formData.opening_offer}
                onChange={handleInputChange}
              />
              <FloatingInput
                label="Counter Offers (Defence)"
                name="counter_offers"
                type="number"
                value={formData.counter_offers}
                onChange={handleInputChange}
              />
              <FloatingInput
                label="Final Settlement Amount"
                name="final_settlement_amount"
                type="number"
                value={formData.final_settlement_amount}
                onChange={handleInputChange}
              />
            </div>
            {renderLogSection({
              title: "System Logs",
              logs: systemLogs,
              showForm: showSystemLogForm,
              setShowForm: setShowSystemLogForm,
              onSubmit: (e) => handleLogSubmit(e, "system"),
            })}
          </section>

          {/* 7. Client Authorization */}
          <section className="space-y-6">
            <h2 className="text-lg font-semibold">Client Authorization</h2>
            <div className="max-w-64">
              <FileUploadField
                label="Digital Consent Upload"
                value={formData.digital_consent_upload_id}
                defaultName={formData.digital_consent_upload_name}
                previewUrl={formData.digital_consent_preview}
                onChange={(val) =>
                  setFormData({ ...formData, digital_consent_upload_id: val })
                }
                placeholder="Upload Consent"
              />
            </div>

            {renderLogSection({
              title: "Client Logs",
              logs: clientLogs,
              showForm: showClientLogForm,
              setShowForm: setShowClientLogForm,
              onSubmit: (e) => handleLogSubmit(e, "client"),
            })}
          </section>

          {/* 9. If Settled */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold">If Settled</h2>
            <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-6 items-start">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FloatingInput
                  label="Settlement Amount"
                  name="settlement_amount"
                  type="number"
                  value={formData.settlement_amount}
                  onChange={handleInputChange}
                />

                <FloatingInput
                  label="Release Tracking"
                  name="release_tracking"
                  value={formData.release_tracking}
                  onChange={handleInputChange}
                />

                <FloatingInput
                  label="Payment Tracking"
                  name="payment_tracking"
                  value={formData.payment_tracking}
                  onChange={handleInputChange}
                />

                <FloatingInput
                  label="Trust Account Entry"
                  name="trust_account_entry"
                  value={formData.trust_account_entry}
                  onChange={handleInputChange}
                />
              </div>
              <div className="w-full md:max-w-sm -mt-8">
                <FileUploadField
                  label="Minutes of Settlement Upload"
                  value={formData.minutes_of_settlement_upload_id}
                  defaultName={formData.minutes_of_settlement_upload_name}
                  previewUrl={formData.minutes_of_settlement_preview}
                  onChange={(val) =>
                    setFormData({
                      ...formData,
                      minutes_of_settlement_upload_id: val,
                    })
                  }
                  placeholder="Upload Minutes"
                />
              </div>
            </div>
          </section>

          {/* 10. If Not Settled */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold">If Not Settled</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <FloatingInput
                label="Next Litigation Step"
                name="next_litigation_step"
                value={formData.next_litigation_step}
                onChange={handleInputChange}
              />
            </div>
            <div className="w-full md:max-w-sm">
              <FileUploadField
                label="Mediation Report Upload"
                value={formData.mediation_report_upload_upload_id}
                defaultName={formData.mediation_report_upload_upload_name}
                previewUrl={formData.mediation_report_preview}
                onChange={(val) =>
                  setFormData({
                    ...formData,
                    mediation_report_upload_upload_id: val,
                  })
                }
                placeholder="Upload Report"
              />
            </div>
          </section>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              type="button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saveMutation.isLoading || loadingMediation}
            >
              {saveMutation.isLoading ? "Saving..." : "Save Mediation"}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
