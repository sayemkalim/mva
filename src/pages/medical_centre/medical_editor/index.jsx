import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiService } from "@/api/api_service/apiService";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { FloatingInput, FloatingTextarea, FloatingWrapper } from "@/components/ui/floating-label";

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const SearchableSelect = ({ label, options, value, onChange, placeholder }) => {
  const [open, setOpen] = useState(false);
  const selected = options?.find((opt) => String(opt.id) === String(value));

  return (
    <FloatingWrapper label={label} hasValue={!!selected} isFocused={open}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between font-normal h-[52px] bg-transparent border border-input"
          >
            {selected ? selected.name : ""}
            <ChevronRight className="ml-auto h-4 w-4 shrink-0 rotate-90" />
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
    </FloatingWrapper>
  );
};

const emptyRecord = {
  did_the_client_go_to_the_hospital_id: "",
  hospital_name: "",
  clinic_name: "",
  dr_name: "",
  address: "",
  tel: "",
  fax: "",
  email: "",
  from_date: "",
  to_date: "",
  date: "",
  notes: "",
  service_type_id: "",
};

const categoryConfig = {
  hospital: {
    title: "Hospital",
    isHospital: true,
  },
  "family_physician_(gp)": {
    title: "Family Physician (GP)",
    fields: [
      { id: "clinic_name", label: "Clinic Name" },
      { id: "dr_name", label: "Dr. Name" },
      { id: "address", label: "Address" },
      { id: "tel", label: "Tel" },
      { id: "fax", label: "Fax" },
      { id: "email", label: "Email", type: "email" },
      { id: "from_date", label: "From", type: "date" },
      { id: "to_date", label: "To", type: "date" },
      { id: "notes", label: "Notes", type: "textarea", colSpan: 4 },
    ],
  },
  walk_in_clinic: {
    title: "Walk in Clinic",
    fields: [
      { id: "clinic_name", label: "Clinic Name" },
      { id: "dr_name", label: "Dr. Name" },
      { id: "address", label: "Address" },
      { id: "tel", label: "Tel" },
      { id: "fax", label: "Fax" },
      { id: "email", label: "Email", type: "email" },
      { id: "from_date", label: "From", type: "date" },
      { id: "to_date", label: "To", type: "date" },
      { id: "notes", label: "Notes", type: "textarea", colSpan: 4 },
    ],
  },
  physiotherapy: {
    title: "Physiotherapy",
    fields: [
      { id: "clinic_name", label: "Health Practitioner" },
      { id: "dr_name", label: "Name of Facility" },
      { id: "address", label: "Address" },
      { id: "tel", label: "Tel" },
      { id: "fax", label: "Fax" },
      { id: "email", label: "Email", type: "email" },
      { id: "from_date", label: "From", type: "date" },
      { id: "to_date", label: "To", type: "date" },
      { id: "notes", label: "Notes", type: "textarea", colSpan: 4 },
    ],
  },
  pharmacy: {
    title: "Pharmacy",
    fields: [
      { id: "clinic_name", label: "Name" },
      { id: "address", label: "Address" },
      { id: "tel", label: "Tel" },
      { id: "fax", label: "Fax" },
      { id: "email", label: "Email", type: "email" },
      { id: "from_date", label: "From", type: "date" },
      { id: "to_date", label: "To", type: "date" },
      { id: "notes", label: "Notes", type: "textarea", colSpan: 4 },
    ],
  },
  laboratory: {
    title: "Laboratory",
    fields: [
      { id: "clinic_name", label: "Name" },
      { id: "address", label: "Address" },
      { id: "tel", label: "Tel" },
      { id: "fax", label: "Fax" },
      { id: "email", label: "Email", type: "email" },
      { id: "from_date", label: "From", type: "date" },
      { id: "to_date", label: "To", type: "date" },
      { id: "notes", label: "Notes", type: "textarea", colSpan: 4 },
    ],
  },
};

const getDefaultFields = () => [
  { id: "clinic_name", label: "Name" },
  { id: "address", label: "Address" },
  { id: "tel", label: "Tel" },
  { id: "fax", label: "Fax" },
  { id: "email", label: "Email", type: "email" },
  { id: "from_date", label: "From", type: "date" },
  { id: "to_date", label: "To", type: "date" },
  { id: "notes", label: "Notes", type: "textarea", colSpan: 4 },
];

