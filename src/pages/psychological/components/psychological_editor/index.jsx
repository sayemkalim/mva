import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { Navbar2 } from "@/components/navbar2";
import { fetchPsychologicalById } from "../../helpers/fetchPsychologicalById";
import {
  createPsychological,
  updatePsychological,
} from "../../helpers/createPsychological";
import Billing from "@/components/billing";

const SYMPTOM_KEYS = {
  psychological: [
    "sadness",
    "low_mood",
    "lack_of_interest_in_activities",
    "negative_thinking",
    "easy_frustration_and_irritability",
    "low_self_esteem",
    "fear_of_another_accident",
    "poor_sleep_and_fatigue",
    "depression",
    "hyper_vigilance",
    "irritable",
    "fear_of_crowds",
    "distress",
    "panic_attacks",
    "accident_flashbacks",
    "suicidal_ideations",
    "accident_nightmares",
    "delusions",
    "fear_of_driving",
    "fear_of_being_a_passenger",
    "constant_fatigue",
    "crying_and_feeling_helpless",
    "loss_of_energy",
    "sleep_disturbance",
    "loss_of_incentive",
    "hallucinations",
    "anxiety",
    "withdrawal_from_people",
  ],
  physical: [
    "neck_pain",
    "pain_radiating_rt",
    "right_shoulder",
    "pain_radiating_ll",
    "left_shoulder",
    "right_knee_pain",
    "upper_back",
    "left_knee_pain",
    "mid_back",
    "right_knee_swelling",
    "low_back",
    "left_knee_swelling",
  ],
  respiratory: [
    "difficulties_in_breathing",
    "chest_pain",
    "difficulties_in_chewing_on_food",
  ],
  cognitive: [
    "recurrent_headaches",
    "memory_loss",
    "loss_of_balance",
    "lack_of_concentration",
    "dizziness",
    "lack_of_comprehension",
    "clumsiness",
    "difficulty_following_directions",
    "blurred_vision",
    "ringing_in_ears",
    "short_tempered",
    "loss_of_taste",
    "mood_swings",
    "loss_of_smell",
    "loss_of_hearing",
    "easily_fatigued",
    "loss_of_consciousness",
  ],
  weight: ["gained_weight", "loss_of_weight"],
};

const ALL_SYMPTOMS = Object.values(SYMPTOM_KEYS).flat();

const createEmptySymptom = () => ({
  checkbox: false,
  mild: false,
  moderate: false,
  severe: false,
  daily: false,
  weekly: false,
});

const createInitialSymptoms = () => {
  const symptoms = {};
  ALL_SYMPTOMS.forEach((key) => {
    symptoms[key] = createEmptySymptom();
  });
  return symptoms;
};

