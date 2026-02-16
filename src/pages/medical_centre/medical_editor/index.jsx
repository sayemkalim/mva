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
import { Loader2, ChevronRight, Check, Plus, Minus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { getABMeta } from "../helpers/fetchABMeta";
import { createMedicalCentre } from "../helpers/createMedicalCentre";
import { fetchMedicalCentreBySlug } from "../helpers/fetchMedicalCentreBySlug";
import { Navbar2 } from "@/components/navbar2";
import Billing from "@/components/billing";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatPhoneNumber } from "@/lib/utils";

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
                    const newVal = String(value) === String(opt.id) ? "" : opt.id;
                    onChange(newVal);
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
    onSuccess: (data) => {
      const resp = data?.response || data;
      if (resp?.Apistatus === false) {
        toast.error(resp?.message || "Validation failed");
        return;
      }
      toast.success(resp?.message || "Medical records saved successfully!");
    },
    onError: (error) => {
      console.error("Mutation Error:", error);
      const errorData = error.response?.data;
      if (errorData?.Apistatus === false) {
        toast.error(errorData?.message || "Validation failed");
      } else {
        toast.error(errorData?.message || "Failed to save medical data");
      }
    },
  });

  const [medicalCentres, setMedicalCentres] = useState([
    { ...emptyMedicalCentre },
  ]);
  const [medicalClinics, setMedicalClinics] = useState([
    { ...emptyMedicalClinic },
  ]);
  const [walkInClinics, setWalkInClinics] = useState([
    { ...emptyMedicalClinic },
  ]);
  const [physiotherapies, setPhysiotherapies] = useState([
    { ...emptyMedicalClinic },
  ]);
  const [pharmacies, setPharmacies] = useState([{ ...emptyMedicalClinic }]);
  const [laboratories, setLaboratories] = useState([{ ...emptyMedicalClinic }]);

  const [expandedSections, setExpandedSections] = useState({
    clinics: false,
    walkin: false,
    physio: false,
    pharmacy: false,
    lab: false,
  });

  const [additionalServices, setAdditionalServices] = useState([]);
  const [addPopoverOpen, setAddPopoverOpen] = useState(false);

  /* Debug: Log available service types */
  useEffect(() => {
    if (meta?.service_type) {
      console.log("Available Service Types from Meta:", meta.service_type);
    }
  }, [meta]);

  const getServiceName = (defaultName) => {
    const found = meta.service_type?.find(s =>
      s.name.toLowerCase().trim() === defaultName.toLowerCase().trim() ||
      s.name.toLowerCase().replace(/[^a-z]/g, '') === defaultName.toLowerCase().replace(/[^a-z]/g, '')
    );
    return found ? found.name : defaultName;
  };

  const getServiceId = (names) => {
    const searchNames = Array.isArray(names) ? names : [names];

    for (const name of searchNames) {
      const found = meta.service_type?.find(s =>
        s.name.toLowerCase().trim() === name.toLowerCase().trim() ||
        s.name.toLowerCase().replace(/[^a-z]/g, '') === name.toLowerCase().replace(/[^a-z]/g, '')
      );
      if (found) {
        // console.log(`Found service ID ${found.id} for name: ${name}`);
        return found.id;
      }
    }

    // Debug: Log validation failure
    console.warn(`Could not find service_type_id for any of: ${JSON.stringify(searchNames)}`);
    return null;
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  useEffect(() => {
    if (medicalData) {
      if (medicalData.medical_centre?.length > 0) {
        setMedicalCentres(
          medicalData.medical_centre.map((rec) => ({
            service_type_id: rec.service_type_id,
            did_the_client_go_to_the_hospital_id: rec.did_the_client_go_to_the_hospital_id || "",
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
      if (medicalData.medical_clinic?.length > 0) {
        setMedicalClinics(
          medicalData.medical_clinic.map((rec) => ({
            service_type_id: rec.service_type_id,
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
      if (medicalData.walk_in_clinic?.length > 0) {
        setWalkInClinics(
          medicalData.walk_in_clinic.map((rec) => ({
            service_type_id: rec.service_type_id,
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
      if (medicalData.physiotherapy?.length > 0) {
        setPhysiotherapies(
          medicalData.physiotherapy.map((rec) => ({
            service_type_id: rec.service_type_id,
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
      if (medicalData.pharmacy?.length > 0) {
        setPharmacies(
          medicalData.pharmacy.map((rec) => ({
            service_type_id: rec.service_type_id,
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
      if (medicalData.laboratory?.length > 0) {
        setLaboratories(
          medicalData.laboratory.map((rec) => ({
            service_type_id: rec.service_type_id,
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
      if (medicalData.other_medical_records?.length > 0) {
        setAdditionalServices(
          medicalData.other_medical_records.map((rec) => ({
            clinic_name: rec.clinic_name || "",
            dr_name: rec.dr_name || "",
            address: rec.address || "",
            tel: rec.tel || "",
            fax: rec.fax || "",
            email: rec.email || "",
            from_date: rec.from_date ? rec.from_date.split("T")[0] : "",
            to_date: rec.to_date ? rec.to_date.split("T")[0] : "",
            notes: rec.notes || "",
            service_type_id: rec.service_type_id || getServiceId(rec.service_type_name || rec.service_type || ""),
            service_type_name: rec.service_type_name || rec.service_type || "Other Service",
          }))
        );
      }
    }
  }, [medicalData]);

  const updateLaboratoryField = (idx, key, value) => setLaboratories(prev => prev.map((rec, i) => i === idx ? { ...rec, [key]: (key === "tel" || key === "fax") ? formatPhoneNumber(value) : value } : rec));
  const updateAdditionalServiceField = (idx, key, value) => setAdditionalServices(prev => prev.map((rec, i) => i === idx ? { ...rec, [key]: (key === "tel" || key === "fax") ? formatPhoneNumber(value) : value } : rec));
  const updateCentreField = (idx, key, value) => setMedicalCentres(prev => prev.map((rec, i) => i === idx ? { ...rec, [key]: (key === "tel" || key === "fax") ? formatPhoneNumber(value) : value } : rec));
  const updateClinicField = (idx, key, value) => setMedicalClinics(prev => prev.map((rec, i) => i === idx ? { ...rec, [key]: (key === "tel" || key === "fax") ? formatPhoneNumber(value) : value } : rec));
  const updateWalkInClinicField = (idx, key, value) => setWalkInClinics(prev => prev.map((rec, i) => i === idx ? { ...rec, [key]: (key === "tel" || key === "fax") ? formatPhoneNumber(value) : value } : rec));
  const updatePhysiotherapyField = (idx, key, value) => setPhysiotherapies(prev => prev.map((rec, i) => i === idx ? { ...rec, [key]: (key === "tel" || key === "fax") ? formatPhoneNumber(value) : value } : rec));
  const updatePharmacyField = (idx, key, value) => setPharmacies(prev => prev.map((rec, i) => i === idx ? { ...rec, [key]: (key === "tel" || key === "fax") ? formatPhoneNumber(value) : value } : rec));

  const addAdditionalService = (type) => {
    const isInAdditional = additionalServices.some(s => s.service_type_id === type.id || s.service_type_name === type.name);
    const standardSections = [
      getServiceName("Medical Centre"),
      getServiceName("Medical Clinic"),
      getServiceName("Walk in Clinic"),
      getServiceName("Physiotherapy"),
      getServiceName("Pharmacy"),
      getServiceName("Laboratory")
    ];
    const isStandard = standardSections.some(s => s.toLowerCase() === type.name.toLowerCase());

    if (isInAdditional || isStandard) {
      toast.error(`${type.name} already exists.`);
      setAddPopoverOpen(false);
      return;
    }

    setAdditionalServices(prev => [...prev, {
      ...emptyMedicalClinic,
      service_type_id: type.id,
      service_type_name: type.name,
    }]);
    setAddPopoverOpen(false);
  };

  const removeMedicalCentre = idx => {
    if (medicalCentres.length === 1) return;
    setMedicalCentres(prev => prev.filter((_, i) => i !== idx));
  };
  const removeMedicalClinic = idx => {
    if (medicalClinics.length === 1) return;
    setMedicalClinics(prev => prev.filter((_, i) => i !== idx));
  };
  const removeWalkInClinic = idx => {
    if (walkInClinics.length === 1) return;
    setWalkInClinics(prev => prev.filter((_, i) => i !== idx));
  };
  const removePhysiotherapy = idx => {
    if (physiotherapies.length === 1) return;
    setPhysiotherapies(prev => prev.filter((_, i) => i !== idx));
  };
  const removePharmacy = idx => {
    if (pharmacies.length === 1) return;
    setPharmacies(prev => prev.filter((_, i) => i !== idx));
  };
  const removeLaboratory = idx => {
    if (laboratories.length === 1) return;
    setLaboratories(prev => prev.filter((_, i) => i !== idx));
  };
  const removeAdditionalService = (idx) => {
    setAdditionalServices(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      medical_centres: medicalCentres.map(m => ({ ...m, service_type_id: m.service_type_id || getServiceId(["Medical Centre", "Hospital"]) })),
      medical_clinics: medicalClinics.map(m => ({ ...m, service_type_id: m.service_type_id || getServiceId(["Medical Clinic", "Family Doctor"]) })),
      walk_in_clinics: walkInClinics.map(m => ({ ...m, service_type_id: m.service_type_id || getServiceId("Walk in Clinic") })),
      physiotherapies: physiotherapies.map(m => ({ ...m, service_type_id: m.service_type_id || getServiceId("Physiotherapy") })),
      pharmacies: pharmacies.map(m => ({ ...m, service_type_id: m.service_type_id || getServiceId("Pharmacy") })),
      laboratories: laboratories.map(m => ({ ...m, service_type_id: m.service_type_id || getServiceId("Laboratory") })),
    };

    if (additionalServices.length > 0) {
      payload.other_medical_records = additionalServices.map(m => ({ ...m, service_type_id: m.service_type_id || getServiceId(m.service_type_name) }));
    }

    console.log("Submitting Medical Payload:", payload);
    mutation.mutate(payload);
  };

  if (loadingMeta || loadingMedicalData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted">
      <Navbar2 />
      <Billing />

      <nav className="bg-card border-b px-6 py-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate("/dashboard")} className="hover:text-foreground transition" type="button">Dashboard</button>
          <ChevronRight className="w-4 h-4" />
          <button onClick={() => navigate("/dashboard/workstation")} className="hover:text-foreground transition" type="button">Workstation</button>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground font-medium">Medical Records</span>
        </div>
      </nav>

      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-6xl">
        <h1 className="text-2xl font-bold mb-6 text-foreground">Medical Records</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Medical Centre Section */}
          <div className="bg-card rounded-lg border border-border/50 overflow-hidden">
            <div className="p-4 border-b border-border/50">
              <h2 className="text-xl font-semibold text-foreground">{getServiceName("Medical Centre")}</h2>
            </div>
            <div className="p-6 space-y-6">
              {medicalCentres.map((centre, idx) => (
                <div key={idx} className="relative grid grid-cols-1 lg:grid-cols-4 gap-6">
                  {medicalCentres.length > 1 && (
                    <Button variant="destructive" size="icon" className="absolute -top-2 -right-2 h-8 w-8" onClick={() => removeMedicalCentre(idx)} type="button">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                  <SearchableSelect
                    label="Did the client go to the Hospital"
                    options={meta.yes_no_option || []}
                    value={centre.did_the_client_go_to_the_hospital_id}
                    onChange={(val) => updateCentreField(idx, "did_the_client_go_to_the_hospital_id", val)}
                    placeholder="Select option"
                  />
                  <div className="space-y-2">
                    <Label className="text-foreground font-medium">Hospital Name</Label>
                    <Input value={centre.hospital_name} onChange={(e) => updateCentreField(idx, "hospital_name", e.target.value)} placeholder="Hospital Name" className="h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground font-medium">Address</Label>
                    <Input value={centre.address} onChange={(e) => updateCentreField(idx, "address", e.target.value)} placeholder="Address" className="h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground font-medium">Tel</Label>
                    <Input value={centre.tel} onChange={(e) => updateCentreField(idx, "tel", e.target.value)} placeholder="(123) 454-3454" className="h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground font-medium">Fax</Label>
                    <Input value={centre.fax} onChange={(e) => updateCentreField(idx, "fax", e.target.value)} placeholder="153-458-5682" className="h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground font-medium">Email</Label>
                    <Input type="email" value={centre.email} onChange={(e) => updateCentreField(idx, "email", e.target.value)} placeholder="info@ratetrade.ca" className="h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground font-medium">From</Label>
                    <Input type="date" value={centre.from_date} onChange={(e) => updateCentreField(idx, "from_date", e.target.value)} className="h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground font-medium">To</Label>
                    <Input type="date" value={centre.to_date} onChange={(e) => updateCentreField(idx, "to_date", e.target.value)} className="h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground font-medium">Date</Label>
                    <Input type="date" value={centre.date} onChange={(e) => updateCentreField(idx, "date", e.target.value)} className="h-11" />
                  </div>
                  <div className="space-y-2 lg:col-span-3">
                    <Label className="text-foreground font-medium">Notes</Label>
                    <Textarea value={centre.notes} onChange={(e) => updateCentreField(idx, "notes", e.target.value)} placeholder="Notes" rows={3} className="resize-none" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Medical Clinic Section */}
          <div className="bg-card rounded-lg border border-border/50 overflow-hidden">
            <div className={cn("flex justify-between items-center p-4 cursor-pointer hover:bg-muted/50 transition-colors", expandedSections.clinics && "border-b border-border/50")} onClick={() => toggleSection("clinics")}>
              <h2 className="text-xl font-semibold text-foreground">{getServiceName("Medical Clinic")}</h2>
              <Button variant="ghost" size="sm" type="button" className="h-8 w-8 p-0">
                {expandedSections.clinics ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              </Button>
            </div>
            {expandedSections.clinics && (
              <div className="p-6 space-y-6">
                {medicalClinics.map((clinic, idx) => (
                  <div key={idx} className="relative grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {medicalClinics.length > 1 && (
                      <Button variant="destructive" size="icon" className="absolute -top-2 -right-2 h-8 w-8" onClick={() => removeMedicalClinic(idx)} type="button">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                    <div className="space-y-2">
                      <Label className="text-foreground font-medium">Clinic Name</Label>
                      <Input value={clinic.clinic_name} onChange={(e) => updateClinicField(idx, "clinic_name", e.target.value)} placeholder="Clinic Name" className="h-11" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-foreground font-medium">Dr. Name</Label>
                      <Input value={clinic.dr_name} onChange={(e) => updateClinicField(idx, "dr_name", e.target.value)} placeholder="Dr. Name" className="h-11" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-foreground font-medium">Address</Label>
                      <Input value={clinic.address} onChange={(e) => updateClinicField(idx, "address", e.target.value)} placeholder="Address" className="h-11" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-foreground font-medium">Tel</Label>
                      <Input value={clinic.tel} onChange={(e) => updateClinicField(idx, "tel", e.target.value)} placeholder="(234) 567-6543" className="h-11" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-foreground font-medium">Fax</Label>
                      <Input value={clinic.fax} onChange={(e) => updateClinicField(idx, "fax", e.target.value)} placeholder="Fax" className="h-11" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-foreground font-medium">Email</Label>
                      <Input type="email" value={clinic.email} onChange={(e) => updateClinicField(idx, "email", e.target.value)} placeholder="info@ratetrade.ca" className="h-11" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-foreground font-medium">From</Label>
                      <Input type="date" value={clinic.from_date} onChange={(e) => updateClinicField(idx, "from_date", e.target.value)} className="h-11" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-foreground font-medium">To</Label>
                      <Input type="date" value={clinic.to_date} onChange={(e) => updateClinicField(idx, "to_date", e.target.value)} className="h-11" />
                    </div>
                    <div className="space-y-2 lg:col-span-4">
                      <Label className="text-foreground font-medium">Notes</Label>
                      <Textarea value={clinic.notes} onChange={(e) => updateClinicField(idx, "notes", e.target.value)} placeholder="Notes" rows={3} className="resize-none" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Walk-in Clinic Section */}
          <div className="bg-card rounded-lg border border-border/50 overflow-hidden">
            <div className={cn("flex justify-between items-center p-4 cursor-pointer hover:bg-muted/50 transition-colors", expandedSections.walkin && "border-b border-border/50")} onClick={() => toggleSection("walkin")}>
              <h2 className="text-xl font-semibold text-foreground">{getServiceName("Walk in Clinic")}</h2>
              <Button variant="ghost" size="sm" type="button" className="h-8 w-8 p-0">
                {expandedSections.walkin ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              </Button>
            </div>
            {expandedSections.walkin && (
              <div className="p-6 space-y-6">
                {walkInClinics.map((clinic, idx) => (
                  <div key={idx} className="relative grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {walkInClinics.length > 1 && (
                      <Button variant="destructive" size="icon" className="absolute -top-2 -right-2 h-8 w-8" onClick={() => removeWalkInClinic(idx)} type="button">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                    <div className="space-y-2">
                      <Label className="text-foreground font-medium">Clinic Name</Label>
                      <Input value={clinic.clinic_name} onChange={(e) => updateWalkInClinicField(idx, "clinic_name", e.target.value)} placeholder="Clinic Name" className="h-11" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-foreground font-medium">Dr. Name</Label>
                      <Input value={clinic.dr_name} onChange={(e) => updateWalkInClinicField(idx, "dr_name", e.target.value)} placeholder="Dr. Name" className="h-11" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-foreground font-medium">Address</Label>
                      <Input value={clinic.address} onChange={(e) => updateWalkInClinicField(idx, "address", e.target.value)} placeholder="Address" className="h-11" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-foreground font-medium">Tel</Label>
                      <Input value={clinic.tel} onChange={(e) => updateWalkInClinicField(idx, "tel", e.target.value)} placeholder="(234) 567-6543" className="h-11" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-foreground font-medium">Fax</Label>
                      <Input value={clinic.fax} onChange={(e) => updateWalkInClinicField(idx, "fax", e.target.value)} placeholder="Fax" className="h-11" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-foreground font-medium">Email</Label>
                      <Input type="email" value={clinic.email} onChange={(e) => updateWalkInClinicField(idx, "email", e.target.value)} placeholder="info@ratetrade.ca" className="h-11" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-foreground font-medium">From</Label>
                      <Input type="date" value={clinic.from_date} onChange={(e) => updateWalkInClinicField(idx, "from_date", e.target.value)} className="h-11" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-foreground font-medium">To</Label>
                      <Input type="date" value={clinic.to_date} onChange={(e) => updateWalkInClinicField(idx, "to_date", e.target.value)} className="h-11" />
                    </div>
                    <div className="space-y-2 lg:col-span-4">
                      <Label className="text-foreground font-medium">Notes</Label>
                      <Textarea value={clinic.notes} onChange={(e) => updateWalkInClinicField(idx, "notes", e.target.value)} placeholder="Notes" rows={3} className="resize-none" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Physiotherapy Section */}
          <div className="bg-card rounded-lg border border-border/50 overflow-hidden">
            <div className={cn("flex justify-between items-center p-4 cursor-pointer hover:bg-muted/50 transition-colors", expandedSections.physio && "border-b border-border/50")} onClick={() => toggleSection("physio")}>
              <h2 className="text-xl font-semibold text-foreground">{getServiceName("Physiotherapy")}</h2>
              <Button variant="ghost" size="sm" type="button" className="h-8 w-8 p-0">
                {expandedSections.physio ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              </Button>
            </div>
            {expandedSections.physio && (
              <div className="p-6 space-y-6">
                {physiotherapies.map((clinic, idx) => (
                  <div key={idx} className="relative grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {physiotherapies.length > 1 && (
                      <Button variant="destructive" size="icon" className="absolute -top-2 -right-2 h-8 w-8" onClick={() => removePhysiotherapy(idx)} type="button">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                    <div className="space-y-2">
                      <Label className="text-foreground font-medium">Health Practitioner</Label>
                      <Input value={clinic.clinic_name} onChange={(e) => updatePhysiotherapyField(idx, "clinic_name", e.target.value)} placeholder="Physiotherapy Name" className="h-11" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-foreground font-medium">Name of Facility</Label>
                      <Input value={clinic.dr_name} onChange={(e) => updatePhysiotherapyField(idx, "dr_name", e.target.value)} placeholder="Dr. Name" className="h-11" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-foreground font-medium">Address</Label>
                      <Input value={clinic.address} onChange={(e) => updatePhysiotherapyField(idx, "address", e.target.value)} placeholder="Address" className="h-11" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-foreground font-medium">Tel</Label>
                      <Input value={clinic.tel} onChange={(e) => updatePhysiotherapyField(idx, "tel", e.target.value)} placeholder="(234) 567-6543" className="h-11" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-foreground font-medium">Fax</Label>
                      <Input value={clinic.fax} onChange={(e) => updatePhysiotherapyField(idx, "fax", e.target.value)} placeholder="Fax" className="h-11" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-foreground font-medium">Email</Label>
                      <Input type="email" value={clinic.email} onChange={(e) => updatePhysiotherapyField(idx, "email", e.target.value)} placeholder="info@ratetrade.ca" className="h-11" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-foreground font-medium">From</Label>
                      <Input type="date" value={clinic.from_date} onChange={(e) => updatePhysiotherapyField(idx, "from_date", e.target.value)} className="h-11" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-foreground font-medium">To</Label>
                      <Input type="date" value={clinic.to_date} onChange={(e) => updatePhysiotherapyField(idx, "to_date", e.target.value)} className="h-11" />
                    </div>
                    <div className="space-y-2 lg:col-span-4">
                      <Label className="text-foreground font-medium">Notes</Label>
                      <Textarea value={clinic.notes} onChange={(e) => updatePhysiotherapyField(idx, "notes", e.target.value)} placeholder="Notes" rows={3} className="resize-none" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pharmacy Section */}
          <div className="bg-card rounded-lg border border-border/50 overflow-hidden">
            <div className={cn("flex justify-between items-center p-4 cursor-pointer hover:bg-muted/50 transition-colors", expandedSections.pharmacy && "border-b border-border/50")} onClick={() => toggleSection("pharmacy")}>
              <h2 className="text-xl font-semibold text-foreground">{getServiceName("Pharmacy")}</h2>
              <Button variant="ghost" size="sm" type="button" className="h-8 w-8 p-0">
                {expandedSections.pharmacy ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              </Button>
            </div>
            {expandedSections.pharmacy && (
              <div className="p-6 space-y-6">
                {pharmacies.map((clinic, idx) => (
                  <div key={idx} className="relative grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {pharmacies.length > 1 && (
                      <Button variant="destructive" size="icon" className="absolute -top-2 -right-2 h-8 w-8" onClick={() => removePharmacy(idx)} type="button">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                    <div className="space-y-2">
                      <Label className="text-foreground font-medium"> Name</Label>
                      <Input value={clinic.clinic_name} onChange={(e) => updatePharmacyField(idx, "clinic_name", e.target.value)} placeholder="Pharmacy Name" className="h-11" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-foreground font-medium">Address</Label>
                      <Input value={clinic.address} onChange={(e) => updatePharmacyField(idx, "address", e.target.value)} placeholder="Address" className="h-11" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-foreground font-medium">Tel</Label>
                      <Input value={clinic.tel} onChange={(e) => updatePharmacyField(idx, "tel", e.target.value)} placeholder="(234) 567-6543" className="h-11" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-foreground font-medium">Fax</Label>
                      <Input value={clinic.fax} onChange={(e) => updatePharmacyField(idx, "fax", e.target.value)} placeholder="Fax" className="h-11" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-foreground font-medium">Email</Label>
                      <Input type="email" value={clinic.email} onChange={(e) => updatePharmacyField(idx, "email", e.target.value)} placeholder="info@ratetrade.ca" className="h-11" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-foreground font-medium">From</Label>
                      <Input type="date" value={clinic.from_date} onChange={(e) => updatePharmacyField(idx, "from_date", e.target.value)} className="h-11" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-foreground font-medium">To</Label>
                      <Input type="date" value={clinic.to_date} onChange={(e) => updatePharmacyField(idx, "to_date", e.target.value)} className="h-11" />
                    </div>
                    <div className="space-y-2 lg:col-span-4">
                      <Label className="text-foreground font-medium">Notes</Label>
                      <Textarea value={clinic.notes} onChange={(e) => updatePharmacyField(idx, "notes", e.target.value)} placeholder="Notes" rows={3} className="resize-none" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Laboratory Section */}
          <div className="bg-card rounded-lg border border-border/50 overflow-hidden">
            <div className={cn("flex justify-between items-center p-4 cursor-pointer hover:bg-muted/50 transition-colors", expandedSections.lab && "border-b border-border/50")} onClick={() => toggleSection("lab")}>
              <h2 className="text-xl font-semibold text-foreground">{getServiceName("Laboratory")}</h2>
              <Button variant="ghost" size="sm" type="button" className="h-8 w-8 p-0">
                {expandedSections.lab ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              </Button>
            </div>
            {expandedSections.lab && (
              <div className="p-6 space-y-6">
                {laboratories.map((clinic, idx) => (
                  <div key={idx} className="relative grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {laboratories.length > 1 && (
                      <Button variant="destructive" size="icon" className="absolute -top-2 -right-2 h-8 w-8" onClick={() => removeLaboratory(idx)} type="button">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                    <div className="space-y-2">
                      <Label className="text-foreground font-medium"> Name</Label>
                      <Input value={clinic.clinic_name} onChange={(e) => updateLaboratoryField(idx, "clinic_name", e.target.value)} placeholder="Laboratory Name" className="h-11" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-foreground font-medium">Address</Label>
                      <Input value={clinic.address} onChange={(e) => updateLaboratoryField(idx, "address", e.target.value)} placeholder="Address" className="h-11" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-foreground font-medium">Tel</Label>
                      <Input value={clinic.tel} onChange={(e) => updateLaboratoryField(idx, "tel", e.target.value)} placeholder="(234) 567-6543" className="h-11" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-foreground font-medium">Fax</Label>
                      <Input value={clinic.fax} onChange={(e) => updateLaboratoryField(idx, "fax", e.target.value)} placeholder="Fax" className="h-11" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-foreground font-medium">Email</Label>
                      <Input type="email" value={clinic.email} onChange={(e) => updateLaboratoryField(idx, "email", e.target.value)} placeholder="info@ratetrade.ca" className="h-11" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-foreground font-medium">From</Label>
                      <Input type="date" value={clinic.from_date} onChange={(e) => updateLaboratoryField(idx, "from_date", e.target.value)} className="h-11" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-foreground font-medium">To</Label>
                      <Input type="date" value={clinic.to_date} onChange={(e) => updateLaboratoryField(idx, "to_date", e.target.value)} className="h-11" />
                    </div>
                    <div className="space-y-2 lg:col-span-4">
                      <Label className="text-foreground font-medium">Notes</Label>
                      <Textarea value={clinic.notes} onChange={(e) => updateLaboratoryField(idx, "notes", e.target.value)} placeholder="Notes" rows={3} className="resize-none" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Dynamic Additional Services */}
          {additionalServices.map((service, idx) => (
            <div key={idx} className="bg-card rounded-lg border border-border/50 overflow-hidden">
              <div className="flex justify-between items-center p-4 border-b border-border/50">
                <h2 className="text-xl font-semibold text-foreground">{service.service_type_name}</h2>
                <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => removeAdditionalService(idx)} type="button">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <Label className="text-foreground font-medium">Name</Label>
                    <Input value={service.clinic_name} onChange={(e) => updateAdditionalServiceField(idx, "clinic_name", e.target.value)} placeholder="Name" className="h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground font-medium">Address</Label>
                    <Input value={service.address} onChange={(e) => updateAdditionalServiceField(idx, "address", e.target.value)} placeholder="Address" className="h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground font-medium">Tel</Label>
                    <Input value={service.tel} onChange={(e) => updateAdditionalServiceField(idx, "tel", e.target.value)} placeholder="Telephone" className="h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground font-medium">Fax</Label>
                    <Input value={service.fax} onChange={(e) => updateAdditionalServiceField(idx, "fax", e.target.value)} placeholder="Fax" className="h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground font-medium">Email</Label>
                    <Input type="email" value={service.email} onChange={(e) => updateAdditionalServiceField(idx, "email", e.target.value)} placeholder="email@example.com" className="h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground font-medium">From</Label>
                    <Input type="date" value={service.from_date} onChange={(e) => updateAdditionalServiceField(idx, "from_date", e.target.value)} className="h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground font-medium">To</Label>
                    <Input type="date" value={service.to_date} onChange={(e) => updateAdditionalServiceField(idx, "to_date", e.target.value)} className="h-11" />
                  </div>
                  <div className="space-y-2 lg:col-span-4">
                    <Label className="text-foreground font-medium">Notes</Label>
                    <Textarea value={service.notes} onChange={(e) => updateAdditionalServiceField(idx, "notes", e.target.value)} placeholder="Notes" rows={3} className="resize-none" />
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div className="flex flex-col sm:flex-row justify-between gap-3 pt-6 border-t border-border/50">
            <Popover open={addPopoverOpen} onOpenChange={setAddPopoverOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto h-11 border-dashed border-2 hover:border-primary hover:text-primary bg-background/50">
                  <Plus className="w-4 h-4 mr-2" /> Add
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[300px] p-0">
                <Command>
                  <CommandInput placeholder="Search service type..." />
                  <CommandEmpty>No options found.</CommandEmpty>
                  <CommandGroup className="max-h-64 overflow-auto">
                    {meta.service_type?.map((type) => (
                      <CommandItem
                        key={type.id}
                        value={type.name}
                        onSelect={() => addAdditionalService(type)}
                        className="cursor-pointer"
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4 opacity-0"
                          )}
                        />
                        {type.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => navigate(-1)} type="button" className="w-full sm:w-auto h-11">Cancel</Button>
              <Button type="submit" disabled={mutation.isLoading} className="w-full sm:w-auto h-11 px-8">
                {mutation.isLoading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</>
                ) : ("Save All Records")}
              </Button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
