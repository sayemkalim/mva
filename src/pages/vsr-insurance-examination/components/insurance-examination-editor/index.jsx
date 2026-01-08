import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Loader2,
  ChevronRight,
  Check,
  ChevronsUpDown,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import { Navbar2 } from "@/components/navbar2";
import { getABMeta } from "../../helpers/fetchABMeta";
import { fetchVsrInsExamById } from "../../helpers/fetchLatById";
import {
  createVsrInsuranceExamination,
  updateVsrInsuranceExamnation,
} from "../../helpers/createInsuranceExamination";

export default function VSRAssessmentPage() {
  const { slug, id } = useParams();
  const navigate = useNavigate();

  const {
    data: metaDataRaw,
    isLoading: loadingMeta,
    error: metaError,
  } = useQuery({
    queryKey: ["abMeta"],
    queryFn: getABMeta,
    staleTime: 5 * 60 * 1000,
  });

  const metaData = metaDataRaw?.response;

  const { data: assessmentData, isLoading: loadingAssessment } = useQuery({
    queryKey: ["vsrAssessmentData", id],
    queryFn: () => fetchVsrInsExamById(id),
    enabled: !!id,
    retry: 1,
  });

  const mutation = useMutation({
    mutationFn: (data) => {
      if (id) {
        return updateVsrInsuranceExamnation(id, data);
      } else {
        if (!slug) {
          return Promise.reject(
            new Error("Slug is required for creating VSR Assessment")
          );
        }
        return createVsrInsuranceExamination({ slug, ...data });
      }
    },
    onSuccess: () => {
      toast.success(
        id
          ? "VSR Assessment updated successfully!"
          : "VSR Assessment saved successfully!"
      );
      navigate(`/dashboard/workstation/edit/${slug}`);
    },
    onError: (err) => {
      toast.error(
        err.message ||
          (id
            ? "Failed to update VSR Assessment"
            : "Failed to save VSR Assessment")
      );
    },
  });

  const [formData, setFormData] = useState({
    assessment_status_id: "",
    type_of_assessment_id: "",
    referral_partner_id: "",
    request_for_assessment: "",
    follow_up_1st: "",
    follow_up_2nd: "",
    assessment_rescheduled_id: "",
    date_of_assessment: "",
    time: "",
    location: "",
    assessor_name: "",
    interprator: "",
    transportation: "",
    informed_to_client_id: "",
    reminder_to_client_id: "",
    date_of_report_received: "",
    report_reviewed_date: "",
    report_reviewed_by: "",
    report_fax_or_email_to_insurance: "",
    note: "",
  });

  // Combobox open states
  const [openAssessmentStatus, setOpenAssessmentStatus] = useState(false);
  const [openTypeOfAssessment, setOpenTypeOfAssessment] = useState(false);
  const [openReferralPartner, setOpenReferralPartner] = useState(false);
  const [openAssessmentRescheduled, setOpenAssessmentRescheduled] =
    useState(false);
  const [openInformedToClient, setOpenInformedToClient] = useState(false);
  const [openReminderToClient, setOpenReminderToClient] = useState(false);

  useEffect(() => {
    if (assessmentData) {
      setFormData({
        assessment_status_id: assessmentData.assessment_status_id || "",
        type_of_assessment_id: assessmentData.type_of_assessment_id || "",
        referral_partner_id: assessmentData.referral_partner_id || "",
        request_for_assessment: assessmentData.request_for_assessment || "",
        follow_up_1st: assessmentData.follow_up_1st
          ? assessmentData.follow_up_1st.split("T")[0]
          : "",
        follow_up_2nd: assessmentData.follow_up_2nd
          ? assessmentData.follow_up_2nd.split("T")[0]
          : "",
        assessment_rescheduled_id:
          assessmentData.assessment_rescheduled_id || "",
        date_of_assessment: assessmentData.date_of_assessment
          ? assessmentData.date_of_assessment.split("T")[0]
          : "",
        time: assessmentData.time || "",
        location: assessmentData.location || "",
        assessor_name: assessmentData.assessor_name || "",
        interprator: assessmentData.interprator || "",
        transportation: assessmentData.transportation || "",
        informed_to_client_id: assessmentData.informed_to_client_id || "",
        reminder_to_client_id: assessmentData.reminder_to_client_id || "",
        date_of_report_received: assessmentData.date_of_report_received
          ? assessmentData.date_of_report_received.split("T")[0]
          : "",
        report_reviewed_date: assessmentData.report_reviewed_date
          ? assessmentData.report_reviewed_date.split("T")[0]
          : "",
        report_reviewed_by: assessmentData.report_reviewed_by || "",
        report_fax_or_email_to_insurance:
          assessmentData.report_fax_or_email_to_insurance || "",
        note: assessmentData.note || "",
      });
    }
  }, [assessmentData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleComboboxChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !formData.assessment_status_id ||
      !formData.type_of_assessment_id ||
      !formData.date_of_assessment
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    const payload = {
      assessment_status_id: parseInt(formData.assessment_status_id),
      type_of_assessment_id: parseInt(formData.type_of_assessment_id),
      referral_partner_id: formData.referral_partner_id
        ? parseInt(formData.referral_partner_id)
        : null,
      request_for_assessment: formData.request_for_assessment,
      follow_up_1st: formData.follow_up_1st,
      follow_up_2nd: formData.follow_up_2nd,
      assessment_rescheduled_id: formData.assessment_rescheduled_id
        ? parseInt(formData.assessment_rescheduled_id)
        : null,
      date_of_assessment: formData.date_of_assessment,
      time: formData.time,
      location: formData.location,
      assessor_name: formData.assessor_name,
      interprator: formData.interprator,
      transportation: formData.transportation,
      informed_to_client_id: formData.informed_to_client_id
        ? parseInt(formData.informed_to_client_id)
        : null,
      reminder_to_client_id: formData.reminder_to_client_id
        ? parseInt(formData.reminder_to_client_id)
        : null,
      date_of_report_received: formData.date_of_report_received,
      report_reviewed_date: formData.report_reviewed_date,
      report_reviewed_by: formData.report_reviewed_by,
      report_fax_or_email_to_insurance:
        formData.report_fax_or_email_to_insurance,
      note: formData.note,
    };

    mutation.mutate(payload);
  };

  // Get selected label function
  const getSelectedLabel = (fieldId, dataArray, defaultText) => {
    if (!fieldId || !dataArray) return defaultText;
    const selected = dataArray.find((item) => item.id === parseInt(fieldId));
    return selected ? selected.name : defaultText;
  };

  if (loadingAssessment || loadingMeta) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading...</span>
      </div>
    );
  }

  if (metaError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-red-500 text-lg">Failed to load metadata</p>
        <p className="text-sm text-muted-foreground mt-2">{metaError?.message}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted">
      <Navbar2 />

      <header className="bg-card border-b px-6 py-3">
        <div className="flex items-center justify-end gap-6 text-sm text-foreground">
          <div>
            Unpaid: <span className="font-semibold">$ 0</span>
          </div>
          <div>
            Unbilled: <span className="font-semibold">$ 0</span>
          </div>
          <div>
            Client Funds-Operating: <span className="font-semibold">$ 0</span>
          </div>
          <div>
            Client Funds-Trust: <span className="font-semibold">$ 0</span>
          </div>
        </div>
      </header>

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
          <span className="text-foreground font-medium">
            {id ? "Edit VSR Assessment" : "Add VSR Assessment"}
          </span>
        </div>
      </nav>

      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-6xl">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-foreground">
          {id ? "Edit VSR Assessment" : "Add VSR Assessment"}
        </h1>

        <form
          className="bg-card rounded-lg shadow-sm border p-6 sm:p-8 space-y-6"
          onSubmit={handleSubmit}
        >
          {/* Assessment Information */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Assessment Information
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Assessment Status */}
              <div className="space-y-2">
                <Label className="text-foreground font-medium">
                  Assessment Status <span className="text-red-500">*</span>
                </Label>
                <Popover
                  open={openAssessmentStatus}
                  onOpenChange={setOpenAssessmentStatus}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openAssessmentStatus}
                      className="w-full h-11 justify-between"
                      disabled={mutation.isLoading}
                    >
                      {getSelectedLabel(
                        formData.assessment_status_id,
                        metaData?.examination_assessment_status,
                        "Select assessment status"
                      )}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search status..." />
                      <CommandList>
                        <CommandEmpty>No status found.</CommandEmpty>
                        <CommandGroup>
                          {metaData?.examination_assessment_status?.map(
                            (status) => (
                              <CommandItem
                                key={status.id}
                                value={status.name}
                                onSelect={() => {
                                  handleComboboxChange(
                                    "assessment_status_id",
                                    status.id.toString()
                                  );
                                  setOpenAssessmentStatus(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    formData.assessment_status_id ===
                                      status.id.toString()
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                {status.name}
                              </CommandItem>
                            )
                          )}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Type of Assessment */}
              <div className="space-y-2">
                <Label className="text-foreground font-medium">
                  Type of Assessment <span className="text-red-500">*</span>
                </Label>
                <Popover
                  open={openTypeOfAssessment}
                  onOpenChange={setOpenTypeOfAssessment}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openTypeOfAssessment}
                      className="w-full h-11 justify-between"
                      disabled={mutation.isLoading}
                    >
                      {getSelectedLabel(
                        formData.type_of_assessment_id,
                        metaData?.examination_type_of_assessment,
                        "Select type of assessment"
                      )}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search type..." />
                      <CommandList>
                        <CommandEmpty>No type found.</CommandEmpty>
                        <CommandGroup>
                          {metaData?.examination_type_of_assessment?.map(
                            (type) => (
                              <CommandItem
                                key={type.id}
                                value={type.name}
                                onSelect={() => {
                                  handleComboboxChange(
                                    "type_of_assessment_id",
                                    type.id.toString()
                                  );
                                  setOpenTypeOfAssessment(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    formData.type_of_assessment_id ===
                                      type.id.toString()
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                {type.name}
                              </CommandItem>
                            )
                          )}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Referral Partner */}
              <div className="space-y-2">
                <Label className="text-foreground font-medium">
                  Referral Partner
                </Label>
                <Popover
                  open={openReferralPartner}
                  onOpenChange={setOpenReferralPartner}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openReferralPartner}
                      className="w-full h-11 justify-between"
                      disabled={mutation.isLoading}
                    >
                      {getSelectedLabel(
                        formData.referral_partner_id,
                        metaData?.examination_referral_partner,
                        "Select referral partner"
                      )}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search partner..." />
                      <CommandList>
                        <CommandEmpty>No partner found.</CommandEmpty>
                        <CommandGroup>
                          {metaData?.examination_referral_partner?.map(
                            (partner) => (
                              <CommandItem
                                key={partner.id}
                                value={partner.name}
                                onSelect={() => {
                                  handleComboboxChange(
                                    "referral_partner_id",
                                    partner.id.toString()
                                  );
                                  setOpenReferralPartner(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    formData.referral_partner_id ===
                                      partner.id.toString()
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                {partner.name}
                              </CommandItem>
                            )
                          )}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Request for Assessment */}
              <div className="space-y-2">
                <Label className="text-foreground font-medium">
                  Request for Assessment
                </Label>
                <Input
                  name="request_for_assessment"
                  value={formData.request_for_assessment}
                  onChange={handleChange}
                  placeholder="Enter request details"
                  className="h-11"
                  disabled={mutation.isLoading}
                />
              </div>
            </div>
          </div>

          {/* Follow-up Information */}
          <div className="pt-6 border-t">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Follow-up Information
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Follow Up 1st */}
              <div className="space-y-2">
                <Label className="text-foreground font-medium">
                  Follow Up (1st)
                </Label>
                <Input
                  type="date"
                  name="follow_up_1st"
                  value={formData.follow_up_1st}
                  onChange={handleChange}
                  className="h-11"
                  disabled={mutation.isLoading}
                />
              </div>

              {/* Follow Up 2nd */}
              <div className="space-y-2">
                <Label className="text-foreground font-medium">
                  Follow Up (2nd)
                </Label>
                <Input
                  type="date"
                  name="follow_up_2nd"
                  value={formData.follow_up_2nd}
                  onChange={handleChange}
                  className="h-11"
                  disabled={mutation.isLoading}
                />
              </div>

              {/* Assessment Rescheduled */}
              <div className="space-y-2">
                <Label className="text-foreground font-medium">
                  Assessment Rescheduled
                </Label>
                <Popover
                  open={openAssessmentRescheduled}
                  onOpenChange={setOpenAssessmentRescheduled}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openAssessmentRescheduled}
                      className="w-full h-11 justify-between"
                      disabled={mutation.isLoading}
                    >
                      {getSelectedLabel(
                        formData.assessment_rescheduled_id,
                        metaData?.yes_no_option,
                        "Select option"
                      )}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <CommandList>
                        <CommandEmpty>No option found.</CommandEmpty>
                        <CommandGroup>
                          {metaData?.yes_no_option?.map((option) => (
                            <CommandItem
                              key={option.id}
                              value={option.name}
                              onSelect={() => {
                                handleComboboxChange(
                                  "assessment_rescheduled_id",
                                  option.id.toString()
                                );
                                setOpenAssessmentRescheduled(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  formData.assessment_rescheduled_id ===
                                    option.id.toString()
                                    ? "opacity-100"
                                    : "opacity-0"
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
              </div>
            </div>
          </div>

          {/* Assessment Details */}
          <div className="pt-6 border-t">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Assessment Details
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Date of Assessment */}
              <div className="space-y-2">
                <Label className="text-foreground font-medium">
                  Date of Assessment <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="date"
                  name="date_of_assessment"
                  value={formData.date_of_assessment}
                  onChange={handleChange}
                  className="h-11"
                  required
                  disabled={mutation.isLoading}
                />
              </div>

              {/* Time */}
              <div className="space-y-2">
                <Label className="text-foreground font-medium">Time</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    className="h-11 pl-10"
                    disabled={mutation.isLoading}
                  />
                </div>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label className="text-foreground font-medium">Location</Label>
                <Input
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Enter location"
                  className="h-11"
                  disabled={mutation.isLoading}
                />
              </div>

              {/* Assessor Name */}
              <div className="space-y-2">
                <Label className="text-foreground font-medium">
                  Assessor Name
                </Label>
                <Input
                  name="assessor_name"
                  value={formData.assessor_name}
                  onChange={handleChange}
                  placeholder="Enter assessor name"
                  className="h-11"
                  disabled={mutation.isLoading}
                />
              </div>

              {/* Interpreter */}
              <div className="space-y-2">
                <Label className="text-foreground font-medium">Interpreter</Label>
                <Input
                  name="interprator"
                  value={formData.interprator}
                  onChange={handleChange}
                  placeholder="Enter interpreter details"
                  className="h-11"
                  disabled={mutation.isLoading}
                />
              </div>

              {/* Transportation */}
              <div className="space-y-2">
                <Label className="text-foreground font-medium">
                  Transportation
                </Label>
                <Input
                  name="transportation"
                  value={formData.transportation}
                  onChange={handleChange}
                  placeholder="Enter transportation details"
                  className="h-11"
                  disabled={mutation.isLoading}
                />
              </div>
            </div>
          </div>

          {/* Client Communication */}
          <div className="pt-6 border-t">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Client Communication
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Informed to Client */}
              <div className="space-y-2">
                <Label className="text-foreground font-medium">
                  Informed to Client
                </Label>
                <Popover
                  open={openInformedToClient}
                  onOpenChange={setOpenInformedToClient}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openInformedToClient}
                      className="w-full h-11 justify-between"
                      disabled={mutation.isLoading}
                    >
                      {getSelectedLabel(
                        formData.informed_to_client_id,
                        metaData?.examination_informed_to_client,
                        "Select option"
                      )}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search option..." />
                      <CommandList>
                        <CommandEmpty>No option found.</CommandEmpty>
                        <CommandGroup>
                          {metaData?.examination_informed_to_client?.map(
                            (option) => (
                              <CommandItem
                                key={option.id}
                                value={option.name}
                                onSelect={() => {
                                  handleComboboxChange(
                                    "informed_to_client_id",
                                    option.id.toString()
                                  );
                                  setOpenInformedToClient(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    formData.informed_to_client_id ===
                                      option.id.toString()
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                {option.name}
                              </CommandItem>
                            )
                          )}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Reminder to Client */}
              <div className="space-y-2">
                <Label className="text-foreground font-medium">
                  Reminder to Client
                </Label>
                <Popover
                  open={openReminderToClient}
                  onOpenChange={setOpenReminderToClient}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openReminderToClient}
                      className="w-full h-11 justify-between"
                      disabled={mutation.isLoading}
                    >
                      {getSelectedLabel(
                        formData.reminder_to_client_id,
                        metaData?.examination_reminder_to_client,
                        "Select reminder"
                      )}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search reminder..." />
                      <CommandList>
                        <CommandEmpty>No reminder found.</CommandEmpty>
                        <CommandGroup>
                          {metaData?.examination_reminder_to_client?.map(
                            (reminder) => (
                              <CommandItem
                                key={reminder.id}
                                value={reminder.name}
                                onSelect={() => {
                                  handleComboboxChange(
                                    "reminder_to_client_id",
                                    reminder.id.toString()
                                  );
                                  setOpenReminderToClient(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    formData.reminder_to_client_id ===
                                      reminder.id.toString()
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                {reminder.name}
                              </CommandItem>
                            )
                          )}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          {/* Report Information */}
          <div className="pt-6 border-t">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Report Information
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Date of Report Received */}
              <div className="space-y-2">
                <Label className="text-foreground font-medium">
                  Date of Report Received
                </Label>
                <Input
                  type="date"
                  name="date_of_report_received"
                  value={formData.date_of_report_received}
                  onChange={handleChange}
                  className="h-11"
                  disabled={mutation.isLoading}
                />
              </div>

              {/* Report Reviewed Date */}
              <div className="space-y-2">
                <Label className="text-foreground font-medium">
                  Report Reviewed Date
                </Label>
                <Input
                  type="date"
                  name="report_reviewed_date"
                  value={formData.report_reviewed_date}
                  onChange={handleChange}
                  className="h-11"
                  disabled={mutation.isLoading}
                />
              </div>

              {/* Report Reviewed By */}
              <div className="space-y-2">
                <Label className="text-foreground font-medium">
                  Report Reviewed By
                </Label>
                <Input
                  name="report_reviewed_by"
                  value={formData.report_reviewed_by}
                  onChange={handleChange}
                  placeholder="Enter reviewer name"
                  className="h-11"
                  disabled={mutation.isLoading}
                />
              </div>

              {/* Report Fax or Email to Insurance */}
              <div className="space-y-2">
                <Label className="text-foreground font-medium">
                  Report Fax/Email to Insurance
                </Label>
                <Input
                  name="report_fax_or_email_to_insurance"
                  value={formData.report_fax_or_email_to_insurance}
                  onChange={handleChange}
                  placeholder="Enter details"
                  className="h-11"
                  disabled={mutation.isLoading}
                />
              </div>

              {/* Note */}
              <div className="space-y-2 lg:col-span-2">
                <Label className="text-foreground font-medium">Note</Label>
                <Textarea
                  name="note"
                  value={formData.note}
                  onChange={handleChange}
                  placeholder="Enter notes"
                  rows={4}
                  className="resize-none"
                  disabled={mutation.isLoading}
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t">
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              type="button"
              className="w-full sm:w-auto"
              disabled={mutation.isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={mutation.isLoading}
              className="w-full sm:w-auto"
            >
              {mutation.isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : id ? (
                "Update VSR Assessment"
              ) : (
                "Save VSR Assessment"
              )}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
