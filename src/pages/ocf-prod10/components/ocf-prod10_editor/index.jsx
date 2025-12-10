import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { Navbar2 } from "@/components/navbar2";
import { fetchOcfProd10ById } from "../../helpers/fetchOcfProd10ById";
import {
  createOcfProd10,
  updateOcfProd10,
} from "../../helpers/createOcfProd10";

export default function OCFProd10Page() {
  const { id, slug } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditMode = Boolean(id);

  const {
    data: ocfResp,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["ocfProd10", id],
    queryFn: () => fetchOcfProd10ById(id),
    enabled: Boolean(isEditMode && id),
  });

  const ocfRecord = ocfResp?.data || null;

  const [formData, setFormData] = useState({
    applicant: {
      first_name: "",
      last_name: "",
      middle_name: "",
      gender: "",
      date_of_birth: "",
      address: {
        street: "",
        city: "",
        province: "",
        postal_code: "",
      },
      contact: {
        home_tel: "",
        work_tel: "",
        ext: "",
      },
      applicant_full_name: "",
      applicant_date: "",
    },
  });

  useEffect(() => {
    if (!ocfRecord) return;

    const applicant = ocfRecord.applicant || {};
    const address = applicant.address || {};
    const contact = applicant.contact || {};

    setFormData({
      applicant: {
        first_name: applicant.first_name || "",
        last_name: applicant.last_name || "",
        middle_name: applicant.middle_name || "",
        gender: applicant.gender || "",
        date_of_birth: applicant.date_of_birth || "",
        address: {
          street: address.street || "",
          city: address.city || "",
          province: address.province || "",
          postal_code: address.postal_code || "",
        },
        contact: {
          home_tel: contact.home_tel || "",
          work_tel: contact.work_tel || "",
          ext: contact.ext || "",
        },
        applicant_full_name: applicant.applicant_full_name || "",
        applicant_date: applicant.applicant_date || "",
      },
    });
  }, [ocfRecord]);

  const handleApplicantChange = (field, value) =>
    setFormData((prev) => ({
      ...prev,
      applicant: {
        ...prev.applicant,
        [field]: value,
      },
    }));

  const handleAddressChange = (field, value) =>
    setFormData((prev) => ({
      ...prev,
      applicant: {
        ...prev.applicant,
        address: {
          ...prev.applicant.address,
          [field]: value,
        },
      },
    }));

  const handleContactChange = (field, value) =>
    setFormData((prev) => ({
      ...prev,
      applicant: {
        ...prev.applicant,
        contact: {
          ...prev.applicant.contact,
          [field]: value,
        },
      },
    }));

  const saveMutation = useMutation({
    mutationFn: ({ isEdit, idOrSlug, data }) =>
      isEdit
        ? updateOcfProd10(idOrSlug, data)
        : createOcfProd10({ slug: idOrSlug, data }),
    onSuccess: (res, variables) => {
      console.log("OCF-PROD-10 save success =>", { res, variables });
      const r = res?.data || res;
      toast.success(r?.message || "OCF-PROD-10 saved successfully");
      queryClient.invalidateQueries({ queryKey: ["ocfProd10"] });
      navigate(-1);
    },
    onError: (error, variables) => {
      console.error("OCF-PROD-10 save error =>", { error, variables });
      toast.error("Failed to save OCF-PROD-10");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    const data = formData; // { applicant: {...} }
    console.log("📤 Final OCF‑10 data:", data);

    const recordId = ocfResp?.id;

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
        <span className="ml-2 text-lg">Loading OCF-PROD-10...</span>
      </div>
    );
  }

  if (error) {
    console.error("OCF-PROD-10 fetch error =>", error);
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
            {isEditMode ? "Edit" : "New"} OCF-PROD-10
          </span>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-8 max-w-5xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditMode ? "Edit OCF-PROD-10" : "New OCF-PROD-10"}
          </h1>
          <div className="text-sm text-gray-500">{isEditMode.toString()}</div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Applicant basic info */}
          <Section title="Applicant Information">
            <Grid>
              <Field
                label="First Name *"
                value={formData.applicant.first_name}
                onChange={(v) => handleApplicantChange("first_name", v)}
                required
              />
              <Field
                label="Last Name *"
                value={formData.applicant.last_name}
                onChange={(v) => handleApplicantChange("last_name", v)}
                required
              />
              <Field
                label="Middle Name"
                value={formData.applicant.middle_name}
                onChange={(v) => handleApplicantChange("middle_name", v)}
              />
              <Field
                label="Gender"
                value={formData.applicant.gender}
                onChange={(v) => handleApplicantChange("gender", v)}
              />
              <Field
                type="date"
                label="Date of Birth"
                value={formData.applicant.date_of_birth}
                onChange={(v) => handleApplicantChange("date_of_birth", v)}
              />
            </Grid>
          </Section>

          {/* Address */}
          <Section title="Address">
            <Grid>
              <Field
                label="Street"
                value={formData.applicant.address.street}
                onChange={(v) => handleAddressChange("street", v)}
              />
              <Field
                label="City"
                value={formData.applicant.address.city}
                onChange={(v) => handleAddressChange("city", v)}
              />
              <Field
                label="Province"
                value={formData.applicant.address.province}
                onChange={(v) => handleAddressChange("province", v)}
              />
              <Field
                label="Postal Code"
                value={formData.applicant.address.postal_code}
                onChange={(v) => handleAddressChange("postal_code", v)}
              />
            </Grid>
          </Section>

          {/* Contact */}
          <Section title="Contact">
            <Grid>
              <Field
                label="Home Telephone"
                value={formData.applicant.contact.home_tel}
                onChange={(v) => handleContactChange("home_tel", v)}
              />
              <Field
                label="Work Telephone"
                value={formData.applicant.contact.work_tel}
                onChange={(v) => handleContactChange("work_tel", v)}
              />
              <Field
                label="Ext"
                value={formData.applicant.contact.ext}
                onChange={(v) => handleContactChange("ext", v)}
              />
            </Grid>
          </Section>

          {/* Applicant confirmation */}
          <Section title="Applicant Confirmation">
            <Grid>
              <Field
                label="Applicant Full Name"
                value={formData.applicant.applicant_full_name}
                onChange={(v) =>
                  handleApplicantChange("applicant_full_name", v)
                }
              />
              <Field
                type="date"
                label="Applicant Date"
                value={formData.applicant.applicant_date}
                onChange={(v) => handleApplicantChange("applicant_date", v)}
              />
            </Grid>
          </Section>

          {/* Actions */}
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
                "Save OCF-PROD-10"
              )}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}

/* Shared layout helpers – same style as other OCF pages */

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