export default function PsychologicalPage() {
  const { id, slug } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditMode = Boolean(id);

  const {
    data: psychResp,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["psychological", id],
    queryFn: () => fetchPsychologicalById(id),
    enabled: Boolean(isEditMode && id),
  });

  const psychRecord = psychResp?.data || null;

  const [formData, setFormData] = useState({
    name_of_patient: "",
    cell_number: "",
    file_number: "",
    date_of_birth: "",
    name_of_insurer: "",
    claim_no: "",
    policy_no: "",
    symptoms: createInitialSymptoms(),

    // Cognitive Complaints
    cognitive_steering_wheel: false,
    cognitive_air_bags: false,
    cognitive_supported_beam: false,
    cognitive_headrest: false,
    cognitive_front_seat: false,
    cognitive_mirror: false,
    cognitive_other_part: "",
    cognitive_pedestrian_hit: false,
    cognitive_road_hit: false,
  });

  useEffect(() => {
    if (!psychRecord) return;

    const d = psychRecord;
    const bool = (val) => val === "on" || val === true;

    const loadedSymptoms = {};
    ALL_SYMPTOMS.forEach((key) => {
      const s = d.symptoms?.[key] || {};
      loadedSymptoms[key] = {
        checkbox: bool(s.checkbox),
        mild: bool(s.mild),
        moderate: bool(s.moderate),
        severe: bool(s.severe),
        daily: bool(s.daily),
        weekly: bool(s.weekly),
      };
    });

    setFormData({
      name_of_patient: d.name_of_patient || "",
      cell_number: d.cell_number || "",
      file_number: d.file_number || "",
      date_of_birth: d.date_of_birth || "",
      name_of_insurer: d.name_of_insurer || "",
      claim_no: d.claim_no || "",
      policy_no: d.policy_no || "",
      symptoms: loadedSymptoms,

      cognitive_steering_wheel: d.cognitive_steering_wheel || false,
      cognitive_air_bags: d.cognitive_air_bags || false,
      cognitive_supported_beam: d.cognitive_supported_beam || false,
      cognitive_headrest: d.cognitive_headrest || false,
      cognitive_front_seat: d.cognitive_front_seat || false,
      cognitive_mirror: d.cognitive_mirror || false,
      cognitive_other_part: d.cognitive_other_part || "",
      cognitive_pedestrian_hit: d.cognitive_pedestrian_hit || false,
      cognitive_road_hit: d.cognitive_road_hit || false,
    });
  }, [psychRecord]);

  const handleChange = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handleSymptomChange = (symptomKey, field, checked) =>
    setFormData((prev) => ({
      ...prev,
      symptoms: {
        ...prev.symptoms,
        [symptomKey]: {
          ...prev.symptoms[symptomKey],
          [field]: checked,
        },
      },
    }));

  const saveMutation = useMutation({
    mutationFn: ({ isEdit, idOrSlug, data }) =>
      isEdit
        ? updatePsychological(idOrSlug, data)
        : createPsychological({ slug: idOrSlug, data }),
    onSuccess: (res, variables) => {
      console.log("Psychological save success =>", { res, variables });
      const r = res?.data || res;
      toast.success(r?.message || "Psychological form saved successfully");
      queryClient.invalidateQueries({ queryKey: ["psychological"] });
      navigate(-1);
    },
    onError: (error, variables) => {
      console.error("Psychological save error =>", { error, variables });
      toast.error("Failed to save Psychological form");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = formData;
    console.log("📤 Final Psychological data:", data);
    const recordId = psychResp?.id;

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
        <span className="ml-2 text-lg">Loading Psychological Form...</span>
      </div>
    );
  }

  if (error) {
    console.error("Psychological fetch error =>", error);
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
            {isEditMode ? "Edit" : "New"} Psychological Assessment
          </span>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-8 max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            {isEditMode ? "Edit" : "New"} Psychological Assessment
          </h1>
          {/* <div className="text-sm text-gray-500">{isEditMode.toString()}</div> */}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Patient Information */}
          <Section title="Patient Information">
            <Grid>
              <Field
                label="Name of Patient"
                value={formData.name_of_patient}
                onChange={(v) => handleChange("name_of_patient", v)}
              />
              <Field
                label="Cell Number"
                value={formData.cell_number}
                onChange={(v) => handleChange("cell_number", v)}
              />
              <Field
                label="File Number"
                value={formData.file_number}
                onChange={(v) => handleChange("file_number", v)}
              />
              <Field
                type="date"
                label="Date of Birth"
                value={formData.date_of_birth}
                onChange={(v) => handleChange("date_of_birth", v)}
              />
              <Field
                label="Name of Insurer"
                value={formData.name_of_insurer}
                onChange={(v) => handleChange("name_of_insurer", v)}
              />
              <Field
                label="Claim No"
                value={formData.claim_no}
                onChange={(v) => handleChange("claim_no", v)}
              />
              <Field
                label="Policy No"
                value={formData.policy_no}
                onChange={(v) => handleChange("policy_no", v)}
              />
            </Grid>
          </Section>

          {/* Psychological Symptoms */}
          <Section title="Psychological Symptoms">
            <SymptomTable
              symptoms={SYMPTOM_KEYS.psychological}
              formData={formData}
              onSymptomChange={handleSymptomChange}
            />
          </Section>

          {/* Physical Symptoms */}
          <Section title="Physical Symptoms">
            <SymptomTable
              symptoms={SYMPTOM_KEYS.physical}
              formData={formData}
              onSymptomChange={handleSymptomChange}
            />
          </Section>

          {/* Respiratory Symptoms */}
          <Section title="Respiratory Symptoms">
            <SymptomTable
              symptoms={SYMPTOM_KEYS.respiratory}
              formData={formData}
              onSymptomChange={handleSymptomChange}
            />
          </Section>

          {/* Cognitive Symptoms */}
          <Section title="Cognitive Symptoms">
            <div className="mb-8 space-y-6 border border-gray-100 rounded-lg p-6 bg-gray-50/50">
              <div className="space-y-4">
                <p className="text-sm font-medium text-gray-700">
                  Did you hit your head on any Interior part of the car? Please circle:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="cognitive_steering_wheel"
                      checked={formData.cognitive_steering_wheel}
                      onCheckedChange={(c) => handleChange("cognitive_steering_wheel", c)}
                    />
                    <Label htmlFor="cognitive_steering_wheel" className="font-normal cursor-pointer">Steering wheel</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="cognitive_air_bags"
                      checked={formData.cognitive_air_bags}
                      onCheckedChange={(c) => handleChange("cognitive_air_bags", c)}
                    />
                    <Label htmlFor="cognitive_air_bags" className="font-normal cursor-pointer">Air bags</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="cognitive_supported_beam"
                      checked={formData.cognitive_supported_beam}
                      onCheckedChange={(c) => handleChange("cognitive_supported_beam", c)}
                    />
                    <div className="flex flex-col cursor-pointer" onClick={() => handleChange("cognitive_supported_beam", !formData.cognitive_supported_beam)}>
                      <Label htmlFor="cognitive_supported_beam" className="font-normal cursor-pointer pointer-events-none">Supported beam</Label>
                      <span className="text-xs text-muted-foreground">(between the front windshields and window)</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="cognitive_headrest"
                      checked={formData.cognitive_headrest}
                      onCheckedChange={(c) => handleChange("cognitive_headrest", c)}
                    />
                    <Label htmlFor="cognitive_headrest" className="font-normal cursor-pointer">Headrest</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="cognitive_front_seat"
                      checked={formData.cognitive_front_seat}
                      onCheckedChange={(c) => handleChange("cognitive_front_seat", c)}
                    />
                    <Label htmlFor="cognitive_front_seat" className="font-normal cursor-pointer">Front seat</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="cognitive_mirror"
                      checked={formData.cognitive_mirror}
                      onCheckedChange={(c) => handleChange("cognitive_mirror", c)}
                    />
                    <Label htmlFor="cognitive_mirror" className="font-normal cursor-pointer">Mirror</Label>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <Label htmlFor="cognitive_other_part" className="font-semibold whitespace-nowrap">OTHER</Label>
                  <Input
                    id="cognitive_other_part"
                    value={formData.cognitive_other_part}
                    onChange={(e) => handleChange("cognitive_other_part", e.target.value)}
                    className="border-b border-t-0 border-x-0 rounded-none px-0 shadow-none focus-visible:ring-0 focus-visible:border-primary h-8"
                    placeholder="________________________________"
                  />
                </div>

                <div className="space-y-3 pt-4 border-t border-dashed">
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="cognitive_pedestrian_hit"
                      checked={formData.cognitive_pedestrian_hit}
                      onCheckedChange={(c) => handleChange("cognitive_pedestrian_hit", c)}
                    />
                    <Label htmlFor="cognitive_pedestrian_hit" className="font-normal pt-0.5 cursor-pointer leading-tight">
                      If Pedestrian did you hit your head (includes face) on any part of the vehicle that struck you
                    </Label>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="cognitive_road_hit"
                      checked={formData.cognitive_road_hit}
                      onCheckedChange={(c) => handleChange("cognitive_road_hit", c)}
                    />
                    <Label htmlFor="cognitive_road_hit" className="font-normal pt-0.5 cursor-pointer leading-tight">
                      Did you strike your head on the road
                    </Label>
                  </div>
                </div>
              </div>
            </div>

            <SymptomTable
              symptoms={SYMPTOM_KEYS.cognitive}
              formData={formData}
              onSymptomChange={handleSymptomChange}
            />
          </Section>

          {/* Weight Symptoms */}
          <Section title="Weight Changes">
            <SymptomTable
              symptoms={SYMPTOM_KEYS.weight}
              formData={formData}
              onSymptomChange={handleSymptomChange}
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
                "Save Assessment"
              )}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}

