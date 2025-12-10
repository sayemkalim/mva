import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { Navbar2 } from "@/components/navbar2";
import { createOcfProd2, updateOcfProd2 } from "../../helpers/createOcfProd2";
import { fetchOcfProd2ById } from "../../helpers/fetchOcfProd2ById";

export default function OCFProd2Page() {
  const { id, slug } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditMode = Boolean(id);

  const {
    data: ocfResp,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["ocfProd2", id],
    queryFn: () => fetchOcfProd2ById(id),
    enabled: Boolean(isEditMode && id),
  });

  const ocfRecord = ocfResp?.data || null;

  const [formData, setFormData] = useState({
    claim_number: "",
    policy_number: "",
    date_of_accident: "",
    last_name: "",
    first_name: "",
    gender: "",
    street_address: "",
    city: "",
    province: "",
    postal_code: "",
    date_of_birth: "",
    home_telephone: "",
    work_telephone: "",
    name_insurance_company: "",
    insurance_address: "",
    insurance_city: "",
    insurance_province: "",
    insurance_postal_code: "",
    name_of_policyholder: "",
    policy_number_2: "",
    signed_by: "",
    date: "",
    employed_date: "",
    self_employed_date: "",
    give_details_below: "",
    give_details_below_textarea: "",
    give_details_below_2nd: "",
    give_details_below_2nd_textarea: "",
    income_continuation_benefit: "",
    supplementary_medical_rehabilitation: "",
    sick_leave: "",
    other5_insurance_company: "",
    other5_policy_no: "",
    other5_insurance_company_2nd: "",
    other5_policy_no_2nd: "",
    applicant_use_sick_credits_following: "",
    is_the_applicant_a_member_of_a_union: "",
    applicant_contribute_to_the_canada_pension: "",
    workplace_safety_and_insurance_board_as_a_result: "",
    date_of_employment_from: "",
    date_of_employment_to: "",
    latest_job_title: "",
    last_date_worked: "",
    date_of_return_to_work: "",
    brief_job_description: "",
    essential_tasks_of_job: "",
    company_name: "",
    contact_person: "",
    contact_address: "",
    contact_identification_number: "",
    contact_city: "",
    contact_province: "",
    contact_postal_code: "",
    contact_telephone_number: "",
    contact_fax_number: "",
    contact_employer_name: "",
    contact_title: "",
  });

  useEffect(() => {
    if (!ocfRecord) return;

    const apiData = ocfRecord;

    setFormData({
      claim_number: apiData.claim_number || "",
      policy_number: apiData.policy_number || "",
      date_of_accident: apiData.date_of_accident || "",
      last_name: apiData.last_name || "",
      first_name: apiData.first_name || "",
      gender: apiData.gender || "",
      street_address: apiData.street_address || "",
      city: apiData.city || "",
      province: apiData.province || "",
      postal_code: apiData.postal_code || "",
      date_of_birth: apiData.date_of_birth || "",
      home_telephone: apiData.home_telephone || "",
      work_telephone: apiData.work_telephone || "",
      name_insurance_company: apiData.name_insurance_company || "",
      insurance_address: apiData.insurance_address || "",
      insurance_city: apiData.insurance_city || "",
      insurance_province: apiData.insurance_province || "",
      insurance_postal_code: apiData.insurance_postal_code || "",
      name_of_policyholder: apiData.name_of_policyholder || "",
      policy_number_2: apiData.policy_number_2 || "",
      signed_by: apiData.signed_by || "",
      date: apiData.date || "",
      employed_date: apiData.employed_date || "",
      self_employed_date: apiData.self_employed_date || "",
      give_details_below: apiData.give_details_below || "",
      give_details_below_textarea: apiData.give_details_below_textarea || "",
      give_details_below_2nd: apiData.give_details_below_2nd || "",
      give_details_below_2nd_textarea:
        apiData.give_details_below_2nd_textarea || "",
      income_continuation_benefit: apiData.income_continuation_benefit || "",
      supplementary_medical_rehabilitation:
        apiData.supplementary_medical_rehabilitation || "",
      sick_leave: apiData.sick_leave || "",
      other5_insurance_company: apiData.other5_insurance_company || "",
      other5_policy_no: apiData.other5_policy_no || "",
      other5_insurance_company_2nd: apiData.other5_insurance_company_2nd || "",
      other5_policy_no_2nd: apiData.other5_policy_no_2nd || "",
      applicant_use_sick_credits_following:
        apiData.applicant_use_sick_credits_following || "",
      is_the_applicant_a_member_of_a_union:
        apiData.is_the_applicant_a_member_of_a_union || "",
      applicant_contribute_to_the_canada_pension:
        apiData.applicant_contribute_to_the_canada_pension || "",
      workplace_safety_and_insurance_board_as_a_result:
        apiData.workplace_safety_and_insurance_board_as_a_result || "",
      date_of_employment_from: apiData.date_of_employment_from || "",
      date_of_employment_to: apiData.date_of_employment_to || "",
      latest_job_title: apiData.latest_job_title || "",
      last_date_worked: apiData.last_date_worked || "",
      date_of_return_to_work: apiData.date_of_return_to_work || "",
      brief_job_description: apiData.brief_job_description || "",
      essential_tasks_of_job: apiData.essential_tasks_of_job || "",
      company_name: apiData.company_name || "",
      contact_person: apiData.contact_person || "",
      contact_address: apiData.contact_address || "",
      contact_identification_number:
        apiData.contact_identification_number || "",
      contact_city: apiData.contact_city || "",
      contact_province: apiData.contact_province || "",
      contact_postal_code: apiData.contact_postal_code || "",
      contact_telephone_number: apiData.contact_telephone_number || "",
      contact_fax_number: apiData.contact_fax_number || "",
      contact_employer_name: apiData.contact_employer_name || "",
      contact_title: apiData.contact_title || "",
    });
  }, [ocfRecord]);

  const handleFieldChange = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const saveMutation = useMutation({
    mutationFn: ({ isEdit, idOrSlug, data }) =>
      isEdit
        ? updateOcfProd2(idOrSlug, data)
        : createOcfProd2({ slug: idOrSlug, data }),
    onSuccess: (res, variables) => {
      console.log("OCF-PROD-2 save success =>", { res, variables });
      const r = res?.data || res;
      toast.success(r?.message || "OCF-PROD-2 saved successfully");
      queryClient.invalidateQueries({ queryKey: ["ocfProd2"] });
      navigate(-1);
    },
    onError: (error, variables) => {
      console.error("OCF-PROD-2 save error =>", { error, variables });
      toast.error("Failed to save OCF-PROD-2");
    },
  });
  const handleSubmit = (e) => {
    e.preventDefault();

    const data = formData;

    console.log("📤 Final data:", data);

    saveMutation.mutate({
      isEdit: isEditMode,
      idOrSlug: isEditMode ? recordId || id : slug,
      data,
    });
  };

  if (isEditMode && isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading OCF-PROD-2...</span>
      </div>
    );
  }

  if (error) {
    console.error("OCF-PROD-2 fetch error =>", error);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar2 />

      <nav className="bg-white border-b px-6 py-4 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="hover:text-gray-900 transition-colors"
          >
            Dashboard
          </button>
          <ChevronRight className="w-4 h-4" />
          <button
            type="button"
            onClick={() => navigate("/dashboard/workstation")}
            className="hover:text-gray-900 transition-colors"
          >
            Workstation
          </button>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 font-medium">
            {isEditMode ? "Edit" : "New"} OCF-PROD-2
          </span>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-8 max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditMode ? "Edit OCF-PROD-2" : "New OCF-PROD-2"}
          </h1>
          <div className="text-sm text-gray-500">{isEditMode.toString()}</div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Applicant & Accident */}
          <Section title="Applicant & Accident Information">
            <Grid>
              <Field
                label="Claim Number *"
                value={formData.claim_number}
                onChange={(v) => handleFieldChange("claim_number", v)}
                required
              />
              <Field
                label="Policy Number"
                value={formData.policy_number}
                onChange={(v) => handleFieldChange("policy_number", v)}
              />
              <Field
                type="date"
                label="Date of Accident"
                value={formData.date_of_accident}
                onChange={(v) => handleFieldChange("date_of_accident", v)}
              />
              <Field
                label="Last Name *"
                value={formData.last_name}
                onChange={(v) => handleFieldChange("last_name", v)}
                required
              />
              <Field
                label="First Name *"
                value={formData.first_name}
                onChange={(v) => handleFieldChange("first_name", v)}
                required
              />
              <Field
                label="Gender"
                value={formData.gender}
                onChange={(v) => handleFieldChange("gender", v)}
              />
              <Field
                label="Street Address"
                value={formData.street_address}
                onChange={(v) => handleFieldChange("street_address", v)}
              />
              <Field
                label="City"
                value={formData.city}
                onChange={(v) => handleFieldChange("city", v)}
              />
              <Field
                label="Province"
                value={formData.province}
                onChange={(v) => handleFieldChange("province", v)}
              />
              <Field
                label="Postal Code"
                value={formData.postal_code}
                onChange={(v) => handleFieldChange("postal_code", v)}
              />
              <Field
                type="date"
                label="Date of Birth"
                value={formData.date_of_birth}
                onChange={(v) => handleFieldChange("date_of_birth", v)}
              />
              <Field
                label="Home Telephone"
                value={formData.home_telephone}
                onChange={(v) => handleFieldChange("home_telephone", v)}
              />
              <Field
                label="Work Telephone"
                value={formData.work_telephone}
                onChange={(v) => handleFieldChange("work_telephone", v)}
              />
            </Grid>
          </Section>

          {/* Insurance */}
          <Section title="Insurance Information">
            <Grid>
              <Field
                label="Insurance Company Name"
                value={formData.name_insurance_company}
                onChange={(v) => handleFieldChange("name_insurance_company", v)}
              />
              <Field
                label="Insurance Address"
                value={formData.insurance_address}
                onChange={(v) => handleFieldChange("insurance_address", v)}
              />
              <Field
                label="Insurance City"
                value={formData.insurance_city}
                onChange={(v) => handleFieldChange("insurance_city", v)}
              />
              <Field
                label="Insurance Province"
                value={formData.insurance_province}
                onChange={(v) => handleFieldChange("insurance_province", v)}
              />
              <Field
                label="Insurance Postal Code"
                value={formData.insurance_postal_code}
                onChange={(v) => handleFieldChange("insurance_postal_code", v)}
              />
              <Field
                label="Policyholder Name"
                value={formData.name_of_policyholder}
                onChange={(v) => handleFieldChange("name_of_policyholder", v)}
              />
              <Field
                label="Policy Number 2"
                value={formData.policy_number_2}
                onChange={(v) => handleFieldChange("policy_number_2", v)}
              />
            </Grid>
          </Section>

          {/* Employment Status */}
          <Section title="Employment Status">
            <Grid>
              <Field
                type="date"
                label="Date Employed"
                value={formData.employed_date}
                onChange={(v) => handleFieldChange("employed_date", v)}
              />
              <Field
                type="date"
                label="Self-Employed Date"
                value={formData.self_employed_date}
                onChange={(v) => handleFieldChange("self_employed_date", v)}
              />
              <Field
                label="Employment Details 1"
                value={formData.give_details_below}
                onChange={(v) => handleFieldChange("give_details_below", v)}
              />
              <TextField
                label="Details Text 1"
                value={formData.give_details_below_textarea}
                onChange={(v) =>
                  handleFieldChange("give_details_below_textarea", v)
                }
              />
              <Field
                label="Employment Details 2"
                value={formData.give_details_below_2nd}
                onChange={(v) => handleFieldChange("give_details_below_2nd", v)}
              />
              <TextField
                label="Details Text 2"
                value={formData.give_details_below_2nd_textarea}
                onChange={(v) =>
                  handleFieldChange("give_details_below_2nd_textarea", v)
                }
              />
            </Grid>
          </Section>

          {/* Other Benefits */}
          <Section title="Other Benefits & Coverage">
            <Grid>
              <Field
                label="Income Continuation Benefit"
                value={formData.income_continuation_benefit}
                onChange={(v) =>
                  handleFieldChange("income_continuation_benefit", v)
                }
              />
              <Field
                label="Medical/Rehab Benefits"
                value={formData.supplementary_medical_rehabilitation}
                onChange={(v) =>
                  handleFieldChange("supplementary_medical_rehabilitation", v)
                }
              />
              <Field
                label="Sick Leave"
                value={formData.sick_leave}
                onChange={(v) => handleFieldChange("sick_leave", v)}
              />
              <Field
                label="Other Insurance Co. #1"
                value={formData.other5_insurance_company}
                onChange={(v) =>
                  handleFieldChange("other5_insurance_company", v)
                }
              />
              <Field
                label="Other Policy #1"
                value={formData.other5_policy_no}
                onChange={(v) => handleFieldChange("other5_policy_no", v)}
              />
              <Field
                label="Other Insurance Co. #2"
                value={formData.other5_insurance_company_2nd}
                onChange={(v) =>
                  handleFieldChange("other5_insurance_company_2nd", v)
                }
              />
              <Field
                label="Other Policy #2"
                value={formData.other5_policy_no_2nd}
                onChange={(v) => handleFieldChange("other5_policy_no_2nd", v)}
              />
              <Field
                label="Sick Credits Usage"
                value={formData.applicant_use_sick_credits_following}
                onChange={(v) =>
                  handleFieldChange("applicant_use_sick_credits_following", v)
                }
              />
              <Field
                label="Union Member?"
                value={formData.is_the_applicant_a_member_of_a_union}
                onChange={(v) =>
                  handleFieldChange("is_the_applicant_a_member_of_a_union", v)
                }
              />
              <Field
                label="Contributes to CPP?"
                value={formData.applicant_contribute_to_the_canada_pension}
                onChange={(v) =>
                  handleFieldChange(
                    "applicant_contribute_to_the_canada_pension",
                    v
                  )
                }
              />
              <Field
                label="WSIB Coverage?"
                value={
                  formData.workplace_safety_and_insurance_board_as_a_result
                }
                onChange={(v) =>
                  handleFieldChange(
                    "workplace_safety_and_insurance_board_as_a_result",
                    v
                  )
                }
              />
            </Grid>
          </Section>

          {/* Job Details */}
          <Section title="Job Details">
            <Grid>
              <Field
                type="date"
                label="Employed From"
                value={formData.date_of_employment_from}
                onChange={(v) =>
                  handleFieldChange("date_of_employment_from", v)
                }
              />
              <Field
                type="date"
                label="Employed To"
                value={formData.date_of_employment_to}
                onChange={(v) => handleFieldChange("date_of_employment_to", v)}
              />
              <Field
                label="Latest Job Title"
                value={formData.latest_job_title}
                onChange={(v) => handleFieldChange("latest_job_title", v)}
              />
              <Field
                type="date"
                label="Last Date Worked"
                value={formData.last_date_worked}
                onChange={(v) => handleFieldChange("last_date_worked", v)}
              />
              <Field
                type="date"
                label="Return to Work Date"
                value={formData.date_of_return_to_work}
                onChange={(v) => handleFieldChange("date_of_return_to_work", v)}
              />
              <TextField
                label="Job Description"
                value={formData.brief_job_description}
                onChange={(v) => handleFieldChange("brief_job_description", v)}
              />
              <TextField
                label="Essential Job Tasks"
                value={formData.essential_tasks_of_job}
                onChange={(v) => handleFieldChange("essential_tasks_of_job", v)}
              />
            </Grid>
          </Section>

          {/* Employer Contact */}
          <Section title="Employer Contact Information">
            <Grid>
              <Field
                label="Company Name"
                value={formData.company_name}
                onChange={(v) => handleFieldChange("company_name", v)}
              />
              <Field
                label="Contact Person"
                value={formData.contact_person}
                onChange={(v) => handleFieldChange("contact_person", v)}
              />
              <Field
                label="Contact Address"
                value={formData.contact_address}
                onChange={(v) => handleFieldChange("contact_address", v)}
              />
              <Field
                label="Contact ID Number"
                value={formData.contact_identification_number}
                onChange={(v) =>
                  handleFieldChange("contact_identification_number", v)
                }
              />
              <Field
                label="Contact City"
                value={formData.contact_city}
                onChange={(v) => handleFieldChange("contact_city", v)}
              />
              <Field
                label="Contact Province"
                value={formData.contact_province}
                onChange={(v) => handleFieldChange("contact_province", v)}
              />
              <Field
                label="Contact Postal Code"
                value={formData.contact_postal_code}
                onChange={(v) => handleFieldChange("contact_postal_code", v)}
              />
              <Field
                label="Contact Phone"
                value={formData.contact_telephone_number}
                onChange={(v) =>
                  handleFieldChange("contact_telephone_number", v)
                }
              />
              <Field
                label="Contact Fax"
                value={formData.contact_fax_number}
                onChange={(v) => handleFieldChange("contact_fax_number", v)}
              />
              <Field
                label="Employer Name"
                value={formData.contact_employer_name}
                onChange={(v) => handleFieldChange("contact_employer_name", v)}
              />
              <Field
                label="Contact Title"
                value={formData.contact_title}
                onChange={(v) => handleFieldChange("contact_title", v)}
              />
            </Grid>
          </Section>

          {/* Signature */}
          <Section title="Signature">
            <Grid>
              <Field
                label="Signed By"
                value={formData.signed_by}
                onChange={(v) => handleFieldChange("signed_by", v)}
              />
              <Field
                type="date"
                label="Date Signed"
                value={formData.date}
                onChange={(v) => handleFieldChange("date", v)}
              />
            </Grid>
          </Section>

          {/* Form Actions */}
          <div className="flex justify-end gap-4 pt-8 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
              className="px-8"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saveMutation.isPending}
              className="px-8 bg-primary hover:bg-primary/90"
            >
              {saveMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save OCF-PROD-2"
              )}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 space-y-6">
      <h2 className="text-2xl font-semibold text-gray-900 border-b border-gray-200 pb-4">
        {title}
      </h2>
      {children}
    </div>
  );
}

function Grid({ children }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {children}
    </div>
  );
}

function Field({ label, value, onChange, type = "text", required = false }) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-semibold text-gray-900">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Input
        type={type}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="h-12 px-4 border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary transition-all"
        placeholder={label}
      />
    </div>
  );
}

function TextField({ label, value, onChange }) {
  return (
    <div className="space-y-2 md:col-span-full">
      <Label className="text-sm font-semibold text-gray-900">{label}</Label>
      <Textarea
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        className="min-h-[100px] border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary transition-all resize-vertical"
        placeholder={`Enter ${label.toLowerCase()}...`}
      />
    </div>
  );
}
