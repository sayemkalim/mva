import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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
import { getABMeta } from "../../helpers/fetchABMeta";
import { fetchSoftCostBySlug } from "../../helpers/fetchSoftCostBySlug";
import { createCost } from "../../helpers/createTask";

const SearchableSelect = ({ label, options, value, onChange, placeholder }) => {
  const selected = options.find((opt) => String(opt.id) === String(value));

  return (
    <div className="space-y-2">
      <Label className="text-gray-700 font-medium">{label}</Label>
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
      <Label className="text-gray-700 font-medium">{label}</Label>
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

export default function TimeCardPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    data: metaResponse,
    isLoading: loadingMeta,
    isError: metaError,
    error: metaErrorObj,
  } = useQuery({
    queryKey: ["timeCardMeta"],
    queryFn: getABMeta,
    staleTime: 300000,
  });

  const meta = metaResponse?.response || {};

  const { data: timeCardResponse, isLoading: loadingTimeCard } = useQuery({
    queryKey: ["timeCard", slug],
    queryFn: () => fetchSoftCostBySlug(slug),
    enabled: !!slug,
  });

  const timeCardData = timeCardResponse?.response || timeCardResponse || {};

  const saveMutation = useMutation({
    mutationFn: createCost,
    onSuccess: () => {
      toast.success("Time Card data saved successfully!");
      queryClient.invalidateQueries(["timeCard", slug]);
    },
    onError: () => {
      toast.error("Failed to save Time Card data");
    },
  });

  const [formData, setFormData] = useState({
    section_type: "time-card",
    timekeeker: "",
    date: "",
    type: "",
    task: "",
    description: "",
    time_spent_id: "",
    time_billed: "",
    rate_level_id: "",
    rate: "",
    rate_type_id: "",
    billing_status_id: "",
    hold: false,
    flag_id: "",
    note: "",
    taxable: false,
  });

  useEffect(() => {
    if (timeCardData && Object.keys(timeCardData).length > 0) {
      setFormData({
        section_type: timeCardData.section_type || "time-card",
        timekeeker: timeCardData.timekeeker || "",
        date: timeCardData.date || "",
        type: timeCardData.type || "",
        task: timeCardData.task || "",
        description: timeCardData.description || "",
        time_spent_id: timeCardData.time_spent_id || "",
        time_billed: timeCardData.time_billed || "",
        rate_level_id: timeCardData.rate_level_id || "",
        rate: timeCardData.rate || "",
        rate_type_id: timeCardData.rate_type_id || "",
        billing_status_id: timeCardData.billing_status_id || "",
        hold: timeCardData.hold || false,
        flag_id: timeCardData.flag_id || "",
        note: timeCardData.note || "",
        taxable: timeCardData.taxable || false,
      });
    }
  }, [timeCardData]);

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

  if (loadingMeta || loadingTimeCard) {
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
    <div className="min-h-screen bg-gray-50">
      <Navbar2 />
      <header className="bg-white border-b px-6 py-3">
        <div className="flex items-center justify-end gap-6 text-sm text-gray-700">
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
      <nav className="bg-white border-b px-6 py-4 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/dashboard")}
            className="hover:text-gray-900 transition"
            type="button"
          >
            Dashboard
          </button>
          <ChevronRight className="w-4 h-4" />
          <button
            onClick={() => navigate("/dashboard/workstation")}
            className="hover:text-gray-900 transition"
            type="button"
          >
            Workstation
          </button>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 font-medium">Time Card</span>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-8 max-w-7xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Time Card</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border p-6 space-y-6">
            {/* Row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">
                  Section Type
                </Label>
                <Input
                  type="text"
                  value={formData.section_type}
                  onChange={(e) =>
                    handleFieldChange("section_type", e.target.value)
                  }
                  placeholder="time-card"
                  className="h-11"
                  readOnly
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">Timekeeper</Label>
                <Input
                  type="text"
                  value={formData.timekeeker}
                  onChange={(e) =>
                    handleFieldChange("timekeeker", e.target.value)
                  }
                  placeholder="Enter timekeeper name"
                  className="h-11"
                />
              </div>

              <DatePicker
                label="Date"
                value={formData.date}
                onChange={(val) => handleFieldChange("date", val)}
              />
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">Type</Label>
                <Input
                  type="text"
                  value={formData.type}
                  onChange={(e) => handleFieldChange("type", e.target.value)}
                  placeholder="e.g., Lawyer Work"
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">Task</Label>
                <Input
                  type="text"
                  value={formData.task}
                  onChange={(e) => handleFieldChange("task", e.target.value)}
                  placeholder="e.g., Consultation"
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">Description</Label>
                <Input
                  type="text"
                  value={formData.description}
                  onChange={(e) =>
                    handleFieldChange("description", e.target.value)
                  }
                  placeholder="Enter description"
                  className="h-11"
                />
              </div>
            </div>

            {/* Row 3 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <SearchableSelect
                label="Time Spent"
                options={meta.timeentries || []}
                value={formData.time_spent_id}
                onChange={(val) => handleFieldChange("time_spent_id", val)}
                placeholder="Select time spent"
              />

              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">
                  Time Billed (HH:MM)
                </Label>
                <Input
                  type="time"
                  value={formData.time_billed}
                  onChange={(e) =>
                    handleFieldChange("time_billed", e.target.value)
                  }
                  className="h-11"
                  placeholder="00:00"
                />
                <p className="text-xs text-gray-500">
                  Format: HH:MM (e.g., 00:45)
                </p>
              </div>

              <SearchableSelect
                label="Rate Level"
                options={meta.rateentries || []}
                value={formData.rate_level_id}
                onChange={(val) => handleFieldChange("rate_level_id", val)}
                placeholder="Select rate level"
              />
            </div>

            {/* Row 4 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">Rate</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.rate}
                  onChange={(e) => handleFieldChange("rate", e.target.value)}
                  placeholder="0.00"
                  className="h-11"
                />
              </div>

              <SearchableSelect
                label="Rate Type"
                options={meta.accounting_rate_type || []}
                value={formData.rate_type_id}
                onChange={(val) => handleFieldChange("rate_type_id", val)}
                placeholder="Select rate type"
              />

              <SearchableSelect
                label="Billing Status"
                options={meta.accounting_billing_status || []}
                value={formData.billing_status_id}
                onChange={(val) => handleFieldChange("billing_status_id", val)}
                placeholder="Select billing status"
              />
            </div>

            {/* Row 5 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">Hold</Label>
                <div className="flex items-center space-x-2 h-11">
                  <Checkbox
                    id="hold"
                    checked={formData.hold}
                    onCheckedChange={(checked) =>
                      handleFieldChange("hold", checked)
                    }
                  />
                  <label
                    htmlFor="hold"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    On Hold
                  </label>
                </div>
              </div>

              <SearchableSelect
                label="Flag"
                options={meta.accounting_flag || []}
                value={formData.flag_id}
                onChange={(val) => handleFieldChange("flag_id", val)}
                placeholder="Select flag"
              />

              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">Taxable</Label>
                <div className="flex items-center space-x-2 h-11">
                  <Checkbox
                    id="taxable"
                    checked={formData.taxable}
                    onCheckedChange={(checked) =>
                      handleFieldChange("taxable", checked)
                    }
                  />
                  <label
                    htmlFor="taxable"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Is Taxable
                  </label>
                </div>
              </div>
            </div>

            {/* Row 6 - Note */}
            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">Note</Label>
                <Textarea
                  value={formData.note}
                  onChange={(e) => handleFieldChange("note", e.target.value)}
                  placeholder="Enter note"
                  rows={3}
                  className="resize-none"
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
