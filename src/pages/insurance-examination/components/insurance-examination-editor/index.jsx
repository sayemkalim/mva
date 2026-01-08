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
import {
  createInsuranceExamination,
  updateInsuranceExamnation,
} from "../../helpers/createInsuranceExamination";
import { fetchInsExamById } from "../../helpers/fetchLatById";

export default function InsuranceExaminationPage() {
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

  const { data: examinationData, isLoading: loadingExamination } = useQuery({
    queryKey: ["examinationData", id],
    queryFn: () => fetchInsExamById(id),
    enabled: !!id,
    retry: 1,
  });

  const mutation = useMutation({
    mutationFn: (data) => {
      if (id) {
        return updateInsuranceExamnation(id, data);
      } else {
        if (!slug) {
          return Promise.reject(
            new Error("Slug is required for creating Insurance Examination")
          );
        }
        return createInsuranceExamination({ slug, ...data });
      }
    },
    onSuccess: () => {
      toast.success(
        id
          ? "Insurance Examination updated successfully!"
          : "Insurance Examination saved successfully!"
      );
    },
    onError: (err) => {
      toast.error(
        err.message ||
          (id
            ? "Failed to update Insurance Examination"
            : "Failed to save Insurance Examination")
      );
    },
  });

  const [formData, setFormData] = useState({
    assessment_status_id: "",
    ie_received_in_our_office: "",
    type_of_assessment_id: "",
    date_of_assessment: "",
    time: "",
    location: "",
    assessor_name: "",
    informed_to_client_id: "",
    mode_of_communication_id: "",
    communication_date: "",
    required_transportation_id: "",
    required_interpreter_id: "",
    communication_date_2nd: "",
    mode_of_communication_2nd_id: "",
    reminder_to_client_id: "",
    informed_transporation_id: "",
    informed_interpreter_id: "",
    response_from_adjuster: "",
    communication_date_3rd: "",
    mode_of_communication_3rd_id: "",
    ie_result: "",
    ie_status_id: "",
    partially_approved: "",
    referred_to: "",
    mode_of_communication_4th_id: "",
    communication_date_4th: "",
    note: "",
  });

  const [openAssessmentStatus, setOpenAssessmentStatus] = useState(false);
  const [openTypeOfAssessment, setOpenTypeOfAssessment] = useState(false);
  const [openInformedToClient, setOpenInformedToClient] = useState(false);
  const [openModeCommunication, setOpenModeCommunication] = useState(false);
  const [openRequiredTransportation, setOpenRequiredTransportation] =
    useState(false);
  const [openRequiredInterpreter, setOpenRequiredInterpreter] = useState(false);
  const [openModeCommunication2nd, setOpenModeCommunication2nd] =
    useState(false);
  const [openReminderToClient, setOpenReminderToClient] = useState(false);
  const [openInformedTransportation, setOpenInformedTransportation] =
    useState(false);
  const [openInformedInterpreter, setOpenInformedInterpreter] = useState(false);
  const [openModeCommunication3rd, setOpenModeCommunication3rd] =
    useState(false);
  const [openIEStatus, setOpenIEStatus] = useState(false);
  const [openModeCommunication4th, setOpenModeCommunication4th] =
    useState(false);

  useEffect(() => {
    if (examinationData) {
      setFormData({
        assessment_status_id: examinationData.assessment_status_id || "",
        ie_received_in_our_office: examinationData.ie_received_in_our_office
          ? examinationData.ie_received_in_our_office.split("T")[0]
          : "",
        type_of_assessment_id: examinationData.type_of_assessment_id || "",
        date_of_assessment: examinationData.date_of_assessment
          ? examinationData.date_of_assessment.split("T")[0]
          : "",
        time: examinationData.time || "",
        location: examinationData.location || "",
        assessor_name: examinationData.assessor_name || "",
        informed_to_client_id: examinationData.informed_to_client_id || "",
        mode_of_communication_id:
          examinationData.mode_of_communication_id || "",
        communication_date: examinationData.communication_date
          ? examinationData.communication_date.split("T")[0]
          : "",
        required_transportation_id:
          examinationData.required_transportation_id || "",
        required_interpreter_id: examinationData.required_interpreter_id || "",
        communication_date_2nd: examinationData.communication_date_2nd
          ? examinationData.communication_date_2nd.split("T")[0]
          : "",
        mode_of_communication_2nd_id:
          examinationData.mode_of_communication_2nd_id || "",
        reminder_to_client_id: examinationData.reminder_to_client_id || "",
        informed_transporation_id:
          examinationData.informed_transporation_id || "",
        informed_interpreter_id: examinationData.informed_interpreter_id || "",
        response_from_adjuster: examinationData.response_from_adjuster || "",
        communication_date_3rd: examinationData.communication_date_3rd
          ? examinationData.communication_date_3rd.split("T")[0]
          : "",
        mode_of_communication_3rd_id:
          examinationData.mode_of_communication_3rd_id || "",
        ie_result: examinationData.ie_result || "",
        ie_status_id: examinationData.ie_status_id || "",
        partially_approved: examinationData.partially_approved || "",
        referred_to: examinationData.referred_to || "",
        mode_of_communication_4th_id:
          examinationData.mode_of_communication_4th_id || "",
        communication_date_4th: examinationData.communication_date_4th
          ? examinationData.communication_date_4th.split("T")[0]
          : "",
        note: examinationData.note || "",
      });
    }
  }, [examinationData]);

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
      ie_received_in_our_office: formData.ie_received_in_our_office,
      type_of_assessment_id: parseInt(formData.type_of_assessment_id),
      date_of_assessment: formData.date_of_assessment,
      time: formData.time,
      location: formData.location,
      assessor_name: formData.assessor_name,
      informed_to_client_id: formData.informed_to_client_id
        ? parseInt(formData.informed_to_client_id)
        : null,
      mode_of_communication_id: formData.mode_of_communication_id
        ? parseInt(formData.mode_of_communication_id)
        : null,
      communication_date: formData.communication_date,
      required_transportation_id: formData.required_transportation_id
        ? parseInt(formData.required_transportation_id)
        : null,
      required_interpreter_id: formData.required_interpreter_id
        ? parseInt(formData.required_interpreter_id)
        : null,
      communication_date_2nd: formData.communication_date_2nd,
      mode_of_communication_2nd_id: formData.mode_of_communication_2nd_id
        ? parseInt(formData.mode_of_communication_2nd_id)
        : null,
      reminder_to_client_id: formData.reminder_to_client_id
        ? parseInt(formData.reminder_to_client_id)
        : null,
      informed_transporation_id: formData.informed_transporation_id
        ? parseInt(formData.informed_transporation_id)
        : null,
      informed_interpreter_id: formData.informed_interpreter_id
        ? parseInt(formData.informed_interpreter_id)
        : null,
      response_from_adjuster: formData.response_from_adjuster,
      communication_date_3rd: formData.communication_date_3rd,
      mode_of_communication_3rd_id: formData.mode_of_communication_3rd_id
        ? parseInt(formData.mode_of_communication_3rd_id)
        : null,
      ie_result: formData.ie_result,
      ie_status_id: formData.ie_status_id
        ? parseInt(formData.ie_status_id)
        : null,
      partially_approved: formData.partially_approved,
      referred_to: formData.referred_to,
      mode_of_communication_4th_id: formData.mode_of_communication_4th_id
        ? parseInt(formData.mode_of_communication_4th_id)
        : null,
      communication_date_4th: formData.communication_date_4th,
      note: formData.note,
    };

    mutation.mutate(payload);
  };

  // Get selected label functions
  const getSelectedLabel = (fieldId, dataArray, defaultText) => {
    if (!fieldId || !dataArray) return defaultText;
    const selected = dataArray.find((item) => item.id === parseInt(fieldId));
    return selected ? selected.name : defaultText;
  };

  if (loadingExamination || loadingMeta) {
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
            {id ? "Edit Insurance Examination" : "Add Insurance Examination"}
          </span>
        </div>
      </nav>

      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-7xl">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-foreground">
          {id ? "Edit Insurance Examination" : "Add Insurance Examination"}
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

              {/* IE Received Date */}
              <div className="space-y-2">
                <Label className="text-foreground font-medium">
                  IE Received in Our Office
                </Label>
                <Input
                  type="date"
                  name="ie_received_in_our_office"
                  value={formData.ie_received_in_our_office}
                  onChange={handleChange}
                  className="h-11"
                  disabled={mutation.isLoading}
                />
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
            </div>
          </div>

          {/* Client Communication - 1st */}
          <div className="pt-6 border-t">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Client Communication (1st)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Mode of Communication */}
              <div className="space-y-2">
                <Label className="text-foreground font-medium">
                  Mode of Communication
                </Label>
                <Popover
                  open={openModeCommunication}
                  onOpenChange={setOpenModeCommunication}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openModeCommunication}
                      className="w-full h-11 justify-between"
                      disabled={mutation.isLoading}
                    >
                      {getSelectedLabel(
                        formData.mode_of_communication_id,
                        metaData?.insurance_mode_of_communication,
                        "Select mode"
                      )}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search mode..." />
                      <CommandList>
                        <CommandEmpty>No mode found.</CommandEmpty>
                        <CommandGroup>
                          {metaData?.insurance_mode_of_communication?.map(
                            (mode) => (
                              <CommandItem
                                key={mode.id}
                                value={mode.name}
                                onSelect={() => {
                                  handleComboboxChange(
                                    "mode_of_communication_id",
                                    mode.id.toString()
                                  );
                                  setOpenModeCommunication(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    formData.mode_of_communication_id ===
                                      mode.id.toString()
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                {mode.name}
                              </CommandItem>
                            )
                          )}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Communication Date */}
              <div className="space-y-2">
                <Label className="text-foreground font-medium">
                  Communication Date
                </Label>
                <Input
                  type="date"
                  name="communication_date"
                  value={formData.communication_date}
                  onChange={handleChange}
                  className="h-11"
                  disabled={mutation.isLoading}
                />
              </div>

              {/* Required Transportation */}
              <div className="space-y-2">
                <Label className="text-foreground font-medium">
                  Required Transportation
                </Label>
                <Popover
                  open={openRequiredTransportation}
                  onOpenChange={setOpenRequiredTransportation}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openRequiredTransportation}
                      className="w-full h-11 justify-between"
                      disabled={mutation.isLoading}
                    >
                      {getSelectedLabel(
                        formData.required_transportation_id,
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
                                  "required_transportation_id",
                                  option.id.toString()
                                );
                                setOpenRequiredTransportation(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  formData.required_transportation_id ===
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

              {/* Required Interpreter */}
              <div className="space-y-2">
                <Label className="text-foreground font-medium">
                  Required Interpreter
                </Label>
                <Popover
                  open={openRequiredInterpreter}
                  onOpenChange={setOpenRequiredInterpreter}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openRequiredInterpreter}
                      className="w-full h-11 justify-between"
                      disabled={mutation.isLoading}
                    >
                      {getSelectedLabel(
                        formData.required_interpreter_id,
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
                                  "required_interpreter_id",
                                  option.id.toString()
                                );
                                setOpenRequiredInterpreter(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  formData.required_interpreter_id ===
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

          {/* Client Communication - 2nd */}
          <div className="pt-6 border-t">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Client Communication (2nd)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Communication Date 2nd */}
              <div className="space-y-2">
                <Label className="text-foreground font-medium">
                  Communication Date
                </Label>
                <Input
                  type="date"
                  name="communication_date_2nd"
                  value={formData.communication_date_2nd}
                  onChange={handleChange}
                  className="h-11"
                  disabled={mutation.isLoading}
                />
              </div>

              {/* Mode of Communication 2nd */}
              <div className="space-y-2">
                <Label className="text-foreground font-medium">
                  Mode of Communication
                </Label>
                <Popover
                  open={openModeCommunication2nd}
                  onOpenChange={setOpenModeCommunication2nd}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openModeCommunication2nd}
                      className="w-full h-11 justify-between"
                      disabled={mutation.isLoading}
                    >
                      {getSelectedLabel(
                        formData.mode_of_communication_2nd_id,
                        metaData?.insurance_mode_of_communication,
                        "Select mode"
                      )}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search mode..." />
                      <CommandList>
                        <CommandEmpty>No mode found.</CommandEmpty>
                        <CommandGroup>
                          {metaData?.insurance_mode_of_communication?.map(
                            (mode) => (
                              <CommandItem
                                key={mode.id}
                                value={mode.name}
                                onSelect={() => {
                                  handleComboboxChange(
                                    "mode_of_communication_2nd_id",
                                    mode.id.toString()
                                  );
                                  setOpenModeCommunication2nd(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    formData.mode_of_communication_2nd_id ===
                                      mode.id.toString()
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                {mode.name}
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

              {/* Informed Transportation */}
              <div className="space-y-2">
                <Label className="text-foreground font-medium">
                  Informed Transportation
                </Label>
                <Popover
                  open={openInformedTransportation}
                  onOpenChange={setOpenInformedTransportation}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openInformedTransportation}
                      className="w-full h-11 justify-between"
                      disabled={mutation.isLoading}
                    >
                      {getSelectedLabel(
                        formData.informed_transporation_id,
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
                                  "informed_transporation_id",
                                  option.id.toString()
                                );
                                setOpenInformedTransportation(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  formData.informed_transporation_id ===
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

              {/* Informed Interpreter */}
              <div className="space-y-2">
                <Label className="text-foreground font-medium">
                  Informed Interpreter
                </Label>
                <Popover
                  open={openInformedInterpreter}
                  onOpenChange={setOpenInformedInterpreter}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openInformedInterpreter}
                      className="w-full h-11 justify-between"
                      disabled={mutation.isLoading}
                    >
                      {getSelectedLabel(
                        formData.informed_interpreter_id,
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
                                  "informed_interpreter_id",
                                  option.id.toString()
                                );
                                setOpenInformedInterpreter(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  formData.informed_interpreter_id ===
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

          {/* Adjuster Communication - 3rd */}
          <div className="pt-6 border-t">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Adjuster Communication (3rd)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Response from Adjuster */}
              <div className="space-y-2 md:col-span-2 lg:col-span-3">
                <Label className="text-foreground font-medium">
                  Response from Adjuster
                </Label>
                <Textarea
                  name="response_from_adjuster"
                  value={formData.response_from_adjuster}
                  onChange={handleChange}
                  placeholder="Enter response from adjuster"
                  rows={3}
                  className="resize-none"
                  disabled={mutation.isLoading}
                />
              </div>

              {/* Communication Date 3rd */}
              <div className="space-y-2">
                <Label className="text-foreground font-medium">
                  Communication Date
                </Label>
                <Input
                  type="date"
                  name="communication_date_3rd"
                  value={formData.communication_date_3rd}
                  onChange={handleChange}
                  className="h-11"
                  disabled={mutation.isLoading}
                />
              </div>

              {/* Mode of Communication 3rd */}
              <div className="space-y-2">
                <Label className="text-foreground font-medium">
                  Mode of Communication
                </Label>
                <Popover
                  open={openModeCommunication3rd}
                  onOpenChange={setOpenModeCommunication3rd}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openModeCommunication3rd}
                      className="w-full h-11 justify-between"
                      disabled={mutation.isLoading}
                    >
                      {getSelectedLabel(
                        formData.mode_of_communication_3rd_id,
                        metaData?.insurance_mode_of_communication,
                        "Select mode"
                      )}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search mode..." />
                      <CommandList>
                        <CommandEmpty>No mode found.</CommandEmpty>
                        <CommandGroup>
                          {metaData?.insurance_mode_of_communication?.map(
                            (mode) => (
                              <CommandItem
                                key={mode.id}
                                value={mode.name}
                                onSelect={() => {
                                  handleComboboxChange(
                                    "mode_of_communication_3rd_id",
                                    mode.id.toString()
                                  );
                                  setOpenModeCommunication3rd(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    formData.mode_of_communication_3rd_id ===
                                      mode.id.toString()
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                {mode.name}
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

          {/* IE Results & Status */}
          <div className="pt-6 border-t">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              IE Results & Status
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* IE Result */}
              <div className="space-y-2 md:col-span-2 lg:col-span-3">
                <Label className="text-foreground font-medium">IE Result</Label>
                <Textarea
                  name="ie_result"
                  value={formData.ie_result}
                  onChange={handleChange}
                  placeholder="Enter IE result"
                  rows={3}
                  className="resize-none"
                  disabled={mutation.isLoading}
                />
              </div>

              {/* IE Status */}
              <div className="space-y-2">
                <Label className="text-foreground font-medium">IE Status</Label>
                <Popover open={openIEStatus} onOpenChange={setOpenIEStatus}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openIEStatus}
                      className="w-full h-11 justify-between"
                      disabled={mutation.isLoading}
                    >
                      {getSelectedLabel(
                        formData.ie_status_id,
                        metaData?.examination_ie_status,
                        "Select IE status"
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
                          {metaData?.examination_ie_status?.map((status) => (
                            <CommandItem
                              key={status.id}
                              value={status.name}
                              onSelect={() => {
                                handleComboboxChange(
                                  "ie_status_id",
                                  status.id.toString()
                                );
                                setOpenIEStatus(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  formData.ie_status_id === status.id.toString()
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {status.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Partially Approved */}
              <div className="space-y-2">
                <Label className="text-foreground font-medium">
                  Partially Approved
                </Label>
                <Input
                  name="partially_approved"
                  value={formData.partially_approved}
                  onChange={handleChange}
                  placeholder="Enter details"
                  className="h-11"
                  disabled={mutation.isLoading}
                />
              </div>

              {/* Referred To */}
              <div className="space-y-2">
                <Label className="text-foreground font-medium">Referred To</Label>
                <Input
                  name="referred_to"
                  value={formData.referred_to}
                  onChange={handleChange}
                  placeholder="Enter referral details"
                  className="h-11"
                  disabled={mutation.isLoading}
                />
              </div>
            </div>
          </div>

          {/* Final Communication - 4th */}
          <div className="pt-6 border-t">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Final Communication (4th)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Mode of Communication 4th */}
              <div className="space-y-2">
                <Label className="text-foreground font-medium">
                  Mode of Communication
                </Label>
                <Popover
                  open={openModeCommunication4th}
                  onOpenChange={setOpenModeCommunication4th}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openModeCommunication4th}
                      className="w-full h-11 justify-between"
                      disabled={mutation.isLoading}
                    >
                      {getSelectedLabel(
                        formData.mode_of_communication_4th_id,
                        metaData?.insurance_mode_of_communication,
                        "Select mode"
                      )}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search mode..." />
                      <CommandList>
                        <CommandEmpty>No mode found.</CommandEmpty>
                        <CommandGroup>
                          {metaData?.insurance_mode_of_communication?.map(
                            (mode) => (
                              <CommandItem
                                key={mode.id}
                                value={mode.name}
                                onSelect={() => {
                                  handleComboboxChange(
                                    "mode_of_communication_4th_id",
                                    mode.id.toString()
                                  );
                                  setOpenModeCommunication4th(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    formData.mode_of_communication_4th_id ===
                                      mode.id.toString()
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                {mode.name}
                              </CommandItem>
                            )
                          )}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Communication Date 4th */}
              <div className="space-y-2">
                <Label className="text-foreground font-medium">
                  Communication Date
                </Label>
                <Input
                  type="date"
                  name="communication_date_4th"
                  value={formData.communication_date_4th}
                  onChange={handleChange}
                  className="h-11"
                  disabled={mutation.isLoading}
                />
              </div>

              {/* Note */}
              <div className="space-y-2 md:col-span-2 lg:col-span-3">
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
                "Update Insurance Examination"
              ) : (
                "Save Insurance Examination"
              )}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
