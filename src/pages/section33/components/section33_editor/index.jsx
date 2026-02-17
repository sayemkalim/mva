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
import { Loader2, Plus, Trash2, ChevronsUpDown, Check, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { fetchSectionById } from "../../helpers/fetchSectionById";
import { getABMeta } from "../../helpers/fetchABMeta";
import { createSection, updateSection } from "../../helpers/createSection";
import { deleteSectionCommunication } from "../../helpers/deleteSectionCommunication";
import { deleteSectiondocument } from "../../helpers/deleteSectiondocument";
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
  const selectedOption = options?.find(
    (opt) => String(opt.id) === String(value)
  );
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
const StatusRibbon = ({ statusName }) => {
  if (!statusName) return null;

  const getStatusColor = (name) => {
    const statusLower = name?.toLowerCase() || "";
    if (statusLower.includes("pending")) return "bg-yellow-500";
    if (statusLower.includes("fulfilled") || statusLower.includes("completed")) return "bg-green-500";
    if (statusLower.includes("rejected") || statusLower.includes("cancelled")) return "bg-red-500";
    if (statusLower.includes("in progress") || statusLower.includes("processing")) return "bg-blue-500";
    return "bg-purple-500";
  };

  return (
    <div className="absolute top-0 left-0 overflow-hidden w-24 h-24 pointer-events-none z-10">
      <div
        className={`${getStatusColor(statusName)} text-white text-[9.5px] font-bold uppercase py-0.5 px-6 transform -rotate-45 -translate-x-6 translate-y-4 shadow-md`}
      >
        {statusName}
      </div>
    </div>
  );
};


const DocumentStatusBadge = ({ statusName }) => {
  if (!statusName) return null;

  const getStatusColor = (name) => {
    const statusLower = name?.toLowerCase() || "";
    if (statusLower.includes("pending")) return "bg-yellow-500";
    if (statusLower.includes("fulfilled") || statusLower.includes("completed")) return "bg-green-500";
    if (statusLower.includes("rejected") || statusLower.includes("cancelled")) return "bg-red-500";
    if (statusLower.includes("in progress") || statusLower.includes("processing")) return "bg-blue-500";
    return "bg-purple-500";
  };

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1  text-white text-[9.5px] font-bold uppercase ">
      <div className="flex items-center gap-2">
        <span className={`${getStatusColor(statusName)} px-3 py-1 `}>
          {statusName}
        </span>
      </div>
    </div>
  );
};

const emptyComm = {
  id: null,
  date: "",
  mode_id: "",
  documents_received_id: "",
  reminder: "",
};

const emptyDocReq = {
  id: null,
  documents_requested_by_the_insurer_id: "",
  from_date: "",
  to_date: "",
  ambulance_cnr: "",
  medical_clinic_name: "",
  phone: "",
  fax: "",
  email: "",
  request_status_id: "",
  request_status_name: "",
  communications: [{ ...emptyComm }],
  expanded: false,
};

