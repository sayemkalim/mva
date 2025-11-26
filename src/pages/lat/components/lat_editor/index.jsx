import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
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
import { Loader2, ChevronsUpDown, Check } from "lucide-react";
import { toast } from "sonner";
import { fetchLatById } from "../../helpers/fetchLatById";
import { getABMeta } from "../../helpers/fetchABMeta";
import { Textarea } from "@/components/ui/textarea";
import { Navbar2 } from "@/components/navbar2";
import { CreateLat, updateLat } from "../../helpers/createSection";

const SearchableDropdown = ({
  value,
  options,
  onSelect,
  placeholder,
  popoverKey,
  fieldName,
  popoverOpen,
  setPopoverOpen,
  label,
  disabled = false,
}) => {
  const selectedOption = options?.find(
    (opt) => String(opt.id) === String(value)
  );
  return (
    <div className="space-y-2">
      <Label className="text-gray-700 font-medium">{label}</Label>
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
            className={`w-full justify-between font-normal bg-gray-50 h-11 ${
              disabled ? "cursor-not-allowed opacity-60" : ""
            }`}
            type="button"
            disabled={disabled}
          >
            {selectedOption ? selectedOption.name : placeholder}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        {!disabled && (
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
        )}
      </Popover>
    </div>
  );
};

