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
import { fetchOcfProd3ById } from "../../helpers/fetchOcfProd3ById";
import { createOcfProd3, updateOcfProd3 } from "../../helpers/createOcfProd3";
import Billing from "@/components/billing";
import { formatPhoneNumber } from "@/utils/formatters";

export default function OCFProd5Page() {
  const { id, slug } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditMode = Boolean(id);

  const {
    data: ocfResp,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["ocfProd5", id],
    queryFn: () => fetchOcfProd3ById(id),
    enabled: Boolean(isEditMode && id),
  });

  // ocfResp => { id, name: "ocf-5", data: {...body}, slug, ... }
  const ocfRecord = ocfResp?.data || null;

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    date_of_birth: "",
    date_of_accident: "",
    street_address: "",
    city: "",
    province: "",
    postal_code: "",
    home_tel: "",
    work_tel: "",
    ext: "",
    applicant_name: "",
    applicant_date: "",
    name_of_insuranceCompany: "",
    name_of_insurancecompany_representative: "",
    name_of_insurancecompany_address: "",
    name_of_insurancecompany_city: "",
    name_of_insurancecompany_province: "",
    name_of_insurancecompany_postalcode: "",
    name_of_insurancecompany_telephone: "",
    name_of_insurancecompany_faxnumber: "",
  });

  useEffect(() => {
    if (!ocfRecord) return;

    const apiData = ocfRecord;

    setFormData({
      first_name: apiData.first_name || "",
      last_name: apiData.last_name || "",
      date_of_birth: apiData.date_of_birth || "",
      date_of_accident: apiData.date_of_accident || "",
      street_address: apiData.street_address || "",
      city: apiData.city || "",
      province: apiData.province || "",
      postal_code: apiData.postal_code || "",
      home_tel: apiData.home_tel || "",
      work_tel: apiData.work_tel || "",
      ext: apiData.ext || "",
      applicant_name: apiData.applicant_name || "",
      applicant_date: apiData.applicant_date || "",
      name_of_insuranceCompany: apiData.name_of_insuranceCompany || "",
      name_of_insurancecompany_representative:
        apiData.name_of_insurancecompany_representative || "",
      name_of_insurancecompany_address:
        apiData.name_of_insurancecompany_address || "",
      name_of_insurancecompany_city:
        apiData.name_of_insurancecompany_city || "",
      name_of_insurancecompany_province:
        apiData.name_of_insurancecompany_province || "",
      name_of_insurancecompany_postalcode:
        apiData.name_of_insurancecompany_postalcode || "",
      name_of_insurancecompany_telephone:
        apiData.name_of_insurancecompany_telephone || "",
      name_of_insurancecompany_faxnumber:
        apiData.name_of_insurancecompany_faxnumber || "",
    });
  }, [ocfRecord]);

  const handleFieldChange = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const saveMutation = useMutation({
    mutationFn: ({ isEdit, idOrSlug, data }) =>
      isEdit
        ? updateOcfProd3(idOrSlug, data)
        : createOcfProd3({ slug: idOrSlug, data }),
    onSuccess: (res, variables) => {
      console.log("OCF-PROD-5 save success =>", { res, variables });
      const r = res?.data || res;
      toast.success(r?.message || "OCF-PROD-5 saved successfully");
      queryClient.invalidateQueries({ queryKey: ["ocfProd5"] });
      navigate(-1);
    },
    onError: (error, variables) => {
      console.error("OCF-PROD-5 save error =>", { error, variables });
      toast.error("Failed to save OCF-PROD-5");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    const data = formData;
    console.log("📤 Final OCF-5 data:", data);

    // recordId agar server se milta ho to yahan use karo, otherwise id use karo
    const recordId = ocfResp?.id;

    saveMutation.mutate({
      isEdit: isEditMode,
      idOrSlug: isEditMode ? recordId || id : slug,
      data,
    });
  };

  if (isEditMode && isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-muted">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading OCF-PROD-5...</span>
      </div>
    );
  }

  if (error) {
    console.error("OCF-PROD-5 fetch error =>", error);
  }

  return (
    <div className="min-h-screen bg-muted">
      <Navbar2 />
      <Billing />
      <nav className="bg-card border-b px-6 py-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="hover:text-foreground transition-colors"
          >
            Dashboard
          </button>
          <ChevronRight className="w-4 h-4" />
          <button
            type="button"
            onClick={() => navigate("/dashboard/workstation")}
            className="hover:text-foreground transition-colors"
          >
            Workstation
          </button>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground font-medium">
            {isEditMode ? "Edit" : "New"} OCF-PROD-5
          </span>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-8 max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            {isEditMode ? "Edit OCF-PROD-5" : "New OCF-PROD-5"}
          </h1>
          <div className="text-sm text-gray-500">{isEditMode.toString()}</div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Applicant & Accident */}
          <Section title="Applicant & Accident Information">
            <Grid>
              <Field
                label="First Name *"
                value={formData.first_name}
                onChange={(v) => handleFieldChange("first_name", v)}
                required
              />
              <Field
                label="Last Name *"
                value={formData.last_name}
                onChange={(v) => handleFieldChange("last_name", v)}
                required
              />
              <Field
                type="date"
                label="Date of Birth"
                value={formData.date_of_birth}
                onChange={(v) => handleFieldChange("date_of_birth", v)}
              />
              <Field
                type="date"
                label="Date of Accident"
                value={formData.date_of_accident}
                onChange={(v) => handleFieldChange("date_of_accident", v)}
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
                label="Home Telephone"
                value={formData.home_tel}
                placeholder="(888) 888-8888"
                onChange={(v) =>
                  handleFieldChange("home_tel", formatPhoneNumber(v))
                }
              />
              <Field
                label="Work Telephone"
                value={formData.work_tel}
                placeholder="(888) 888-8888"
                onChange={(v) =>
                  handleFieldChange("work_tel", formatPhoneNumber(v))
                }
              />
              <Field
                label="Ext"
                value={formData.ext}
                onChange={(v) => handleFieldChange("ext", v)}
              />
            </Grid>
          </Section>

          {/* Applicant Confirmation */}
          <Section title="Applicant Confirmation">
            <Grid>
              <Field
                label="Applicant Name"
                value={formData.applicant_name}
                onChange={(v) => handleFieldChange("applicant_name", v)}
              />
              <Field
                type="date"
                label="Applicant Date"
                value={formData.applicant_date}
                onChange={(v) => handleFieldChange("applicant_date", v)}
              />
            </Grid>
          </Section>

          {/* Insurance Company */}
          <Section title="Insurance Company Information">
            <Grid>
              <Field
                label="Insurance Company Name"
                value={formData.name_of_insuranceCompany}
                onChange={(v) =>
                  handleFieldChange("name_of_insuranceCompany", v)
                }
              />
              <Field
                label="Insurance Representative"
                value={formData.name_of_insurancecompany_representative}
                onChange={(v) =>
                  handleFieldChange(
                    "name_of_insurancecompany_representative",
                    v
                  )
                }
              />
              <TextField
                label="Insurance Company Address"
                value={formData.name_of_insurancecompany_address}
                onChange={(v) =>
                  handleFieldChange("name_of_insurancecompany_address", v)
                }
              />
              <Field
                label="Insurance Company City"
                value={formData.name_of_insurancecompany_city}
                onChange={(v) =>
                  handleFieldChange("name_of_insurancecompany_city", v)
                }
              />
              <Field
                label="Insurance Company Province"
                value={formData.name_of_insurancecompany_province}
                onChange={(v) =>
                  handleFieldChange("name_of_insurancecompany_province", v)
                }
              />
              <Field
                label="Insurance Company Postal Code"
                value={formData.name_of_insurancecompany_postalcode}
                onChange={(v) =>
                  handleFieldChange("name_of_insurancecompany_postalcode", v)
                }
              />
              <Field
                label="Insurance Company Telephone"
                value={formData.name_of_insurancecompany_telephone}
                placeholder="(888) 888-8888"
                onChange={(v) =>
                  handleFieldChange(
                    "name_of_insurancecompany_telephone",
                    formatPhoneNumber(v)
                  )
                }
              />
              <Field
                label="Insurance Company Fax Number"
                value={formData.name_of_insurancecompany_faxnumber}
                placeholder="(888) 888-8888"
                onChange={(v) =>
                  handleFieldChange(
                    "name_of_insurancecompany_faxnumber",
                    formatPhoneNumber(v)
                  )
                }
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
                "Save OCF-PROD-5"
              )}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}

/* Reusable layout helpers – same as OCFProd2 */

function Section({ title, children }) {
  return (
    <div className="bg-card rounded-xl shadow-sm border border-gray-200 p-8 space-y-6">
      <h2 className="text-2xl font-semibold text-foreground border-b border-gray-200 pb-4">
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

function Field({ label, value, onChange, type = "text", required = false, placeholder }) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-semibold text-foreground">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Input
        type={type}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="h-12 px-4 border-input focus:ring-2 focus:ring-primary focus:border-primary transition-all"
        placeholder={placeholder || label}
      />
    </div>
  );
}

function TextField({ label, value, onChange }) {
  return (
    <div className="space-y-2 md:col-span-full">
      <Label className="text-sm font-semibold text-foreground">{label}</Label>
      <Textarea
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        className="min-h-[100px] border-input focus:ring-2 focus:ring-primary focus:border-primary transition-all resize-vertical"
        placeholder={`Enter ${label.toLowerCase()}...`}
      />
    </div>
  );
}