export default function MedicalCentrePage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchVal, setSearchVal] = useState("");

  const {
    data: metaResponse,
    isLoading: loadingMeta,
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

  const createTrackingMedicalCentreMutation = useMutation({
    mutationFn: async (name) => {
      const response = await apiService({
        endpoint: "api/v2/setup/master/store/tracking-medical-centre",
        method: "POST",
        data: { name },
        headers: { "Content-Type": "application/json" },
      });
      return response;
    },
    onSuccess: (data) => {
      const resp = data?.response || data;
      if (resp?.Apistatus === false) {
        toast.error(resp?.message || "Failed to create medical centre");
      } else {
        toast.success(resp?.message || "Medical centre created successfully");
        queryClient.invalidateQueries({ queryKey: ["medicalCentreMeta"] });
        setSearchVal("");
      }
    },
    onError: (error) => {
      console.error(error);
      toast.error("Error creating new medical centre");
    }
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

  const deleteServiceTypeMutation = useMutation({
    mutationFn: async (id) => {
      const response = await apiService({
        endpoint: `api/v2/setup/master/delete/${id}`,
        method: "DELETE",
      });
      return response;
    },
    onSuccess: (data) => {
      const resp = data?.response || data;
      if (resp?.Apistatus === false) {
        toast.error(resp?.message || "Failed to delete service type");
      } else {
        toast.success(resp?.message || "Service type deleted successfully");
        queryClient.invalidateQueries({ queryKey: ["medicalCentreMeta"] });
      }
    },
    onError: (error) => {
      console.error(error);
      toast.error("Error deleting service type");
    }
  });

  const [servicesData, setServicesData] = useState({});
  const [expandedSections, setExpandedSections] = useState({ hospital: true });
  const [addPopoverOpen, setAddPopoverOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null, name: "" });

  useEffect(() => {
    if (medicalData) {
      const parsed = {};
      Object.keys(medicalData).forEach(key => {
        if (Array.isArray(medicalData[key])) {
          parsed[key] = medicalData[key].map(rec => ({
            ...emptyRecord,
            ...rec,
            did_the_client_go_to_the_hospital_id: rec.did_the_client_go_to_the_hospital_id || "",
            hospital_name: rec.hospital_name || "",
            clinic_name: rec.clinic_name || "",
            dr_name: rec.dr_name || "",
            address: rec.address || "",
            tel: rec.tel || "",
            fax: rec.fax || "",
            email: rec.email || "",
            from_date: rec.from_date ? String(rec.from_date).split("T")[0] : "",
            to_date: rec.to_date ? String(rec.to_date).split("T")[0] : "",
            date: rec.date ? String(rec.date).split("T")[0] : "",
            notes: rec.notes || "",
            service_type_id: rec.service_type_id || ""
          }));
        }
      });
      setServicesData(parsed);
    }
  }, [medicalData]);

  const toggleSection = (key) => setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));

  const updateField = (category, idx, fieldId, value) => {
    setServicesData(prev => ({
      ...prev,
      [category]: prev[category].map((rec, i) => i === idx ? {
        ...rec,
        [fieldId]: (fieldId === "tel" || fieldId === "fax") ? formatPhoneNumber(value) : value
      } : rec)
    }));
  };

  const addAdditionalService = (type) => {
    const key = type.name.toLowerCase().replace(/ /g, '_');

    if (servicesData[key]) {
      toast.error(`${type.name} already exists.`);
      setAddPopoverOpen(false);
      return;
    }

    setServicesData(prev => ({
      ...prev,
      [key]: [{ ...emptyRecord, service_type_id: type.id }]
    }));

    setExpandedSections(prev => ({ ...prev, [key]: true }));
    setAddPopoverOpen(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submitting Medical Payload:", servicesData);
    mutation.mutate(servicesData);
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

          {Object.entries(servicesData).map(([key, records]) => {
            const config = categoryConfig[key];
            const title = config?.title || key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
            const isExpanded = expandedSections[key] ?? false;

            return (
              <div key={key} className="bg-card rounded-lg border border-border/50 overflow-hidden">
                <div
                  className={cn("flex justify-between items-center p-4 cursor-pointer hover:bg-muted/50 transition-colors", isExpanded && "border-b border-border/50")}
                  onClick={() => toggleSection(key)}
                >
                  <h2 className="text-xl font-semibold text-foreground">{title}</h2>
                  <Button variant="ghost" size="sm" type="button" className="h-8 w-8 p-0">
                    {isExpanded ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </Button>
                </div>

                {isExpanded && (
                  <div className="p-6 space-y-6">
                    {records.map((rec, idx) => (
                      <div key={idx} className="relative grid grid-cols-1 lg:grid-cols-4 gap-6">
                        {config?.isHospital ? (
                          <>
                            <SearchableSelect
                              label="Did the client go to the Hospital"
                              options={meta.yes_no_option || []}
                              value={rec.did_the_client_go_to_the_hospital_id}
                              onChange={(val) => updateField(key, idx, "did_the_client_go_to_the_hospital_id", val)}
                              placeholder="Select option"
                            />
                            {meta.yes_no_option?.find((opt) => String(opt.id) === String(rec.did_the_client_go_to_the_hospital_id))?.name?.toLowerCase() === "yes" && (
                              <>
                                <FloatingInput label="Hospital Name" value={rec.hospital_name} onChange={(e) => updateField(key, idx, "hospital_name", e.target.value)} />
                                <FloatingInput label="Address" value={rec.address} onChange={(e) => updateField(key, idx, "address", e.target.value)} />
                                <FloatingInput label="Tel" value={rec.tel} onChange={(e) => updateField(key, idx, "tel", e.target.value)} />
                                <FloatingInput label="Fax" value={rec.fax} onChange={(e) => updateField(key, idx, "fax", e.target.value)} />
                                <FloatingInput label="Email" type="email" value={rec.email} onChange={(e) => updateField(key, idx, "email", e.target.value)} />
                                <FloatingInput label="From" type="date" value={rec.from_date} onChange={(e) => updateField(key, idx, "from_date", e.target.value)} />
                                <FloatingInput label="To" type="date" value={rec.to_date} onChange={(e) => updateField(key, idx, "to_date", e.target.value)} />
                                <FloatingInput label="Date" type="date" value={rec.date} onChange={(e) => updateField(key, idx, "date", e.target.value)} />
                                <div className="lg:col-span-3">
                                  <FloatingTextarea label="Notes" value={rec.notes} onChange={(e) => updateField(key, idx, "notes", e.target.value)} rows={3} className="resize-none" />
                                </div>
                              </>
                            )}
                          </>
                        ) : (
                          (config?.fields || getDefaultFields()).map(field => (
                            <div key={field.id} className={cn(field.colSpan && `lg:col-span-${field.colSpan}`)}>
                              {field.type === "textarea" ? (
                                <FloatingTextarea label={field.label} value={rec[field.id] || ""} onChange={(e) => updateField(key, idx, field.id, e.target.value)} rows={3} className="resize-none" />
                              ) : (
                                <FloatingInput label={field.label} type={field.type || "text"} value={rec[field.id] || ""} onChange={(e) => updateField(key, idx, field.id, e.target.value)} />
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          <div className="flex flex-col sm:flex-row justify-between gap-3 pt-6 border-t border-border/50">
            <Popover open={addPopoverOpen} onOpenChange={setAddPopoverOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto h-11 border-dashed border-2 hover:border-primary hover:text-primary bg-background/50">
                  <Plus className="w-4 h-4 mr-2" /> Add Additional Service
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[300px] p-0">
                <Command>
                  <CommandInput
                    placeholder="Search service type..."
                    value={searchVal}
                    onValueChange={setSearchVal}
                  />
                  <CommandEmpty>
                    <div className="p-4 flex flex-col items-center justify-center space-y-3">
                      <p className="text-sm text-muted-foreground">No options found.</p>
                      {searchVal && (
                        <div className="w-full">
                          <Button
                            type="button"
                            variant="default"
                            size="sm"
                            className="w-full"
                            disabled={createTrackingMedicalCentreMutation.isLoading}
                            onClick={() => createTrackingMedicalCentreMutation.mutate(searchVal)}
                          >
                            {createTrackingMedicalCentreMutation.isLoading ? "Creating..." : `Create "${searchVal}"`}
                          </Button>
                        </div>
                      )}
                    </div>
                  </CommandEmpty>
                  <CommandGroup className="max-h-64 overflow-auto">
                    {meta.service_type?.map((type) => (
                      <CommandItem
                        key={type.id}
                        value={type.name}
                        onSelect={() => addAdditionalService(type)}
                        className="cursor-pointer flex items-center justify-between group h-10"
                      >
                        <div className="flex items-center">
                          <Check className="mr-2 h-4 w-4 opacity-0" />
                          {type.name}
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive transition-all"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteConfirm({ open: true, id: type.id, name: type.name });
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>

            <AlertDialog
              open={deleteConfirm.open}
              onOpenChange={(open) => setDeleteConfirm(prev => ({ ...prev, open }))}
            >
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete the service type "{deleteConfirm.name}" from the system.
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    variant="destructive"
                    onClick={() => {
                      deleteServiceTypeMutation.mutate(deleteConfirm.id);
                      setDeleteConfirm({ open: false, id: null, name: "" });
                    }}
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

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