export default function LatEditor() {
  const { slug, id } = useParams();
  const navigate = useNavigate();

  const [popoverOpen, setPopoverOpen] = useState({});
  const [form, setForm] = useState({
    typeofplanid: "",
    planstatusid: "",
    partiallyapproved: "",
    totalamount: "",
    approvedamount: "",
    nebstartfrom: "",
    nebstoppedon: "",
    dateofdenial: "",
    deniedamount: "",
    tapsubmitteddate: "",
    tapsubmittedby: "",
    deadline1st: "",
    deadline2nd: "",
    finaldeadline: "",
    latletterdrafted: "",
    dateoflatsubmission: "",
    caseconferenceid: "",
    dateconference: "",
    documentexchangedeadline: "",
    briefsubmittedtolatid: "",
    communicationsubmissiondate1st: "",
    modeofcommunication1stid: "",
    briefsubmittedbyvsrlawid: "",
    documentsubmissiondate: "",
    modeofcommunication2ndid: "",
    briefreceivedfromopposingcounsel: "",
    communicationreceiveddate: "",
    modeofcommunication3rdid: "",
    matterresolvedatcaseconfrenceid: "",
    lathearingdate: "",
    latdecision: "",
    notes: "",
  });

  const {
    data: metaResponse,
    isLoading: loadingMeta,
    isError: errorMeta,
    error: metaError,
  } = useQuery({
    queryKey: ["latMeta"],
    queryFn: getABMeta,
    staleTime: 300000,
  });

  const meta = metaResponse?.response || {};

  const {
    data: latData,
    isLoading: loadingData,
    isError: errorData,
  } = useQuery({
    queryKey: ["latData", id],
    queryFn: () => fetchLatById(id),
    enabled: !!id,
    retry: 1,
  });

  useEffect(() => {
    if (latData) {
      setForm({
        typeofplanid: latData.type_of_plan_id || "",
        planstatusid: latData.plan_status_id || "",
        partiallyapproved: latData.partially_approved || "",
        totalamount: latData.total_amount || "",
        approvedamount: latData.approved_amount || "",
        nebstartfrom: latData.neb_start_from || "",
        nebstoppedon: latData.neb_stopped_on || "",
        dateofdenial: latData.date_of_denial || "",
        deniedamount: latData.denied_amount || "",
        tapsubmitteddate: latData.tap_submitted_date || "",
        tapsubmittedby: latData.tap_submitted_by || "",
        deadline1st: latData.deadline_1st || "",
        deadline2nd: latData.deadline_2nd || "",
        finaldeadline: latData.final_deadline || "",
        latletterdrafted: latData.lat_letter_drafted || "",
        dateoflatsubmission: latData.date_of_lat_submission || "",
        caseconferenceid: latData.case_conference_id || "",
        dateconference: latData.date_conference || "",
        documentexchangedeadline: latData.document_exchange_deadline || "",
        briefsubmittedtolatid: latData.brief_submitted_tolat_id || "",
        communicationsubmissiondate1st:
          latData.communication_submission_date_1st || "",
        modeofcommunication1stid: latData.mode_of_communication_1st_id || "",
        briefsubmittedbyvsrlawid: latData.brief_submitted_by_vsr_law_id || "",
        documentsubmissiondate: latData.document_submission_date || "",
        modeofcommunication2ndid: latData.mode_of_communication_2nd_id || "",
        briefreceivedfromopposingcounsel:
          latData.brief_received_from_opposing_counsel || "",
        communicationreceiveddate: latData.communication_received_date || "",
        modeofcommunication3rdid: latData.mode_of_communication_3rd_id || "",
        matterresolvedatcaseconfrenceid:
          latData.matter_resolved_at_case_confrence_id || "",
        lathearingdate: latData.lat_hearing_date || "",
        latdecision: latData.lat_decision_id || "",
        notes: latData.notes || "",
      });
    }
  }, [latData]);

  const mutation = useMutation({
    mutationFn: (data) => {
      if (id) {
        return updateLat(id, data);
      } else {
        return CreateLat(data);
      }
    },
    onSuccess: () => {
      toast.success(
        id ? "LAT data updated successfully" : "LAT data saved successfully"
      );
    },
    onError: (err) => {
      toast.error(
        err.message ||
          (id ? "Failed to update LAT data" : "Failed to save LAT data")
      );
    },
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleDropdownSelect = (field, val, popoverKey) => {
    setForm((prev) => ({ ...prev, [field]: String(val) }));
    setPopoverOpen((p) => ({ ...p, [popoverKey]: false }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      type_of_plan_id: form.typeofplanid,
      plan_status_id: form.planstatusid,
      partially_approved: form.partiallyapproved,
      total_amount: form.totalamount,
      approved_amount: form.approvedamount,
      neb_start_from: form.nebstartfrom,
      neb_stopped_on: form.nebstoppedon,
      date_of_denial: form.dateofdenial,
      denied_amount: form.deniedamount,
      tap_submitted_date: form.tapsubmitteddate,
      tap_submitted_by: form.tapsubmittedby,
      deadline_1st: form.deadline1st,
      deadline_2nd: form.deadline2nd,
      final_deadline: form.finaldeadline,
      lat_letter_drafted: form.latletterdrafted,
      date_of_lat_submission: form.dateoflatsubmission,
      case_conference_id: form.caseconferenceid,
      date_conference: form.dateconference,
      document_exchange_deadline: form.documentexchangedeadline,
      brief_submitted_tolat_id: form.briefsubmittedtolatid,
      communication_submission_date_1st: form.communicationsubmissiondate1st,
      mode_of_communication_1st_id: form.modeofcommunication1stid,
      brief_submitted_by_vsr_law_id: form.briefsubmittedbyvsrlawid,
      document_submission_date: form.documentsubmissiondate,
      mode_of_communication_2nd_id: form.modeofcommunication2ndid,
      brief_received_from_opposing_counsel:
        form.briefreceivedfromopposingcounsel,
      communication_received_date: form.communicationreceiveddate,
      mode_of_communication_3rd_id: form.modeofcommunication3rdid,
      matter_resolved_at_case_confrence_id:
        form.matterresolvedatcaseconfrenceid,
      lat_hearing_date: form.lathearingdate,
      lat_decision_id: form.latdecision,
      notes: form.notes,
    };

    mutation.mutate(payload);
  };

  if (loadingMeta || loadingData)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading...</span>
      </div>
    );

  if (errorMeta)
    return (
      <div className="text-red-500">
        Error loading metadata: {metaError?.message || "Unknown error"}
      </div>
    );

  if (errorData)
    return (
      <div className="text-red-500">
        Error loading LAT data: {errorData.message || "Unknown error"}
      </div>
    );

  const planStatusName =
    meta.insurance_plan_status?.find(
      (item) => String(item.id) === String(form.planstatusid)
    )?.name || "";

  const showBasicFields = planStatusName === "Approved" || !form.planstatusid;
  const showAllFields =
    planStatusName === "Denied" || planStatusName === "Partially Approved";

  const basicFields = [
    {
      type: "dropdown",
      key: "typeofplanid",
      label: "Type of Plan",
      options: meta.insurance_type_of_plan || [],
      popoverKey: "typeofplanid",
      placeholder: "Select type of plan",
    },
    {
      type: "dropdown",
      key: "planstatusid",
      label: "Plan Status",
      options: meta.insurance_plan_status || [],
      popoverKey: "planstatusid",
      placeholder: "Select plan status",
    },
    {
      type: "dropdown",
      key: "partiallyapproved",
      label: "Partially Approved",
      options: meta.yes_no_option || [],
      popoverKey: "partiallyapproved",
      placeholder: "Select yes or no",
    },
    {
      type: "input",
      key: "totalamount",
      label: "Total Amount",
      inputType: "number",
      placeholder: "Enter total amount",
    },
    {
      type: "input",
      key: "approvedamount",
      label: "Approved Amount",
      inputType: "number",
      placeholder: "Enter approved amount",
    },
    {
      type: "input",
      key: "nebstartfrom",
      label: "NEB START FROM",
      inputType: "date",
    },
    {
      type: "input",
      key: "nebstoppedon",
      label: "NEB STOPPED ON",
      inputType: "date",
    },
    {
      type: "input",
      key: "dateofdenial",
      label: "DATE OF DENIAL",
      inputType: "date",
    },
  ];

  const extraFields = [
    {
      type: "input",
      key: "deniedamount",
      label: "Denied Amount",
      inputType: "number",
      placeholder: "Enter denied amount",
    },
    {
      type: "input",
      key: "tapsubmitteddate",
      label: "TAP Submitted Date",
      inputType: "date",
    },
    {
      type: "input",
      key: "tapsubmittedby",
      label: "TAP Submitted By",
      inputType: "text",
      placeholder: "Enter name",
    },
    {
      type: "input",
      key: "deadline1st",
      label: "1st Deadline",
      inputType: "date",
    },
    {
      type: "input",
      key: "deadline2nd",
      label: "2nd Deadline",
      inputType: "date",
    },
    {
      type: "input",
      key: "finaldeadline",
      label: "Final Deadline",
      inputType: "date",
    },
    {
      type: "input",
      key: "latletterdrafted",
      label: "LAT Letter Drafted",
      inputType: "date",
    },
    {
      type: "input",
      key: "dateoflatsubmission",
      label: "Date of LAT Submission",
      inputType: "date",
    },
    {
      type: "dropdown",
      key: "caseconferenceid",
      label: "Case Conference",
      options: meta.yes_no_option || [],
      popoverKey: "caseconferenceid",
      placeholder: "Select case conference",
    },
    {
      type: "input",
      key: "dateconference",
      label: "Date of Conference",
      inputType: "date",
    },
    {
      type: "input",
      key: "documentexchangedeadline",
      label: "Document Exchange Deadline",
      inputType: "date",
    },
    {
      type: "dropdown",
      key: "briefsubmittedtolatid",
      label: "Brief Submitted to LAT",
      options: meta.yes_no_option || [],
      popoverKey: "briefsubmittedtolatid",
      placeholder: "Select option",
    },
    {
      type: "input",
      key: "communicationsubmissiondate1st",
      label: "Communication Submission Date 1st",
      inputType: "date",
    },
    {
      type: "dropdown",
      key: "modeofcommunication1stid",
      label: "Mode of Communication 1st",
      options: meta.insurance_mode_of_communication || [],
      popoverKey: "modeofcommunication1stid",
      placeholder: "Select mode",
    },
    {
      type: "dropdown",
      key: "briefsubmittedbyvsrlawid",
      label: "Brief Submitted By VSR Law",
      options: meta.yes_no_option || [],
      popoverKey: "briefsubmittedbyvsrlawid",
      placeholder: "Select option",
    },
    {
      type: "input",
      key: "documentsubmissiondate",
      label: "Document Submission Date",
      inputType: "date",
    },
    {
      type: "dropdown",
      key: "modeofcommunication2ndid",
      label: "Mode of Communication 2nd",
      options: meta.insurance_mode_of_communication || [],
      popoverKey: "modeofcommunication2ndid",
      placeholder: "Select mode",
    },
    {
      type: "input",
      key: "briefreceivedfromopposingcounsel",
      label: "Brief Received from Opposing Counsel",
      inputType: "date",
    },
    {
      type: "input",
      key: "communicationreceiveddate",
      label: "Communication Received Date",
      inputType: "date",
    },
    {
      type: "dropdown",
      key: "modeofcommunication3rdid",
      label: "Mode of Communication 3rd",
      options: meta.insurance_mode_of_communication || [],
      popoverKey: "modeofcommunication3rdid",
      placeholder: "Select mode",
    },
    {
      type: "dropdown",
      key: "matterresolvedatcaseconfrenceid",
      label: "Matter Resolved at Case Conference",
      options: meta.insuranceplanstatus || [],
      popoverKey: "matterresolvedatcaseconfrenceid",
      placeholder: "Select option",
    },
    {
      type: "input",
      key: "lathearingdate",
      label: "LAT Hearing Date",
      inputType: "date",
    },
    {
      type: "dropdown",
      key: "latdecision",
      label: "LAT Decision",
      options: meta.insurancelatdecision || [],
      popoverKey: "latdecision",
      placeholder: "Select decision",
    },
    {
      type: "textarea",
      key: "notes",
      label: "Notes",
      placeholder: "Add any notes...",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar2 />
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
            onClick={() => navigate(`/dashboard/workstation/edit/${slug}/lat`)}
            className="hover:text-gray-900 transition"
          >
            Lat List
          </button>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 font-medium">LAT </span>
        </div>
      </div>
      <form
        className="container mx-auto px-6 py-8 max-w-7xl bg-white rounded-lg shadow-sm border p-8"
        onSubmit={handleSubmit}
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {basicFields.map((field) => {
            const fieldValue = form[field.key];
            if (field.type === "dropdown") {
              return (
                <SearchableDropdown
                  key={field.key}
                  label={field.label}
                  value={fieldValue}
                  options={field.options}
                  onSelect={handleDropdownSelect}
                  placeholder={field.placeholder}
                  fieldName={field.key}
                  popoverKey={field.popoverKey}
                  popoverOpen={popoverOpen}
                  setPopoverOpen={setPopoverOpen}
                  disabled={mutation.isLoading}
                />
              );
            }
            return (
              <div key={field.key} className="space-y-2">
                <Label>{field.label}</Label>
                <Input
                  type={field.inputType}
                  name={field.key}
                  value={fieldValue}
                  onChange={handleInputChange}
                  placeholder={field.placeholder}
                  disabled={mutation.isLoading}
                />
              </div>
            );
          })}
        </div>

        {showAllFields && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
            {extraFields.map((field) => {
              const fieldValue = form[field.key];
              if (field.type === "dropdown") {
                return (
                  <SearchableDropdown
                    key={field.key}
                    label={field.label}
                    value={fieldValue}
                    options={field.options}
                    onSelect={handleDropdownSelect}
                    placeholder={field.placeholder}
                    fieldName={field.key}
                    popoverKey={field.popoverKey}
                    popoverOpen={popoverOpen}
                    setPopoverOpen={setPopoverOpen}
                    disabled={mutation.isLoading}
                  />
                );
              }
              if (field.type === "textarea") {
                return (
                  <div key={field.key} className="space-y-2 md:col-span-4">
                    <Label>{field.label}</Label>
                    <Textarea
                      name={field.key}
                      value={fieldValue}
                      onChange={handleInputChange}
                      placeholder={field.placeholder}
                      disabled={mutation.isLoading}
                    />
                  </div>
                );
              }
              return (
                <div key={field.key} className="space-y-2">
                  <Label>{field.label}</Label>
                  <Input
                    type={field.inputType}
                    name={field.key}
                    value={fieldValue}
                    onChange={handleInputChange}
                    placeholder={field.placeholder}
                    disabled={mutation.isLoading}
                  />
                </div>
              );
            })}
          </div>
        )}

        <div className="flex justify-end space-x-4 pt-6 border-t mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(-1)}
            disabled={mutation.isLoading}
            size="lg"
          >
            Cancel
          </Button>
          <Button type="submit" disabled={mutation.isLoading} size="lg">
            {mutation.isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : id ? (
              "Update LAT"
            ) : (
              "Save LAT Data"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
