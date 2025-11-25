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
import { Loader2, Plus, Trash2, ChevronsUpDown, Check } from "lucide-react";
import { toast } from "sonner";
import { fetchSectionById } from "../../helpers/fetchSectionById";
import { getABMeta } from "../../helpers/fetchABMeta";
import { createSection, updateSection } from "../../helpers/createSection";
import { deleteSectionCommunication } from "../../helpers/deleteSectionCommunication";
import { deleteSectiondocument } from "../../helpers/deleteSectiondocument";
import { Navbar2 } from "@/components/navbar2";

// SearchableDropdown component
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
          <CommandInput placeholder="Search..." autoFocus />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {options?.map((opt) => (
                <CommandItem
                  key={opt.id}
                  value={opt.name}
                  onSelect={() => onSelect(fieldName, opt.id, popoverKey)}
                  className="cursor-pointer flex items-center"
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

const emptyComm = {
  date: "",
  mode_id: "",
  documents_received_id: "",
  reminder: "",
};

const emptyDocReq = {
  documents_requested_by_the_insurer_id: "",
  from_date: "",
  to_date: "",
  ambulance_cnr: "",
  medical_clinic_name: "",
  phone: "",
  fax: "",
  email: "",
  request_status_id: "",
  communications: [{ ...emptyComm }],
  expanded: false,
};

export default function Section33() {
  const { id, slug } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [popoverOpen, setPopoverOpen] = useState({});
  const isEditMode = Boolean(id);

  // Fetch meta info for dropdown options
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

  // Fetch existing section33 data for editing
  const { data: section33, isLoading: loadingSection33 } = useQuery({
    queryKey: ["section33", id],
    queryFn: () => fetchSectionById(id),
    enabled: isEditMode,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  // Delete mutations
  const deleteCommMutation = useMutation({
    mutationFn: (commId) => deleteSectionCommunication(commId),
    onSuccess: () => {
      toast.success("Communication deleted successfully!");
      queryClient.invalidateQueries(["section33", id]);
    },
    onError: (e) => toast.error(e.message || "Failed to delete communication"),
  });

  const deleteDocMutation = useMutation({
    mutationFn: (docId) => deleteSectiondocument(docId),
    onSuccess: () => {
      toast.success("Document deleted successfully!");
      queryClient.invalidateQueries(["section33", id]);
    },
    onError: (e) => toast.error(e.message || "Failed to delete document"),
  });

  // Main form state (includes first document fields)
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
    ambulance_cnr: "",
    medical_clinic_name: "",
    phone: "",
    fax: "",
    email: "",
    request_status_id: "",
    communications: [{ ...emptyComm }],
    expanded: false,
  });
  const [documentsRequested, setDocumentsRequested] = useState([]);

  useEffect(() => {
    if (section33 && isEditMode) {
      const requestedDocs = section33.requested_documents || [];
      const firstDoc = requestedDocs[0] || {};

      setMainForm({
        id: firstDoc.id ?? "",
        request_id: section33.request_id ?? "",
        s33_req_received: section33.s33_req_received ?? "",
        documents_requested_by_the_insurer_id: firstDoc.requested_id ?? "",
        from_date: firstDoc.from_date ?? "",
        to_date: firstDoc.to_date ?? "",
        deadline: section33.deadline ?? "",
        response_to_insurance: section33.response_to_insurance ?? "",
        s33_req_status_id: section33.s33_req_status_id ?? "",
        ambulance_cnr: firstDoc.ambulance_cnr ?? "",
        medical_clinic_name: firstDoc.medical_clinic_name ?? "",
        phone: firstDoc.phone ?? "",
        fax: firstDoc.fax ?? "",
        email: firstDoc.email ?? "",
        request_status_id: firstDoc.request_status_id ?? "",
        communications: firstDoc.communications?.length
          ? firstDoc.communications.map((c) => ({
              ...emptyComm,
              ...c,
            }))
          : [{ ...emptyComm }],
        expanded: !!firstDoc.requested_id,
      });

      setDocumentsRequested(
        requestedDocs.slice(1).map((doc) => ({
          ...emptyDocReq,
          id: doc.id,
          documents_requested_by_the_insurer_id: doc.requested_id ?? "",
          from_date: doc.from_date ?? "",
          to_date: doc.to_date ?? "",
          ambulance_cnr: doc.ambulance_cnr ?? "",
          medical_clinic_name: doc.medical_clinic_name ?? "",
          phone: doc.phone ?? "",
          fax: doc.fax ?? "",
          email: doc.email ?? "",
          request_status_id: doc.request_status_id ?? "",
          communications: doc.communications?.length
            ? doc.communications.map((c) => ({ ...emptyComm, ...c }))
            : [{ ...emptyComm }],
          expanded: !!doc.requested_id,
        }))
      );

      toast.success("Data loaded successfully!");
    } else if (!isEditMode) {
      setMainForm({
        id: "",
        request_id: "",
        s33_req_received: "",
        documents_requested_by_the_insurer_id: "",
        from_date: "",
        to_date: "",
        deadline: "",
        response_to_insurance: "",
        s33_req_status_id: "",
        ambulance_cnr: "",
        medical_clinic_name: "",
        phone: "",
        fax: "",
        email: "",
        request_status_id: "",
        communications: [{ ...emptyComm }],
        expanded: false,
      });
      setDocumentsRequested([]);
    }
  }, [section33, isEditMode]);

  // Helper to get label from options by id
  const getLabel = (id, arr) =>
    arr?.find((opt) => String(opt.id) === String(id))?.name || "";

  // Main form dropdown selection handler
  const handleMainSearchSelect = (fieldName, value, popKey) => {
    if (fieldName === "documents_requested_by_the_insurer_id") {
      setMainForm((prev) => ({
        ...prev,
        documents_requested_by_the_insurer_id: value,
        expanded: !!value,
      }));
      setPopoverOpen((p) => ({ ...p, [popKey]: false }));
    } else {
      setMainForm((prev) => ({ ...prev, [fieldName]: value }));
      setPopoverOpen((p) => ({ ...p, [popKey]: false }));
    }
  };

  // Communication handlers for main form
  const addMainComm = () =>
    setMainForm((prev) => ({
      ...prev,
      communications: [...prev.communications, { ...emptyComm }],
    }));

  const removeMainComm = (commIdx) => {
    const comm = mainForm.communications[commIdx];
    if (comm.id) {
      // If it has an ID, delete from server
      handleDeleteCommunication(comm.id);
    } else {
      // If no ID, just remove from state
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

  // Additional documents handlers
  const handleDocSearchSelect = (idx, fieldName, value, popKey) => {
    setDocumentsRequested((prev) =>
      prev.map((item, i) =>
        i === idx
          ? fieldName === "documents_requested_by_the_insurer_id"
            ? {
                ...item,
                [fieldName]: value,
                expanded: !!value,
              }
            : { ...item, [fieldName]: value }
          : item
      )
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
      // If it has an ID, delete from server
      handleDeleteDocument(doc.id);
    } else {
      // If no ID, just remove from state
      setDocumentsRequested((prev) => prev.filter((_, i) => i !== idx));
    }
  };

  // Communication inside documents handlers
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
      // If it has an ID, delete from server
      handleDeleteCommunication(comm.id);
    } else {
      // If no ID, just remove from state
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

  // Mutation for save/update
  const mutation = useMutation({
    mutationFn: ({ isEdit, idOrSlug, data }) =>
      isEdit
        ? updateSection(idOrSlug, data)
        : createSection({ slug: idOrSlug, data }),
    onSuccess: () => {
      toast.success(
        isEditMode ? "Updated successfully!" : "Created successfully!"
      );
      queryClient.invalidateQueries(["section33", id]);
    },
    onError: (e) => toast.error(e.message || "Failed to save"),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...mainForm,
      documents_requested: documentsRequested.map((doc) => ({
        ...doc,
        documents_requested_by_the_insurer_id:
          doc.documents_requested_by_the_insurer_id &&
          Number(doc.documents_requested_by_the_insurer_id) > 0
            ? Number(doc.documents_requested_by_the_insurer_id)
            : null,
        request_status_id:
          doc.request_status_id && Number(doc.request_status_id) > 0
            ? Number(doc.request_status_id)
            : null,
      })),
      documents_requested_by_the_insurer_id:
        mainForm.documents_requested_by_the_insurer_id > 0
          ? mainForm.documents_requested_by_the_insurer_id
          : null,
      s33_req_status_id:
        mainForm.s33_req_status_id > 0 ? mainForm.s33_req_status_id : null,
    };
    if (isEditMode) {
      mutation.mutate({ isEdit: true, idOrSlug: id, data: payload });
    } else {
      mutation.mutate({ isEdit: false, idOrSlug: slug, data: payload });
    }
  };

  // Delete handlers
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

  // NEW: Main document delete logic
  const handleDeleteMainDocument = () => {
    if (mainForm.id) {
      handleDeleteDocument(mainForm.id);
    }
    setMainForm({
      id: "",
      request_id: "",
      s33_req_received: "",
      documents_requested_by_the_insurer_id: "",
      from_date: "",
      to_date: "",
      deadline: "",
      response_to_insurance: "",
      s33_req_status_id: "",
      ambulance_cnr: "",
      medical_clinic_name: "",
      phone: "",
      fax: "",
      email: "",
      request_status_id: "",
      communications: [{ ...emptyComm }],
      expanded: false,
    });
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
    <div className="min-h-screen bg-gray-50">
      <Navbar2 />
      <form
        onSubmit={handleSubmit}
        className="container mx-auto px-6 py-8 max-w-7xl"
      >
        <div className="bg-white rounded-lg shadow-sm border p-8">
          {/* First document main fields */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-2">
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
              <Label>S33 REQ Received</Label>
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
                className="h-9 bg-gray-50 border-gray-300"
              />
            </div>
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
                className="h-9 bg-gray-50 border-gray-300"
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
                className="h-9 bg-gray-50 border-gray-300"
              />
            </div>
          </div>
          {/* Expanded first document additional fields */}
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
                    className="h-9 bg-gray-50 border-gray-300"
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
                    className="h-9 bg-gray-50 border-gray-300"
                    placeholder="Clinic Name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    value={mainForm.phone}
                    onChange={(e) =>
                      setMainForm((p) => ({ ...p, phone: e.target.value }))
                    }
                    className="h-9 bg-gray-50 border-gray-300"
                    placeholder="Phone"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Fax</Label>
                  <Input
                    value={mainForm.fax}
                    onChange={(e) =>
                      setMainForm((p) => ({ ...p, fax: e.target.value }))
                    }
                    className="h-9 bg-gray-50 border-gray-300"
                    placeholder="Fax"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    value={mainForm.email}
                    onChange={(e) =>
                      setMainForm((p) => ({ ...p, email: e.target.value }))
                    }
                    className="h-9 bg-gray-50 border-gray-300"
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
              {/* First document communications */}
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
                    className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-4 mb-3 border rounded-lg relative"
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
                        className="h-9 bg-gray-50 border-gray-300"
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
                      <Input
                        value={c.documents_received_id}
                        onChange={(e) =>
                          handleMainCommChange(
                            commIdx,
                            "documents_received_id",
                            e.target.value
                          )
                        }
                        className="h-9 bg-gray-50 border-gray-300"
                        placeholder="Doc ID"
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
                        className="h-9 bg-gray-50 border-gray-300"
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
              <div key={idx} className="mb-8 border rounded-lg p-6 bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-bold">Document {idx + 2}</div>
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
                      className="h-9 bg-gray-50 border-gray-300"
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
                      className="h-9 bg-gray-50 border-gray-300"
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
                          className="h-9 bg-gray-50 border-gray-300"
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
                          className="h-9 bg-gray-50 border-gray-300"
                          placeholder="Clinic Name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Phone</Label>
                        <Input
                          value={doc.phone}
                          onChange={(e) =>
                            handleDocSearchSelect(idx, "phone", e.target.value)
                          }
                          className="h-9 bg-gray-50 border-gray-300"
                          placeholder="Phone"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Fax</Label>
                        <Input
                          value={doc.fax}
                          onChange={(e) =>
                            handleDocSearchSelect(idx, "fax", e.target.value)
                          }
                          className="h-9 bg-gray-50 border-gray-300"
                          placeholder="Fax"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input
                          value={doc.email}
                          onChange={(e) =>
                            handleDocSearchSelect(idx, "email", e.target.value)
                          }
                          className="h-9 bg-gray-50 border-gray-300"
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
                          className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-4 mb-3 border rounded-lg relative"
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
                              className="h-9 bg-gray-50 border-gray-300"
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
                            <Input
                              value={c.documents_received_id}
                              onChange={(e) =>
                                handleCommChange(
                                  idx,
                                  commIdx,
                                  "documents_received_id",
                                  e.target.value
                                )
                              }
                              className="h-9 bg-gray-50 border-gray-300"
                              placeholder="Doc ID"
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
                              className="h-9 bg-gray-50 border-gray-300"
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
          {/* Bottom fields */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div className="space-y-2">
              <Label>Deadline</Label>
              <Input
                type="date"
                name="deadline"
                value={mainForm.deadline}
                onChange={(e) =>
                  setMainForm((p) => ({ ...p, deadline: e.target.value }))
                }
                className="h-9 bg-gray-50 border-gray-300"
              />
            </div>
            <div className="space-y-2">
              <Label>Response to Insurance</Label>
              <Input
                type="date"
                name="response_to_insurance"
                value={mainForm.response_to_insurance}
                onChange={(e) =>
                  setMainForm((p) => ({
                    ...p,
                    response_to_insurance: e.target.value,
                  }))
                }
                className="h-9 bg-gray-50 border-gray-300"
              />
            </div>
            <div className="space-y-2">
              <Label>S33 REQ Status</Label>
              <SearchableDropdown
                value={mainForm.s33_req_status_id}
                options={meta.insurance_status}
                onSelect={handleMainSearchSelect}
                placeholder="Select status"
                popoverKey="main_s33_req_status"
                fieldName="s33_req_status_id"
                popoverOpen={popoverOpen}
                setPopoverOpen={setPopoverOpen}
              />
            </div>
          </div>
          {/* Submit Buttons */}
          <div className="flex justify-end gap-4 pt-6 border-t mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
              disabled={mutation.isPending}
              size="lg"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending} size="lg">
              {mutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditMode ? "Updating..." : "Saving..."}
                </>
              ) : isEditMode ? (
                "Update Section 33"
              ) : (
                "Save Section 33"
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
