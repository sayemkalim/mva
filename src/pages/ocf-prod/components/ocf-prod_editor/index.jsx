import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Loader2, ChevronRight, Calendar as CalendarIcon, Check, ChevronsUpDown } from "lucide-react";
import { getABMeta } from "@/pages/medical_centre/helpers/fetchABMeta";
import { getEmploymentMeta } from "@/pages/employment/helpers/fetchIEmploymentMetadata";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Navbar2 } from "@/components/navbar2";
import { createOcfProd, updateOcfProd } from "../../helpers/createOcfProd";
import { fetchOcfProdById } from "../../helpers/fetchOcfProdById";
import Billing from "@/components/billing";
import { format } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { FloatingInput, FloatingTextarea, FloatingWrapper } from "@/components/ui/floating-label";

export default function OCFProdPage() {
  const { id, slug } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditMode = Boolean(id);

  const { data: ocfResp, isLoading: loadingOCF } = useQuery({
    queryKey: ["ocfProd", id],
    queryFn: () => fetchOcfProdById(id),
    enabled: isEditMode,
  });

  const ocfRecord = ocfResp || null;
  const apiData = ocfRecord?.data;
  console.log("🔍 ocfResp:", ocfResp);
  const saveMutation = useMutation({
    mutationFn: ({ isEdit, idOrSlug, data }) =>
      isEdit
        ? updateOcfProd(idOrSlug, data)
        : createOcfProd({ slug: idOrSlug, data }),
    onSuccess: (data) => {
      const resp = data?.response || data;
      if (resp?.Apistatus === false) {
        toast.error(resp?.message || "Validation failed");
        return;
      }
      toast.success(resp?.message || "Form saved successfully!");
      queryClient.invalidateQueries(["ocfProd", id]);
      navigate(-1);
    },
    onError: (error) => {
      console.error("Mutation Error:", error);
      const errorData = error.response?.data;
      if (errorData?.Apistatus === false) {
        toast.error(errorData?.message || "Validation failed");
      } else {
        toast.error(errorData?.message || "Failed to save OCF-PROD");
      }
    },
  });

  const [formData, setFormData] = useState({
    claim_no: "",
    policy_no: "",
    date_of_accident: "",
    document_date: "",
    first_name: "",
    last_name: "",
    middle_name: "",
    gender: "",
    date_of_birth: "",
    language: "",
    marital_status: "",
    street_address: "",
    city: "",
    province: "",
    postal_code: "",
    home_tel: "",
    work_tel: "",
    fax: "",
    email: "",
    driver_licence_no: "",
    any_dependants: "",
    how_many_persons: "",
    patient_rep: "",
    patient_last_name: "",
    patient_first_name: "",
    patient_address: "",
    patient_city: "",
    patient_province: "",
    patient_postal_code: "",
    patient_home_tel: "",
    patient_work_tel: "",
    patient_fax: "",
    patient_email: "",
    r_lawyer: "",
    r_othervalue: "",
    signed_by: "",
    date: "",
    insurance_co: "",
    insurance_street_address: "",
    insurance_City: "",
    insurance_province: "",
    insurance_postal_code: "",
    day_of_the_week: "",
    time_of_the_day: "",
    other_value: "",
    Date_of_accident_1st: "",
    time_of_accident_1st: "",
    patient_position: "",
    accident_location: "",
    accident_city: "",
    accident_province: "",
    accident_occur: "",
    safety_insurance: "",
    accident_reported_police: "",
    police_department: "",
    officer_name: "",
    badge_no: "",
    reporting_center: "",
    was_claiment_charged: "",
    police_date_reported: "",
    police_if_yes_give_details: "",
    brief_accident_description: "",
    return_to_normal_activities: "",
    did_the_patient_go_to_the_hospital: "",
    outcome_if_yes_give_details: "",
    did_patient_see_health_professional: "",
    outcome_if_yes_give_details_2nd: "",
    post_accident_additional_sheets: false,
    facility_name: "",
    health_professional: "",
    health_address: "",
    health_city: "",
    health_province: "",
    health_postal_code: "",
    begun_ant_treatment: "",
    health_if_yes_give_details: "",
    health_facility_additional_sheets: false,
    private_policy: "",
    spouse_policy: "",
    claimant_us_dependent: "",

    claimant_as_a_drive: "",
    claimant_employer_policy: "",
    policy_insuring: "",
    name_of_policyholder: "",
    insurance_company: "",
    policy_number: "",
    automobile_make_model_year: "",
    licence_plate_no: "",
    were_you_an_occupant_of_this_automobile_at_the_time_of_the_accident:
      "",
    employed: "",
    not_employed: "",
    un_employed_and: "",
    student_or_recent_graduate: "",
    caregiver: "",
    applicant_status_claimant_attending_school: "",
    applicant_status_name_of_school: "",
    applicant_status_address: "",
    applicant_status_city: "",
    applicant_status_province: "",
    applicant_status_postal_code: "",
    applicant_status_data_last_attended_date: "",
    applicant_status_program_and_level: "",
    applicant_status_project_date_for_completion: "",
    applicant_status_is_the_claimant_attending_school: "",
    applicant_status_is_the_claimant_attending_school_date: "",
    applicant_status_was_the_claimant_able_to_return_to_school_after_the_accident:
      "",
    applicant_status_was_the_claimant_able_to_return_to_school_after_the_accident_date:
      "",
    caregiver_him_her_at_the_time_accident: "",
    caregiver_claimant_paid_to_provide_care_to_these_people: "",
    caregiver_name: ["", "", "", "", ""],
    caregiver_date: ["", "", "", "", ""],
    caregiver_disabled: ["", "", "", "", ""],
    patient_suffer_a_substantial_to_engage_in_the_caregiving: "",
    caregiver_if_yes_to_above_indicate_the_date_and_explain_below: "",
    caregiver_explain_below: "",
    caregiver_did_claimant_return_to_caregiving_after_the_accident: "",
    caregiver_if_yes_to_above_inicate_return_date: "",
    date_from: ["", "", "", "", ""],
    date_to: ["", "", "", "", ""],
    employer_name_address: ["", "", "", "", ""],
    position_task: ["", "", "", "", ""],
    hours_per_week: ["", "", "", "", ""],
    gross_income: ["", "", "", "", ""],
    income_injuries_private_him_her_from_working: "",
    income_form_what_date: "",
    were_you_able_to_return_to_work_since_the_accident: "",
    income_when_date: "",
    The_amount_of_claimants_benefit_id_based_on_his_her_past_income: "",
    other_insurance_or_spouse_dependent: "",
    name_of_benefit_payer: ["", ""],
    type_of_coverage: ["", ""],
    policy_or_certifucate_no: ["", ""],
    other_disability_benift_plan: "",
    other_form_date: "",
    other_to_date: "",
    other_total_amount_recived: "",
    other_receiving_employment_insurance: "",
    other_form_date1: "",
    other_to_date1: "",
    other_total_amount_recived1: "",
    other_receiving_social_assistance_benfits: "",
    caregiver_additional_sheets_attached: "",
    caregiver_additional_sheets_attached_2: "",
    employment_additional_sheets_attached: "",
    other_insurance_additional_sheets: "",
    applicant_name: "",
    applicant_date: "",
  });

  const { data: metaDataRaw } = useQuery({
    queryKey: ["abMeta"],
    queryFn: getABMeta,
    staleTime: 5 * 60 * 1000,
  });

  const { data: employmentMetaRaw } = useQuery({
    queryKey: ["employmentMeta"],
    queryFn: getEmploymentMeta,
    staleTime: 5 * 60 * 1000,
  });

  const employmentMetadata = employmentMetaRaw?.response;
  const metaData = metaDataRaw?.response;
  const [openStates, setOpenStates] = useState({});

  const toggleOpen = (key, value) => {
    setOpenStates((prev) => ({ ...prev, [key]: value }));
  };

  const formatPhoneNumber = (value) => {
    if (!value) return value;
    const phoneNumber = value.replace(/[^\d]/g, "");
    const phoneNumberLength = phoneNumber.length;
    if (phoneNumberLength < 4) return phoneNumber;
    if (phoneNumberLength < 7) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    }
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
  };

  const SearchableDropdown = ({ label, value, onChange, options, placeholder, openKey }) => {
    const isOpen = openStates[openKey] || false;
    return (
      <FloatingWrapper label={label} hasValue={!!value} isFocused={isOpen}>
        <Popover open={isOpen} onOpenChange={(v) => toggleOpen(openKey, v)}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={isOpen}
              className="w-full justify-between h-[52px] font-normal bg-transparent border border-input"
            >
              {value
                ? options?.find((option) => option.name === value)?.name || value
                : ""}
              <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
            <Command>
              <CommandInput placeholder="Search..." />
              <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup>
                  <CommandItem
                    onSelect={() => {
                      onChange("");
                      toggleOpen(openKey, false);
                    }}
                    className="italic text-muted-foreground"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        !value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    None
                  </CommandItem>
                  {options?.map((option) => (
                    <CommandItem
                      key={option.id}
                      value={option.name}
                      onSelect={() => {
                        const newVal = value === option.name ? "" : option.name;
                        onChange(newVal);
                        toggleOpen(openKey, false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === option.name ? "opacity-100" : "opacity-0"
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
      </FloatingWrapper>
    );
  };

  const DatePicker = ({ label, value, onChange, placeholder, openKey }) => {
    const isOpen = openStates[openKey] || false;
    return (
      <FloatingWrapper label={label} hasValue={!!value} isFocused={isOpen}>
        <Popover open={isOpen} onOpenChange={(v) => toggleOpen(openKey, v)}>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className="w-full justify-start text-left font-normal h-[52px] bg-transparent border border-input"
            >
              {value ? (
                format(new Date(value + "T00:00:00"), "dd/MM/yyyy")
              ) : (
                ""
              )}
              <CalendarIcon className="ml-auto h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <CalendarComponent
              mode="single"
              selected={value ? new Date(value + "T00:00:00") : undefined}
              onSelect={(date) => {
                if (date) {
                  const yyyy = date.getFullYear();
                  const mm = String(date.getMonth() + 1).padStart(2, "0");
                  const dd = String(date.getDate()).padStart(2, "0");
                  onChange(`${yyyy}-${mm}-${dd}`);
                } else {
                  onChange("");
                }
                toggleOpen(openKey, false);
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </FloatingWrapper>
    );
  };

  const [recordId, setRecordId] = useState(null);

  useEffect(() => {
    if (!ocfRecord) return;
    const d = apiData || {};

    const normArray = (arr, len) => {
      if (!Array.isArray(arr)) return Array(len).fill("");
      const cleaned = arr.map((v) =>
        v === null || v === "-undefined-undefined" ? "" : String(v)
      );
      while (cleaned.length < len) cleaned.push("");
      return cleaned.slice(0, len);
    };

    setFormData({
      claim_no: d.claim_no || "",
      policy_no: d.policy_no || "",
      date_of_accident: d.date_of_accident || "",
      document_date: d.document_date || "",
      first_name: d.first_name || "",
      last_name: d.last_name || "",
      middle_name: d.middle_name || "",
      gender: d.gender || "",
      date_of_birth: d.date_of_birth || "",
      language: d.language || "",
      marital_status: d.marital_status || "",
      street_address: d.street_address || "",
      city: d.city || "",
      province: d.province || "",
      postal_code: d.postal_code || "",
      home_tel: d.home_tel || "",
      work_tel: d.work_tel || "",
      fax: d.fax || "",
      email: d.email || "",
      driver_licence_no: d.driver_licence_no || "",
      any_dependants: d.any_dependants || "",
      how_many_persons: d.how_many_persons || "",
      patient_rep: d.patient_rep || "",
      patient_last_name: d.patient_last_name || "",
      patient_first_name: d.patient_first_name || "",
      patient_address: d.patient_address || "",
      patient_city: d.patient_city || "",
      patient_province: d.patient_province || "",
      patient_postal_code: d.patient_postal_code || "",
      patient_home_tel: d.patient_home_tel || "",
      patient_work_tel: d.patient_work_tel || "",
      patient_fax: d.patient_fax || "",
      patient_email: d.patient_email || "",
      r_lawyer: d.r_lawyer || "",
      r_othervalue: d.r_othervalue || "",
      signed_by: d.signed_by || "",
      date: d.date || "",
      insurance_co: d.insurance_co || "",
      insurance_street_address: d.insurance_street_address || "",
      insurance_City: d.insurance_City || "",
      insurance_province: d.insurance_province || "",
      insurance_postal_code: d.insurance_postal_code || "",
      day_of_the_week: d.day_of_the_week || "",
      time_of_the_day: d.time_of_the_day || "",
      other_value: d.other_value || "",
      Date_of_accident_1st: d.Date_of_accident_1st || "",
      time_of_accident_1st: d.time_of_accident_1st || "",
      patient_position: d.patient_position || "",
      accident_location: d.accident_location || "",
      accident_city: d.accident_city || "",
      accident_province: d.accident_province || "",
      accident_occur: d.accident_occur || "",
      safety_insurance: d.safety_insurance || "",
      accident_reported_police: d.accident_reported_police || "",
      police_department: d.police_department || "",
      officer_name: d.officer_name || "",
      badge_no: d.badge_no || "",
      reporting_center: d.reporting_center || "",
      was_claiment_charged: d.was_claiment_charged || "",
      police_date_reported: d.police_date_reported || "",
      police_if_yes_give_details: d.police_if_yes_give_details || "",
      brief_accident_description: d.brief_accident_description || "",
      return_to_normal_activities: d.return_to_normal_activities || "",
      did_the_patient_go_to_the_hospital:
        d.did_the_patient_go_to_the_hospital || "",
      outcome_if_yes_give_details: d.outcome_if_yes_give_details || "",
      did_patient_see_health_professional:
        d.did_patient_see_health_professional || "",
      outcome_if_yes_give_details_2nd: d.outcome_if_yes_give_details_2nd || "",
      post_accident_additional_sheets: d.post_accident_additional_sheets || false,
      facility_name: d.facility_name || "",
      health_professional: d.health_professional || "",
      health_address: d.health_address || "",
      health_city: d.health_city || "",
      health_province: d.health_province || "",
      health_postal_code: d.health_postal_code || "",
      begun_ant_treatment: d.begun_ant_treatment || "",
      health_if_yes_give_details: d.health_if_yes_give_details || "",
      health_facility_additional_sheets: d.health_facility_additional_sheets || false,
      private_policy: d.private_policy || "",
      spouse_policy: d.spouse_policy || "",
      claimant_us_dependent: d.claimant_us_dependent || "",
      claimant_as_a_drive: d.claimant_as_a_drive || "",
      claimant_employer_policy: d.claimant_employer_policy || "",
      policy_insuring: d.policy_insuring || "",
      name_of_policyholder: d.name_of_policyholder || "",
      insurance_company: d.insurance_company || "",
      policy_number: d.policy_number || "",
      automobile_make_model_year: d.automobile_make_model_year || "",
      licence_plate_no: d.licence_plate_no || "",
      were_you_an_occupant_of_this_automobile_at_the_time_of_the_accident:
        d.were_you_an_occupant_of_this_automobile_at_the_time_of_the_accident ||
        "",
      employed: d.employed || "",
      not_employed: d.not_employed || "",
      un_employed_and: d.un_employed_and || "",
      student_or_recent_graduate: d.student_or_recent_graduate || "",
      caregiver: d.caregiver || "",
      applicant_status_claimant_attending_school:
        d.applicant_status_claimant_attending_school || "",
      applicant_status_name_of_school: d.applicant_status_name_of_school || "",
      applicant_status_address: d.applicant_status_address || "",
      applicant_status_city: d.applicant_status_city || "",
      applicant_status_province: d.applicant_status_province || "",
      applicant_status_postal_code: d.applicant_status_postal_code || "",
      applicant_status_data_last_attended_date:
        d.applicant_status_data_last_attended_date || "",
      applicant_status_program_and_level:
        d.applicant_status_program_and_level || "",
      applicant_status_project_date_for_completion:
        d.applicant_status_project_date_for_completion || "",
      applicant_status_is_the_claimant_attending_school:
        d.applicant_status_is_the_claimant_attending_school || "",
      applicant_status_is_the_claimant_attending_school_date:
        d.applicant_status_is_the_claimant_attending_school_date || "",
      applicant_status_was_the_claimant_able_to_return_to_school_after_the_accident:
        d.applicant_status_was_the_claimant_able_to_return_to_school_after_the_accident ||
        "",
      applicant_status_was_the_claimant_able_to_return_to_school_after_the_accident_date:
        d.applicant_status_was_the_claimant_able_to_return_to_school_after_the_accident_date ||
        "",
      caregiver_him_her_at_the_time_accident:
        d.caregiver_him_her_at_the_time_accident || "",
      caregiver_claimant_paid_to_provide_care_to_these_people:
        d.caregiver_claimant_paid_to_provide_care_to_these_people || "",
      caregiver_name: normArray(d.caregiver_name, 5),
      caregiver_date: normArray(d.caregiver_date, 5),
      caregiver_disabled: normArray(d.caregiver_disabled, 5),
      patient_suffer_a_substantial_to_engage_in_the_caregiving:
        d.patient_suffer_a_substantial_to_engage_in_the_caregiving || "",
      caregiver_if_yes_to_above_indicate_the_date_and_explain_below:
        d.caregiver_if_yes_to_above_indicate_the_date_and_explain_below || "",
      caregiver_explain_below: d.caregiver_explain_below || "",
      caregiver_did_claimant_return_to_caregiving_after_the_accident:
        d.caregiver_did_claimant_return_to_caregiving_after_the_accident || "",
      caregiver_if_yes_to_above_inicate_return_date:
        d.caregiver_if_yes_to_above_inicate_return_date || "",
      date_from: normArray(d.date_from, 5),
      date_to: normArray(d.date_to, 5),
      employer_name_address: normArray(d.employer_name_address, 5),
      position_task: normArray(d.position_task, 5),
      hours_per_week: normArray(d.hours_per_week, 5),
      gross_income: normArray(d.gross_income, 5),
      income_injuries_private_him_her_from_working:
        d.income_injuries_private_him_her_from_working || "",
      income_form_what_date: d.income_form_what_date || "",
      were_you_able_to_return_to_work_since_the_accident:
        d.were_you_able_to_return_to_work_since_the_accident || "",
      income_when_date: d.income_when_date || "",
      The_amount_of_claimants_benefit_id_based_on_his_her_past_income:
        d.The_amount_of_claimants_benefit_id_based_on_his_her_past_income || "",
      other_insurance_or_spouse_dependent:
        d.other_insurance_or_spouse_dependent || "",
      name_of_benefit_payer: normArray(d.name_of_benefit_payer, 2),
      type_of_coverage: normArray(d.type_of_coverage, 2),
      policy_or_certifucate_no: normArray(d.policy_or_certifucate_no, 2),
      other_disability_benift_plan: d.other_disability_benift_plan || "",
      other_form_date: d.other_form_date || "",
      other_to_date: d.other_to_date || "",
      other_total_amount_recived: d.other_total_amount_recived || "",
      other_receiving_employment_insurance:
        d.other_receiving_employment_insurance || "",
      other_form_date1: d.other_form_date1 || "",
      other_to_date1: d.other_to_date1 || "",
      other_total_amount_recived1: d.other_total_amount_recived1 || "",
      other_receiving_social_assistance_benfits:
        d.other_receiving_social_assistance_benfits || "",
      caregiver_additional_sheets_attached:
        d.caregiver_additional_sheets_attached || "",
      caregiver_additional_sheets_attached_2:
        d.caregiver_additional_sheets_attached_2 || "",
      employment_additional_sheets_attached:
        d.employment_additional_sheets_attached || "",
      other_insurance_additional_sheets:
        d.other_insurance_additional_sheets || "",
      applicant_name: d.applicant_name || "",
      applicant_date: d.applicant_date || "",
    });

    setRecordId(ocfRecord.id || null);
  }, [ocfRecord, apiData]);

  const handleFieldChange = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handleArrayFieldChange = (arrayName, idx, value) => {
    setFormData((prev) => {
      const copy = [...(prev[arrayName] || [])];
      copy[idx] = value || "";
      return { ...prev, [arrayName]: copy };
    });
  };
  // 2) handleSubmit
  const handleSubmit = (e) => {
    e.preventDefault();

    // Sirf formData ko data bana ke bhejo
    const data = formData;

    console.log("📤 Sending Data to API:", JSON.stringify(data, null, 2));
    console.log(
      "🔗 API Function:",
      isEditMode ? "updateOcfProd" : "createOcfProd"
    );

    if (isEditMode) {
      saveMutation.mutate({
        isEdit: true,
        idOrSlug: recordId || id,
        data,
      });
    } else {
      saveMutation.mutate({
        isEdit: false,
        idOrSlug: slug, // URL se slug
        data,
      });
    }
  };

  if (isEditMode && loadingOCF) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading...</span>
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
          <span className="text-foreground font-medium">OCF-PROD</span>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-8 max-w-7xl">
        <h1 className="text-3xl font-bold text-foreground mb-6">OCF-PROD Form</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* SECTION 1: Basic Information */}
          <div className="bg-card rounded-lg shadow-sm border p-6 space-y-6">
            <h2 className="text-xl font-semibold text-foreground border-b pb-3">
              Basic Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <FloatingInput label="Claim No" value={formData.claim_no} onChange={(e) => handleFieldChange("claim_no", e.target.value)} />
              <FloatingInput label="Policy No" value={formData.policy_no} onChange={(e) => handleFieldChange("policy_no", e.target.value)} />
              <FloatingInput label="Date of Accident" type="date" value={formData.date_of_accident} onChange={(e) => handleFieldChange("date_of_accident", e.target.value)} />
              <FloatingInput label="Document Date" type="date" value={formData.document_date} onChange={(e) => handleFieldChange("document_date", e.target.value)} />
            </div>
          </div>

          {/* SECTION 2: Applicant Information */}
          <div className="bg-card rounded-lg shadow-sm border p-6 space-y-6">
            <h2 className="text-xl font-semibold text-foreground border-b pb-3">
              Applicant Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <FloatingInput label="First Name" value={formData.first_name} onChange={(e) => handleFieldChange("first_name", e.target.value)} />
              <FloatingInput label="Middle Name" value={formData.middle_name} onChange={(e) => handleFieldChange("middle_name", e.target.value)} />
              <FloatingInput label="Last Name" value={formData.last_name} onChange={(e) => handleFieldChange("last_name", e.target.value)} />
              <FloatingInput label="Gender" value={formData.gender} onChange={(e) => handleFieldChange("gender", e.target.value)} />
              <FloatingInput label="Date of Birth" type="date" value={formData.date_of_birth} onChange={(e) => handleFieldChange("date_of_birth", e.target.value)} />
              <FloatingInput label="Language" value={formData.language} onChange={(e) => handleFieldChange("language", e.target.value)} />
              <FloatingInput label="Marital Status" value={formData.marital_status} onChange={(e) => handleFieldChange("marital_status", e.target.value)} />
              <FloatingInput label="Driver Licence No" value={formData.driver_licence_no} onChange={(e) => handleFieldChange("driver_licence_no", e.target.value)} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="col-span-2">
                <FloatingInput label="Street Address" value={formData.street_address} onChange={(e) => handleFieldChange("street_address", e.target.value)} />
              </div>
              <FloatingInput label="City" value={formData.city} onChange={(e) => handleFieldChange("city", e.target.value)} />
              <FloatingInput label="Province" value={formData.province} onChange={(e) => handleFieldChange("province", e.target.value)} />
              <FloatingInput label="Postal Code" value={formData.postal_code} onChange={(e) => handleFieldChange("postal_code", e.target.value)} />
              <FloatingInput label="Home Tel" value={formData.home_tel} onChange={(e) => handleFieldChange("home_tel", formatPhoneNumber(e.target.value))} maxLength={14} />
              <FloatingInput label="Work Tel" value={formData.work_tel} onChange={(e) => handleFieldChange("work_tel", formatPhoneNumber(e.target.value))} maxLength={14} />
              <FloatingInput label="Fax" value={formData.fax} onChange={(e) => handleFieldChange("fax", formatPhoneNumber(e.target.value))} maxLength={14} />
              <FloatingInput label="Email" type="email" value={formData.email} onChange={(e) => handleFieldChange("email", e.target.value)} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SearchableDropdown label="Any Dependants" value={formData.any_dependants} onChange={(val) => handleFieldChange("any_dependants", val)} options={metaData?.yes_no_option} placeholder="Select" openKey="any_dependants" />
              <FloatingInput label="How Many Persons" value={formData.how_many_persons} onChange={(e) => handleFieldChange("how_many_persons", e.target.value)} type="number" />
            </div>
          </div>

          {/* SECTION 3: Patient Representative */}
          <div className="bg-card rounded-lg shadow-sm border p-6 space-y-6">
            <h2 className="text-xl font-semibold text-foreground border-b pb-3">
              Patient Representative
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <FloatingInput label="Patient Rep" value={formData.patient_rep} onChange={(e) => handleFieldChange("patient_rep", e.target.value)} />
              <FloatingInput label="First Name" value={formData.patient_first_name} onChange={(e) => handleFieldChange("patient_first_name", e.target.value)} />
              <FloatingInput label="Last Name" value={formData.patient_last_name} onChange={(e) => handleFieldChange("patient_last_name", e.target.value)} />
              <FloatingInput label="Address" value={formData.patient_address} onChange={(e) => handleFieldChange("patient_address", e.target.value)} />
              <FloatingInput label="City" value={formData.patient_city} onChange={(e) => handleFieldChange("patient_city", e.target.value)} />
              <FloatingInput label="Province" value={formData.patient_province} onChange={(e) => handleFieldChange("patient_province", e.target.value)} />
              <FloatingInput label="Postal Code" value={formData.patient_postal_code} onChange={(e) => handleFieldChange("patient_postal_code", e.target.value)} />
              <FloatingInput label="Home Tel" value={formData.patient_home_tel} onChange={(e) => handleFieldChange("patient_home_tel", formatPhoneNumber(e.target.value))} maxLength={14} />
              <FloatingInput label="Work Tel" value={formData.patient_work_tel} onChange={(e) => handleFieldChange("patient_work_tel", formatPhoneNumber(e.target.value))} maxLength={14} />
              <FloatingInput label="Fax" value={formData.patient_fax} onChange={(e) => handleFieldChange("patient_fax", formatPhoneNumber(e.target.value))} maxLength={14} />
              <FloatingInput label="Email" type="email" value={formData.patient_email} onChange={(e) => handleFieldChange("patient_email", e.target.value)} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FloatingInput label="R Lawyer" value={formData.r_lawyer} onChange={(e) => handleFieldChange("r_lawyer", e.target.value)} />
              <FloatingInput label="R Other Value" value={formData.r_othervalue} onChange={(e) => handleFieldChange("r_othervalue", e.target.value)} />
              <FloatingInput label="Signed By" value={formData.signed_by} onChange={(e) => handleFieldChange("signed_by", e.target.value)} />
              <FloatingInput label="Date" type="date" value={formData.date} onChange={(e) => handleFieldChange("date", e.target.value)} />
            </div>
          </div>

          {/* SECTION 4: Insurance Company */}
          <div className="bg-card rounded-lg shadow-sm border p-6 space-y-6">
            <h2 className="text-xl font-semibold text-foreground border-b pb-3">
              Insurance Company
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <FloatingInput label="Insurance Co" value={formData.insurance_co} onChange={(e) => handleFieldChange("insurance_co", e.target.value)} />
              <FloatingInput label="Street Address" value={formData.insurance_street_address} onChange={(e) => handleFieldChange("insurance_street_address", e.target.value)} />
              <FloatingInput label="City" value={formData.insurance_City} onChange={(e) => handleFieldChange("insurance_City", e.target.value)} />
              <FloatingInput label="Province" value={formData.insurance_province} onChange={(e) => handleFieldChange("insurance_province", e.target.value)} />
              <FloatingInput label="Postal Code" value={formData.insurance_postal_code} onChange={(e) => handleFieldChange("insurance_postal_code", e.target.value)} />
            </div>
          </div>

          {/* SECTION 5: Accident Details */}
          <div className="bg-card rounded-lg shadow-sm border p-6 space-y-6">
            <h2 className="text-xl font-semibold text-foreground border-b pb-3">
              Accident Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <FloatingInput label="Day of Week" value={formData.day_of_the_week} onChange={(e) => handleFieldChange("day_of_the_week", e.target.value)} />
              <FloatingInput label="Time of Day" type="time" value={formData.time_of_the_day} onChange={(e) => handleFieldChange("time_of_the_day", e.target.value)} />
              <FloatingInput label="Other Value" value={formData.other_value} onChange={(e) => handleFieldChange("other_value", e.target.value)} />
              <FloatingInput label="Date of Accident (1st)" type="date" value={formData.Date_of_accident_1st} onChange={(e) => handleFieldChange("Date_of_accident_1st", e.target.value)} />
              <FloatingInput label="Time of Accident (1st)" type="time" value={formData.time_of_accident_1st} onChange={(e) => handleFieldChange("time_of_accident_1st", e.target.value)} />
              <FloatingInput label="Patient Position" value={formData.patient_position} onChange={(e) => handleFieldChange("patient_position", e.target.value)} />
              <FloatingInput label="Accident Location" value={formData.accident_location} onChange={(e) => handleFieldChange("accident_location", e.target.value)} />
              <FloatingInput label="Accident City" value={formData.accident_city} onChange={(e) => handleFieldChange("accident_city", e.target.value)} />
              <FloatingInput label="Accident Province" value={formData.accident_province} onChange={(e) => handleFieldChange("accident_province", e.target.value)} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SearchableDropdown label="Did the accident occur while you were at work?" value={formData.accident_occur} onChange={(val) => handleFieldChange("accident_occur", val)} options={metaData?.yes_no_option} placeholder="Select" openKey="accident_occur" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SearchableDropdown label="Did you file a claim with the Workplace Safety and Insurance Board?" value={formData.safety_insurance} onChange={(val) => handleFieldChange("safety_insurance", val)} options={metaData?.yes_no_option} placeholder="Select" openKey="safety_insurance" />
              <SearchableDropdown label="Was the accident reported to the police?" value={formData.accident_reported_police} onChange={(val) => handleFieldChange("accident_reported_police", val)} options={metaData?.yes_no_option} placeholder="Select" openKey="accident_reported_police" />
            </div>
          </div>

          {/* SECTION 6: Police Report */}
          <div className="bg-card rounded-lg shadow-sm border p-6 space-y-6">
            <h2 className="text-xl font-semibold text-foreground border-b pb-3">
              POLICE REPORT SUMMARY
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FloatingInput label="Department" value={formData.police_department} onChange={(e) => handleFieldChange("police_department", e.target.value)} />
              <FloatingInput label="Officer Name" value={formData.officer_name} onChange={(e) => handleFieldChange("officer_name", e.target.value)} />
              <FloatingInput label="Badge No" value={formData.badge_no} onChange={(e) => handleFieldChange("badge_no", e.target.value)} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FloatingInput label="Date Reported" type="date" value={formData.police_date_reported} onChange={(e) => handleFieldChange("police_date_reported", e.target.value)} />
              <FloatingInput label="Reporting center" value={formData.reporting_center} onChange={(e) => handleFieldChange("reporting_center", e.target.value)} />
              <SearchableDropdown label="Was claimant charged ?" value={formData.was_claiment_charged} onChange={(val) => handleFieldChange("was_claiment_charged", val)} options={metaData?.yes_no_option} placeholder="Select" openKey="was_claiment_charged" />
            </div>

            <div className="space-y-4">
              <FloatingTextarea label="if yes, give details" value={formData.police_if_yes_give_details} onChange={(e) => handleFieldChange("police_if_yes_give_details", e.target.value)} rows={3} className="resize-none" />
              <FloatingTextarea label="Brief Accident Description" value={formData.brief_accident_description} onChange={(e) => handleFieldChange("brief_accident_description", e.target.value)} rows={3} className="resize-none" />
            </div>
          </div>

          {/* POST-ACCIDENT OUTCOMES */}
          <div className="bg-card rounded-lg shadow-sm border p-6 space-y-6">
            <h2 className="text-xl font-semibold text-foreground border-b pb-3">
              POST-ACCIDENT OUTCOMES
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SearchableDropdown label="Was the patient able to return to normal activities" value={formData.return_to_normal_activities} onChange={(val) => handleFieldChange("return_to_normal_activities", val)} options={metaData?.yes_no_option} placeholder="Select" openKey="return_to_normal_activities" />
              <SearchableDropdown label="Did the patient go to the hospital ?" value={formData.did_the_patient_go_to_the_hospital} onChange={(val) => handleFieldChange("did_the_patient_go_to_the_hospital", val)} options={metaData?.yes_no_option} placeholder="Select" openKey="did_the_patient_go_to_the_hospital" />
            </div>

            <FloatingTextarea label="if yes, give details" value={formData.outcome_if_yes_give_details} onChange={(e) => handleFieldChange("outcome_if_yes_give_details", e.target.value)} rows={3} className="resize-none" />

            <SearchableDropdown label="Did patient see health professional" value={formData.did_patient_see_health_professional} onChange={(val) => handleFieldChange("did_patient_see_health_professional", val)} options={metaData?.yes_no_option} placeholder="Select" openKey="did_patient_see_health_professional" />

            <FloatingTextarea label="if yes, give details" value={formData.outcome_if_yes_give_details_2nd} onChange={(e) => handleFieldChange("outcome_if_yes_give_details_2nd", e.target.value)} rows={3} className="resize-none" />

            <div className="flex items-center justify-end space-x-2">
              <Checkbox
                id="post_additional"
                checked={formData.post_accident_additional_sheets}
                onCheckedChange={(checked) => handleFieldChange("post_accident_additional_sheets", checked)}
              />
              <Label htmlFor="post_additional" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Additional Sheets Attached
              </Label>
            </div>
          </div>

          {/* SECTION 7: Health Information */}
          <div className="bg-card rounded-lg shadow-sm border p-6 space-y-6">
            <h2 className="text-xl font-semibold text-foreground border-b pb-3">
              HEALTH FACILITY
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <FloatingInput label="Facility Name" value={formData.facility_name} onChange={(e) => handleFieldChange("facility_name", e.target.value)} />
              <FloatingInput label="Health Professional" value={formData.health_professional} onChange={(e) => handleFieldChange("health_professional", e.target.value)} />
              <FloatingInput label="Address" value={formData.health_address} onChange={(e) => handleFieldChange("health_address", e.target.value)} />
              <FloatingInput label="City" value={formData.health_city} onChange={(e) => handleFieldChange("health_city", e.target.value)} />
              <FloatingInput label="Province" value={formData.health_province} onChange={(e) => handleFieldChange("health_province", e.target.value)} />
              <FloatingInput label="Postal Code" value={formData.health_postal_code} onChange={(e) => handleFieldChange("health_postal_code", e.target.value)} />
              <div className="md:col-span-2">
                <SearchableDropdown label="Has this provider begun any treatment?" value={formData.begun_ant_treatment} onChange={(val) => handleFieldChange("begun_ant_treatment", val)} options={metaData?.yes_no_option} placeholder="Select" openKey="begun_ant_treatment" />
              </div>
              <div className="md:col-span-4">
                <FloatingTextarea label="If yes, give details" value={formData.health_if_yes_give_details} onChange={(e) => handleFieldChange("health_if_yes_give_details", e.target.value)} rows={3} className="resize-none" />
              </div>
            </div>
            <div className="flex items-center justify-end space-x-2">
              <Checkbox
                id="health_additional"
                checked={formData.health_facility_additional_sheets}
                onCheckedChange={(checked) => handleFieldChange("health_facility_additional_sheets", checked)}
              />
              <Label htmlFor="health_additional" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Additional Sheets Attached
              </Label>
            </div>
          </div>

          {/* SECTION 8: Insurance Policy Details */}
          <div className="bg-card rounded-lg shadow-sm border p-6 space-y-6">
            <h2 className="text-xl font-semibold text-foreground border-b pb-3">
              Insurance Policy Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <SearchableDropdown label="Private Policy" value={formData.private_policy} onChange={(val) => handleFieldChange("private_policy", val)} options={metaData?.yes_no_option} placeholder="Select" openKey="private_policy" />
              <SearchableDropdown label="Spouse Policy" value={formData.spouse_policy} onChange={(val) => handleFieldChange("spouse_policy", val)} options={metaData?.yes_no_option} placeholder="Select" openKey="spouse_policy" />
              <SearchableDropdown label="Claimant US Dependent" value={formData.claimant_us_dependent} onChange={(val) => handleFieldChange("claimant_us_dependent", val)} options={metaData?.yes_no_option} placeholder="Select" openKey="claimant_us_dependent" />
              <SearchableDropdown label="Claimant as Driver" value={formData.claimant_as_a_drive} onChange={(val) => handleFieldChange("claimant_as_a_drive", val)} options={metaData?.yes_no_option} placeholder="Select" openKey="claimant_as_a_drive" />
              <SearchableDropdown label="Claimant Employer Policy" value={formData.claimant_employer_policy} onChange={(val) => handleFieldChange("claimant_employer_policy", val)} options={metaData?.yes_no_option} placeholder="Select" openKey="claimant_employer_policy" />
              <SearchableDropdown label="Policy Insuring" value={formData.policy_insuring} onChange={(val) => handleFieldChange("policy_insuring", val)} options={metaData?.yes_no_option} placeholder="Select" openKey="policy_insuring" />
            </div>
          </div>

          {/* SECTION 9: Vehicle Information */}
          <div className="bg-card rounded-lg shadow-sm border p-6 space-y-6">
            <h2 className="text-xl font-semibold text-foreground border-b pb-3">
              Insurance Company 1
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <FloatingInput label="Policyholder Name" value={formData.name_of_policyholder} onChange={(e) => handleFieldChange("name_of_policyholder", e.target.value)} />
              <FloatingInput label="Insurance Company" value={formData.insurance_company} onChange={(e) => handleFieldChange("insurance_company", e.target.value)} />
              <FloatingInput label="Policy Number" value={formData.policy_number} onChange={(e) => handleFieldChange("policy_number", e.target.value)} />
              <FloatingInput label="Automobile Make Model Year" value={formData.automobile_make_model_year} onChange={(e) => handleFieldChange("automobile_make_model_year", e.target.value)} />
              <FloatingInput label="Licence Plate No" value={formData.licence_plate_no} onChange={(e) => handleFieldChange("licence_plate_no", e.target.value)} />
              <SearchableDropdown label="Were You Occupant at Time of Accident" value={formData.were_you_an_occupant_of_this_automobile_at_the_time_of_the_accident} onChange={(val) => handleFieldChange("were_you_an_occupant_of_this_automobile_at_the_time_of_the_accident", val)} options={metaData?.yes_no_option} placeholder="Select" openKey="were_you_an_occupant_of_this_automobile_at_the_time_of_the_accident" />
            </div>
          </div>

          {/* SECTION 10: Employment Status */}
          <div className="bg-card rounded-lg shadow-sm border p-6 space-y-6">
            <h2 className="text-xl font-semibold text-foreground border-b pb-3">
              Employment Status
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <SearchableDropdown label="Employed" value={formData.employed} onChange={(val) => handleFieldChange("employed", val)} options={employmentMetadata?.employed} placeholder="Select" openKey="employed" />
              <SearchableDropdown label="Not Employed" value={formData.not_employed} onChange={(val) => handleFieldChange("not_employed", val)} options={employmentMetadata?.not_employed} placeholder="Select" openKey="not_employed" />
              {formData.not_employed === "Unemployed And" && (
                <SearchableDropdown label="Unemployed And" value={formData.un_employed_and} onChange={(val) => handleFieldChange("un_employed_and", val)} options={employmentMetadata?.unemployed_and} placeholder="Select" openKey="un_employed_and" />
              )}
            </div>
            {/* New Checkboxes for Student/Graduate & Caregiver */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="student_or_recent_graduate"
                  checked={
                    formData.student_or_recent_graduate === true ||
                    formData.student_or_recent_graduate === "true"
                  }
                  onCheckedChange={(checked) =>
                    handleFieldChange("student_or_recent_graduate", checked)
                  }
                />
                <Label htmlFor="student_or_recent_graduate">
                  Student or recent graduate
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="caregiver"
                  checked={
                    formData.caregiver === true || formData.caregiver === "true"
                  }
                  onCheckedChange={(checked) =>
                    handleFieldChange("caregiver", checked)
                  }
                />
                <Label htmlFor="caregiver">Caregiver</Label>
              </div>
            </div>
          </div>

          {/* SECTION 11: STUDENT ATTENDING SCHOOL */}
          <div className="bg-card rounded-lg shadow-sm border p-6 space-y-6">
            <h2 className="text-xl font-semibold text-foreground border-b pb-3 uppercase">
              Student Attending School
            </h2>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <Label className="text-sm font-medium flex-1">
                Was the claimant attending school on a full-time basis at the time of the accident or had he/she completed education less than one year before the accident?
              </Label>
              <div className="w-full md:w-1/4">
                <SearchableDropdown label="Attending School" value={formData.applicant_status_claimant_attending_school} onChange={(val) => handleFieldChange("applicant_status_claimant_attending_school", val)} options={metaData?.yes_no_option} placeholder="Select" openKey="applicant_status_claimant_attending_school" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <FloatingInput label="Name of School" value={formData.applicant_status_name_of_school} onChange={(e) => handleFieldChange("applicant_status_name_of_school", e.target.value)} />
              <FloatingInput label="Address" value={formData.applicant_status_address} onChange={(e) => handleFieldChange("applicant_status_address", e.target.value)} />
              <FloatingInput label="City" value={formData.applicant_status_city} onChange={(e) => handleFieldChange("applicant_status_city", e.target.value)} />
              <FloatingInput label="Province" value={formData.applicant_status_province} onChange={(e) => handleFieldChange("applicant_status_province", e.target.value)} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <FloatingInput label="Postal Code" value={formData.applicant_status_postal_code} onChange={(e) => handleFieldChange("applicant_status_postal_code", e.target.value)} />
              <FloatingInput label="Date Last Attended" type="date" value={formData.applicant_status_data_last_attended_date} onChange={(e) => handleFieldChange("applicant_status_data_last_attended_date", e.target.value)} />
              <FloatingInput label="Program and Level" value={formData.applicant_status_program_and_level} onChange={(e) => handleFieldChange("applicant_status_program_and_level", e.target.value)} />
              <FloatingInput label="Projected Date for completion" type="date" value={formData.applicant_status_project_date_for_completion} onChange={(e) => handleFieldChange("applicant_status_project_date_for_completion", e.target.value)} />
            </div>

            {/* Row 4: Is the claimant attending school? */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <Label className="text-sm font-medium">
                Is the claimant attending school ?
              </Label>
              <div className="flex gap-4 w-full md:w-auto">
                <div className="w-full md:w-[200px]">
                  <SearchableDropdown
                    label="Attending School"
                    value={formData.applicant_status_is_the_claimant_attending_school}
                    onChange={(val) => handleFieldChange("applicant_status_is_the_claimant_attending_school", val)}
                    options={metaData?.yes_no_option}
                    placeholder="Select"
                    openKey="applicant_status_is_the_claimant_attending_school"
                  />
                </div>
                <div className="w-full md:w-[200px]">
                  <FloatingInput label="Date" type="date" value={formData.applicant_status_is_the_claimant_attending_school_date} onChange={(e) => handleFieldChange("applicant_status_is_the_claimant_attending_school_date", e.target.value)} />
                </div>
              </div>
            </div>

            {/* Row 5: Was the claimant able to return to school... */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <Label className="text-sm font-medium">
                Was the claimant able to return to school after the accident
              </Label>
              <div className="flex gap-4 w-full md:w-auto">
                <div className="w-full md:w-[200px]">
                  <SearchableDropdown
                    label="Return to School"
                    value={formData.applicant_status_was_the_claimant_able_to_return_to_school_after_the_accident}
                    onChange={(val) => handleFieldChange("applicant_status_was_the_claimant_able_to_return_to_school_after_the_accident", val)}
                    options={metaData?.yes_no_option}
                    placeholder="Select"
                    openKey="applicant_status_was_the_claimant_able_to_return_to_school_after_the_accident"
                  />
                </div>
                <div className="w-full md:w-[200px]">
                  <Input
                    type="date"
                    value={
                      formData.applicant_status_was_the_claimant_able_to_return_to_school_after_the_accident_date
                    }
                    onChange={(e) =>
                      handleFieldChange(
                        "applicant_status_was_the_claimant_able_to_return_to_school_after_the_accident_date",
                        e.target.value
                      )
                    }
                    className="h-10"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 12: CAREGIVER */}
          <div className="bg-card rounded-lg shadow-sm border p-6 space-y-6">
            <h2 className="text-xl font-semibold text-foreground border-b pb-3 uppercase">
              Caregiver
            </h2>

            {/* Q1 */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <Label className="text-sm font-medium flex-1">
                Was the claimant the main caregiver to people with him / her at the
                time of the accident
              </Label>
              <div className="w-full md:w-1/4">
                <SearchableDropdown
                  label="Main Caregiver"
                  value={formData.caregiver_him_her_at_the_time_accident}
                  onChange={(val) =>
                    handleFieldChange(
                      "caregiver_him_her_at_the_time_accident",
                      val
                    )
                  }
                  options={metaData?.yes_no_option}
                  placeholder="Select"
                  openKey="caregiver_him_her_at_the_time_accident"
                />
              </div>
            </div>

            {/* Q2 */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <Label className="text-sm font-medium flex-1">
                Was the claimant paid to provide care to these people ?
              </Label>
              <div className="w-full md:w-1/4">
                <SearchableDropdown
                  label="Paid to Provide Care"
                  value={
                    formData.caregiver_claimant_paid_to_provide_care_to_these_people
                  }
                  onChange={(val) =>
                    handleFieldChange(
                      "caregiver_claimant_paid_to_provide_care_to_these_people",
                      val
                    )
                  }
                  options={metaData?.yes_no_option}
                  placeholder="Select"
                  openKey="caregiver_claimant_paid_to_provide_care_to_these_people"
                />
              </div>
            </div>

            {/* List of People */}
            <div className="space-y-4 pt-4">
              <h3 className="font-medium text-foreground">
                List of people the claimant has taken care of at the time of the
                accident
              </h3>
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-5 md:col-span-6">
                  <Label className="text-sm font-medium text-muted-foreground">
                    Name
                  </Label>
                </div>
                <div className="col-span-4 md:col-span-3">
                  <Label className="text-sm font-medium text-muted-foreground">
                    Date of Birth
                  </Label>
                </div>
                <div className="col-span-3 md:col-span-3">
                  <Label className="text-sm font-medium text-muted-foreground">
                    Disabled?
                  </Label>
                </div>
              </div>

              {[0, 1, 2, 3, 4].map((index) => (
                <div key={index} className="grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-5 md:col-span-6">
                    <Input
                      value={formData.caregiver_name[index] || ""}
                      onChange={(e) =>
                        handleArrayFieldChange(
                          "caregiver_name",
                          index,
                          e.target.value
                        )
                      }
                      className="h-10"
                    />
                  </div>
                  <div className="col-span-4 md:col-span-3">
                    <Input
                      type="date"
                      value={formData.caregiver_date[index] || ""}
                      onChange={(e) =>
                        handleArrayFieldChange(
                          "caregiver_date",
                          index,
                          e.target.value
                        )
                      }
                      className="h-10"
                    />
                  </div>
                  <div className="col-span-3 md:col-span-3">
                    <SearchableDropdown
                      label="Disabled?"
                      value={formData.caregiver_disabled[index] || ""}
                      onChange={(val) =>
                        handleArrayFieldChange("caregiver_disabled", index, val)
                      }
                      options={metaData?.yes_no_option}
                      placeholder="Select"
                      openKey={`caregiver_disabled_${index}`}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Section */}
            <div className="space-y-6 pt-4 border-t mt-4">
              {/* Q3 */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <Label className="text-sm font-medium flex-1">
                  As a result of patient`s injuries does the patient suffer a
                  substantial inability to engage in the caregiving activities in which he/she
                  engaged at the time of the accident ?
                </Label>
                <div className="w-full md:w-1/4">
                  <SearchableDropdown
                    label="Substantial Inability"
                    value={
                      formData.patient_suffer_a_substantial_to_engage_in_the_caregiving
                    }
                    onChange={(val) =>
                      handleFieldChange(
                        "patient_suffer_a_substantial_to_engage_in_the_caregiving",
                        val
                      )
                    }
                    options={metaData?.yes_no_option}
                    placeholder="Select"
                    openKey="patient_suffer_a_substantial_to_engage_in_the_caregiving"
                  />
                </div>
              </div>

              {/* Q4 */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <Label className="text-sm font-medium flex-1">
                  if yes to above, indicate the date and explain below
                </Label>
                <div className="w-full md:w-1/4">
                  <Input
                    type="date"
                    value={
                      formData.caregiver_if_yes_to_above_indicate_the_date_and_explain_below
                    }
                    onChange={(e) =>
                      handleFieldChange(
                        "caregiver_if_yes_to_above_indicate_the_date_and_explain_below",
                        e.target.value
                      )
                    }
                    className="h-10"
                  />
                </div>
              </div>

              {/* Explain Below Textarea */}
              <div className="space-y-2">
                <Textarea
                  value={formData.caregiver_explain_below}
                  onChange={(e) =>
                    handleFieldChange("caregiver_explain_below", e.target.value)
                  }
                  className="min-h-[100px]"
                />
              </div>

              {/* Q5 */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <Label className="text-sm font-medium flex-1">
                  Did claimant return to caregiving after the accident
                </Label>
                <div className="w-full md:w-1/4">
                  <SearchableDropdown
                    label="Return to Caregiving"
                    value={
                      formData.caregiver_did_claimant_return_to_caregiving_after_the_accident
                    }
                    onChange={(val) =>
                      handleFieldChange(
                        "caregiver_did_claimant_return_to_caregiving_after_the_accident",
                        val
                      )
                    }
                    options={metaData?.yes_no_option}
                    placeholder="Select"
                    openKey="caregiver_did_claimant_return_to_caregiving_after_the_accident"
                  />
                </div>
              </div>

              {/* Q6 */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <Label className="text-sm font-medium flex-1">
                  if yes to above , indicate return date
                </Label>
                <div className="w-full md:w-1/4">
                  <Input
                    type="date"
                    value={
                      formData.caregiver_if_yes_to_above_inicate_return_date
                    }
                    onChange={(e) =>
                      handleFieldChange(
                        "caregiver_if_yes_to_above_inicate_return_date",
                        e.target.value
                      )
                    }
                    className="h-10"
                  />
                </div>
              </div>

              {/* Additional Sheets Attached 2 */}
              <div className="flex justify-end pt-2">
                <div className="flex items-center space-x-2">
                  <Label
                    htmlFor="caregiver_additional_sheets_attached_2"
                    className="font-normal text-muted-foreground"
                  >
                    Additional Sheets Attached
                  </Label>
                  <Checkbox
                    id="caregiver_additional_sheets_attached_2"
                    checked={
                      formData.caregiver_additional_sheets_attached_2 === true ||
                      formData.caregiver_additional_sheets_attached_2 === "true"
                    }
                    onCheckedChange={(checked) =>
                      handleFieldChange(
                        "caregiver_additional_sheets_attached_2",
                        checked
                      )
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 13: Employment Information */}
          <div className="bg-card rounded-lg shadow-sm border p-6 space-y-6">
            <h2 className="text-xl font-semibold text-foreground border-b pb-3 uppercase">
              INCOME REPLACEMENT DETERMINATION (DETAILS OF CLAIMANT'S EMPLOYMENT FOR THE PAST 52 WEEKS)
            </h2>

            {/* Table Header */}
            <div className="hidden md:grid grid-cols-12 gap-2 text-center items-end bg-muted/50 p-2 rounded">
              <div className="col-span-3">
                <Label className="text-sm font-semibold">
                  Date (Year/Month/Day) <br /> From To
                </Label>
              </div>
              <div className="col-span-3 border-l border-indigo-500 pl-2">
                <Label className="text-sm font-semibold">
                  Name and address of Most Recent Employer
                </Label>
              </div>
              <div className="col-span-2 border-l border-indigo-500 pl-2">
                <Label className="text-sm font-semibold">
                  Position / Essential Task
                </Label>
              </div>
              <div className="col-span-2 border-l border-indigo-500 pl-2">
                <Label className="text-sm font-semibold">
                  No. of Hours Per Week
                </Label>
              </div>
              <div className="col-span-2 border-l border-indigo-500 pl-2">
                <Label className="text-sm font-semibold">
                  Gross Income for the Period
                </Label>
              </div>
            </div>

            {/* Table Rows */}
            <div className="space-y-2">
              {[0, 1, 2, 3, 4].map((index) => (
                <div
                  key={index}
                  className="grid grid-cols-12 gap-2 items-center border-b md:border-none pb-4 md:pb-0"
                >
                  {/* Mobile Headers */}
                  <div className="col-span-12 md:hidden">
                    <h3 className="font-medium text-foreground py-2">
                      Employment Details #{index + 1}
                    </h3>
                  </div>

                  {/* Date From/To */}
                  <div className="col-span-12 md:col-span-3 flex gap-4 pr-2">
                    <div className="flex-1">
                      <DatePicker
                        label="From"
                        value={formData.date_from[index] || ""}
                        onChange={(val) =>
                          handleArrayFieldChange("date_from", index, val)
                        }
                        placeholder="Pick a date"
                        openKey={`date_from_${index}`}
                      />
                    </div>
                    <div className="flex-1">
                      <DatePicker
                        label="To"
                        value={formData.date_to[index] || ""}
                        onChange={(val) =>
                          handleArrayFieldChange("date_to", index, val)
                        }
                        placeholder="Pick a date"
                        openKey={`date_to_${index}`}
                      />
                    </div>
                  </div>

                  {/* Employer Name/Address */}
                  <div className="col-span-12 md:col-span-3 border-l border-indigo-500 pl-2">
                    <div className="md:hidden">
                      <Label className="text-xs">Employer</Label>
                    </div>
                    <Input
                      value={formData.employer_name_address[index] || ""}
                      onChange={(e) =>
                        handleArrayFieldChange(
                          "employer_name_address",
                          index,
                          e.target.value
                        )
                      }
                      className="h-10"
                    />
                  </div>

                  {/* Position */}
                  <div className="col-span-12 md:col-span-2 border-l border-indigo-500 pl-2">
                    <div className="md:hidden">
                      <Label className="text-xs">Position</Label>
                    </div>
                    <Input
                      value={formData.position_task[index] || ""}
                      onChange={(e) =>
                        handleArrayFieldChange(
                          "position_task",
                          index,
                          e.target.value
                        )
                      }
                      className="h-10"
                    />
                  </div>

                  {/* Hours */}
                  <div className="col-span-12 md:col-span-2 border-l border-indigo-500 pl-2">
                    <div className="md:hidden">
                      <Label className="text-xs">Hours</Label>
                    </div>
                    <Input
                      value={formData.hours_per_week[index] || ""}
                      onChange={(e) =>
                        handleArrayFieldChange(
                          "hours_per_week",
                          index,
                          e.target.value
                        )
                      }
                      className="h-10"
                    />
                  </div>

                  {/* Gross Income */}
                  <div className="col-span-12 md:col-span-2 border-l border-indigo-500 pl-2">
                    <div className="md:hidden">
                      <Label className="text-xs">Gross Income</Label>
                    </div>
                    <Input
                      value={formData.gross_income[index] || ""}
                      onChange={(e) =>
                        handleArrayFieldChange(
                          "gross_income",
                          index,
                          e.target.value
                        )
                      }
                      placeholder="$0.00"
                      className="h-10"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Additional Sheets Attached */}
            <div className="flex justify-end pt-2">
              <div className="flex items-center space-x-2">
                <Label
                  htmlFor="employment_additional_sheets_attached"
                  className="font-normal text-muted-foreground"
                >
                  Additional Sheets Attached
                </Label>
                <Checkbox
                  id="employment_additional_sheets_attached"
                  checked={
                    formData.employment_additional_sheets_attached === true ||
                    formData.employment_additional_sheets_attached === "true"
                  }
                  onCheckedChange={(checked) =>
                    handleFieldChange("employment_additional_sheets_attached", checked)
                  }
                />
              </div>
            </div>

            {/* Bottom Section */}
            <div className="space-y-6 pt-4 border-t mt-4">
              {/* Q1 */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <Label className="text-sm font-medium flex-1">
                  Do the claimant`s injuries prevent him/her from working
                </Label>
                <div className="w-full md:w-1/4">
                  <SearchableDropdown
                    label="Prevent from Working"
                    value={
                      formData.income_injuries_private_him_her_from_working
                    }
                    onChange={(val) =>
                      handleFieldChange(
                        "income_injuries_private_him_her_from_working",
                        val
                      )
                    }
                    options={metaData?.yes_no_option}
                    placeholder="Select"
                    openKey="income_injuries_private_him_her_from_working"
                  />
                </div>
              </div>

              {/* Q2 */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <Label className="text-sm font-medium flex-1">
                  From what date ?
                </Label>
                <div className="w-full md:w-1/4">
                  <Input
                    type="date"
                    value={formData.income_form_what_date}
                    onChange={(e) =>
                      handleFieldChange(
                        "income_form_what_date",
                        e.target.value
                      )
                    }
                    className="h-10"
                  />
                </div>
              </div>

              {/* Q3 */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <Label className="text-sm font-medium flex-1">
                  At any period since the accident, were you able to return to work since the accident?
                </Label>
                <div className="w-full md:w-1/4">
                  <SearchableDropdown
                    label="Return to Work"
                    value={
                      formData.were_you_able_to_return_to_work_since_the_accident
                    }
                    onChange={(val) =>
                      handleFieldChange(
                        "were_you_able_to_return_to_work_since_the_accident",
                        val
                      )
                    }
                    options={metaData?.yes_no_option}
                    placeholder="Select"
                    openKey="were_you_able_to_return_to_work_since_the_accident"
                  />
                </div>
              </div>

              {/* Q4 */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <Label className="text-sm font-medium flex-1">
                  When ?
                </Label>
                <div className="w-full md:w-1/4">
                  <Input
                    type="date"
                    value={formData.income_when_date}
                    onChange={(e) =>
                      handleFieldChange("income_when_date", e.target.value)
                    }
                    className="h-10"
                  />
                </div>
              </div>

              {/* Q5 */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <Label className="text-sm font-medium flex-1">
                  The amount of claimant`s benefit is based on his/her past income . During which of the following periods did he/she have the highest average weekly income ?
                </Label>
                <div className="w-full md:w-1/4">
                  <SearchableDropdown
                    label="Income Period"
                    value={
                      formData.The_amount_of_claimants_benefit_id_based_on_his_her_past_income
                    }
                    onChange={(val) =>
                      handleFieldChange(
                        "The_amount_of_claimants_benefit_id_based_on_his_her_past_income",
                        val
                      )
                    }
                    options={metaData?.yes_no_option}
                    placeholder="Select"
                    openKey="The_amount_of_claimants_benefit_id_based_on_his_her_past_income"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 14: Other Insurance & Benefits */}
          <div className="bg-card rounded-lg shadow-sm border p-6 space-y-6">
            <h2 className="text-xl font-semibold text-foreground border-b pb-3 uppercase">
              OTHER INSURANCE OR COLLATERAL PAYMENTS
            </h2>

            {/* Q1: Other Benefit Plan */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <Label className="text-sm font-medium flex-1 pt-2">
                Does the applicant his /her spouse or anyone he/she is dependent
                on (e.g parents) have any other benefit plan that covers
                him/her (e.g group or private,union disability medical or dental
                etc ?
              </Label>
              <div className="w-full md:w-1/4">
                <SearchableDropdown
                  label="Other Benefit Plan"
                  value={formData.other_insurance_or_spouse_dependent}
                  onChange={(val) =>
                    handleFieldChange("other_insurance_or_spouse_dependent", val)
                  }
                  options={metaData?.yes_no_option}
                  placeholder="Select"
                  openKey="other_insurance_or_spouse_dependent"
                />
              </div>
            </div>

            {/* Benefit Payer Grid */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Label className="hidden md:block text-sm font-medium">
                  Name of Benefit Payer
                </Label>
                <Label className="hidden md:block text-sm font-medium">
                  Type of Coverage
                </Label>
                <Label className="hidden md:block text-sm font-medium">
                  Policy or Certificate No
                </Label>
              </div>

              {[0, 1].map((index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2 md:space-y-0">
                    <Label className="md:hidden text-sm font-medium">
                      Name of Benefit Payer
                    </Label>
                    <Input
                      value={formData.name_of_benefit_payer[index] || ""}
                      onChange={(e) =>
                        handleArrayFieldChange(
                          "name_of_benefit_payer",
                          index,
                          e.target.value
                        )
                      }
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-2 md:space-y-0">
                    <Label className="md:hidden text-sm font-medium">
                      Type of Coverage
                    </Label>
                    <Input
                      value={formData.type_of_coverage[index] || ""}
                      onChange={(e) =>
                        handleArrayFieldChange(
                          "type_of_coverage",
                          index,
                          e.target.value
                        )
                      }
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-2 md:space-y-0">
                    <Label className="md:hidden text-sm font-medium">
                      Policy or Certifucate No
                    </Label>
                    <Input
                      value={formData.policy_or_certifucate_no[index] || ""}
                      onChange={(e) =>
                        handleArrayFieldChange(
                          "policy_or_certifucate_no",
                          index,
                          e.target.value
                        )
                      }
                      className="h-10"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Q2: Disability Income */}
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <Label className="text-sm font-medium flex-1">
                  During the past 52 weeks , did the claimant receive any income
                  from a disability benefit Plan
                </Label>
                <div className="w-full md:w-1/4">
                  <SearchableDropdown
                    label="Disability Benefit Plan"
                    value={formData.other_disability_benift_plan}
                    onChange={(val) =>
                      handleFieldChange("other_disability_benift_plan", val)
                    }
                    options={metaData?.yes_no_option}
                    placeholder="Select"
                    openKey="other_disability_benift_plan"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <DatePicker label="From Date" value={formData.other_form_date} onChange={(val) => handleFieldChange("other_form_date", val)} placeholder="dd/mm/yyyy" openKey="other_form_date" />
                <DatePicker label="To Date" value={formData.other_to_date} onChange={(val) => handleFieldChange("other_to_date", val)} placeholder="dd/mm/yyyy" openKey="other_to_date" />
                <FloatingInput label="Total Amount Received" value={formData.other_total_amount_recived} onChange={(e) => handleFieldChange("other_total_amount_recived", e.target.value)} />
              </div>
            </div>

            {/* Q3: Employment Insurance */}
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <Label className="text-sm font-medium flex-1">
                  Is the claimant receiving Employment Insurance Benefit ?
                </Label>
                <div className="w-full md:w-1/4">
                  <SearchableDropdown
                    label="Employment Insurance"
                    value={formData.other_receiving_employment_insurance}
                    onChange={(val) =>
                      handleFieldChange(
                        "other_receiving_employment_insurance",
                        val
                      )
                    }
                    options={metaData?.yes_no_option}
                    placeholder="Select"
                    openKey="other_receiving_employment_insurance"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <DatePicker label="From Date" value={formData.other_form_date1} onChange={(val) => handleFieldChange("other_form_date1", val)} placeholder="dd/mm/yyyy" openKey="other_form_date1" />
                <DatePicker label="To Date" value={formData.other_to_date1} onChange={(val) => handleFieldChange("other_to_date1", val)} placeholder="dd/mm/yyyy" openKey="other_to_date1" />
                <FloatingInput label="Total Amount Received" value={formData.other_total_amount_recived1} onChange={(e) => handleFieldChange("other_total_amount_recived1", e.target.value)} />
              </div>
            </div>

            {/* Q4: Social Assistance */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <Label className="text-sm font-medium flex-1">
                Is the claimant receiving Social Assistance Benefits (Welfare) ?
              </Label>
              <div className="w-full md:w-1/4">
                <SearchableDropdown
                  label="Social Assistance"
                  value={formData.other_receiving_social_assistance_benfits}
                  onChange={(val) =>
                    handleFieldChange(
                      "other_receiving_social_assistance_benfits",
                      val
                    )
                  }
                  options={metaData?.yes_no_option}
                  placeholder="Select"
                  openKey="other_receiving_social_assistance_benfits"
                />
              </div>
            </div>

            {/* Additional Sheets Attached */}
            <div className="flex justify-end pt-2">
              <div className="flex items-center space-x-2">
                <Label
                  htmlFor="other_insurance_additional_sheets"
                  className="font-normal text-muted-foreground"
                >
                  Additional Sheets Attached
                </Label>
                <Checkbox
                  id="other_insurance_additional_sheets"
                  checked={
                    formData.other_insurance_additional_sheets === true ||
                    formData.other_insurance_additional_sheets === "true"
                  }
                  onCheckedChange={(checked) =>
                    handleFieldChange(
                      "other_insurance_additional_sheets",
                      checked
                    )
                  }
                />
              </div>
            </div>
          </div>

          {/* SECTION 15: Applicant Signature */}
          <div className="bg-card rounded-lg shadow-sm border p-6 space-y-6">
            <h2 className="text-xl font-semibold text-foreground border-b pb-3">
              Applicant Signature
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FloatingInput label="Applicant Name" value={formData.applicant_name} onChange={(e) => handleFieldChange("applicant_name", e.target.value)} />
              <FloatingInput label="Applicant Date" type="date" value={formData.applicant_date} onChange={(e) => handleFieldChange("applicant_date", e.target.value)} />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4 pt-6 border-t">
            <Button
              variant="outline"
              type="button"
              onClick={() => navigate(-1)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save OCF-PROD"
              )}
            </Button>
          </div>
        </form>
      </main>
    </div >
  );
}
