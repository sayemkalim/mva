import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { Loader2, ChevronRight, Check, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { getABMeta } from "../helpers/fetchABMeta";
import { createMedicalCentre } from "../helpers/createMedicalCentre";
import { fetchMedicalCentreBySlug } from "../helpers/fetchMedicalCentreBySlug";
import { Navbar2 } from "@/components/navbar2";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const SearchableSelect = ({ label, options, value, onChange, placeholder }) => {
  const [open, setOpen] = useState(false);
  const selected = options?.find((opt) => String(opt.id) === String(value));

  return (
    <div className="space-y-2">
      <Label className="text-foreground font-medium">{label}</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-11"
          >
            {selected ? selected.name : placeholder}
            <ChevronRight className="ml-2 h-4 w-4 rotate-90" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0">
          <Command>
            <CommandInput placeholder={`Search ${label.toLowerCase()}...`} />
            <CommandEmpty>No options found.</CommandEmpty>
            <CommandGroup className="max-h-64 overflow-auto">
              {options?.map((opt) => (
                <CommandItem
                  key={opt.id}
                  value={opt.name}
                  onSelect={() => {
                    onChange(opt.id);
                    setOpen(false);
                  }}
                  className="cursor-pointer"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      String(value) === String(opt.id)
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                  {opt.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

const emptyMedicalCentre = {
  did_the_client_go_to_the_hospital_id: "",
  hospital_name: "",
  address: "",
  tel: "",
  fax: "",
  email: "",
  from_date: "",
  to_date: "",
  date: "",
  notes: "",
};

const emptyMedicalClinic = {
  clinic_name: "",
  dr_name: "",
  address: "",
  tel: "",
  fax: "",
  email: "",
  from_date: "",
  to_date: "",
  notes: "",
};

export default function MedicalCentrePage() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const {
    data: metaResponse,
    isLoading: loadingMeta,
    isError: metaError,
    error: metaErrObj,
  } = useQuery({
    queryKey: ["medicalCentreMeta"],
    queryFn: getABMeta,
    staleTime: 300000,
  });

  const meta = metaResponse?.response || metaResponse || {};

  const { data: medicalData, isLoading: loadingMedicalData } = useQuery({
    queryKey: ["medicalCentreData", slug],
    queryFn: () => fetchMedicalCentreBySlug(slug),
    enabled: !!slug,
  });

  const mutation = useMutation({
    mutationFn: (data) => createMedicalCentre({ slug, data }),
    onSuccess: () => {
      toast.success("Medical records saved successfully!");
      // navigate("/dashboard/workstation");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to save medical data");
    },
  });

  const [medicalCentres, setMedicalCentres] = useState([
    { ...emptyMedicalCentre },
  ]);
  const [medicalClinics, setMedicalClinics] = useState([
    { ...emptyMedicalClinic },
  ]);

  useEffect(() => {
    if (medicalData) {
      if (
        medicalData.medical_centres &&
        medicalData.medical_centres.length > 0
      ) {
        setMedicalCentres(
          medicalData.medical_centres.map((rec) => ({
            did_the_client_go_to_the_hospital_id:
              rec.did_the_client_go_to_the_hospital_id || "",
            hospital_name: rec.hospital_name || "",
            address: rec.address || "",
            tel: rec.tel || "",
            fax: rec.fax || "",
            email: rec.email || "",
            from_date: rec.from_date ? rec.from_date.split("T")[0] : "",
            to_date: rec.to_date ? rec.to_date.split("T")[0] : "",
            date: rec.date ? rec.date.split("T")[0] : "",
            notes: rec.notes || "",
          }))
        );
      }

      if (
        medicalData.medical_clinics &&
        medicalData.medical_clinics.length > 0
      ) {
        setMedicalClinics(
          medicalData.medical_clinics.map((rec) => ({
            clinic_name: rec.clinic_name || "",
            dr_name: rec.dr_name || "",
            address: rec.address || "",
            tel: rec.tel || "",
            fax: rec.fax || "",
            email: rec.email || "",
            from_date: rec.from_date ? rec.from_date.split("T")[0] : "",
            to_date: rec.to_date ? rec.to_date.split("T")[0] : "",
            notes: rec.notes || "",
          }))
        );
      }
    }
  }, [medicalData]);

  const addMedicalCentre = () => {
    setMedicalCentres((prev) => [...prev, { ...emptyMedicalCentre }]);
  };

  const addMedicalClinic = () => {
    setMedicalClinics((prev) => [...prev, { ...emptyMedicalClinic }]);
  };

  const updateCentreField = (idx, key, value) => {
    setMedicalCentres((prev) =>
      prev.map((rec, i) => (i === idx ? { ...rec, [key]: value } : rec))
    );
  };

  const updateClinicField = (idx, key, value) => {
    setMedicalClinics((prev) =>
      prev.map((rec, i) => (i === idx ? { ...rec, [key]: value } : rec))
    );
  };

  const removeMedicalCentre = (idx) => {
    if (medicalCentres.length === 1) return;
    setMedicalCentres((prev) => prev.filter((_, i) => i !== idx));
  };

  const removeMedicalClinic = (idx) => {
    if (medicalClinics.length === 1) return;
    setMedicalClinics((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate({
      medical_centres: medicalCentres,
      medical_clinics: medicalClinics,
    });
  };

  if (loadingMeta || loadingMedicalData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading...</span>
      </div>
    );
  }

  if (metaError) {
    return (
      <div className="text-red-600">
        Failed to load metadata: {metaErrObj?.message || "Unknown error"}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted">
      <Navbar2 />

      {/* Financial Summary Header */}
      <header className="bg-card border-b px-6 py-3">
        <div className="flex items-center justify-end gap-6 text-sm text-foreground">
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

      {/* Breadcrumb Navigation */}
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
          <span className="text-foreground font-medium">Medical Centre</span>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-6xl">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-foreground">
          Medical Centre & Clinic
        </h1>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Medical Centre Section */}
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-foreground">
                Medical Centre
              </h2>
              <Button
                onClick={addMedicalCentre}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                type="button"
              >
                <Plus className="w-4 h-4" /> Add Medical Centre
              </Button>
            </div>

            {medicalCentres.map((centre, idx) => (
              <div
                key={idx}
                className="relative bg-card rounded-lg shadow-sm border p-6 space-y-6"
              >
                {medicalCentres.length > 1 && (
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-4 right-4"
                    onClick={() => removeMedicalCentre(idx)}
                    type="button"
                  >
                    <Trash2 className="w-5 h-5" />
                  </Button>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  <SearchableSelect
                    label="Did the client go to the Hospital"
                    options={meta.yes_no_option || []}
                    value={centre.did_the_client_go_to_the_hospital_id}
                    onChange={(val) =>
                      updateCentreField(
                        idx,
                        "did_the_client_go_to_the_hospital_id",
                        val
                      )
                    }
                    placeholder="Select option"
                  />

                  <div className="space-y-2">
                    <Label className="text-foreground font-medium">
                      Hospital Name
                    </Label>
                    <Input
                      value={centre.hospital_name}
                      onChange={(e) =>
                        updateCentreField(idx, "hospital_name", e.target.value)
                      }
                      placeholder="Hospital Name"
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-foreground font-medium">Address</Label>
                    <Input
                      value={centre.address}
                      onChange={(e) =>
                        updateCentreField(idx, "address", e.target.value)
                      }
                      placeholder="Address"
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-foreground font-medium">Tel</Label>
                    <Input
                      value={centre.tel}
                      onChange={(e) =>
                        updateCentreField(idx, "tel", e.target.value)
                      }
                      placeholder="(123) 454-3454"
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-foreground font-medium">Fax</Label>
                    <Input
                      value={centre.fax}
                      onChange={(e) =>
                        updateCentreField(idx, "fax", e.target.value)
                      }
                      placeholder="153-458-5682"
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-foreground font-medium">Email</Label>
                    <Input
                      type="email"
                      value={centre.email}
                      onChange={(e) =>
                        updateCentreField(idx, "email", e.target.value)
                      }
                      placeholder="info@ratetrade.ca"
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-foreground font-medium">From</Label>
                    <Input
                      type="date"
                      value={centre.from_date}
                      onChange={(e) =>
                        updateCentreField(idx, "from_date", e.target.value)
                      }
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-foreground font-medium">To</Label>
                    <Input
                      type="date"
                      value={centre.to_date}
                      onChange={(e) =>
                        updateCentreField(idx, "to_date", e.target.value)
                      }
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-foreground font-medium">Date</Label>
                    <Input
                      type="date"
                      value={centre.date}
                      onChange={(e) =>
                        updateCentreField(idx, "date", e.target.value)
                      }
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2 lg:col-span-3">
                    <Label className="text-foreground font-medium">Notes</Label>
                    <Textarea
                      value={centre.notes}
                      onChange={(e) =>
                        updateCentreField(idx, "notes", e.target.value)
                      }
                      placeholder="Looking for bank mortgage rates in"
                      rows={3}
                      className="resize-none"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Medical Clinic Section */}
          <div className="space-y-6 pt-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-foreground">
                Medical Clinic
              </h2>
              <Button
                onClick={addMedicalClinic}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                type="button"
              >
                <Plus className="w-4 h-4" /> Add Medical Clinic
              </Button>
            </div>

            {medicalClinics.map((clinic, idx) => (
              <div
                key={idx}
                className="relative bg-card rounded-lg shadow-sm border p-6 space-y-6"
              >
                {medicalClinics.length > 1 && (
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-4 right-4"
                    onClick={() => removeMedicalClinic(idx)}
                    type="button"
                  >
                    <Trash2 className="w-5 h-5" />
                  </Button>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <Label className="text-foreground font-medium">
                      Clinic Name
                    </Label>
                    <Input
                      value={clinic.clinic_name}
                      onChange={(e) =>
                        updateClinicField(idx, "clinic_name", e.target.value)
                      }
                      placeholder="Clinic Name"
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-foreground font-medium">
                      Dr. Name
                    </Label>
                    <Input
                      value={clinic.dr_name}
                      onChange={(e) =>
                        updateClinicField(idx, "dr_name", e.target.value)
                      }
                      placeholder="Dr. Name"
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-foreground font-medium">Address</Label>
                    <Input
                      value={clinic.address}
                      onChange={(e) =>
                        updateClinicField(idx, "address", e.target.value)
                      }
                      placeholder="Address"
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-foreground font-medium">Tel</Label>
                    <Input
                      value={clinic.tel}
                      onChange={(e) =>
                        updateClinicField(idx, "tel", e.target.value)
                      }
                      placeholder="(234) 567-6543"
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-foreground font-medium">Fax</Label>
                    <Input
                      value={clinic.fax}
                      onChange={(e) =>
                        updateClinicField(idx, "fax", e.target.value)
                      }
                      placeholder="Fax"
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-foreground font-medium">Email</Label>
                    <Input
                      type="email"
                      value={clinic.email}
                      onChange={(e) =>
                        updateClinicField(idx, "email", e.target.value)
                      }
                      placeholder="info@ratetrade.ca"
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-foreground font-medium">From</Label>
                    <Input
                      type="date"
                      value={clinic.from_date}
                      onChange={(e) =>
                        updateClinicField(idx, "from_date", e.target.value)
                      }
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-foreground font-medium">To</Label>
                    <Input
                      type="date"
                      value={clinic.to_date}
                      onChange={(e) =>
                        updateClinicField(idx, "to_date", e.target.value)
                      }
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2 lg:col-span-4">
                    <Label className="text-foreground font-medium">Notes</Label>
                    <Textarea
                      value={clinic.notes}
                      onChange={(e) =>
                        updateClinicField(idx, "notes", e.target.value)
                      }
                      placeholder="Looking for bank mortgage rates in"
                      rows={3}
                      className="resize-none"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t">
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              type="button"
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={mutation.isLoading}
              className="w-full sm:w-auto"
            >
              {mutation.isLoading ? "Saving..." : "Save All Records"}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
