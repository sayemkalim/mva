import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { FloatingWrapper } from "@/components/ui/floating-label";
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
import { Navbar2 } from "@/components/navbar2";
import Billing from "@/components/billing";
import { fetchBankBySlug } from "../helpers/fetchBankBySlug";
import { createBank } from "../helpers/createBank";
import { getABMeta } from "../helpers/fetchABMeta";

const SearchableSelect = ({ label, options, value, onChange, placeholder }) => {
  const [open, setOpen] = useState(false);
  const selected = options.find((opt) => String(opt.id) === String(value));

  return (
    <FloatingWrapper label={label} hasValue={!!selected} isFocused={open}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            role="combobox"
            variant="outline"
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
            <CommandGroup>
              {options && options.length > 0 ? (
                options.map((opt) => (
                  <CommandItem
                    key={opt.id}
                    onSelect={() => {
                      onChange(opt.id);
                      setOpen(false);
                    }}
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
    </FloatingWrapper>
  );
};

const DatePicker = ({ label, value, onChange }) => {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(value ? new Date(value) : undefined);

  useEffect(() => {
    setDate(value ? new Date(value) : undefined);
  }, [value]);

  const handleSelect = (selectedDate) => {
    setDate(selectedDate);
    onChange(selectedDate ? format(selectedDate, "yyyy-MM-dd") : "");
    setOpen(false);
  };

  return (
    <FloatingWrapper label={label} hasValue={!!date} isFocused={open}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start text-left font-normal h-[52px] bg-transparent border border-input"
          >
            {date ? format(date, "PPP") : ""}
            <CalendarIcon className="ml-auto h-4 w-4 shrink-0 opacity-50" />
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
    </FloatingWrapper>
  );
};

export default function BankPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    data: metaResponse,
    isLoading: loadingMeta,
    isError: metaError,
    error: metaErrorObj,
  } = useQuery({
    queryKey: ["bankMeta"],
    queryFn: getABMeta,
    staleTime: 300000,
  });

  const meta = metaResponse?.response || {};

  const { data: bankResponse, isLoading: loadingBank } = useQuery({
    queryKey: ["bank", slug],
    queryFn: () => fetchBankBySlug(slug),
    enabled: !!slug,
  });

  const bankData = bankResponse?.response || bankResponse || {};

  const saveMutation = useMutation({
    mutationFn: createBank,
    onSuccess: () => {
      toast.success("Bank data saved successfully!");
      queryClient.invalidateQueries(["bank", slug]);
    },
    onError: () => {
      toast.error("Failed to save Bank data");
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
    if (bankData && Object.keys(bankData).length > 0) {
      setFormData({
        tax_return_period_id: bankData.tax_return_period_id || "",
        request_date: bankData.request_date || "",
        received_date: bankData.received_date || "",
        date: bankData.date || "",
        via_id: bankData.via_id || "",
        date_2: bankData.date_2 || "",
        via_2_id: bankData.via_2_id || "",
      });
    }
  }, [bankData]);

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

  if (loadingMeta || loadingBank) {
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
          <span className="text-foreground font-medium">Bank</span>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-8 max-w-7xl">
        <h1 className="text-2xl font-bold text-foreground mb-6">Bank</h1>

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
