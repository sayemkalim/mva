import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FloatingInput, FloatingTextarea } from "@/components/ui/floating-label";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, ChevronRight, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Navbar2 } from "@/components/navbar2";
import { fetchSocProdById } from "../../helpers/fetchSocProdById";
import { createSocProd, updateSocProd } from "../../helpers/createSocProd";
import Billing from "@/components/billing";

export default function SocProdPage() {
  const { id, slug } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditMode = Boolean(id);

  const {
    data: socResp,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["soc", id],
    queryFn: () => fetchSocProdById(id),
    enabled: Boolean(isEditMode && id),
  });

  const socRecord = socResp?.data || null;

  const [formData, setFormData] = useState({
    plaintiffs: [{ first_name: "", last_name: "" }],
    defendants: [
      {
        first_name: "",
        last_name: "",
        unit_number: "",
        street_number: "",
        street_name: "",
        city: "",
        province: "",
        postal_code: "",
        make: "",
        model: "",
        year: "",
        plate_number: "",
      },
    ],
    accident: {
      date: "",
      time: "",
      city: "",
      description: "",
      Wearing_a_seatbelt: false,
    },
    vehicle: {
      make: "",
      model: "",
      year: "",
      plate_number: "",
    },
    diagnoses: [""],
    result: "",
  });

  useEffect(() => {
    if (!socRecord) return;

    const data = socRecord;

    setFormData({
      plaintiffs: Array.isArray(data.plaintiffs)
        ? data.plaintiffs.map((p) => ({
            first_name: p.first_name || "",
            last_name: p.last_name || "",
          }))
        : [{ first_name: "", last_name: "" }],
      defendants: Array.isArray(data.defendants)
        ? data.defendants.map((d) => ({
            first_name: d.first_name || "",
            last_name: d.last_name || "",
            unit_number: d.unit_number || "",
            street_number: d.street_number || "",
            street_name: d.street_name || "",
            city: d.city || "",
            province: d.province || "",
            postal_code: d.postal_code || "",
            make: d.make || "",
            model: d.model || "",
            year: d.year || "",
            plate_number: d.plate_number || "",
          }))
        : [
            {
              first_name: "",
              last_name: "",
              unit_number: "",
              street_number: "",
              street_name: "",
              city: "",
              province: "",
              postal_code: "",
              make: "",
              model: "",
              year: "",
              plate_number: "",
            },
          ],
      accident: {
        date: data.accident?.date || "",
        time: data.accident?.time || "",
        city: data.accident?.city || "",
        description: data.accident?.description || "",
        Wearing_a_seatbelt: data.accident?.Wearing_a_seatbelt || false,
      },
      vehicle: {
        make: data.vehicle?.make || "",
        model: data.vehicle?.model || "",
        year: data.vehicle?.year || "",
        plate_number: data.vehicle?.plate_number || "",
      },
      diagnoses: Array.isArray(data.diagnoses)
        ? data.diagnoses.map((d) => d || "")
        : [""],
      result: data.result || "",
    });
  }, [socRecord]);

  // Plaintiffs
  const addPlaintiff = () =>
    setFormData((prev) => ({
      ...prev,
      plaintiffs: [...prev.plaintiffs, { first_name: "", last_name: "" }],
    }));

  const removePlaintiff = (index) =>
    setFormData((prev) => ({
      ...prev,
      plaintiffs: prev.plaintiffs.filter((_, i) => i !== index),
    }));

  const handlePlaintiffChange = (index, field, value) =>
    setFormData((prev) => ({
      ...prev,
      plaintiffs: prev.plaintiffs.map((p, i) =>
        i === index ? { ...p, [field]: value } : p
      ),
    }));

  // Defendants
  const addDefendant = () =>
    setFormData((prev) => ({
      ...prev,
      defendants: [
        ...prev.defendants,
        {
          first_name: "",
          last_name: "",
          unit_number: "",
          street_number: "",
          street_name: "",
          city: "",
          province: "",
          postal_code: "",
          make: "",
          model: "",
          year: "",
          plate_number: "",
        },
      ],
    }));

  const removeDefendant = (index) =>
    setFormData((prev) => ({
      ...prev,
      defendants: prev.defendants.filter((_, i) => i !== index),
    }));

  const handleDefendantChange = (index, field, value) =>
    setFormData((prev) => ({
      ...prev,
      defendants: prev.defendants.map((d, i) =>
        i === index ? { ...d, [field]: value } : d
      ),
    }));

  // Accident
  const handleAccidentChange = (field, value) =>
    setFormData((prev) => ({
      ...prev,
      accident: {
        ...prev.accident,
        [field]: value,
      },
    }));

  // Vehicle
  const handleVehicleChange = (field, value) =>
    setFormData((prev) => ({
      ...prev,
      vehicle: {
        ...prev.vehicle,
        [field]: value,
      },
    }));

  // Diagnoses
  const addDiagnosis = () =>
    setFormData((prev) => ({
      ...prev,
      diagnoses: [...prev.diagnoses, ""],
    }));

  const removeDiagnosis = (index) =>
    setFormData((prev) => ({
      ...prev,
      diagnoses: prev.diagnoses.filter((_, i) => i !== index),
    }));

  const handleDiagnosisChange = (index, value) =>
    setFormData((prev) => ({
      ...prev,
      diagnoses: prev.diagnoses.map((d, i) => (i === index ? value : d)),
    }));

  const saveMutation = useMutation({
    mutationFn: ({ isEdit, idOrSlug, data }) =>
      isEdit
        ? updateSocProd(idOrSlug, data)
        : createSocProd({ slug: idOrSlug, data }),
    onSuccess: (res, variables) => {
      console.log("SOC save success =>", { res, variables });
      const r = res?.data || res;
      toast.success(r?.message || "SOC saved successfully");
      queryClient.invalidateQueries({ queryKey: ["soc"] });
      navigate(-1);
    },
    onError: (error, variables) => {
      console.error("SOC save error =>", { error, variables });
      toast.error("Failed to save SOC");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = formData;
    console.log("📤 Final SOC data:", data);

    const recordId = socResp?.id;

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
        <span className="ml-2 text-lg">Loading SOC...</span>
      </div>
    );
  }

  if (error) {
    console.error("SOC fetch error =>", error);
  }

  return (
    <div className="min-h-screen bg-muted">
      <Navbar2 />
<Billing/>
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
            {isEditMode ? "Edit" : "New"} SOC
          </span>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-8 max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            {isEditMode ? "Edit SOC" : "New SOC"}
          </h1>
          <div className="text-sm text-gray-500">{isEditMode.toString()}</div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Plaintiffs */}
          <Section title="Plaintiffs">
            {formData.plaintiffs.map((plaintiff, index) => (
              <div key={index} className="border p-4 rounded-lg mb-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold">Plaintiff {index + 1}</h3>
                  {formData.plaintiffs.length > 1 && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removePlaintiff(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <Grid>
                  <Field
                    label="First Name"
                    value={plaintiff.first_name}
                    onChange={(v) =>
                      handlePlaintiffChange(index, "first_name", v)
                    }
                  />
                  <Field
                    label="Last Name"
                    value={plaintiff.last_name}
                    onChange={(v) =>
                      handlePlaintiffChange(index, "last_name", v)
                    }
                  />
                </Grid>
              </div>
            ))}
            <Button type="button" onClick={addPlaintiff} variant="outline">
              <Plus className="h-4 w-4 mr-2" /> Add Plaintiff
            </Button>
          </Section>

          {/* Defendants */}
          <Section title="Defendants">
            {formData.defendants.map((defendant, index) => (
              <div key={index} className="border p-4 rounded-lg mb-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold">Defendant {index + 1}</h3>
                  {formData.defendants.length > 1 && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeDefendant(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <Grid>
                  <Field
                    label="First Name"
                    value={defendant.first_name}
                    onChange={(v) =>
                      handleDefendantChange(index, "first_name", v)
                    }
                  />
                  <Field
                    label="Last Name"
                    value={defendant.last_name}
                    onChange={(v) =>
                      handleDefendantChange(index, "last_name", v)
                    }
                  />
                  <Field
                    label="Unit Number"
                    value={defendant.unit_number}
                    onChange={(v) =>
                      handleDefendantChange(index, "unit_number", v)
                    }
                  />
                  <Field
                    label="Street Number"
                    value={defendant.street_number}
                    onChange={(v) =>
                      handleDefendantChange(index, "street_number", v)
                    }
                  />
                  <Field
                    label="Street Name"
                    value={defendant.street_name}
                    onChange={(v) =>
                      handleDefendantChange(index, "street_name", v)
                    }
                  />
                  <Field
                    label="City"
                    value={defendant.city}
                    onChange={(v) => handleDefendantChange(index, "city", v)}
                  />
                  <Field
                    label="Province"
                    value={defendant.province}
                    onChange={(v) =>
                      handleDefendantChange(index, "province", v)
                    }
                  />
                  <Field
                    label="Postal Code"
                    value={defendant.postal_code}
                    onChange={(v) =>
                      handleDefendantChange(index, "postal_code", v)
                    }
                  />
                  <Field
                    label="Vehicle Make"
                    value={defendant.make}
                    onChange={(v) => handleDefendantChange(index, "make", v)}
                  />
                  <Field
                    label="Vehicle Model"
                    value={defendant.model}
                    onChange={(v) => handleDefendantChange(index, "model", v)}
                  />
                  <Field
                    label="Vehicle Year"
                    type="number"
                    value={defendant.year}
                    onChange={(v) => handleDefendantChange(index, "year", v)}
                  />
                  <Field
                    label="Plate Number"
                    value={defendant.plate_number}
                    onChange={(v) =>
                      handleDefendantChange(index, "plate_number", v)
                    }
                  />
                </Grid>
              </div>
            ))}
            <Button type="button" onClick={addDefendant} variant="outline">
              <Plus className="h-4 w-4 mr-2" /> Add Defendant
            </Button>
          </Section>

          {/* Accident */}
          <Section title="Accident Details">
            <Grid>
              <Field
                type="date"
                label="Date"
                value={formData.accident.date}
                onChange={(v) => handleAccidentChange("date", v)}
              />
              <Field
                type="time"
                label="Time"
                value={formData.accident.time}
                onChange={(v) => handleAccidentChange("time", v)}
              />
              <Field
                label="City"
                value={formData.accident.city}
                onChange={(v) => handleAccidentChange("city", v)}
              />
              <TextField
                label="Description"
                value={formData.accident.description}
                onChange={(v) => handleAccidentChange("description", v)}
              />
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="seatbelt"
                  checked={formData.accident.Wearing_a_seatbelt}
                  onCheckedChange={(checked) =>
                    handleAccidentChange("Wearing_a_seatbelt", checked)
                  }
                />
                <label
                  htmlFor="seatbelt"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Wearing a seatbelt
                </label>
              </div>
            </Grid>
          </Section>

          {/* Vehicle */}
          <Section title="Vehicle Information">
            <Grid>
              <Field
                label="Make"
                value={formData.vehicle.make}
                onChange={(v) => handleVehicleChange("make", v)}
              />
              <Field
                label="Model"
                value={formData.vehicle.model}
                onChange={(v) => handleVehicleChange("model", v)}
              />
              <Field
                label="Year"
                type="number"
                value={formData.vehicle.year}
                onChange={(v) => handleVehicleChange("year", v)}
              />
              <Field
                label="Plate Number"
                value={formData.vehicle.plate_number}
                onChange={(v) => handleVehicleChange("plate_number", v)}
              />
            </Grid>
          </Section>

          {/* Diagnoses */}
          <Section title="Diagnoses">
            {formData.diagnoses.map((diagnosis, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <Input
                  value={diagnosis}
                  onChange={(e) => handleDiagnosisChange(index, e.target.value)}
                  placeholder={`Diagnosis ${index + 1}`}
                  className="flex-1"
                />
                {formData.diagnoses.length > 1 && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removeDiagnosis(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button type="button" onClick={addDiagnosis} variant="outline">
              <Plus className="h-4 w-4 mr-2" /> Add Diagnosis
            </Button>
          </Section>

          {/* Result */}
          <Section title="Result">
            <TextField
              label="Result"
              value={formData.result}
              onChange={(v) => setFormData((prev) => ({ ...prev, result: v }))}
            />
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
                "Save SOC"
              )}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}

/* Shared helpers */

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

function Field({ label, value, onChange, type = "text", required = false }) {
  return (
    <FloatingInput
      label={label}
      required={required}
      type={type}
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

function TextField({ label, value, onChange }) {
  return (
    <div className="md:col-span-full">
      <FloatingTextarea
        label={label}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        className="min-h-[100px] resize-vertical"
      />
    </div>
  );
}