/* Component Helpers */

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
        placeholder={label}
      />
    </div>
  );
}

function SymptomTable({ symptoms, formData, onSymptomChange }) {
  const formatLabel = (key) => {
    return key
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border border-gray-200 text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-4 py-3 text-left font-semibold">
              Symptom
            </th>
            <th className="border px-4 py-3 text-center font-semibold w-24">
              Present
            </th>
            <th className="border px-4 py-3 text-center font-semibold w-24">
              Mild
            </th>
            <th className="border px-4 py-3 text-center font-semibold w-24">
              Moderate
            </th>
            <th className="border px-4 py-3 text-center font-semibold w-24">
              Severe
            </th>
          </tr>
        </thead>
        <tbody>
          {symptoms.map((key) => {
            const symptom = formData.symptoms[key] || createEmptySymptom();
            return (
              <tr key={key} className="hover:bg-muted">
                <td className="border px-4 py-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span>{formatLabel(key)}</span>
                    {key === "recurrent_headaches" && (
                      <div className="flex gap-3 items-center">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`daily-${key}`}
                            checked={symptom.daily || false}
                            onCheckedChange={(c) =>
                              onSymptomChange(key, "daily", c)
                            }
                          />
                          <Label
                            htmlFor={`daily-${key}`}
                            className="font-normal text-xs cursor-pointer"
                          >
                            Daily
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`weekly-${key}`}
                            checked={symptom.weekly || false}
                            onCheckedChange={(c) =>
                              onSymptomChange(key, "weekly", c)
                            }
                          />
                          <Label
                            htmlFor={`weekly-${key}`}
                            className="font-normal text-xs cursor-pointer"
                          >
                            Weekly
                          </Label>
                        </div>
                      </div>
                    )}
                  </div>
                </td>
                <td className="border px-4 py-3 text-center">
                  <Checkbox
                    checked={symptom.checkbox}
                    onCheckedChange={(checked) =>
                      onSymptomChange(key, "checkbox", checked)
                    }
                  />
                </td>
                <td className="border px-4 py-3 text-center">
                  <Checkbox
                    checked={symptom.mild}
                    onCheckedChange={(checked) =>
                      onSymptomChange(key, "mild", checked)
                    }
                  />
                </td>
                <td className="border px-4 py-3 text-center">
                  <Checkbox
                    checked={symptom.moderate}
                    onCheckedChange={(checked) =>
                      onSymptomChange(key, "moderate", checked)
                    }
                  />
                </td>
                <td className="border px-4 py-3 text-center">
                  <Checkbox
                    checked={symptom.severe}
                    onCheckedChange={(checked) =>
                      onSymptomChange(key, "severe", checked)
                    }
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
