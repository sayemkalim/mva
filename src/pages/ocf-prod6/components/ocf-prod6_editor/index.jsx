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
import { createOcfProd6, updateOcfProd6 } from "../../helpers/createOcfProd6";
import { fetchOcfProd6ById } from "../../helpers/fetchOcfProd6ById";
import Billing from "@/components/billing";
import { formatPhoneNumber } from "@/utils/formatters";

export default function OCFProd6Page() {
  const { id, slug } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditMode = Boolean(id);

  const {
    data: ocfResp,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["ocfProd6", id],
    queryFn: () => fetchOcfProd6ById(id),
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
      street_address: "",
      city: "",
      province: "",
      postal_code: "",
      home_tel: "",
      work_tel: "",
      ext: "",
      applicant_name: "",
      applicant_date: "",
    },
    items: Array.from({ length: 10 }, (_, i) => ({
      item: String(i + 1),
      date: "",
      description: "",
      serviceProvider: "",
      amount: "",
    })),
  });

  useEffect(() => {
    if (!ocfRecord) return;

    const apiData = ocfRecord;
    const applicant = apiData.applicant || {};
    const items = Array.isArray(apiData.items) ? apiData.items : [];

    setFormData({
      applicant: {
        first_name: applicant.first_name || "",
        last_name: applicant.last_name || "",
        middle_name: applicant.middle_name || "",
        gender: applicant.gender || "",
        date_of_birth: applicant.date_of_birth || "",
        street_address: applicant.street_address || "",
        city: applicant.city || "",
        province: applicant.province || "",
        postal_code: applicant.postal_code || "",
        home_tel: applicant.home_tel || "",
        work_tel: applicant.work_tel || "",
        ext: applicant.ext || "",
        applicant_name: applicant.applicant_name || "",
        applicant_date: applicant.applicant_date || "",
      },
      items: Array.from({ length: 10 }, (_, i) => {
        const row = items[i] || {};
        return {
          item: row.item || String(i + 1),
          date: row.date || "",
          description: row.description || "",
          serviceProvider: row.serviceProvider || "",
          amount: row.amount || "",
        };
      }),
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

  const handleItemChange = (index, field, value) =>
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));

  const saveMutation = useMutation({
    mutationFn: ({ isEdit, idOrSlug, data }) =>
      isEdit
        ? updateOcfProd6(idOrSlug, data)
        : createOcfProd6({ slug: idOrSlug, data }),
    onSuccess: (res, variables) => {
      console.log("OCF-PROD-6 save success =>", { res, variables });
      const r = res?.data || res;
      toast.success(r?.message || "OCF-PROD-6 saved successfully");
      queryClient.invalidateQueries({ queryKey: ["ocfProd6"] });
      navigate(-1);
    },
    onError: (error, variables) => {
      console.error("OCF-PROD-6 save error =>", { error, variables });
      toast.error("Failed to save OCF-PROD-6");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    const data = formData;
    console.log("📤 Final OCF‑6 data:", data);

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
        <span className="ml-2 text-lg">Loading OCF-PROD-6...</span>
      </div>
    );
  }

  if (error) {
    console.error("OCF-PROD-6 fetch error =>", error);
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
            {isEditMode ? "Edit" : "New"} OCF-PROD-6
          </span>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-8 max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            {isEditMode ? "Edit OCF-PROD-6" : "New OCF-PROD-6"}
          </h1>

        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Applicant */}
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
              <Field
                label="Street Address"
                value={formData.applicant.street_address}
                onChange={(v) => handleApplicantChange("street_address", v)}
              />
              <Field
                label="City"
                value={formData.applicant.city}
                onChange={(v) => handleApplicantChange("city", v)}
              />
              <Field
                label="Province"
                value={formData.applicant.province}
                onChange={(v) => handleApplicantChange("province", v)}
              />
              <Field
                label="Postal Code"
                value={formData.applicant.postal_code}
                onChange={(v) => handleApplicantChange("postal_code", v)}
              />
              <Field
                label="Home Telephone"
                value={formData.applicant.home_tel}
                placeholder="(888) 888-8888"
                onChange={(v) =>
                  handleApplicantChange("home_tel", formatPhoneNumber(v))
                }
              />
              <Field
                label="Work Telephone"
                value={formData.applicant.work_tel}
                placeholder="(888) 888-8888"
                onChange={(v) =>
                  handleApplicantChange("work_tel", formatPhoneNumber(v))
                }
              />
              <Field
                label="Ext"
                value={formData.applicant.ext}
                onChange={(v) => handleApplicantChange("ext", v)}
              />
              <Field
                label="Applicant Name"
                value={formData.applicant.applicant_name}
                onChange={(v) => handleApplicantChange("applicant_name", v)}
              />
              <Field
                type="date"
                label="Applicant Date"
                value={formData.applicant.applicant_date}
                onChange={(v) => handleApplicantChange("applicant_date", v)}
              />
            </Grid>
          </Section>

          {/* Items */}
          <Section title="Expenses / Items">
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200 text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border px-3 py-2 text-left w-16">Item</th>
                    <th className="border px-3 py-2 text-left w-40">Date</th>
                    <th className="border px-3 py-2 text-left">Description</th>
                    <th className="border px-3 py-2 text-left w-60">
                      Service Provider
                    </th>
                    <th className="border px-3 py-2 text-left w-32">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.items.map((row, index) => (
                    <tr key={row.item || index}>
                      <td className="border px-3 py-2 align-top">
                        {row.item}
                      </td>
                      <td className="border px-3 py-2 align-top">
                        <Input
                          type="date"
                          value={row.date || ""}
                          onChange={(e) =>
                            handleItemChange(index, "date", e.target.value)
                          }
                        />
                      </td>
                      <td className="border px-3 py-2 align-top">
                        <Textarea
                          rows={2}
                          value={row.description || ""}
                          onChange={(e) =>
                            handleItemChange(
                              index,
                              "description",
                              e.target.value
                            )
                          }
                        />
                      </td>
                      <td className="border px-3 py-2 align-top">
                        <Input
                          value={row.serviceProvider || ""}
                          onChange={(e) =>
                            handleItemChange(
                              index,
                              "serviceProvider",
                              e.target.value
                            )
                          }
                        />
                      </td>
                      <td className="border px-3 py-2 align-top">
                        <Input
                          value={row.amount || ""}
                          onChange={(e) =>
                            handleItemChange(index, "amount", e.target.value)
                          }
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
                "Save OCF-PROD-6"
              )}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}

/* Shared layout helpers */

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
