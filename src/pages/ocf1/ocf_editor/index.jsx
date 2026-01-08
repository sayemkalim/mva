import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
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
import { getABMeta } from "../helpers/fetchABMeta";
import { fetchOcf1BySlug } from "../helpers/fetchOcf1BySlug";
import { createOcf1 } from "../helpers/createOcf1";

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
              {options.map((opt) => (
                <CommandItem
                  key={opt.id}
                  onSelect={() => onChange(opt.id)}
                  value={opt.name}
                >
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

export default function Ocf1Page() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const {
    data: metaResponse,
    isLoading: loadingMeta,
    isError: metaError,
    error: metaErrorObj,
  } = useQuery({
    queryKey: ["ocf1Meta"],
    queryFn: getABMeta,
    staleTime: 300000,
  });

  const meta = metaResponse?.response || {};

  const { data: ocf1Data, isLoading: loadingOcf1 } = useQuery({
    queryKey: ["ocf1", slug],
    queryFn: () => fetchOcf1BySlug(slug),
    enabled: !!slug,
  });

  const saveMutation = useMutation({
    mutationFn: createOcf1,
    onSuccess: () => {
      toast.success("OCF-1 data saved successfully!");
    },
    onError: () => {
      toast.error("Failed to save OCF-1 data");
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
    if (ocf1Data) {
      setFormData({
        completed_by_id: ocf1Data.completed_by_id || "",
        date_of_completion: ocf1Data.date_of_completion || "",
        date: ocf1Data.date || "",
        via_id: ocf1Data.via_id || "",
        date_2: ocf1Data.date_2 || "",
        via_2_id: ocf1Data.via_2_id || "",
      });
    }
  }, [ocf1Data]);

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

  if (loadingMeta || loadingOcf1) {
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
        Failed to load metadata: {metaErrorObj?.message || "Unknown error"}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted">
      <Navbar2 />
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
          <span className="text-foreground font-medium">OCF-1</span>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-8 max-w-7xl">
        <h1 className="text-2xl font-bold mb-6 text-foreground">OCF-1 Form</h1>
        <form
          className="bg-card rounded-lg shadow-sm border p-8 space-y-8"
          onSubmit={handleSubmit}
        >
          {/* Row 1: Completed By, Date of Completion, Date (Sent to AB) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <SearchableSelect
              label="Completed By"
              options={meta.tracking_ocf_1_completed_by || []}
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
                "Save OCF-1"
              )}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
