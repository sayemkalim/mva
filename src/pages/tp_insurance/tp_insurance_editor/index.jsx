import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronRight, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { fetchTpInsuranceBySlug } from "../helpers/fetchTpInsuranceBySlug";
import { createTpInsurance } from "../helpers/createInsurance";
import { Navbar2 } from "@/components/navbar2";
import { deleteTpInsurance } from "../helpers/deleteTpInsurance";
import Billing from "@/components/billing";

const emptyRecord = {
  id: null,
  last_name: "",
  firm_name: "",
  middle_name: "",
  insurance_company: "",
  policy_no: "",
  claim_no: "",
  address: {
    id: null,
    unit_number: "",
    street_number: "",
    street_name: "",
    street: "",
    city: "",
    province: "",
    postal_code: "",
    country: "",
  },
};

export default function TPInsurerForm() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const {
    data: fetchedRecords,
    isLoading: loadingRecords,
    error: fetchError,
  } = useQuery({
    queryKey: ["tpInsurerRecords", slug],
    queryFn: () => fetchTpInsuranceBySlug(slug),
    enabled: !!slug,
    onError: (err) => toast.error(err.message || "Failed to fetch records"),
  });

  const [records, setRecords] = useState([{ ...emptyRecord }]);

  useEffect(() => {
    if (
      fetchedRecords &&
      Array.isArray(fetchedRecords) &&
      fetchedRecords.length > 0
    ) {
      setRecords(
        fetchedRecords.map((rec) => ({
          id: rec.id || null,
          last_name: rec.last_name || "",
          firm_name: rec.firm_name || "",
          middle_name: rec.middle_name || "",
          insurance_company: rec.insurance_company || "",
          policy_no: rec.policy_no || "",
          claim_no: rec.claim_no || "",
          address: {
            id: rec.address?.id || null,
            unit_number: rec.address?.unit_number || "",
            street_number: rec.address?.street_number || "",
            street_name: rec.address?.street_name || "",
            street: rec.address?.street || "",
            city: rec.address?.city || "",
            province: rec.address?.province || "",
            postal_code: rec.address?.postal_code || "",
            country: rec.address?.country || "",
          },
        }))
      );
    }
  }, [fetchedRecords]);

  // SAVE mutation
  const mutation = useMutation({
    mutationFn: (data) => createTpInsurance({ slug, data }),
    onSuccess: (data) => {
      const resp = data?.response;
      if (resp?.Apistatus === false) {
        toast.error(resp?.message || "Validation failed");
        return;
      }
      toast.success(resp?.message || "TP Insurer data saved successfully!");
    },
    onError: (error) => {
      const errorData = error.response?.data;
      if (errorData?.Apistatus === false) {
        toast.error(errorData?.message || "Validation failed");
      } else {
        toast.error(errorData?.message || "Failed to save data");
      }
    },
  });

  // DELETE mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => deleteTpInsurance(id),
    onSuccess: (data) => {
      const resp = data?.response;
      if (resp?.Apistatus === false) {
        toast.error(resp?.message || "Validation failed");
        return;
      }
      toast.success(resp?.message || "Record deleted successfully!");
    },
    onError: (error) => {
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
      prev.map((rec, i) => (i === index ? { ...rec, [key]: value } : rec))
    );
  };

  const updateAddressField = (index, key, value) => {
    setRecords((prev) =>
      prev.map((rec, i) =>
        i === index
          ? { ...rec, address: { ...rec.address, [key]: value } }
          : rec
      )
    );
  };

  const handleDelete = (id, index) => {
    // Agar record abhi backend me save nahi hua (id null) to sirf UI se hatao
    if (!id) {
      setRecords((prev) => prev.filter((_, i) => i !== index));
      return;
    }

    // Saved record → delete API call
    deleteMutation.mutate(id, {
      onSuccess: () => {
        setRecords((prev) => prev.filter((_, i) => i !== index));
      },
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(records);
  };

  if (loadingRecords) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading records...</span>
      </div>
    );
  }

  if (fetchError) {
    return <div className="text-red-600">Error: {fetchError.message}</div>;
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
          <span className="text-foreground font-medium">TP Insurance</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        <div className="bg-card rounded-lg shadow-sm border p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-extrabold text-foreground">
                Third Party Insurer Records
              </h2>

              {/* Add Insurer → sirf naya block add, form submit nahi */}
              <Button
                type="button"
                onClick={addRecord}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Plus className="w-5 h-5" /> Add Insurer
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
                    aria-label="Remove record"
                  >
                    <Trash2 className="w-5 h-5" />
                  </Button>
                )}

                {/* Main Fields */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="space-y-2">
                    <Label
                      className="text-foreground font-medium cursor-pointer"
                      htmlFor={`first_name_${idx}`}
                    >
                      First Name
                    </Label>
                    <Input
                      id={`firm_name_${idx}`}
                      value={rec.firm_name}
                      onChange={(e) =>
                        updateField(idx, "firm_name", e.target.value)
                      }
                      placeholder="Firm Name"
                      className="h-9 bg-muted border-input"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      className="text-foreground font-medium cursor-pointer"
                      htmlFor={`last_name_${idx}`}
                    >
                      Last Name
                    </Label>
                    <Input
                      id={`last_name_${idx}`}
                      value={rec.last_name}
                      onChange={(e) =>
                        updateField(idx, "last_name", e.target.value)
                      }
                      placeholder="Last Name"
                      className="h-9 bg-muted border-input"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      className="text-foreground font-medium cursor-pointer"
                      htmlFor={`middle_name_${idx}`}
                    >
                      Middle Name
                    </Label>
                    <Input
                      id={`middle_name_${idx}`}
                      value={rec.middle_name}
                      onChange={(e) =>
                        updateField(idx, "middle_name", e.target.value)
                      }
                      placeholder="Middle Name"
                      className="h-9 bg-muted border-input"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      className="text-foreground font-medium cursor-pointer"
                      htmlFor={`insurance_company_${idx}`}
                    >
                      Insurance Company
                    </Label>
                    <Input
                      id={`insurance_company_${idx}`}
                      value={rec.insurance_company}
                      onChange={(e) =>
                        updateField(idx, "insurance_company", e.target.value)
                      }
                      placeholder="Insurance Company"
                      className="h-9 bg-muted border-input"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      className="text-foreground font-medium cursor-pointer"
                      htmlFor={`policy_no_${idx}`}
                    >
                      Policy Number
                    </Label>
                    <Input
                      id={`policy_no_${idx}`}
                      value={rec.policy_no}
                      onChange={(e) =>
                        updateField(idx, "policy_no", e.target.value)
                      }
                      placeholder="Policy Number"
                      className="h-9 bg-muted border-input"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      className="text-foreground font-medium cursor-pointer"
                      htmlFor={`claim_no_${idx}`}
                    >
                      Claim Number
                    </Label>
                    <Input
                      id={`claim_no_${idx}`}
                      value={rec.claim_no}
                      onChange={(e) =>
                        updateField(idx, "claim_no", e.target.value)
                      }
                      placeholder="Claim Number"
                      className="h-9 bg-muted border-input"
                    />
                  </div>
                </div>

                {/* Address Section */}
                <h3 className="mt-4 mb-5 text-xl font-bold text-foreground">
                  Address
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <Label
                      className="text-foreground font-medium cursor-pointer"
                      htmlFor={`unit_number_${idx}`}
                    >
                      Unit Number
                    </Label>
                    <Input
                      id={`unit_number_${idx}`}
                      value={rec.address.unit_number}
                      onChange={(e) =>
                        updateAddressField(idx, "unit_number", e.target.value)
                      }
                      placeholder="Unit Number"
                      className="h-9 bg-muted border-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      className="text-foreground font-medium cursor-pointer"
                      htmlFor={`street_${idx}`}
                    >
                      Street
                    </Label>
                    <Input
                      id={`street_${idx}`}
                      value={rec.address.street}
                      onChange={(e) =>
                        updateAddressField(idx, "street", e.target.value)
                      }
                      placeholder="Street"
                      className="h-9 bg-muted border-input"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      className="text-foreground font-medium cursor-pointer"
                      htmlFor={`city_${idx}`}
                    >
                      City
                    </Label>
                    <Input
                      id={`city_${idx}`}
                      value={rec.address.city}
                      onChange={(e) =>
                        updateAddressField(idx, "city", e.target.value)
                      }
                      placeholder="City"
                      className="h-9 bg-muted border-input"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      className="text-foreground font-medium cursor-pointer"
                      htmlFor={`province_${idx}`}
                    >
                      Province
                    </Label>
                    <Input
                      id={`province_${idx}`}
                      value={rec.address.province}
                      onChange={(e) =>
                        updateAddressField(idx, "province", e.target.value)
                      }
                      placeholder="Province"
                      className="h-9 bg-muted border-input"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      className="text-foreground font-medium cursor-pointer"
                      htmlFor={`postal_code_${idx}`}
                    >
                      Postal Code
                    </Label>
                    <Input
                      id={`postal_code_${idx}`}
                      value={rec.address.postal_code}
                      onChange={(e) =>
                        updateAddressField(idx, "postal_code", e.target.value)
                      }
                      placeholder="Postal Code"
                      className="h-9 bg-muted border-input"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      className="text-foreground font-medium cursor-pointer"
                      htmlFor={`country_${idx}`}
                    >
                      Country
                    </Label>
                    <Input
                      id={`country_${idx}`}
                      value={rec.address.country}
                      onChange={(e) =>
                        updateAddressField(idx, "country", e.target.value)
                      }
                      placeholder="Country"
                      className="h-9 bg-muted border-input"
                    />
                  </div>
                </div>
              </div>
            ))}

            <Button type="submit" size="lg" disabled={mutation.isLoading}>
              {mutation.isLoading ? "Saving..." : "Save"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
