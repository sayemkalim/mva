import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Loader2, ChevronRight, CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

import { Navbar2 } from "@/components/navbar2";
import Billing from "@/components/billing";
import { fetchStatutoryBySlug } from "../helpers/fetchStatutoryBySlug";
import { createStatutory } from "../helpers/createStatutory";
import { getABMeta } from "../helpers/fetchABMeta";

const SearchableSelect = ({ label, options, value, onChange, placeholder }) => {
  const selected = options.find((opt) => String(opt.id) === String(value));

  return (
    <div className="space-y-2">
      <Label className="text-foreground font-medium">{label}</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            role="combobox"
            variant="outline"
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
            <CommandGroup>
              {options && options.length > 0 ? (
                options.map((opt) => (
                  <CommandItem
                    key={opt.id}
                    onSelect={() => onChange(opt.id)}
                    value={opt.name}
                  >
                    {opt.name}
                  </CommandItem>
                ))
              ) : (
                <div className="p-2 text-sm text-gray-500">
                  No data available
                </div>
              )}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

const DatePicker = ({ label, value, onChange }) => {
  const [date, setDate] = useState(value ? new Date(value) : undefined);

  useEffect(() => {
    setDate(value ? new Date(value) : undefined);
  }, [value]);

  const handleSelect = (selectedDate) => {
    setDate(selectedDate);
    onChange(selectedDate ? format(selectedDate, "yyyy-MM-dd") : "");
  };

  return (
    <div className="space-y-2">
      <Label className="text-foreground font-medium">{label}</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal h-11",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP") : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleSelect}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default function StatutoryPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    data: metaResponse,
    isLoading: loadingMeta,
    isError: metaError,
    error: metaErrorObj,
  } = useQuery({
    queryKey: ["statutoryMeta"],
    queryFn: getABMeta,
    staleTime: 300000,
  });

  const meta = metaResponse?.response || {};

  const { data: statutoryResponse, isLoading: loadingStatutory } = useQuery({
    queryKey: ["statutory", slug],
    queryFn: () => fetchStatutoryBySlug(slug),
    enabled: !!slug,
  });

  const statutoryData = statutoryResponse?.response || statutoryResponse || {};

  const saveMutation = useMutation({
    mutationFn: createStatutory,
    onSuccess: () => {
      toast.success("Statutory Declaration data saved successfully!");
      queryClient.invalidateQueries(["statutory", slug]);
    },
    onError: () => {
      toast.error("Failed to save Statutory Declaration data");
    },
  });

  const [formData, setFormData] = useState({
    request_to_client_for_completion: "",
    received_statutory_declaration: "",
    submitted_to_ab: "",
    request_to_client_for_completion_1: "",
    received_statutory_declaration_1: "",
    submitted_to_ab_1: "",
    request_to_client_for_completion_2: "",
    received_statutory_declaration_2: "",
    submitted_to_ab_2: "",
    soc_status: "",
    soc_issued_on: "",
    soc_status_1: "",
    soc_issued_on_1: "",
  });

  useEffect(() => {
    if (statutoryData && Object.keys(statutoryData).length > 0) {
      setFormData({
        request_to_client_for_completion:
          statutoryData.request_to_client_for_completion || "",
        received_statutory_declaration:
          statutoryData.received_statutory_declaration || "",
        submitted_to_ab: statutoryData.submitted_to_ab || "",
        request_to_client_for_completion_1:
          statutoryData.request_to_client_for_completion_1 || "",
        received_statutory_declaration_1:
          statutoryData.received_statutory_declaration_1 || "",
        submitted_to_ab_1: statutoryData.submitted_to_ab_1 || "",
        request_to_client_for_completion_2:
          statutoryData.request_to_client_for_completion_2 || "",
        received_statutory_declaration_2:
          statutoryData.received_statutory_declaration_2 || "",
        submitted_to_ab_2: statutoryData.submitted_to_ab_2 || "",
        soc_status: statutoryData.soc_status || "",
        soc_issued_on: statutoryData.soc_issued_on || "",
        soc_status_1: statutoryData.soc_status_1 || "",
        soc_issued_on_1: statutoryData.soc_issued_on_1 || "",
      });
    }
  }, [statutoryData]);

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    saveMutation.mutate({ slug, data: formData });
  };

  if (loadingMeta || loadingStatutory) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading...</span>
      </div>
    );
  }

  if (metaError) {
    return (
      <div className="text-red-600 p-4">
        Failed to load metadata: {metaErrorObj?.message || "Unknown error"}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted">
      <Navbar2 />
      <Billing />

      {/* Breadcrumb */}
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
            Statutory Declaration
          </span>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-8 max-w-7xl">
        <h1 className="text-2xl font-bold text-foreground mb-6">
          Statutory Declaration
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-card rounded-lg shadow-sm border p-6 space-y-6">
            {/* Section 1 */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Declaration Set 1
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <DatePicker
                  label="Request to Client for Completion"
                  value={formData.request_to_client_for_completion}
                  onChange={(val) =>
                    handleFieldChange("request_to_client_for_completion", val)
                  }
                />

                <DatePicker
                  label="Received Statutory Declaration"
                  value={formData.received_statutory_declaration}
                  onChange={(val) =>
                    handleFieldChange("received_statutory_declaration", val)
                  }
                />

                <DatePicker
                  label="Submitted to AB"
                  value={formData.submitted_to_ab}
                  onChange={(val) => handleFieldChange("submitted_to_ab", val)}
                />
              </div>
            </div>

            {/* Section 2 */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Declaration Set 2
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <DatePicker
                  label="Request to Client for Completion"
                  value={formData.request_to_client_for_completion_1}
                  onChange={(val) =>
                    handleFieldChange("request_to_client_for_completion_1", val)
                  }
                />

                <DatePicker
                  label="Received Statutory Declaration"
                  value={formData.received_statutory_declaration_1}
                  onChange={(val) =>
                    handleFieldChange("received_statutory_declaration_1", val)
                  }
                />

                <DatePicker
                  label="Submitted to AB"
                  value={formData.submitted_to_ab_1}
                  onChange={(val) =>
                    handleFieldChange("submitted_to_ab_1", val)
                  }
                />
              </div>
            </div>

            {/* Section 3 */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Declaration Set 3
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <DatePicker
                  label="Request to Client for Completion"
                  value={formData.request_to_client_for_completion_2}
                  onChange={(val) =>
                    handleFieldChange("request_to_client_for_completion_2", val)
                  }
                />

                <DatePicker
                  label="Received Statutory Declaration"
                  value={formData.received_statutory_declaration_2}
                  onChange={(val) =>
                    handleFieldChange("received_statutory_declaration_2", val)
                  }
                />

                <DatePicker
                  label="Submitted to AB"
                  value={formData.submitted_to_ab_2}
                  onChange={(val) =>
                    handleFieldChange("submitted_to_ab_2", val)
                  }
                />
              </div>
            </div>

            {/* SOC Section 1 */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">
                SOC Details 1
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label className="text-foreground font-medium">
                    SOC Status
                  </Label>
                  <Input
                    type="text"
                    value={formData.soc_status}
                    onChange={(e) =>
                      handleFieldChange("soc_status", e.target.value)
                    }
                    placeholder="Enter SOC status"
                    className="h-11"
                  />
                </div>

                <DatePicker
                  label="SOC Issued On"
                  value={formData.soc_issued_on}
                  onChange={(val) => handleFieldChange("soc_issued_on", val)}
                />
              </div>
            </div>

            {/* SOC Section 2 */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">
                SOC Details 2
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label className="text-foreground font-medium">
                    SOC Status
                  </Label>
                  <Input
                    type="text"
                    value={formData.soc_status_1}
                    onChange={(e) =>
                      handleFieldChange("soc_status_1", e.target.value)
                    }
                    placeholder="Enter SOC status"
                    className="h-11"
                  />
                </div>

                <DatePicker
                  label="SOC Issued On"
                  value={formData.soc_issued_on_1}
                  onChange={(val) => handleFieldChange("soc_issued_on_1", val)}
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4 pt-6">
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              type="button"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
