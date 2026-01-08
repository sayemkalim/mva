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
import { createScheduled } from "../helpers/createScheduled";
import { fetchScheduledBySlug } from "../helpers/fetchScheduledBySlug";

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

export default function ScheduledPage() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const {
    data: metaResponse,
    isLoading: loadingMeta,
    isError: metaError,
    error: metaErrObj,
  } = useQuery({
    queryKey: ["scheduledMeta"],
    queryFn: getABMeta,
    staleTime: 300000,
  });

  const meta = metaResponse?.response || metaResponse || {};

  const { data: scheduledData, isLoading: loadingScheduled } = useQuery({
    queryKey: ["scheduledData", slug],
    queryFn: () => fetchScheduledBySlug(slug),
    enabled: !!slug,
  });

  const mutation = useMutation({
    mutationFn: (data) => createScheduled({ slug, data }),
    onSuccess: () => {
      toast.success("Discovery scheduled information saved successfully!");
      // navigate("/dashboard/workstation");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to save scheduled data");
    },
  });

  const [formData, setFormData] = useState({
    discovery_scheduled_id: "",
    discovery_date: "",
    informed_client_id: "",
    date: "",
    method_of_communication_id: "",
    correspond_with_opposing_counsel: "",
  });

  // Check if "No" is selected for Discovery Scheduled
  const isDiscoveryScheduledNo = () => {
    if (!meta.yes_no_option || !formData.discovery_scheduled_id) return false;
    const selectedOption = meta.yes_no_option.find(
      (opt) => String(opt.id) === String(formData.discovery_scheduled_id)
    );
    return selectedOption?.name?.toLowerCase() === "no";
  };

  useEffect(() => {
    if (scheduledData) {
      setFormData({
        discovery_scheduled_id: scheduledData.discovery_scheduled_id || "",
        discovery_date: scheduledData.discovery_date
          ? scheduledData.discovery_date.split("T")[0]
          : "",
        informed_client_id: scheduledData.informed_client_id || "",
        date: scheduledData.date ? scheduledData.date.split("T")[0] : "",
        method_of_communication_id:
          scheduledData.method_of_communication_id || "",
        correspond_with_opposing_counsel:
          scheduledData.correspond_with_opposing_counsel || "",
      });
    }
  }, [scheduledData]);

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

  if (loadingMeta || loadingScheduled) {
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
          <span className="text-foreground font-medium">Discovery Scheduled</span>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-6xl">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-foreground">
          Discovery Scheduled
        </h1>

        <form
          className="bg-card rounded-lg shadow-sm border p-6 sm:p-8 space-y-6"
          onSubmit={handleSubmit}
        >
          {/* Discovery Information */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Discovery Information
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SearchableSelect
                label="Discovery Scheduled"
                options={meta.yes_no_option || []}
                value={formData.discovery_scheduled_id}
                onChange={(val) =>
                  handleSelectChange("discovery_scheduled_id", val)
                }
                placeholder="Select option"
              />

              {!isDiscoveryScheduledNo() && (
                <div className="space-y-2">
                  <Label className="text-foreground font-medium">
                    Discovery Date
                  </Label>
                  <Input
                    type="date"
                    name="discovery_date"
                    value={formData.discovery_date}
                    onChange={handleChange}
                    className="h-11"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Client Communication - Show only when Discovery Scheduled is NOT "No" */}
          {!isDiscoveryScheduledNo() && (
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

          {/* Opposing Counsel Section - Show only when Discovery Scheduled is "No" */}
          {isDiscoveryScheduledNo() && (
            <div className="pt-6 border-t">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Opposing Counsel Communication
              </h2>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-foreground font-medium">
                    Correspond with Opposing Counsel
                  </Label>
                  <Textarea
                    name="correspond_with_opposing_counsel"
                    value={formData.correspond_with_opposing_counsel}
                    onChange={handleChange}
                    placeholder="Enter correspondence details..."
                    rows={4}
                    className="resize-none"
                  />
                </div>

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
              {mutation.isLoading ? "Saving..." : "Save Discovery"}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
