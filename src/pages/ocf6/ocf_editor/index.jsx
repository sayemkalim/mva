import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
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
import { fetchOcf6BySlug } from "../helpers/fetchOcf6BySlug";
import { createOcf6 } from "../helpers/createOcf6";
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

export default function Ocf6Page() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const {
    data: metaResponse,
    isLoading: loadingMeta,
    isError: metaError,
    error: metaErrorObj,
  } = useQuery({
    queryKey: ["ocf6Meta"],
    queryFn: getABMeta,
    staleTime: 300000,
  });

  const meta = metaResponse?.response || {};

  const { data: ocf6Response, isLoading: loadingOcf6 } = useQuery({
    queryKey: ["ocf6", slug],
    queryFn: () => fetchOcf6BySlug(slug),
    enabled: !!slug,
  });

  // Extract data from response
  const ocf6Data = ocf6Response?.response || ocf6Response;

  const saveMutation = useMutation({
    mutationFn: createOcf6,
    onSuccess: () => {
      toast.success("OCF-6 data saved successfully!");
      navigate("/dashboard/workstation");
    },
    onError: () => {
      toast.error("Failed to save OCF-6 data");
    },
  });

  const [formData, setFormData] = useState({
    completed_by_id: "",
    date_of_completion: "",
    date: "",
    via_id: "",
    date_2: "",
    via_2_id: "",
  });

  useEffect(() => {
    if (ocf6Data) {
      setFormData({
        completed_by_id: ocf6Data.completed_by_id || "",
        date_of_completion: ocf6Data.date_of_completion || "",
        date: ocf6Data.date || "",
        via_id: ocf6Data.via_id || "",
        date_2: ocf6Data.date_2 || "",
        via_2_id: ocf6Data.via_2_id || "",
      });
    }
  }, [ocf6Data]);

  const handleSelectChange = (name, val) => {
    setFormData((prev) => ({
      ...prev,
      [name]: val,
    }));
  };

  const handleDateChange = (name, val) => {
    setFormData((prev) => ({
      ...prev,
      [name]: val,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    saveMutation.mutate({ slug, data: formData });
  };

  if (loadingMeta || loadingOcf6) {
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
          <span className="text-foreground font-medium">OCF-6</span>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-8 max-w-7xl">
        <h1 className="text-2xl font-bold mb-6 text-foreground">OCF-6 Form</h1>
        <form
          className="bg-card rounded-lg shadow-sm border p-8 space-y-8"
          onSubmit={handleSubmit}
        >
          {/* Row 1: Completed By, Date of Completion, Date (Sent to AB) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <SearchableSelect
              label="Completed By"
              options={meta.tracking_ocf_6_completed_by || []}
              value={formData.completed_by_id}
              onChange={(val) => handleSelectChange("completed_by_id", val)}
              placeholder="Select who completed"
            />

            <DatePicker
              label="Date of Completion"
              value={formData.date_of_completion}
              onChange={(val) => handleDateChange("date_of_completion", val)}
            />

            <DatePicker
              label="Date (Sent to AB)"
              value={formData.date}
              onChange={(val) => handleDateChange("date", val)}
            />
          </div>

          {/* Row 2: Via, Date 2, Via 2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <SearchableSelect
              label="Via"
              options={meta.tracking_via || []}
              value={formData.via_id}
              onChange={(val) => handleSelectChange("via_id", val)}
              placeholder="Select via method"
            />

            <DatePicker
              label="Date 2"
              value={formData.date_2}
              onChange={(val) => handleDateChange("date_2", val)}
            />

            <SearchableSelect
              label="Via 2"
              options={meta.tracking_via || []}
              value={formData.via_2_id}
              onChange={(val) => handleSelectChange("via_2_id", val)}
              placeholder="Select via method"
            />
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
                "Save OCF-6"
              )}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
