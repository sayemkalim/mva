import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import { Navbar2 } from "@/components/navbar2";
import { createOcfProd, updateOcfProd } from "../../helpers/createOcfProd";
import { fetchOcfProdById } from "../../helpers/fetchOcfProdById";

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
    mutationFn: ({ isEdit, idOrSlug, payload }) =>
      isEdit
        ? updateOcfProd(idOrSlug, payload)
        : createOcfProd({ slug: idOrSlug, payload }),
    onSuccess: (res) => {
      const r = res?.data || res?.response || res;
      toast.success(r?.message || "Form saved");
      queryClient.invalidateQueries(["ocfProd", id]);
      navigate(-1);
    },
    onError: (err) => {
      console.error(err);
      toast.error("Failed to save OCF-PROD");
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
    police_if_yes_give_details: "",
    brief_accident_description: "",
    return_to_normal_activities: "",
    did_the_patient_go_to_the_hospital: "",
    outcome_if_yes_give_details: "",
    did_patient_see_health_professional: "",
    outcome_if_yes_give_details_2nd: "",
    facility_name: "",
    health_professional: "",
    health_address: "",
    health_city: "",
    health_province: "",
    health_postal_code: "",
    begun_ant_treatment: "",
    health_if_yes_give_details: "",
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
    were_you_an_occupant_of_this_automobile_at_the_time_of_the_accident: "",
    employed: "",
    not_employed: "",
    un_employed_and: "",
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
    applicant_name: "",
    applicant_date: "",
  });

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
      police_if_yes_give_details: d.police_if_yes_give_details || "",
      brief_accident_description: d.brief_accident_description || "",
      return_to_normal_activities: d.return_to_normal_activities || "",
      did_the_patient_go_to_the_hospital:
        d.did_the_patient_go_to_the_hospital || "",
      outcome_if_yes_give_details: d.outcome_if_yes_give_details || "",
      did_patient_see_health_professional:
        d.did_patient_see_health_professional || "",
      outcome_if_yes_give_details_2nd: d.outcome_if_yes_give_details_2nd || "",
      facility_name: d.facility_name || "",
      health_professional: d.health_professional || "",
      health_address: d.health_address || "",
      health_city: d.health_city || "",
      health_province: d.health_province || "",
      health_postal_code: d.health_postal_code || "",
      begun_ant_treatment: d.begun_ant_treatment || "",
      health_if_yes_give_details: d.health_if_yes_give_details || "",
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

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      name: ocfRecord?.name || "ocf-1",
      slug: ocfRecord?.slug || slug,
      data: formData,
    };

    if (isEditMode) {
      saveMutation.mutate({ isEdit: true, idOrSlug: recordId || id, payload });
    } else {
      saveMutation.mutate({ isEdit: false, idOrSlug: slug, payload });
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
    <div className="min-h-screen bg-gray-50">
      <Navbar2 />

      <header className="bg-white border-b px-6 py-3">
        <div className="flex items-center justify-end gap-6 text-sm text-gray-700">
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

      <nav className="bg-white border-b px-6 py-4 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/dashboard")}
            className="hover:text-gray-900 transition"
            type="button"
          >
            Dashboard
          </button>
          <ChevronRight className="w-4 h-4" />
          <button
            onClick={() => navigate("/dashboard/workstation")}
            className="hover:text-gray-900 transition"
            type="button"
          >
            Workstation
          </button>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 font-medium">OCF-PROD</span>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-8 max-w-7xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">OCF-PROD Form</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* SECTION 1: Basic Information */}
          <div className="bg-white rounded-lg shadow-sm border p-6 space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 border-b pb-3">
              Basic Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Claim No</Label>
                <Input
                  value={formData.claim_no}
                  onChange={(e) =>
                    handleFieldChange("claim_no", e.target.value)
                  }
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Policy No</Label>
                <Input
                  value={formData.policy_no}
                  onChange={(e) =>
                    handleFieldChange("policy_no", e.target.value)
                  }
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Date of Accident</Label>
                <Input
                  type="date"
                  value={formData.date_of_accident}
                  onChange={(e) =>
                    handleFieldChange("date_of_accident", e.target.value)
                  }
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Document Date</Label>
                <Input
                  type="date"
                  value={formData.document_date}
                  onChange={(e) =>
                    handleFieldChange("document_date", e.target.value)
                  }
                  className="h-10"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: Applicant Information */}
          <div className="bg-white rounded-lg shadow-sm border p-6 space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 border-b pb-3">
              Applicant Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">First Name</Label>
                <Input
                  value={formData.first_name}
                  onChange={(e) =>
                    handleFieldChange("first_name", e.target.value)
                  }
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Middle Name</Label>
                <Input
                  value={formData.middle_name}
                  onChange={(e) =>
                    handleFieldChange("middle_name", e.target.value)
                  }
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Last Name</Label>
                <Input
                  value={formData.last_name}
                  onChange={(e) =>
                    handleFieldChange("last_name", e.target.value)
                  }
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Gender</Label>
                <Input
                  value={formData.gender}
                  onChange={(e) => handleFieldChange("gender", e.target.value)}
                  placeholder="Male/Female"
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Date of Birth</Label>
                <Input
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) =>
                    handleFieldChange("date_of_birth", e.target.value)
                  }
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Language</Label>
                <Input
                  value={formData.language}
                  onChange={(e) =>
                    handleFieldChange("language", e.target.value)
                  }
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Marital Status</Label>
                <Input
                  value={formData.marital_status}
                  onChange={(e) =>
                    handleFieldChange("marital_status", e.target.value)
                  }
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Driver Licence No</Label>
                <Input
                  value={formData.driver_licence_no}
                  onChange={(e) =>
                    handleFieldChange("driver_licence_no", e.target.value)
                  }
                  className="h-10"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2 col-span-2">
                <Label className="text-sm font-medium">Street Address</Label>
                <Input
                  value={formData.street_address}
                  onChange={(e) =>
                    handleFieldChange("street_address", e.target.value)
                  }
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">City</Label>
                <Input
                  value={formData.city}
                  onChange={(e) => handleFieldChange("city", e.target.value)}
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Province</Label>
                <Input
                  value={formData.province}
                  onChange={(e) =>
                    handleFieldChange("province", e.target.value)
                  }
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Postal Code</Label>
                <Input
                  value={formData.postal_code}
                  onChange={(e) =>
                    handleFieldChange("postal_code", e.target.value)
                  }
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Home Tel</Label>
                <Input
                  value={formData.home_tel}
                  onChange={(e) =>
                    handleFieldChange("home_tel", e.target.value)
                  }
                  placeholder="(000) 000-0000"
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Work Tel</Label>
                <Input
                  value={formData.work_tel}
                  onChange={(e) =>
                    handleFieldChange("work_tel", e.target.value)
                  }
                  placeholder="(000) 000-0000"
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Fax</Label>
                <Input
                  value={formData.fax}
                  onChange={(e) => handleFieldChange("fax", e.target.value)}
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Email</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleFieldChange("email", e.target.value)}
                  className="h-10"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Any Dependants</Label>
                <Input
                  value={formData.any_dependants}
                  onChange={(e) =>
                    handleFieldChange("any_dependants", e.target.value)
                  }
                  placeholder="Yes/No"
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">How Many Persons</Label>
                <Input
                  value={formData.how_many_persons}
                  onChange={(e) =>
                    handleFieldChange("how_many_persons", e.target.value)
                  }
                  type="number"
                  className="h-10"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: Patient Representative */}
          <div className="bg-white rounded-lg shadow-sm border p-6 space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 border-b pb-3">
              Patient Representative
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Patient Rep</Label>
                <Input
                  value={formData.patient_rep}
                  onChange={(e) =>
                    handleFieldChange("patient_rep", e.target.value)
                  }
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">First Name</Label>
                <Input
                  value={formData.patient_first_name}
                  onChange={(e) =>
                    handleFieldChange("patient_first_name", e.target.value)
                  }
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Last Name</Label>
                <Input
                  value={formData.patient_last_name}
                  onChange={(e) =>
                    handleFieldChange("patient_last_name", e.target.value)
                  }
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Address</Label>
                <Input
                  value={formData.patient_address}
                  onChange={(e) =>
                    handleFieldChange("patient_address", e.target.value)
                  }
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">City</Label>
                <Input
                  value={formData.patient_city}
                  onChange={(e) =>
                    handleFieldChange("patient_city", e.target.value)
                  }
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Province</Label>
                <Input
                  value={formData.patient_province}
                  onChange={(e) =>
                    handleFieldChange("patient_province", e.target.value)
                  }
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Postal Code</Label>
                <Input
                  value={formData.patient_postal_code}
                  onChange={(e) =>
                    handleFieldChange("patient_postal_code", e.target.value)
                  }
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Home Tel</Label>
                <Input
                  value={formData.patient_home_tel}
                  onChange={(e) =>
                    handleFieldChange("patient_home_tel", e.target.value)
                  }
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Work Tel</Label>
                <Input
                  value={formData.patient_work_tel}
                  onChange={(e) =>
                    handleFieldChange("patient_work_tel", e.target.value)
                  }
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Fax</Label>
                <Input
                  value={formData.patient_fax}
                  onChange={(e) =>
                    handleFieldChange("patient_fax", e.target.value)
                  }
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Email</Label>
                <Input
                  type="email"
                  value={formData.patient_email}
                  onChange={(e) =>
                    handleFieldChange("patient_email", e.target.value)
                  }
                  className="h-10"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">R Lawyer</Label>
                <Input
                  value={formData.r_lawyer}
                  onChange={(e) =>
                    handleFieldChange("r_lawyer", e.target.value)
                  }
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">R Other Value</Label>
                <Input
                  value={formData.r_othervalue}
                  onChange={(e) =>
                    handleFieldChange("r_othervalue", e.target.value)
                  }
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Signed By</Label>
                <Input
                  value={formData.signed_by}
                  onChange={(e) =>
                    handleFieldChange("signed_by", e.target.value)
                  }
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Date</Label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleFieldChange("date", e.target.value)}
                  className="h-10"
                />
              </div>
            </div>
          </div>

          {/* SECTION 4: Insurance Company */}
          <div className="bg-white rounded-lg shadow-sm border p-6 space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 border-b pb-3">
              Insurance Company
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Insurance Co</Label>
                <Input
                  value={formData.insurance_co}
                  onChange={(e) =>
                    handleFieldChange("insurance_co", e.target.value)
                  }
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Street Address</Label>
                <Input
                  value={formData.insurance_street_address}
                  onChange={(e) =>
                    handleFieldChange(
                      "insurance_street_address",
                      e.target.value
                    )
                  }
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">City</Label>
                <Input
                  value={formData.insurance_City}
                  onChange={(e) =>
                    handleFieldChange("insurance_City", e.target.value)
                  }
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Province</Label>
                <Input
                  value={formData.insurance_province}
                  onChange={(e) =>
                    handleFieldChange("insurance_province", e.target.value)
                  }
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Postal Code</Label>
                <Input
                  value={formData.insurance_postal_code}
                  onChange={(e) =>
                    handleFieldChange("insurance_postal_code", e.target.value)
                  }
                  className="h-10"
                />
              </div>
            </div>
          </div>

          {/* SECTION 5: Accident Details */}
          <div className="bg-white rounded-lg shadow-sm border p-6 space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 border-b pb-3">
              Accident Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Day of Week</Label>
                <Input
                  value={formData.day_of_the_week}
                  onChange={(e) =>
                    handleFieldChange("day_of_the_week", e.target.value)
                  }
                  placeholder="Monday, Tuesday..."
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Time of Day</Label>
                <Input
                  type="time"
                  value={formData.time_of_the_day}
                  onChange={(e) =>
                    handleFieldChange("time_of_the_day", e.target.value)
                  }
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Other Value</Label>
                <Input
                  value={formData.other_value}
                  onChange={(e) =>
                    handleFieldChange("other_value", e.target.value)
                  }
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Date of Accident (1st)
                </Label>
                <Input
                  type="date"
                  value={formData.Date_of_accident_1st}
                  onChange={(e) =>
                    handleFieldChange("Date_of_accident_1st", e.target.value)
                  }
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Time of Accident (1st)
                </Label>
                <Input
                  type="time"
                  value={formData.time_of_accident_1st}
                  onChange={(e) =>
                    handleFieldChange("time_of_accident_1st", e.target.value)
                  }
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Patient Position</Label>
                <Input
                  value={formData.patient_position}
                  onChange={(e) =>
                    handleFieldChange("patient_position", e.target.value)
                  }
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Accident Location</Label>
                <Input
                  value={formData.accident_location}
                  onChange={(e) =>
                    handleFieldChange("accident_location", e.target.value)
                  }
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Accident City</Label>
                <Input
                  value={formData.accident_city}
                  onChange={(e) =>
                    handleFieldChange("accident_city", e.target.value)
                  }
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Accident Province</Label>
                <Input
                  value={formData.accident_province}
                  onChange={(e) =>
                    handleFieldChange("accident_province", e.target.value)
                  }
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Accident Occur</Label>
                <Input
                  value={formData.accident_occur}
                  onChange={(e) =>
                    handleFieldChange("accident_occur", e.target.value)
                  }
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Safety Insurance</Label>
                <Input
                  value={formData.safety_insurance}
                  onChange={(e) =>
                    handleFieldChange("safety_insurance", e.target.value)
                  }
                  className="h-10"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Brief Accident Description
                </Label>
                <Textarea
                  value={formData.brief_accident_description}
                  onChange={(e) =>
                    handleFieldChange(
                      "brief_accident_description",
                      e.target.value
                    )
                  }
                  rows={4}
                  className="resize-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Return to Normal Activities
                </Label>
                <Input
                  value={formData.return_to_normal_activities}
                  onChange={(e) =>
                    handleFieldChange(
                      "return_to_normal_activities",
                      e.target.value
                    )
                  }
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Did Patient Go to Hospital
                </Label>
                <Input
                  value={formData.did_the_patient_go_to_the_hospital}
                  onChange={(e) =>
                    handleFieldChange(
                      "did_the_patient_go_to_the_hospital",
                      e.target.value
                    )
                  }
                  placeholder="Yes/No"
                  className="h-10"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label className="text-sm font-medium">
                  Outcome Details (Hospital)
                </Label>
                <Textarea
                  value={formData.outcome_if_yes_give_details}
                  onChange={(e) =>
                    handleFieldChange(
                      "outcome_if_yes_give_details",
                      e.target.value
                    )
                  }
                  rows={2}
                  className="resize-none"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Did Patient See Health Professional
                </Label>
                <Input
                  value={formData.did_patient_see_health_professional}
                  onChange={(e) =>
                    handleFieldChange(
                      "did_patient_see_health_professional",
                      e.target.value
                    )
                  }
                  placeholder="Yes/No"
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Outcome Details (Health Professional)
                </Label>
                <Textarea
                  value={formData.outcome_if_yes_give_details_2nd}
                  onChange={(e) =>
                    handleFieldChange(
                      "outcome_if_yes_give_details_2nd",
                      e.target.value
                    )
                  }
                  rows={2}
                  className="resize-none"
                />
              </div>
            </div>
          </div>

          {/* SECTION 6: Police Report */}
          <div className="bg-white rounded-lg shadow-sm border p-6 space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 border-b pb-3">
              Police Report
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Accident Reported to Police
                </Label>
                <Input
                  value={formData.accident_reported_police}
                  onChange={(e) =>
                    handleFieldChange(
                      "accident_reported_police",
                      e.target.value
                    )
                  }
                  placeholder="Yes/No"
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Police Department</Label>
                <Input
                  value={formData.police_department}
                  onChange={(e) =>
                    handleFieldChange("police_department", e.target.value)
                  }
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Officer Name</Label>
                <Input
                  value={formData.officer_name}
                  onChange={(e) =>
                    handleFieldChange("officer_name", e.target.value)
                  }
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Badge No</Label>
                <Input
                  value={formData.badge_no}
                  onChange={(e) =>
                    handleFieldChange("badge_no", e.target.value)
                  }
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Reporting Center</Label>
                <Input
                  value={formData.reporting_center}
                  onChange={(e) =>
                    handleFieldChange("reporting_center", e.target.value)
                  }
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Was Claimant Charged
                </Label>
                <Input
                  value={formData.was_claiment_charged}
                  onChange={(e) =>
                    handleFieldChange("was_claiment_charged", e.target.value)
                  }
                  placeholder="Yes/No"
                  className="h-10"
                />
              </div>
              <div className="space-y-2 md:col-span-3">
                <Label className="text-sm font-medium">
                  Police Details (If Yes)
                </Label>
                <Textarea
                  value={formData.police_if_yes_give_details}
                  onChange={(e) =>
                    handleFieldChange(
                      "police_if_yes_give_details",
                      e.target.value
                    )
                  }
                  rows={2}
                  className="resize-none"
                />
              </div>
            </div>
          </div>

          {/* SECTION 7: Health Information */}
          <div className="bg-white rounded-lg shadow-sm border p-6 space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 border-b pb-3">
              Health Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Facility Name</Label>
                <Input
                  value={formData.facility_name}
                  onChange={(e) =>
                    handleFieldChange("facility_name", e.target.value)
                  }
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Health Professional
                </Label>
                <Input
                  value={formData.health_professional}
                  onChange={(e) =>
                    handleFieldChange("health_professional", e.target.value)
                  }
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Address</Label>
                <Input
                  value={formData.health_address}
                  onChange={(e) =>
                    handleFieldChange("health_address", e.target.value)
                  }
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">City</Label>
                <Input
                  value={formData.health_city}
                  onChange={(e) =>
                    handleFieldChange("health_city", e.target.value)
                  }
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Province</Label>
                <Input
                  value={formData.health_province}
                  onChange={(e) =>
                    handleFieldChange("health_province", e.target.value)
                  }
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Postal Code</Label>
                <Input
                  value={formData.health_postal_code}
                  onChange={(e) =>
                    handleFieldChange("health_postal_code", e.target.value)
                  }
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Begun Any Treatment
                </Label>
                <Input
                  value={formData.begun_ant_treatment}
                  onChange={(e) =>
                    handleFieldChange("begun_ant_treatment", e.target.value)
                  }
                  className="h-10"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label className="text-sm font-medium">
                  Health Details (If Yes)
                </Label>
                <Textarea
                  value={formData.health_if_yes_give_details}
                  onChange={(e) =>
                    handleFieldChange(
                      "health_if_yes_give_details",
                      e.target.value
                    )
                  }
                  rows={2}
                  className="resize-none"
                />
              </div>
            </div>
          </div>

          {/* SECTION 8: Insurance Policy Details */}
          <div className="bg-white rounded-lg shadow-sm border p-6 space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 border-b pb-3">
              Insurance Policy Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Private Policy</Label>
                <Input
                  value={formData.private_policy}
                  onChange={(e) =>
                    handleFieldChange("private_policy", e.target.value)
                  }
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Spouse Policy</Label>
                <Input
                  value={formData.spouse_policy}
                  onChange={(e) =>
                    handleFieldChange("spouse_policy", e.target.value)
                  }
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Claimant US Dependent
                </Label>
                <Input
                  value={formData.claimant_us_dependent}
                  onChange={(e) =>
                    handleFieldChange("claimant_us_dependent", e.target.value)
                  }
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Claimant as Driver
                </Label>
                <Input
                  value={formData.claimant_as_a_drive}
                  onChange={(e) =>
                    handleFieldChange("claimant_as_a_drive", e.target.value)
                  }
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Claimant Employer Policy
                </Label>
                <Input
                  value={formData.claimant_employer_policy}
                  onChange={(e) =>
                    handleFieldChange(
                      "claimant_employer_policy",
                      e.target.value
                    )
                  }
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Policy Insuring</Label>
                <Input
                  value={formData.policy_insuring}
                  onChange={(e) =>
                    handleFieldChange("policy_insuring", e.target.value)
                  }
                  className="h-10"
                />
              </div>
            </div>
          </div>

          {/* SECTION 9: Vehicle Information */}
          <div className="bg-white rounded-lg shadow-sm border p-6 space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 border-b pb-3">
              Vehicle Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Policyholder Name</Label>
                <Input
                  value={formData.name_of_policyholder}
                  onChange={(e) =>
                    handleFieldChange("name_of_policyholder", e.target.value)
                  }
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Insurance Company</Label>
                <Input
                  value={formData.insurance_company}
                  onChange={(e) =>
                    handleFieldChange("insurance_company", e.target.value)
                  }
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Policy Number</Label>
                <Input
                  value={formData.policy_number}
                  onChange={(e) =>
                    handleFieldChange("policy_number", e.target.value)
                  }
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Automobile Make Model Year
                </Label>
                <Input
                  value={formData.automobile_make_model_year}
                  onChange={(e) =>
                    handleFieldChange(
                      "automobile_make_model_year",
                      e.target.value
                    )
                  }
                  placeholder="BMW E Class 2024"
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Licence Plate No</Label>
                <Input
                  value={formData.licence_plate_no}
                  onChange={(e) =>
                    handleFieldChange("licence_plate_no", e.target.value)
                  }
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Were You Occupant at Time of Accident
                </Label>
                <Input
                  value={
                    formData.were_you_an_occupant_of_this_automobile_at_the_time_of_the_accident
                  }
                  onChange={(e) =>
                    handleFieldChange(
                      "were_you_an_occupant_of_this_automobile_at_the_time_of_the_accident",
                      e.target.value
                    )
                  }
                  className="h-10"
                />
              </div>
            </div>
          </div>

          {/* SECTION 10: Employment Status */}
          <div className="bg-white rounded-lg shadow-sm border p-6 space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 border-b pb-3">
              Employment Status
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Employed</Label>
                <Input
                  value={formData.employed}
                  onChange={(e) =>
                    handleFieldChange("employed", e.target.value)
                  }
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Not Employed</Label>
                <Input
                  value={formData.not_employed}
                  onChange={(e) =>
                    handleFieldChange("not_employed", e.target.value)
                  }
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Unemployed And</Label>
                <Input
                  value={formData.un_employed_and}
                  onChange={(e) =>
                    handleFieldChange("un_employed_and", e.target.value)
                  }
                  className="h-10"
                />
              </div>
            </div>
          </div>

          {/* SECTION 11: School Information */}
          <div className="bg-white rounded-lg shadow-sm border p-6 space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 border-b pb-3">
              School Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Claimant Attending School
                </Label>
                <Input
                  value={formData.applicant_status_claimant_attending_school}
                  onChange={(e) =>
                    handleFieldChange(
                      "applicant_status_claimant_attending_school",
                      e.target.value
                    )
                  }
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">School Name</Label>
                <Input
                  value={formData.applicant_status_name_of_school}
                  onChange={(e) =>
                    handleFieldChange(
                      "applicant_status_name_of_school",
                      e.target.value
                    )
                  }
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Address</Label>
                <Input
                  value={formData.applicant_status_address}
                  onChange={(e) =>
                    handleFieldChange(
                      "applicant_status_address",
                      e.target.value
                    )
                  }
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">City</Label>
                <Input
                  value={formData.applicant_status_city}
                  onChange={(e) =>
                    handleFieldChange("applicant_status_city", e.target.value)
                  }
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Province</Label>
                <Input
                  value={formData.applicant_status_province}
                  onChange={(e) =>
                    handleFieldChange(
                      "applicant_status_province",
                      e.target.value
                    )
                  }
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Postal Code</Label>
                <Input
                  value={formData.applicant_status_postal_code}
                  onChange={(e) =>
                    handleFieldChange(
                      "applicant_status_postal_code",
                      e.target.value
                    )
                  }
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Last Attended Date
                </Label>
                <Input
                  type="date"
                  value={formData.applicant_status_data_last_attended_date}
                  onChange={(e) =>
                    handleFieldChange(
                      "applicant_status_data_last_attended_date",
                      e.target.value
                    )
                  }
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Program and Level</Label>
                <Input
                  value={formData.applicant_status_program_and_level}
                  onChange={(e) =>
                    handleFieldChange(
                      "applicant_status_program_and_level",
                      e.target.value
                    )
                  }
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Project Date for Completion
                </Label>
                <Input
                  type="date"
                  value={formData.applicant_status_project_date_for_completion}
                  onChange={(e) =>
                    handleFieldChange(
                      "applicant_status_project_date_for_completion",
                      e.target.value
                    )
                  }
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Is Claimant Attending School
                </Label>
                <Input
                  value={
                    formData.applicant_status_is_the_claimant_attending_school
                  }
                  onChange={(e) =>
                    handleFieldChange(
                      "applicant_status_is_the_claimant_attending_school",
                      e.target.value
                    )
                  }
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Attending School Date
                </Label>
                <Input
                  type="date"
                  value={
                    formData.applicant_status_is_the_claimant_attending_school_date
                  }
                  onChange={(e) =>
                    handleFieldChange(
                      "applicant_status_is_the_claimant_attending_school_date",
                      e.target.value
                    )
                  }
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Was Able to Return to School After Accident
                </Label>
                <Input
                  value={
                    formData.applicant_status_was_the_claimant_able_to_return_to_school_after_the_accident
                  }
                  onChange={(e) =>
                    handleFieldChange(
                      "applicant_status_was_the_claimant_able_to_return_to_school_after_the_accident",
                      e.target.value
                    )
                  }
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Return to School Date
                </Label>
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

          {/* SECTION 12: Caregiver Information */}
          <div className="bg-white rounded-lg shadow-sm border p-6 space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 border-b pb-3">
              Caregiver Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Caregiver At Time of Accident
                </Label>
                <Input
                  value={formData.caregiver_him_her_at_the_time_accident}
                  onChange={(e) =>
                    handleFieldChange(
                      "caregiver_him_her_at_the_time_accident",
                      e.target.value
                    )
                  }
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Claimant Paid to Provide Care
                </Label>
                <Input
                  value={
                    formData.caregiver_claimant_paid_to_provide_care_to_these_people
                  }
                  onChange={(e) =>
                    handleFieldChange(
                      "caregiver_claimant_paid_to_provide_care_to_these_people",
                      e.target.value
                    )
                  }
                  className="h-10"
                />
              </div>
            </div>

            {[0, 1, 2, 3, 4].map((index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-lg p-4 space-y-4 border"
              >
                <h3 className="font-medium text-gray-900">
                  Caregiver #{index + 1}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Name</Label>
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
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Date</Label>
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
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Disabled</Label>
                    <Input
                      value={formData.caregiver_disabled[index] || ""}
                      onChange={(e) =>
                        handleArrayFieldChange(
                          "caregiver_disabled",
                          index,
                          e.target.value
                        )
                      }
                      placeholder="Yes/No"
                      className="h-10"
                    />
                  </div>
                </div>
              </div>
            ))}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Patient Suffer Substantial to Engage in Caregiving
                </Label>
                <Input
                  value={
                    formData.patient_suffer_a_substantial_to_engage_in_the_caregiving
                  }
                  onChange={(e) =>
                    handleFieldChange(
                      "patient_suffer_a_substantial_to_engage_in_the_caregiving",
                      e.target.value
                    )
                  }
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Indicate Date</Label>
                <Input
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
              <div className="space-y-2 md:col-span-2">
                <Label className="text-sm font-medium">Explain Below</Label>
                <Textarea
                  value={formData.caregiver_explain_below}
                  onChange={(e) =>
                    handleFieldChange("caregiver_explain_below", e.target.value)
                  }
                  rows={3}
                  className="resize-none"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Did Claimant Return to Caregiving After Accident
                </Label>
                <Input
                  value={
                    formData.caregiver_did_claimant_return_to_caregiving_after_the_accident
                  }
                  onChange={(e) =>
                    handleFieldChange(
                      "caregiver_did_claimant_return_to_caregiving_after_the_accident",
                      e.target.value
                    )
                  }
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Return Date</Label>
                <Input
                  value={formData.caregiver_if_yes_to_above_inicate_return_date}
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
          </div>

          {/* SECTION 13: Employment Information */}
          <div className="bg-white rounded-lg shadow-sm border p-6 space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 border-b pb-3">
              Employment Information
            </h2>

            {[0, 1, 2, 3, 4].map((index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-lg p-4 space-y-4 border"
              >
                <h3 className="font-medium text-gray-900">
                  Employment #{index + 1}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Date From</Label>
                    <Input
                      type="date"
                      value={formData.date_from[index] || ""}
                      onChange={(e) =>
                        handleArrayFieldChange(
                          "date_from",
                          index,
                          e.target.value
                        )
                      }
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Date To</Label>
                    <Input
                      type="date"
                      value={formData.date_to[index] || ""}
                      onChange={(e) =>
                        handleArrayFieldChange("date_to", index, e.target.value)
                      }
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Employer Name/Address
                    </Label>
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
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Position/Task</Label>
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
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Hours Per Week
                    </Label>
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
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Gross Income</Label>
                    <Input
                      value={formData.gross_income[index] || ""}
                      onChange={(e) =>
                        handleArrayFieldChange(
                          "gross_income",
                          index,
                          e.target.value
                        )
                      }
                      className="h-10"
                    />
                  </div>
                </div>
              </div>
            ))}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Income Injuries Private From Working
                </Label>
                <Input
                  value={formData.income_injuries_private_him_her_from_working}
                  onChange={(e) =>
                    handleFieldChange(
                      "income_injuries_private_him_her_from_working",
                      e.target.value
                    )
                  }
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Income Form What Date
                </Label>
                <Input
                  type="date"
                  value={formData.income_form_what_date}
                  onChange={(e) =>
                    handleFieldChange("income_form_what_date", e.target.value)
                  }
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Were You Able to Return to Work Since Accident
                </Label>
                <Input
                  value={
                    formData.were_you_able_to_return_to_work_since_the_accident
                  }
                  onChange={(e) =>
                    handleFieldChange(
                      "were_you_able_to_return_to_work_since_the_accident",
                      e.target.value
                    )
                  }
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Income When Date</Label>
                <Input
                  type="date"
                  value={formData.income_when_date}
                  onChange={(e) =>
                    handleFieldChange("income_when_date", e.target.value)
                  }
                  className="h-10"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label className="text-sm font-medium">
                  Amount of Claimants Benefit Based on Past Income
                </Label>
                <Input
                  value={
                    formData.The_amount_of_claimants_benefit_id_based_on_his_her_past_income
                  }
                  onChange={(e) =>
                    handleFieldChange(
                      "The_amount_of_claimants_benefit_id_based_on_his_her_past_income",
                      e.target.value
                    )
                  }
                  className="h-10"
                />
              </div>
            </div>
          </div>

          {/* SECTION 14: Other Insurance & Benefits */}
          <div className="bg-white rounded-lg shadow-sm border p-6 space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 border-b pb-3">
              Other Insurance & Benefits
            </h2>

            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Other Insurance or Spouse Dependent
              </Label>
              <Input
                value={formData.other_insurance_or_spouse_dependent}
                onChange={(e) =>
                  handleFieldChange(
                    "other_insurance_or_spouse_dependent",
                    e.target.value
                  )
                }
                className="h-10"
              />
            </div>

            {[0, 1].map((index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-lg p-4 space-y-4 border"
              >
                <h3 className="font-medium text-gray-900">
                  Benefit #{index + 1}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
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
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
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
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Policy or Certificate No
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
              </div>
            ))}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Other Disability Benefit Plan
                </Label>
                <Input
                  value={formData.other_disability_benift_plan}
                  onChange={(e) =>
                    handleFieldChange(
                      "other_disability_benift_plan",
                      e.target.value
                    )
                  }
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Other Form Date</Label>
                <Input
                  type="date"
                  value={formData.other_form_date}
                  onChange={(e) =>
                    handleFieldChange("other_form_date", e.target.value)
                  }
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Other To Date</Label>
                <Input
                  type="date"
                  value={formData.other_to_date}
                  onChange={(e) =>
                    handleFieldChange("other_to_date", e.target.value)
                  }
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Other Total Amount Received
                </Label>
                <Input
                  value={formData.other_total_amount_recived}
                  onChange={(e) =>
                    handleFieldChange(
                      "other_total_amount_recived",
                      e.target.value
                    )
                  }
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Receiving Employment Insurance
                </Label>
                <Input
                  value={formData.other_receiving_employment_insurance}
                  onChange={(e) =>
                    handleFieldChange(
                      "other_receiving_employment_insurance",
                      e.target.value
                    )
                  }
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Employment Insurance From Date
                </Label>
                <Input
                  type="date"
                  value={formData.other_form_date1}
                  onChange={(e) =>
                    handleFieldChange("other_form_date1", e.target.value)
                  }
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Employment Insurance To Date
                </Label>
                <Input
                  type="date"
                  value={formData.other_to_date1}
                  onChange={(e) =>
                    handleFieldChange("other_to_date1", e.target.value)
                  }
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Employment Insurance Total Amount
                </Label>
                <Input
                  value={formData.other_total_amount_recived1}
                  onChange={(e) =>
                    handleFieldChange(
                      "other_total_amount_recived1",
                      e.target.value
                    )
                  }
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Receiving Social Assistance Benefits
                </Label>
                <Input
                  value={formData.other_receiving_social_assistance_benfits}
                  onChange={(e) =>
                    handleFieldChange(
                      "other_receiving_social_assistance_benfits",
                      e.target.value
                    )
                  }
                  className="h-10"
                />
              </div>
            </div>
          </div>

          {/* SECTION 15: Applicant Signature */}
          <div className="bg-white rounded-lg shadow-sm border p-6 space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 border-b pb-3">
              Applicant Signature
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Applicant Name</Label>
                <Input
                  value={formData.applicant_name}
                  onChange={(e) =>
                    handleFieldChange("applicant_name", e.target.value)
                  }
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Applicant Date</Label>
                <Input
                  type="date"
                  value={formData.applicant_date}
                  onChange={(e) =>
                    handleFieldChange("applicant_date", e.target.value)
                  }
                  className="h-10"
                />
              </div>
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
    </div>
  );
}
