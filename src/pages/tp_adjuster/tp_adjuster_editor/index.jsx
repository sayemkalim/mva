import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ChevronRight, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Navbar2 } from "@/components/navbar2";
import { formatPhoneNumber } from "@/lib/utils";
import { fetchTpAdjusterBySlug } from "../helpers/fetchTpAdjusterBySlug";
import { createTpAdjuster } from "../helpers/createTpAdjuster";
import { deleteTpAdjuster } from "../helpers/deleteTpAdjuster";
import Billing from "@/components/billing";
import { Textarea } from "@/components/ui/textarea";
import { FloatingInput, FloatingTextarea } from "@/components/ui/floating-label";

const emptyRecord = {
  id: null,
  current: false,
  adjuster_company: "",
  adjuster_claim_no: "",
  first_name: "",
  last_name: "",
  toll_free_no: "",
  telephone: "",
  ext: "",
  fax: "",
  email: "",
  note: "",
};

export default function TPAdjusterForm() {
  const { slug } = useParams();
  const navigate = useNavigate();

  // ---------- FETCH ----------
  const {
    data: fetchedRecords,
    isLoading: loadingRecords,
    error: fetchError,
  } = useQuery({
    queryKey: ["tpAdjusterRecords", slug],
    queryFn: () => fetchTpAdjusterBySlug(slug),
    enabled: !!slug,
    onError: (err) =>
      toast.error(err?.message || "Failed to fetch adjuster records"),
  });

  const [records, setRecords] = useState([{ ...emptyRecord, current: true }]);

  useEffect(() => {
    if (Array.isArray(fetchedRecords) && fetchedRecords.length > 0) {
      setRecords(
        fetchedRecords.map((rec, idx) => ({
          id: rec.id ?? null,
          current: !!rec.current,
          adjuster_company: rec.adjuster_company || "",
          adjuster_claim_no: rec.adjuster_claim_no || "",
          first_name: rec.first_name || "",
          last_name: rec.last_name || "",
          toll_free_no: rec.toll_free_no || "",
          telephone: rec.telephone || "",
          ext: rec.ext || "",
          fax: rec.fax || "",
          email: rec.email || "",
          note: rec.note || "",
        }))
      );
    }
  }, [fetchedRecords]);

  // ---------- SAVE MUTATION ----------
  const saveMutation = useMutation({
    mutationFn: (data) => createTpAdjuster({ slug, data }),
    onSuccess: (data) => {
      const resp = data?.response;
      if (resp?.Apistatus === false) {
        toast.error(resp?.message || "Validation failed");
        return;
      }
      toast.success(resp?.message || "TP Adjuster data saved successfully!");
      // navigate("/dashboard/workstation");
    },
    onError: (error) => {
      console.error("Mutation Error:", error);
      const errorData = error.response?.data;
      if (errorData?.Apistatus === false) {
        toast.error(errorData?.message || "Validation failed");
      } else {
        toast.error(errorData?.message || "Failed to save adjuster data");
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteTpAdjuster(id),
    onSuccess: (data) => {
      const resp = data?.response;
      if (resp?.Apistatus === false) {
        toast.error(resp?.message || "Validation failed");
        return;
      }
      toast.success(resp?.message || "Adjuster record deleted");
    },
    onError: (error) => {
      console.error("Mutation Error:", error);
      const errorData = error.response?.data;
      if (errorData?.Apistatus === false) {
        toast.error(errorData?.message || "Validation failed");
      } else {
        toast.error(errorData?.message || "Failed to delete record");
      }
    },
  });

  const addRecord = () => {
    setRecords((prev) => [...prev, { ...emptyRecord }]);
  };

  const updateField = (index, key, value) => {
    setRecords((prev) =>
      prev.map((r, i) => (i === index ? { ...r, [key]: value } : r))
    );
  };

  const setCurrentRecord = (index) => {
    setRecords((prev) =>
      prev.map((r, i) => ({
        ...r,
        current: i === index,
      }))
    );
  };

  const handleDelete = (id, index) => {
    if (!id) {
      setRecords((prev) => {
        const updated = prev.filter((_, i) => i !== index);
        if (updated.length > 0 && !updated.some((r) => r.current)) {
          updated[0].current = true;
        }
        return updated;
      });
      return;
    }
    deleteMutation.mutate(id, {
      onSuccess: () => {
        setRecords((prev) => {
          const updated = prev.filter((_, i) => i !== index);
          if (updated.length > 0 && !updated.some((r) => r.current)) {
            updated[0].current = true;
          }
          return updated;
        });
      },
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const currentCount = records.filter((r) => r.current).length;
    if (currentCount !== 1) {
      toast.error("Exactly one adjuster must be marked as current.");
      return;
    }

    saveMutation.mutate(records);
  };

  if (loadingRecords) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading adjuster records...</span>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="text-red-600 p-4">
        Error: {fetchError?.message || "Unable to load adjuster records"}
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-muted">
      <Navbar2 />
      <Billing />
      {/* Breadcrumb */}
      <div className="bg-card border-b px-6 py-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <button
            onClick={() => navigate("/dashboard")}
            className="hover:text-foreground transition"
          >
            Dashboard
          </button>
          <ChevronRight className="w-4 h-4" />
          <button
            onClick={() => navigate("/dashboard/workstation")}
            className="hover:text-foreground transition"
          >
            Workstation
          </button>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground font-medium">TP Adjuster</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        <div className="bg-card rounded-lg shadow-sm border p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-extrabold text-foreground">
                BI Adjuster
              </h2>

              <Button
                type="button"
                onClick={addRecord}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Plus className="w-5 h-5" /> Add Adjuster
              </Button>
            </div>

            {records.map((rec, idx) => (
              <div
                key={idx}
                className="relative border border-input rounded-2xl p-8 "
              >
                {records.length > 1 && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-4 right-4"
                    onClick={() => handleDelete(rec.id, idx)}
                    aria-label="Remove adjuster"
                  >
                    <Trash2 className="w-5 h-5" />
                  </Button>
                )}

                {/* Current radio */}
                <div className="mb-4 flex items-center gap-2">
                  <input
                    type="radio"
                    id={`current_${idx}`}
                    name="currentAdjuster"
                    checked={rec.current}
                    onChange={() => setCurrentRecord(idx)}
                    className="h-4 w-4"
                  />
                  <Label htmlFor={`current_${idx}`} className="text-foreground">
                    Mark as current adjuster
                  </Label>
                </div>

                {/* Fields */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="space-y-2">
                    <FloatingInput
                      id={`adjuster_company_${idx}`}
                      label="Adjuster Company"
                      value={rec.adjuster_company}
                      onChange={(e) =>
                        updateField(idx, "adjuster_company", e.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <FloatingInput
                      id={`adjuster_claim_no_${idx}`}
                      label="Adjuster Claim No"
                      value={rec.adjuster_claim_no}
                      onChange={(e) =>
                        updateField(idx, "adjuster_claim_no", e.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <FloatingInput
                      id={`first_name_${idx}`}
                      label="First Name"
                      value={rec.first_name}
                      onChange={(e) =>
                        updateField(idx, "first_name", e.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <FloatingInput
                      id={`last_name_${idx}`}
                      label="Last Name"
                      value={rec.last_name}
                      onChange={(e) =>
                        updateField(idx, "last_name", e.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <FloatingInput
                      id={`toll_free_no_${idx}`}
                      label="Toll Free No"
                      value={rec.toll_free_no}
                      onChange={(e) =>
                        updateField(idx, "toll_free_no", formatPhoneNumber(e.target.value))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <FloatingInput
                      id={`telephone_${idx}`}
                      label="Telephone"
                      value={rec.telephone}
                      onChange={(e) =>
                        updateField(idx, "telephone", formatPhoneNumber(e.target.value))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <FloatingInput
                      id={`ext_${idx}`}
                      label="Ext"
                      value={rec.ext}
                      onChange={(e) => updateField(idx, "ext", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <FloatingInput
                      id={`fax_${idx}`}
                      label="Fax"
                      value={rec.fax}
                      onChange={(e) => updateField(idx, "fax", formatPhoneNumber(e.target.value))}
                    />
                  </div>

                  <div className="space-y-2">
                    <FloatingInput
                      id={`email_${idx}`}
                      label="Email"
                      value={rec.email}
                      onChange={(e) =>
                        updateField(idx, "email", e.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2 mt-4">
                  <FloatingTextarea
                    id={`note_${idx}`}
                    label="Note"
                    value={rec.note}
                    onChange={(e) => updateField(idx, "note", e.target.value)}
                  />
                </div>
              </div>
            ))}

            <Button
              type="submit"
              size="lg"
              disabled={saveMutation.isLoading || deleteMutation.isLoading}
            >
              {saveMutation.isLoading ? "Saving..." : "Save"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
