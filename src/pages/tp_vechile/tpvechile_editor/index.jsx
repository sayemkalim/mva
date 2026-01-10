import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";

import { ChevronRight, Loader2, Check, ChevronsUpDown } from "lucide-react";
import { toast } from "sonner";
import { Navbar2 } from "@/components/navbar2";
import { getABMeta } from "../helpers/fetchABMeta";
import { createTpVechile } from "../helpers/createTpVechile";
import { fetchTpVechileBySlug } from "../helpers/fetchTpVechileBySlug";
import Billing from "@/components/billing";

// Reusable Searchable Dropdown
function SearchableDropdown({
  label = "",
  placeholder = "Select...",
  options = [],
  value,
  onChange,
}) {
  const [open, setOpen] = useState(false);

  const selected =
    (options || []).find((o) => String(o.id) === String(value)) || null;

  return (
    <div className="space-y-2">
      {label && <label className="text-foreground font-medium">{label}</label>}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            type="button"
            className="justify-between w-full"
          >
            {selected ? selected.name : placeholder}
            <ChevronsUpDown className="w-4 h-4 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-[300px] p-0">
          <Command>
            <CommandInput placeholder="Search..." />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup>
                {(options || []).map((option) => (
                  <CommandItem
                    key={option.id}
                    value={option.name}
                    onSelect={() => {
                      onChange(option.id);
                      setOpen(false);
                    }}
                    className="cursor-pointer"
                  >
                    <Check
                      className={`mr-2 w-5 h-5 ${
                        String(option.id) === String(value)
                          ? "opacity-100"
                          : "opacity-0"
                      }`}
                    />
                    {option.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

// Empty template
const emptyVehicle = {
  plate_no: "",
  province: "",
  vehicle_year: "",
  vehicle_make: "",
  vehicle_model: "",
  vehicle_color: "",
  name: "",
  driver_licence_state: "",
  driver_licence_number: "",
  driver_licence_expiry_date: "",
  plate_search_id: "",
  plate_searched_date: "",
};

export default function VehicleInfoForm() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyVehicle);
  const {
    data: metaRaw,
    isLoading: loadingMeta,
    error: metaError,
  } = useQuery({
    queryKey: ["abMeta"],
    queryFn: getABMeta,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  const metadata = metaRaw?.response ?? metaRaw?.data ?? metaRaw ?? {};
  const yesNoOptions = metadata?.yes_no_option || [];

  const {
    data: vehicleData,
    isLoading: loadingVehicle,
    error: vehicleError,
  } = useQuery({
    queryKey: ["tpVehicle", slug],
    queryFn: () => fetchTpVechileBySlug(slug),
    enabled: !!slug,
  });

  useEffect(() => {
    if (vehicleData) {
      setForm((prev) => ({
        ...prev,
        plate_no: vehicleData.plate_no ?? "",
        province: vehicleData.province ?? "",
        vehicle_year: vehicleData.vehicle_year ?? "",
        vehicle_make: vehicleData.vehicle_make ?? "",
        vehicle_model: vehicleData.vehicle_model ?? "",
        vehicle_color: vehicleData.vehicle_color ?? "",
        name: vehicleData.name ?? "",
        driver_licence_state: vehicleData.driver_licence_state ?? "",
        driver_licence_number: vehicleData.driver_licence_number ?? "",
        driver_licence_expiry_date:
          vehicleData.driver_licence_expiry_date ?? "",
        plate_search_id: vehicleData.plate_search_id ?? "",
        plate_searched_date: vehicleData.plate_searched_date ?? "",
      }));
    } else {
      setForm(emptyVehicle);
    }
  }, [vehicleData]);
  const updateField = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const createVehicleMutation = useMutation({
    mutationFn: (payload) => createTpVechile({ slug, data: payload }),
    onSuccess: (response) => {
      toast.success("Vehicle information saved successfully!");
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to save vehicle information");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = { ...form };
    createVehicleMutation.mutate(payload);
  };

  const selectedPlateSearch = yesNoOptions.find(
    (o) => String(o.id) === String(form.plate_search_id)
  );

  const plateSearchDateLabel =
    selectedPlateSearch?.name === "No"
      ? "Projected Search Date"
      : "Plate Searched Date";

  if (loadingMeta || loadingVehicle) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading vehicle information...</span>
      </div>
    );
  }

  if (metaError || vehicleError) {
    return (
      <div className="text-red-600 p-4">
        {metaError && <div>Error loading metadata: {metaError.message}</div>}
        {vehicleError && (
          <div>Error loading vehicle info: {vehicleError.message}</div>
        )}
      </div>
    );
  }

  // Form UI
  return (
    <div className="min-h-screen bg-muted">
      <Navbar2 />
      <Billing/>
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
          <span className="text-foreground font-medium">Vehicle Information</span>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-7xl">
        <div className="bg-card rounded-lg shadow-sm border p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            <h2 className="text-3xl font-extrabold text-foreground mb-4">
              Vehicle Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label>Plate Number</Label>
                <Input
                  value={form.plate_no}
                  onChange={(e) => updateField("plate_no", e.target.value)}
                  className="h-9 bg-card border-input"
                />
              </div>

              <div className="space-y-2">
                <Label>Province</Label>
                <Input
                  value={form.province}
                  onChange={(e) => updateField("province", e.target.value)}
                  className="h-9 bg-card border-input"
                />
              </div>

              <div className="space-y-2">
                <Label>Vehicle Year</Label>
                <Input
                  value={form.vehicle_year}
                  onChange={(e) => updateField("vehicle_year", e.target.value)}
                  className="h-9 bg-card border-input"
                />
              </div>

              <div className="space-y-2">
                <Label>Vehicle Make</Label>
                <Input
                  value={form.vehicle_make}
                  onChange={(e) => updateField("vehicle_make", e.target.value)}
                  className="h-9 bg-card border-input"
                />
              </div>

              <div className="space-y-2">
                <Label>Vehicle Model</Label>
                <Input
                  value={form.vehicle_model}
                  onChange={(e) => updateField("vehicle_model", e.target.value)}
                  className="h-9 bg-card border-input"
                />
              </div>

              <div className="space-y-2">
                <Label>Vehicle Color</Label>
                <Input
                  value={form.vehicle_color}
                  onChange={(e) => updateField("vehicle_color", e.target.value)}
                  className="h-9 bg-card border-input"
                />
              </div>

              <div className="space-y-2">
                <Label>Vehicle Name</Label>
                <Input
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  className="h-9 bg-card border-input"
                />
              </div>

              <div className="space-y-2">
                <Label>Driver Licence State</Label>
                <Input
                  value={form.driver_licence_state}
                  onChange={(e) =>
                    updateField("driver_licence_state", e.target.value)
                  }
                  className="h-9 bg-card border-input"
                />
              </div>

              <div className="space-y-2">
                <Label>Driver Licence Number</Label>
                <Input
                  value={form.driver_licence_number}
                  onChange={(e) =>
                    updateField("driver_licence_number", e.target.value)
                  }
                  className="h-9 bg-card border-input"
                />
              </div>

              <div className="space-y-2">
                <Label>Licence Expiry Date</Label>
                <Input
                  type="date"
                  value={form.driver_licence_expiry_date || ""}
                  onChange={(e) =>
                    updateField("driver_licence_expiry_date", e.target.value)
                  }
                  className="h-9 bg-card border-input"
                />
              </div>

              <SearchableDropdown
                label="Plate Searched?"
                placeholder="Select Yes or No"
                options={yesNoOptions}
                value={form.plate_search_id}
                onChange={(val) => updateField("plate_search_id", val)}
              />

              <div className="space-y-2">
                <Label>{plateSearchDateLabel}</Label>
                <Input
                  type="date"
                  value={form.plate_searched_date || ""}
                  onChange={(e) =>
                    updateField("plate_searched_date", e.target.value)
                  }
                  className="h-9 bg-card border-input"
                />
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={createVehicleMutation.isPending}
            >
              {createVehicleMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