export default function Section33() {
  const { id, slug } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [popoverOpen, setPopoverOpen] = useState({});
  const isEditMode = Boolean(id);

  const {
    data: metaResp,
    isLoading: loadingMeta,
    isError: metaError,
    error: metaErrObj,
  } = useQuery({
    queryKey: ["section33Meta"],
    queryFn: getABMeta,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
  const meta = metaResp?.response || {};

  const { data: section33, isLoading: loadingSection33 } = useQuery({
    queryKey: ["section33", id],
    queryFn: () => fetchSectionById(id),
    enabled: isEditMode,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const deleteCommMutation = useMutation({
    mutationFn: (commId) => deleteSectionCommunication(commId),
    onSuccess: (data) => {
      const resp = data?.response;
      if (resp?.Apistatus === false) {
        toast.error(resp?.message || "Validation failed");
        return;
      }
      toast.success(resp?.message || "Communication deleted successfully!");
      queryClient.invalidateQueries(["section33", id]);
    },
    onError: (error) => {
      console.error("Mutation Error:", error);
      const errorData = error.response?.data;
      if (errorData?.Apistatus === false) {
        toast.error(errorData?.message || "Validation failed");
      } else {
        toast.error(errorData?.message || "Failed to delete communication");
      }
    },
  });

  const deleteDocMutation = useMutation({
    mutationFn: (docId) => deleteSectiondocument(docId),
    onSuccess: (data) => {
      const resp = data?.response;
      if (resp?.Apistatus === false) {
        toast.error(resp?.message || "Validation failed");
        return;
      }
      toast.success(resp?.message || "Document deleted successfully!");
      queryClient.invalidateQueries(["section33", id]);
    },
    onError: (error) => {
      console.error("Mutation Error:", error);
      const errorData = error.response?.data;
      if (errorData?.Apistatus === false) {
        toast.error(errorData?.message || "Validation failed");
      } else {
        toast.error(errorData?.message || "Failed to delete document");
      }
    },
  });

  const [mainForm, setMainForm] = useState({
    id: "",
    request_id: "",
    s33_req_received: "",
    documents_requested_by_the_insurer_id: "",
    from_date: "",
    to_date: "",
    deadline: "",
    response_to_insurance: "",
    s33_req_status_id: "",
    s33_req_status_name: "",
    ambulance_cnr: "",
    medical_clinic_name: "",
    phone: "",
    fax: "",
    email: "",
    request_status_id: "",
    request_status_name: "",
    main_doc_id: null,
    communications: [{ ...emptyComm }],
    expanded: false,
  });
  const [documentsRequested, setDocumentsRequested] = useState([]);

  useEffect(() => {
    if (section33 && isEditMode) {
      const docs = section33.requested_documents || [];

      if (docs.length > 0) {
        const firstDoc = docs[0];

        setMainForm({
          id: section33.id ?? "",
          request_id: section33.request_id ?? "",
          s33_req_received: section33.s33_req_received ?? "",
          documents_requested_by_the_insurer_id: firstDoc.requested_id ?? "",
          from_date: firstDoc.from_date ?? "",
          to_date: firstDoc.to_date ?? "",
          ambulance_cnr: firstDoc.ambulance_cnr ?? "",
          medical_clinic_name: firstDoc.medical_clinic_name ?? "",
          phone: firstDoc.phone ?? "",
          fax: firstDoc.fax ?? "",
          email: firstDoc.email ?? "",
          request_status_id: firstDoc.request_status_id ?? "",
          request_status_name: firstDoc.status?.name ?? "",
          deadline: section33.deadline ?? "",
          response_to_insurance: section33.response_to_insurance ?? "",
          s33_req_status_id: section33.s33_req_status_id ?? "",
          s33_req_status_name: section33.status?.name ?? "",
          expanded: !!firstDoc.requested_id,
          main_doc_id: firstDoc.id ?? null,
          communications: (firstDoc.communications || []).map((c) => ({
            ...emptyComm,
            ...c,
          })) || [{ ...emptyComm }],
        });

        setDocumentsRequested(
          docs.slice(1).map((doc) => ({
            ...emptyDocReq,
            id: doc.id ?? null,
            documents_requested_by_the_insurer_id: doc.requested_id ?? "",
            from_date: doc.from_date ?? "",
            to_date: doc.to_date ?? "",
            ambulance_cnr: doc.ambulance_cnr ?? "",
            medical_clinic_name: doc.medical_clinic_name ?? "",
            phone: doc.phone ?? "",
            fax: doc.fax ?? "",
            email: doc.email ?? "",
            request_status_id: doc.request_status_id ?? "",
            request_status_name: doc.status?.name ?? "",
            expanded: !!doc.requested_id,
            communications: (doc.communications || []).map((c) => ({
              ...emptyComm,
              ...c,
            })) || [{ ...emptyComm }],
          }))
        );
      } else {
        setMainForm({
          id: section33.id ?? "",
          request_id: section33.request_id ?? "",
          s33_req_received: section33.s33_req_received ?? "",
          documents_requested_by_the_insurer_id: "",
          from_date: "",
          to_date: "",
          ambulance_cnr: "",
          medical_clinic_name: "",
          phone: "",
          fax: "",
          email: "",
          request_status_id: "",
          request_status_name: "",
          deadline: section33.deadline ?? "",
          response_to_insurance: section33.response_to_insurance ?? "",
          s33_req_status_id: section33.s33_req_status_id ?? "",
          s33_req_status_name: section33.status?.name ?? "",
          expanded: false,
          main_doc_id: null,
          communications: [{ ...emptyComm }],
        });
        setDocumentsRequested([]);
      }
    }
  }, [section33, isEditMode]);

  const getLabel = (id, arr) =>
    arr?.find((opt) => String(opt.id) === String(id))?.name || "";

  const handleMainSearchSelect = (fieldName, value, popKey) => {
    if (fieldName === "documents_requested_by_the_insurer_id") {
      setMainForm((prev) => {
        const newVal = prev[fieldName] === value ? "" : value;
        return {
          ...prev,
          documents_requested_by_the_insurer_id: newVal,
          expanded: !!newVal,
        };
      });
      setPopoverOpen((p) => ({ ...p, [popKey]: false }));
    } else if (fieldName === "s33_req_status_id") {
      setMainForm((prev) => {
        const newVal = prev[fieldName] === value ? "" : value;
        const statusName = newVal ? getLabel(newVal, meta.insurance_section_request) : "";
        return {
          ...prev,
          s33_req_status_id: newVal,
          s33_req_status_name: statusName,
        };
      });
      setPopoverOpen((p) => ({ ...p, [popKey]: false }));
    } else if (fieldName === "request_status_id") {
      setMainForm((prev) => {
        const newVal = prev[fieldName] === value ? "" : value;
        const statusName = newVal ? getLabel(newVal, meta.insurance_status) : "";
        return {
          ...prev,
          request_status_id: newVal,
          request_status_name: statusName,
        };
      });
      setPopoverOpen((p) => ({ ...p, [popKey]: false }));
    } else {
      setMainForm((prev) => ({
        ...prev,
        [fieldName]: prev[fieldName] === value ? "" : value,
      }));
      setPopoverOpen((p) => ({ ...p, [popKey]: false }));
    }
  };

  const addMainComm = () =>
    setMainForm((prev) => ({
      ...prev,
      communications: [...prev.communications, { ...emptyComm }],
    }));

  const removeMainComm = (commIdx) => {
    const comm = mainForm.communications[commIdx];
    if (comm.id) {
      handleDeleteCommunication(comm.id);
    } else {
      setMainForm((prev) => ({
        ...prev,
        communications: prev.communications.filter((_, i) => i !== commIdx),
      }));
    }
  };

  const handleMainCommChange = (commIdx, key, value) =>
    setMainForm((prev) => ({
      ...prev,
      communications: prev.communications.map((c, i) =>
        i === commIdx ? { ...c, [key]: value } : c
      ),
    }));

  const handleMainCommSearchSelect = (commIdx, fieldName, value, popKey) => {
    handleMainCommChange(commIdx, fieldName, value);
    setPopoverOpen((p) => ({ ...p, [popKey]: false }));
  };

  const handleDocSearchSelect = (idx, fieldName, value, popKey) => {
    setDocumentsRequested((prev) =>
      prev.map((item, i) => {
        if (i === idx) {
          const newVal = item[fieldName] === value ? "" : value;
          if (fieldName === "documents_requested_by_the_insurer_id") {
            return {
              ...item,
              [fieldName]: newVal,
              expanded: !!newVal,
            };
          } else if (fieldName === "request_status_id") {
            const statusName = newVal ? getLabel(newVal, meta.insurance_status) : "";
            return {
              ...item,
              request_status_id: newVal,
              request_status_name: statusName,
            };
          } else {
            return { ...item, [fieldName]: newVal };
          }
        }
        return item;
      })
    );
    if (popKey) {
      setPopoverOpen((p) => ({ ...p, [popKey]: false }));
    }
  };

  const addDocReq = () =>
    setDocumentsRequested((prev) => [...prev, { ...emptyDocReq }]);

  const removeDocReq = (idx) => {
    const doc = documentsRequested[idx];
    if (doc.id) {
      handleDeleteDocument(doc.id);
    } else {
      setDocumentsRequested((prev) => prev.filter((_, i) => i !== idx));
    }
  };

  const addComm = (docIdx) =>
    setDocumentsRequested((prev) =>
      prev.map((doc, idx) =>
        idx === docIdx
          ? {
            ...doc,
            communications: [...doc.communications, { ...emptyComm }],
          }
          : doc
      )
    );

  const removeComm = (docIdx, commIdx) => {
    const comm = documentsRequested[docIdx].communications[commIdx];
    if (comm.id) {
      handleDeleteCommunication(comm.id);
    } else {
      setDocumentsRequested((prev) =>
        prev.map((doc, di) =>
          di === docIdx
            ? {
              ...doc,
              communications: doc.communications.filter(
                (_, i) => i !== commIdx
              ),
            }
            : doc
        )
      );
    }
  };

  const handleCommChange = (docIdx, commIdx, key, value) => {
    setDocumentsRequested((prev) =>
      prev.map((doc, di) =>
        di === docIdx
          ? {
            ...doc,
            communications: doc.communications.map((c, ci) =>
              ci === commIdx ? { ...c, [key]: value } : c
            ),
          }
          : doc
      )
    );
  };

  const handleCommSearchSelect = (
    docIdx,
    commIdx,
    fieldName,
    value,
    popKey
  ) => {
    handleCommChange(docIdx, commIdx, fieldName, value);
    setPopoverOpen((p) => ({ ...p, [popKey]: false }));
  };

  const mutation = useMutation({
    mutationFn: ({ isEdit, idOrSlug, data }) =>
      isEdit
        ? updateSection(idOrSlug, data)
        : createSection({ slug: idOrSlug, data }),
    onSuccess: (data) => {
      const resp = data?.response || data;

      console.log("API Success Response:", resp);

      if (resp.Apistatus === true) {
        toast.success(
          resp.message ||
          (isEditMode
            ? "Record updated successfully!"
            : "Record created successfully!")
        );
        queryClient.invalidateQueries(["section33", id]);
        navigate(-1);
      } else {
        toast.error(resp.message || "Operation failed. Please try again.");
      }
    },

    onError: (error) => {
      console.error("Mutation Error:", error);
      const errorData = error.response?.data;
      if (errorData?.Apistatus === false) {
        toast.error(errorData?.message || "Validation failed");
      } else {
        toast.error(errorData?.message || "Operation failed. Please try again.");
      }
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    const mainCommsPayload = (mainForm.communications || []).map((c) => ({
      id: c.id ?? null,
      date: c.date,
      mode_id: c.mode_id,
      documents_received_id: c.documents_received_id,
      reminder: c.reminder,
    }));

    const docsPayload = [
      {
        id: mainForm.main_doc_id ?? null,
        requested_id: mainForm.documents_requested_by_the_insurer_id,
        from_date: mainForm.from_date,
        to_date: mainForm.to_date,
        ambulance_cnr: mainForm.ambulance_cnr,
        medical_clinic_name: mainForm.medical_clinic_name,
        phone: mainForm.phone,
        fax: mainForm.fax,
        email: mainForm.email,
        request_status_id: mainForm.request_status_id,
        communications: mainCommsPayload,
      },
      ...documentsRequested.map((doc) => ({
        id: doc.id ?? null,
        requested_id: doc.documents_requested_by_the_insurer_id,
        from_date: doc.from_date,
        to_date: doc.to_date,
        ambulance_cnr: doc.ambulance_cnr,
        medical_clinic_name: doc.medical_clinic_name,
        phone: doc.phone,
        fax: doc.fax,
        email: doc.email,
        request_status_id: doc.request_status_id,
        communications: (doc.communications || []).map((c) => ({
          id: c.id ?? null,
          date: c.date,
          mode_id: c.mode_id,
          documents_received_id: c.documents_received_id,
          reminder: c.reminder,
        })),
      })),
    ];

    const payload = {
      id: mainForm.id || null,
      request_id: mainForm.request_id,
      s33_req_received: mainForm.s33_req_received,
      documents_requested_by_the_insurer_id:
        mainForm.documents_requested_by_the_insurer_id,
      from_date: mainForm.from_date,
      to_date: mainForm.to_date,
      deadline: mainForm.deadline,
      response_to_insurance: mainForm.response_to_insurance,
      s33_req_status_id: mainForm.s33_req_status_id,
      ambulance_cnr: mainForm.ambulance_cnr,
      medical_clinic_name: mainForm.medical_clinic_name,
      phone: mainForm.phone,
      fax: mainForm.fax,
      email: mainForm.email,
      request_status_id: mainForm.request_status_id,
      communications: mainCommsPayload,
      documents_requested: docsPayload,
    };

    if (isEditMode) {
      mutation.mutate({ isEdit: true, idOrSlug: id, data: payload });
    } else {
      mutation.mutate({ isEdit: false, idOrSlug: slug, data: payload });
    }
  };

  const handleDeleteDocument = (docId) => {
    if (!docId) {
      toast.error("Document does not have a valid ID to delete.");
      return;
    }
    deleteDocMutation.mutate(docId);
  };

  const handleDeleteCommunication = (commId) => {
    if (!commId) {
      toast.error("Communication does not have a valid ID to delete.");
      return;
    }
    deleteCommMutation.mutate(commId);
  };

  const handleDeleteMainDocument = () => {
    if (mainForm.main_doc_id) {
      handleDeleteDocument(mainForm.main_doc_id);
    }
    setMainForm((prev) => ({
      ...prev,
      documents_requested_by_the_insurer_id: "",
      from_date: "",
      to_date: "",
      deadline: prev.deadline,
      response_to_insurance: prev.response_to_insurance,
      s33_req_status_id: prev.s33_req_status_id,
      s33_req_status_name: prev.s33_req_status_name,
      ambulance_cnr: "",
      medical_clinic_name: "",
      phone: "",
      fax: "",
      email: "",
      request_status_id: "",
      request_status_name: "",
      main_doc_id: null,
      communications: [{ ...emptyComm }],
      expanded: false,
    }));
  };

  if (loadingMeta || (isEditMode && loadingSection33)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">
          {isEditMode ? "Loading data..." : "Loading form..."}
        </span>
      </div>
    );
  }
  if (metaError) {
    return (
      <div className="text-red-500">
        Meta Error: {metaErrObj?.message || "Meta fetch failed"}
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
            onClick={() => navigate(-1)}
            className="hover:text-foreground transition"
          >
            Section 33 List
          </button>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground font-medium">Section 33 </span>
        </div>
      </div>
      <form
        onSubmit={handleSubmit}
        className="container mx-auto px-6 py-8 max-w-7xl"
      >
        <div className="bg-card rounded-lg shadow-sm border p-8 relative overflow-hidden">
          {/* S33 Request Status Ribbon - Only in Edit Mode */}
          {isEditMode && mainForm.s33_req_status_name && (
            <StatusRibbon statusName={mainForm.s33_req_status_name} />
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="space-y-2">
              <Label>Request</Label>
              <SearchableDropdown
                value={mainForm.request_id}
                options={meta.insurance_request}
                onSelect={handleMainSearchSelect}
                placeholder="Select request"
                popoverKey="request_id"
                fieldName="request_id"
                popoverOpen={popoverOpen}
                setPopoverOpen={setPopoverOpen}
              />
            </div>
            <div className="space-y-2">
              <Label>S33 REQ Requested Received</Label>
              <Input
                type="date"
                name="s33_req_received"
                value={mainForm.s33_req_received}
                onChange={(e) =>
                  setMainForm((p) => ({
                    ...p,
                    s33_req_received: e.target.value,
                  }))
                }
                className="h-9 bg-muted border-input"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 mb-6">
            <Label className="text-lg font-bold">DOCUMENTS REQUESTED (1)</Label>
            {isEditMode && mainForm.expanded && mainForm.request_status_name && (
              <DocumentStatusBadge statusName={mainForm.request_status_name} />
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-2">
            <div className="space-y-2">
              <Label>Documents Requested by the Insurer</Label>
              <SearchableDropdown
                value={mainForm.documents_requested_by_the_insurer_id}
                options={meta.insurance_documents_requested_by_the_insurer}
                onSelect={handleMainSearchSelect}
                placeholder="Select document"
                popoverKey="documents_requested_by_the_insurer_id"
                fieldName="documents_requested_by_the_insurer_id"
                popoverOpen={popoverOpen}
                setPopoverOpen={setPopoverOpen}
              />
            </div>
            <div className="space-y-2">
              <Label>From</Label>
              <Input
                type="date"
                name="from_date"
                value={mainForm.from_date}
                onChange={(e) =>
                  setMainForm((p) => ({ ...p, from_date: e.target.value }))
                }
                className="h-9 bg-muted border-input"
              />
            </div>
            <div className="space-y-2">
              <Label>To</Label>
              <Input
                type="date"
                name="to_date"
                value={mainForm.to_date}
                onChange={(e) =>
                  setMainForm((p) => ({ ...p, to_date: e.target.value }))
                }
                className="h-9 bg-muted border-input"
              />
            </div>
          </div>

          {mainForm.expanded && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                <div className="space-y-2">
                  <Label>
                    {getLabel(
                      mainForm.documents_requested_by_the_insurer_id,
                      meta.insurance_documents_requested_by_the_insurer
                    ) || "Ambulance CNR"}
                  </Label>
                  <Input
                    value={mainForm.ambulance_cnr}
                    onChange={(e) =>
                      setMainForm((p) => ({
                        ...p,
                        ambulance_cnr: e.target.value,
                      }))
                    }
                    className="h-9 bg-muted border-input"
                    placeholder="Reference Number"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Medical Clinic Name</Label>
                  <Input
                    value={mainForm.medical_clinic_name}
                    onChange={(e) =>
                      setMainForm((p) => ({
                        ...p,
                        medical_clinic_name: e.target.value,
                      }))
                    }
                    className="h-9 bg-muted border-input"
                    placeholder="Clinic Name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    value={mainForm.phone}
                    onChange={(e) =>
                      setMainForm((p) => ({ ...p, phone: formatPhoneNumber(e.target.value) }))
                    }
                    className="h-9 bg-muted border-input"
                    placeholder="(888) 888-8888"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Fax</Label>
                  <Input
                    value={mainForm.fax}
                    onChange={(e) =>
                      setMainForm((p) => ({ ...p, fax: formatPhoneNumber(e.target.value) }))
                    }
                    className="h-9 bg-muted border-input"
                    placeholder="(888) 888-8888"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    value={mainForm.email}
                    onChange={(e) =>
                      setMainForm((p) => ({ ...p, email: e.target.value }))
                    }
                    className="h-9 bg-muted border-input"
                    placeholder="Email"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Request Status</Label>
                  <SearchableDropdown
                    value={mainForm.request_status_id}
                    options={meta.insurance_status}
                    onSelect={handleMainSearchSelect}
                    placeholder="Select status"
                    popoverKey="main_request_status"
                    fieldName="request_status_id"
                    popoverOpen={popoverOpen}
                    setPopoverOpen={setPopoverOpen}
                  />
                </div>
              </div>

              <div className="mt-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold">Communications</span>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={addMainComm}
                  >
                    <Plus className="h-4 w-4 mr-2" /> Add Communication
                  </Button>
                </div>
                {mainForm.communications.map((c, commIdx) => (
                  <div
                    key={commIdx}
                    className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-card p-4 mb-3 border rounded-lg relative"
                  >
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="absolute top-2 right-2"
                      onClick={() => removeMainComm(commIdx)}
                    >
                      <Trash2 className="h-4 w-4 text-red-400" />
                    </Button>
                    <div className="space-y-2">
                      <Label>Communication Date</Label>
                      <Input
                        type="date"
                        value={c.date}
                        onChange={(e) =>
                          handleMainCommChange(commIdx, "date", e.target.value)
                        }
                        className="h-9 bg-muted border-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Mode of Communication</Label>
                      <SearchableDropdown
                        value={c.mode_id}
                        options={meta.insurance_mode_of_communication}
                        onSelect={(fieldName, value, popKey) =>
                          handleMainCommSearchSelect(
                            commIdx,
                            fieldName,
                            value,
                            popKey
                          )
                        }
                        placeholder="Select mode"
                        popoverKey={`main_comm_mode_${commIdx}`}
                        fieldName="mode_id"
                        popoverOpen={popoverOpen}
                        setPopoverOpen={setPopoverOpen}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Documents Received</Label>
                      <SearchableDropdown
                        value={c.documents_received_id}
                        options={meta.yes_no_option}
                        onSelect={(fieldName, value, popKey) =>
                          handleMainCommSearchSelect(
                            commIdx,
                            fieldName,
                            value,
                            popKey
                          )
                        }
                        placeholder="Select received document"
                        popoverKey={`main_comm_doc_received_${commIdx}`}
                        fieldName="documents_received_id"
                        popoverOpen={popoverOpen}
                        setPopoverOpen={setPopoverOpen}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>1st Reminder</Label>
                      <Input
                        type="date"
                        value={c.reminder}
                        onChange={(e) =>
                          handleMainCommChange(
                            commIdx,
                            "reminder",
                            e.target.value
                          )
                        }
                        className="h-9 bg-muted border-input"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          <div className="flex gap-4 mb-4 mt-4">
            <Button
              type="button"
              onClick={addDocReq}
              variant="outline"
              size="sm"
            >
              + Add Document
            </Button>
            <Button
              type="button"
              onClick={handleDeleteMainDocument}
              variant="destructive"
              size="sm"
              className="ml-2"
            >
              <Trash2 className="h-4 w-4 mr-2" /> Delete Document
            </Button>
          </div>

          {documentsRequested.map((doc, idx) => {
            const selectedDocLabel =
              getLabel(
                doc.documents_requested_by_the_insurer_id,
                meta.insurance_documents_requested_by_the_insurer
              ) || "Ambulance CNR";
            return (
              <div key={idx} className="mb-8 border rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="font-bold">DOCUMENTS REQUESTED ({idx + 2})</div>
                    {/* Horizontal Document Status Badge for Additional Documents - Only in Edit Mode */}
                    {isEditMode && doc.expanded && doc.request_status_name && (
                      <DocumentStatusBadge statusName={doc.request_status_name} />
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removeDocReq(idx)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" /> Remove
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label>Documents Requested by the Insurer</Label>
                    <SearchableDropdown
                      value={doc.documents_requested_by_the_insurer_id}
                      options={
                        meta.insurance_documents_requested_by_the_insurer
                      }
                      onSelect={(fieldName, value, popKey) =>
                        handleDocSearchSelect(idx, fieldName, value, popKey)
                      }
                      placeholder="Select document"
                      popoverKey={`requested_doc_${idx}`}
                      fieldName="documents_requested_by_the_insurer_id"
                      popoverOpen={popoverOpen}
                      setPopoverOpen={setPopoverOpen}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>From</Label>
                    <Input
                      type="date"
                      value={doc.from_date}
                      onChange={(e) =>
                        handleDocSearchSelect(idx, "from_date", e.target.value)
                      }
                      className="h-9 bg-muted border-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>To</Label>
                    <Input
                      type="date"
                      value={doc.to_date}
                      onChange={(e) =>
                        handleDocSearchSelect(idx, "to_date", e.target.value)
                      }
                      className="h-9 bg-muted border-input"
                    />
                  </div>
                </div>
                {doc.expanded && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                      <div className="space-y-2">
                        <Label>{selectedDocLabel}</Label>
                        <Input
                          value={doc.ambulance_cnr}
                          onChange={(e) =>
                            handleDocSearchSelect(
                              idx,
                              "ambulance_cnr",
                              e.target.value
                            )
                          }
                          className="h-9 bg-muted border-input"
                          placeholder={`${selectedDocLabel} Ref No`}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Medical Clinic Name</Label>
                        <Input
                          value={doc.medical_clinic_name}
                          onChange={(e) =>
                            handleDocSearchSelect(
                              idx,
                              "medical_clinic_name",
                              e.target.value
                            )
                          }
                          className="h-9 bg-muted border-input"
                          placeholder="Clinic Name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Phone</Label>
                        <Input
                          value={doc.phone}
                          onChange={(e) =>
                            handleDocSearchSelect(idx, "phone", formatPhoneNumber(e.target.value))
                          }
                          className="h-9 bg-muted border-input"
                          placeholder="(888) 888-8888"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Fax</Label>
                        <Input
                          value={doc.fax}
                          onChange={(e) =>
                            handleDocSearchSelect(idx, "fax", formatPhoneNumber(e.target.value))
                          }
                          className="h-9 bg-muted border-input"
                          placeholder="(888) 888-8888"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input
                          value={doc.email}
                          onChange={(e) =>
                            handleDocSearchSelect(idx, "email", e.target.value)
                          }
                          className="h-9 bg-muted border-input"
                          placeholder="Email"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Request Status</Label>
                        <SearchableDropdown
                          value={doc.request_status_id}
                          options={meta.insurance_status}
                          onSelect={(fieldName, value, popKey) =>
                            handleDocSearchSelect(idx, fieldName, value, popKey)
                          }
                          placeholder="Select status"
                          popoverKey={`doc_request_status_${idx}`}
                          fieldName="request_status_id"
                          popoverOpen={popoverOpen}
                          setPopoverOpen={setPopoverOpen}
                        />
                      </div>
                    </div>
                    <div className="mt-6">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold">Communications</span>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => addComm(idx)}
                        >
                          <Plus className="h-4 w-4 mr-2" /> Add Communication
                        </Button>
                      </div>
                      {doc.communications.map((c, commIdx) => (
                        <div
                          key={commIdx}
                          className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-card p-4 mb-3 border rounded-lg relative"
                        >
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="absolute top-2 right-2"
                            onClick={() => removeComm(idx, commIdx)}
                          >
                            <Trash2 className="h-4 w-4 text-red-400" />
                          </Button>
                          <div className="space-y-2">
                            <Label>Communication Date</Label>
                            <Input
                              type="date"
                              value={c.date}
                              onChange={(e) =>
                                handleCommChange(
                                  idx,
                                  commIdx,
                                  "date",
                                  e.target.value
                                )
                              }
                              className="h-9 bg-muted border-input"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Mode of Communication</Label>
                            <SearchableDropdown
                              value={c.mode_id}
                              options={meta.insurance_mode_of_communication}
                              onSelect={(fieldName, value, popKey) =>
                                handleCommSearchSelect(
                                  idx,
                                  commIdx,
                                  fieldName,
                                  value,
                                  popKey
                                )
                              }
                              placeholder="Select mode"
                              popoverKey={`doc_comm_mode_${idx}_${commIdx}`}
                              fieldName="mode_id"
                              popoverOpen={popoverOpen}
                              setPopoverOpen={setPopoverOpen}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Documents Received</Label>
                            <SearchableDropdown
                              value={c.documents_received_id}
                              options={meta.yes_no_option}
                              onSelect={(fieldName, value, popKey) =>
                                handleCommSearchSelect(
                                  idx,
                                  commIdx,
                                  fieldName,
                                  value,
                                  popKey
                                )
                              }
                              placeholder="Select received document"
                              popoverKey={`doc_comm_doc_received_${idx}_${commIdx}`}
                              fieldName="documents_received_id"
                              popoverOpen={popoverOpen}
                              setPopoverOpen={setPopoverOpen}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>1st Reminder</Label>
                            <Input
                              type="date"
                              value={c.reminder}
                              onChange={(e) =>
                                handleCommChange(
                                  idx,
                                  commIdx,
                                  "reminder",
                                  e.target.value
                                )
                              }
                              className="h-9 bg-muted border-input"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            );
          })}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div className="space-y-2">
              <Label>Deadline</Label>
              <Input
                type="date"
                value={mainForm.deadline}
                onChange={(e) =>
                  setMainForm((p) => ({ ...p, deadline: e.target.value }))
                }
                className="h-9 bg-muted border-input"
              />
            </div>
            <div className="space-y-2">
              <Label>Response to Insurance</Label>
              <Input
                type="date"
                value={mainForm.response_to_insurance}
                onChange={(e) =>
                  setMainForm((p) => ({
                    ...p,
                    response_to_insurance: e.target.value,
                  }))
                }
                className="h-9 bg-muted border-input"
              />
            </div>
            <div className="space-y-2">
              <Label>S33 REQ Status</Label>
              <SearchableDropdown
                value={mainForm.s33_req_status_id}
                options={meta.insurance_section_request}
                onSelect={handleMainSearchSelect}
                placeholder="Select status"
                popoverKey="s33_req_status_id"
                fieldName="s33_req_status_id"
                popoverOpen={popoverOpen}
                setPopoverOpen={setPopoverOpen}
              />
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-8">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : isEditMode ? (
                "Update"
              ) : (
                "Save"
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
