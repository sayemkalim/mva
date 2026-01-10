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
import { Loader2, ChevronRight, Check } from "lucide-react";
import { toast } from "sonner";
import { getABMeta } from "../helpers/fetchABMeta";

import { Navbar2 } from "@/components/navbar2";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { fetchAodBySlug } from "../helpers/fetchAodBySlug";
import { createAod } from "../helpers/createAod";
import Billing from "@/components/billing";

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

export default function AodPage() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const {
    data: metaResponse,
    isLoading: loadingMeta,
    isError: metaError,
    error: metaErrObj,
  } = useQuery({
    queryKey: ["aodMeta"],
    queryFn: getABMeta,
    staleTime: 300000,
  });

  const meta = metaResponse?.response || metaResponse || {};

  const { data: aodData, isLoading: loadingAod } = useQuery({
    queryKey: ["aodData", slug],
    queryFn: () => fetchAodBySlug(slug),
    enabled: !!slug,
  });

  const mutation = useMutation({
    mutationFn: (data) => createAod({ slug, data }),
    onSuccess: () => {
      toast.success("AOD information saved successfully!");
      // navigate("/dashboard/workstation");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to save AOD data");
    },
  });

  const [formData, setFormData] = useState({
    aod_serviced_id: "",
    date: "",
    informed_client_id: "",
    method_of_communication_id: "",
    all_communication_etc: "",
    aod_received_from_tps_counsel_id: "",
  });

  // Check if "No" is selected for AOD Serviced
  const isAodServicedNo = () => {
    if (!meta.yes_no_option || !formData.aod_serviced_id) return false;
    const selectedOption = meta.yes_no_option.find(
      (opt) => String(opt.id) === String(formData.aod_serviced_id)
    );
    return selectedOption?.name?.toLowerCase() === "no";
  };

  useEffect(() => {
    if (aodData) {
      setFormData({
        aod_serviced_id: aodData.aod_serviced_id || "",
        date: aodData.date ? aodData.date.split("T")[0] : "",
        informed_client_id: aodData.informed_client_id || "",
        method_of_communication_id: aodData.method_of_communication_id || "",
        all_communication_etc: aodData.all_communication_etc || "",
        aod_received_from_tps_counsel_id:
          aodData.aod_received_from_tps_counsel_id || "",
      });
    }
  }, [aodData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  if (loadingMeta || loadingAod) {
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

    <Billing/>

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
          <span className="text-foreground font-medium">
            Affidavit of Documents
          </span>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-6xl">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-foreground">
          Affidavit of Documents (AOD)
        </h1>

        <form
          className="bg-card rounded-lg shadow-sm border p-6 sm:p-8 space-y-6"
          onSubmit={handleSubmit}
        >
          {/* AOD Service Information */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">
              AOD Service Information
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SearchableSelect
                label="AOD Serviced"
                options={meta.yes_no_option || []}
                value={formData.aod_serviced_id}
                onChange={(val) => handleSelectChange("aod_serviced_id", val)}
                placeholder="Select option"
              />

              {!isAodServicedNo() && (
                <div className="space-y-2">
                  <Label className="text-foreground font-medium">Date</Label>
                  <Input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className="h-11"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Client Communication - Show only when AOD Serviced is NOT "No" */}
          {!isAodServicedNo() && (
            <div className="pt-6 border-t">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Client Communication
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SearchableSelect
                  label="Informed Client"
                  options={meta.yes_no_option || []}
                  value={formData.informed_client_id}
                  onChange={(val) =>
                    handleSelectChange("informed_client_id", val)
                  }
                  placeholder="Select option"
                />

                <SearchableSelect
                  label="Method of Communication"
                  options={meta.insurance_mode_of_communication || []}
                  value={formData.method_of_communication_id}
                  onChange={(val) =>
                    handleSelectChange("method_of_communication_id", val)
                  }
                  placeholder="Select method"
                />
              </div>
            </div>
          )}

          {/* Communication Details - Always visible */}
          <div className="pt-6 border-t">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Communication Details
            </h2>
            <div className="space-y-2">
              <Label className="text-foreground font-medium">
                All Communication etc.
              </Label>
              <Textarea
                name="all_communication_etc"
                value={formData.all_communication_etc}
                onChange={handleChange}
                placeholder="Enter all communication details"
                rows={4}
                className="resize-none"
              />
            </div>
          </div>

          {/* Third Party Information - Always visible */}
          <div className="pt-6 border-t">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Third Party Information
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SearchableSelect
                label="AOD Received from TP's Counsel"
                options={meta.yes_no_option || []}
                value={formData.aod_received_from_tps_counsel_id}
                onChange={(val) =>
                  handleSelectChange("aod_received_from_tps_counsel_id", val)
                }
                placeholder="Select option"
              />
            </div>
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
              {mutation.isLoading ? "Saving..." : "Save AOD"}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
