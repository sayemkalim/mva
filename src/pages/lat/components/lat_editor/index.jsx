import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, ChevronRight, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { fetchSectionById } from "../../helpers/fetchSectionById";
import { getABMeta } from "../../helpers/fetchABMeta";
import { createSection, updateSection } from "../../helpers/createSection";
import { Navbar2 } from "@/components/navbar2";

export default function Section33() {
  const { id } = useParams();
  const { slug } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

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

  const emptyDocReq = {
    requested_id: "",
    from_date: "",
    to_date: "",
    ambulance_cnr: "",
    medical_clinic_name: "",
    phone: "",
    fax: "",
    email: "",
    request_status_id: "",
    communications: [
      { date: "", mode_id: "", documents_received_id: "", reminder: "" },
    ],
  };

  const emptyComm = {
    date: "",
    mode_id: "",
    documents_received_id: "",
    reminder: "",
  };

  const [form, setForm] = useState({
    request_id: "",
    s33_req_received: "",
    documents_requested_by_the_insurer_id: "",
    from_date: "",
    to_date: "",
    deadline: "",
    response_to_insurance: "",
    s33_req_status_id: "",
    documents_requested: [{ ...emptyDocReq }],
  });
  useEffect(() => {
    if (section33 && isEditMode) {
      setForm({
        request_id: section33.request_id || "",
        s33_req_received: section33.s33_req_received || "",
        documents_requested_by_the_insurer_id:
          section33.documents_requested_by_the_insurer_id || "",
        from_date: section33.from_date || "",
        to_date: section33.to_date || "",
        deadline: section33.deadline || "",
        response_to_insurance: section33.response_to_insurance || "",
        s33_req_status_id: section33.s33_req_status_id || "",
        documents_requested:
          section33.requested_documents && section33.requested_documents.length
            ? section33.requested_documents.map((doc) => ({
                id: doc.id || null,
                requested_id: doc.requested_id || "",
                from_date: doc.from_date || "",
                to_date: doc.to_date || "",
                ambulance_cnr: doc.ambulance_cnr || "",
                medical_clinic_name: doc.medical_clinic_name || "",
                phone: doc.phone || "",
                fax: doc.fax || "",
                email: doc.email || "",
                request_status_id: doc.request_status_id || "",
                communications:
                  doc.communications && doc.communications.length
                    ? doc.communications.map((comm) => ({
                        id: comm.id || null,
                        date: comm.date || "",
                        mode_id: comm.mode_id || "",
                        documents_received_id: comm.documents_received_id || "",
                        reminder: comm.reminder || "",
                      }))
                    : [{ ...emptyComm }],
              }))
            : [{ ...emptyDocReq }],
      });
      toast.success("Data loaded successfully!");
    }
    if (!isEditMode) {
      setForm({
        request_id: "",
        s33_req_received: "",
        documents_requested_by_the_insurer_id: "",
        from_date: "",
        to_date: "",
        deadline: "",
        response_to_insurance: "",
        s33_req_status_id: "",
        documents_requested: [{ ...emptyDocReq }],
      });
    }
  }, [section33, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelect = (name, val) =>
    setForm((prev) => ({ ...prev, [name]: Number(val) }));

  const updateDocReq = (idx, key, val) =>
    setForm((prev) => ({
      ...prev,
      documents_requested: prev.documents_requested.map((d, i) =>
        i === idx ? { ...d, [key]: val } : d
      ),
    }));

  const updateComm = (docIdx, commIdx, key, val) =>
    setForm((prev) => ({
      ...prev,
      documents_requested: prev.documents_requested.map((d, i) =>
        i === docIdx
          ? {
              ...d,
              communications: d.communications.map((c, ci) =>
                ci === commIdx ? { ...c, [key]: val } : c
              ),
            }
          : d
      ),
    }));

  const addDocReq = () =>
    setForm((prev) => ({
      ...prev,
      documents_requested: [...prev.documents_requested, { ...emptyDocReq }],
    }));

  const removeDocReq = (idx) =>
    setForm((prev) => ({
      ...prev,
      documents_requested: prev.documents_requested.filter((_, i) => i !== idx),
    }));

  const addComm = (docIdx) =>
    setForm((prev) => ({
      ...prev,
      documents_requested: prev.documents_requested.map((d, i) =>
        i === docIdx
          ? { ...d, communications: [...d.communications, { ...emptyComm }] }
          : d
      ),
    }));

  const removeComm = (docIdx, commIdx) =>
    setForm((prev) => ({
      ...prev,
      documents_requested: prev.documents_requested.map((d, i) =>
        i === docIdx
          ? {
              ...d,
              communications: d.communications.filter(
                (_, ci) => ci !== commIdx
              ),
            }
          : d
      ),
    }));

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

    const safeDocumentsRequestedByInsurerId =
      form.documents_requested_by_the_insurer_id > 0
        ? form.documents_requested_by_the_insurer_id
        : null;
    const safeS33ReqStatusId =
      form.s33_req_status_id > 0 ? form.s33_req_status_id : null;
    const safeDocumentsRequested = form.documents_requested.map((doc) => ({
      ...doc,
      requested_id:
        doc.requested_id && Number(doc.requested_id) > 0
          ? Number(doc.requested_id)
          : null,
    }));

    const payload = {
      ...form,
      documents_requested_by_the_insurer_id: safeDocumentsRequestedByInsurerId,
      s33_req_status_id: safeS33ReqStatusId,
      documents_requested: safeDocumentsRequested,
    };

    if (isEditMode) {
      mutation.mutate({ isEdit: true, idOrSlug: id, data: payload });
    } else {
      mutation.mutate({ isEdit: false, idOrSlug: slug, data: payload });
    }
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

  const getLabel = (id, arr) =>
    arr?.find((opt) => String(opt.id) === String(id))?.name || "";

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
          <span className="text-gray-900 font-medium">Section 33</span>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-7xl">
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <h1 className="text-2xl font-bold mb-8 text-gray-900 uppercase">
            {isEditMode
              ? "Edit Section 33 Insurer Request"
              : "Add Section 33 Insurer Request"}
          </h1>

          <form onSubmit={handleSubmit} className="space-y-10">
            {/* Main info fields */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="s33_req_received">
                  Section 33 Request Received
                </Label>
                <Input
                  id="s33_req_received"
                  type="date"
                  name="s33_req_received"
                  value={form.s33_req_received}
                  onChange={handleChange}
                  className="h-9 bg-gray-50 border-gray-300"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="documents_requested_by_the_insurer_id">
                  Documents Requested By The Insurer
                </Label>
                <Select
                  value={
                    form.documents_requested_by_the_insurer_id?.toString() || ""
                  }
                  onValueChange={(val) =>
                    handleSelect("documents_requested_by_the_insurer_id", val)
                  }
                >
                  <SelectTrigger className="w-full h-11 bg-gray-50 border-gray-300">
                    <SelectValue>
                      {getLabel(
                        form.documents_requested_by_the_insurer_id,
                        meta.insurance_documents_requested_by_the_insurer
                      ) || "Select document"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {meta.insurance_documents_requested_by_the_insurer?.map(
                      (opt) => (
                        <SelectItem key={opt.id} value={opt.id.toString()}>
                          {opt.name}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="from_date">From Date</Label>
                <Input
                  id="from_date"
                  type="date"
                  name="from_date"
                  value={form.from_date}
                  onChange={handleChange}
                  className="h-9 bg-gray-50 border-gray-300"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="to_date">To Date</Label>
                <Input
                  id="to_date"
                  type="date"
                  name="to_date"
                  value={form.to_date}
                  onChange={handleChange}
                  className="h-9 bg-gray-50 border-gray-300"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deadline">Deadline</Label>
                <Input
                  id="deadline"
                  type="date"
                  name="deadline"
                  value={form.deadline}
                  onChange={handleChange}
                  className="h-9 bg-gray-50 border-gray-300"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="response_to_insurance">
                  Response to Insurance
                </Label>
                <Input
                  id="response_to_insurance"
                  type="date"
                  name="response_to_insurance"
                  value={form.response_to_insurance}
                  onChange={handleChange}
                  className="h-9 bg-gray-50 border-gray-300"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="s33_req_status_id">
                  Section 33 Request Status
                </Label>
                <Select
                  value={form.s33_req_status_id?.toString() || ""}
                  onValueChange={(val) =>
                    handleSelect("s33_req_status_id", val)
                  }
                >
                  <SelectTrigger className="w-full h-11 bg-gray-50 border-gray-300">
                    <SelectValue>
                      {getLabel(
                        form.s33_req_status_id,
                        meta.insurance_status
                      ) || "Select status"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {meta.insurance_status?.map((opt) => (
                      <SelectItem key={opt.id} value={opt.id.toString()}>
                        {opt.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Documents Requested */}
            <div className="space-y-6 pt-6 border-t">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">
                  Documents Requested
                </h2>
                <Button
                  type="button"
                  onClick={addDocReq}
                  variant="outline"
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" /> Add Document Request
                </Button>
              </div>
              {form.documents_requested.map((d, idx) => (
                <div
                  key={idx}
                  className="border border-gray-200 rounded-lg p-6 mb-6 bg-gray-50"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-800 text-lg">
                      Document Request {idx + 1}
                    </h3>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeDocReq(idx)}
                      disabled={form.documents_requested.length === 1}
                    >
                      <Trash2 className="h-4 w-4 mr-2" /> Remove
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Requested ID */}
                    <div className="space-y-2">
                      <Label>Requested ID</Label>
                      <Input
                        value={d.requested_id}
                        onChange={(e) =>
                          updateDocReq(idx, "requested_id", e.target.value)
                        }
                        className="h-9 bg-white border-gray-300"
                      />
                    </div>
                    {/* From Date */}
                    <div className="space-y-2">
                      <Label>From Date</Label>
                      <Input
                        type="date"
                        value={d.from_date}
                        onChange={(e) =>
                          updateDocReq(idx, "from_date", e.target.value)
                        }
                        className="h-9 bg-white border-gray-300"
                      />
                    </div>
                    {/* To Date */}
                    <div className="space-y-2">
                      <Label>To Date</Label>
                      <Input
                        type="date"
                        value={d.to_date}
                        onChange={(e) =>
                          updateDocReq(idx, "to_date", e.target.value)
                        }
                        className="h-9 bg-white border-gray-300"
                      />
                    </div>
                    {/* Ambulance CNR */}
                    <div className="space-y-2">
                      <Label>Ambulance CNR</Label>
                      <Input
                        value={d.ambulance_cnr}
                        onChange={(e) =>
                          updateDocReq(idx, "ambulance_cnr", e.target.value)
                        }
                        placeholder="CNR Ref No"
                        className="h-9 bg-white border-gray-300"
                      />
                    </div>
                    {/* Medical Clinic Name */}
                    <div className="space-y-2">
                      <Label>Medical Clinic Name</Label>
                      <Input
                        value={d.medical_clinic_name}
                        onChange={(e) =>
                          updateDocReq(
                            idx,
                            "medical_clinic_name",
                            e.target.value
                          )
                        }
                        placeholder="Clinic Name"
                        className="h-9 bg-white border-gray-300"
                      />
                    </div>
                    {/* Phone */}
                    <div className="space-y-2">
                      <Label>Phone</Label>
                      <Input
                        value={d.phone}
                        onChange={(e) =>
                          updateDocReq(idx, "phone", e.target.value)
                        }
                        placeholder="Phone"
                        className="h-9 bg-white border-gray-300"
                      />
                    </div>
                    {/* Fax */}
                    <div className="space-y-2">
                      <Label>Fax</Label>
                      <Input
                        value={d.fax}
                        onChange={(e) =>
                          updateDocReq(idx, "fax", e.target.value)
                        }
                        placeholder="Fax"
                        className="h-9 bg-white border-gray-300"
                      />
                    </div>
                    {/* Email */}
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input
                        value={d.email}
                        onChange={(e) =>
                          updateDocReq(idx, "email", e.target.value)
                        }
                        placeholder="Email"
                        className="h-9 bg-white border-gray-300"
                      />
                    </div>
                    {/* Request Status */}
                    <div className="space-y-2">
                      <Label>Request Status</Label>
                      <Select
                        value={d.request_status_id?.toString() || ""}
                        onValueChange={(val) =>
                          updateDocReq(idx, "request_status_id", val)
                        }
                      >
                        <SelectTrigger className="w-full h-11 bg-white border-gray-300">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          {meta.insurance_status?.map((opt) => (
                            <SelectItem key={opt.id} value={opt.id.toString()}>
                              {opt.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Communications */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-semibold text-gray-800">
                        Communications
                      </span>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => addComm(idx)}
                      >
                        <Plus className="h-4 w-4 mr-2" /> Add Communication
                      </Button>
                    </div>
                    {d.communications.map((c, commIdx) => (
                      <div
                        key={commIdx}
                        className="border border-gray-200 p-4 rounded-lg mb-3 bg-white relative"
                      >
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="absolute top-2 right-2"
                          onClick={() => removeComm(idx, commIdx)}
                          disabled={d.communications.length === 1}
                        >
                          <Trash2 className="h-4 w-4 text-red-400" />
                        </Button>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pr-10">
                          <div className="space-y-2">
                            <Label>Date</Label>
                            <Input
                              type="date"
                              value={c.date}
                              onChange={(e) =>
                                updateComm(idx, commIdx, "date", e.target.value)
                              }
                              className="h-9 bg-gray-50 border-gray-300"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Mode</Label>
                            <Select
                              value={c.mode_id?.toString() || ""}
                              onValueChange={(val) =>
                                updateComm(idx, commIdx, "mode_id", val)
                              }
                            >
                              <SelectTrigger className="w-full h-11 bg-gray-50 border-gray-300">
                                <SelectValue placeholder="Select mode" />
                              </SelectTrigger>
                              <SelectContent>
                                {meta.insurance_mode_of_communication?.map(
                                  (opt) => (
                                    <SelectItem
                                      key={opt.id}
                                      value={opt.id.toString()}
                                    >
                                      {opt.name}
                                    </SelectItem>
                                  )
                                )}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Documents Received ID</Label>
                            <Input
                              value={c.documents_received_id}
                              onChange={(e) =>
                                updateComm(
                                  idx,
                                  commIdx,
                                  "documents_received_id",
                                  e.target.value
                                )
                              }
                              placeholder="Doc ID"
                              className="h-9 bg-gray-50 border-gray-300"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Reminder</Label>
                            <Input
                              type="date"
                              value={c.reminder}
                              onChange={(e) =>
                                updateComm(
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
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Submit buttons */}
            <div className="flex justify-end gap-4 pt-6 border-t">
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
          </form>
        </div>
      </div>
    </div>
  );
}
