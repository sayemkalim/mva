import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
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
import { fetchTaxBySlug } from "../helpers/fetchTaxBySlug";
import { createTax } from "../helpers/createTax";
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

export default function TaxPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    data: metaResponse,
    isLoading: loadingMeta,
    isError: metaError,
    error: metaErrorObj,
  } = useQuery({
    queryKey: ["taxMeta"],
    queryFn: getABMeta,
    staleTime: 300000,
  });

  const meta = metaResponse?.response || {};

  const { data: taxResponse, isLoading: loadingTax } = useQuery({
    queryKey: ["tax", slug],
    queryFn: () => fetchTaxBySlug(slug),
    enabled: !!slug,
  });

  const taxData = taxResponse?.response || taxResponse || {};

  const saveMutation = useMutation({
    mutationFn: createTax,
    onSuccess: () => {
      toast.success("Tax data saved successfully!");
      queryClient.invalidateQueries(["tax", slug]);
    },
    onError: () => {
      toast.error("Failed to save Tax data");
    },
  });

  const [formData, setFormData] = useState({
    tax_return_period_id: "",
    request_date: "",
    received_date: "",
    date: "",
    via_id: "",
    date_2: "",
    via_2_id: "",
  });

  useEffect(() => {
    if (taxData && Object.keys(taxData).length > 0) {
      setFormData({
        tax_return_period_id: taxData.tax_return_period_id || "",
        request_date: taxData.request_date || "",
        received_date: taxData.received_date || "",
        date: taxData.date || "",
        via_id: taxData.via_id || "",
        date_2: taxData.date_2 || "",
        via_2_id: taxData.via_2_id || "",
      });
    }
  }, [taxData]);

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

  if (loadingMeta || loadingTax) {
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
          <span className="text-foreground font-medium">Tax</span>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-8 max-w-7xl">
        <h1 className="text-2xl font-bold text-foreground mb-6">Tax</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-card rounded-lg shadow-sm border p-6 space-y-6">
            {/* Row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <SearchableSelect
                label="Tax Return Period"
                options={meta.tracking_tax_return_period || []}
                value={formData.tax_return_period_id}
                onChange={(val) =>
                  handleFieldChange("tax_return_period_id", val)
                }
                placeholder="Select tax return period"
              />

              <DatePicker
                label="Request Date"
                value={formData.request_date}
                onChange={(val) => handleFieldChange("request_date", val)}
              />

              <DatePicker
                label="Received Date"
                value={formData.received_date}
                onChange={(val) => handleFieldChange("received_date", val)}
              />
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <DatePicker
                label="Date"
                value={formData.date}
                onChange={(val) => handleFieldChange("date", val)}
              />

              <SearchableSelect
                label="Via"
                options={meta.tracking_via || []}
                value={formData.via_id}
                onChange={(val) => handleFieldChange("via_id", val)}
                placeholder="Select via method"
              />

              <DatePicker
                label="Date 2"
                value={formData.date_2}
                onChange={(val) => handleFieldChange("date_2", val)}
              />
            </div>

            {/* Row 3 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <SearchableSelect
                label="Via 2"
                options={meta.tracking_via || []}
                value={formData.via_2_id}
                onChange={(val) => handleFieldChange("via_2_id", val)}
                placeholder="Select via method"
              />
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
