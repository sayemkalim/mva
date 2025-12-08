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
import { createCost } from "../../helpers/createCost";
import { getABMeta } from "../../helpers/fetchABMeta";

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

export default function SoftCostPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    data: metaResponse,
    isLoading: loadingMeta,
    isError: metaError,
    error: metaErrorObj,
  } = useQuery({
    queryKey: ["softCostMeta"],
    queryFn: getABMeta,
    staleTime: 300000,
  });

  const meta = metaResponse?.response || {};

  const { data: softCostResponse, isLoading: loadingSoftCost } = useQuery({
    queryKey: ["softCost", slug],
    queryFn: () => fetchSoftCostBySlug(slug),
    enabled: !!slug,
  });

  const softCostData = softCostResponse?.response || softCostResponse || {};

  const saveMutation = useMutation({
    mutationFn: createCost,
    onSuccess: (data) => {
      console.log("✅ Mutation success:", data);
      toast.success("Soft Cost data saved successfully!");
      queryClient.invalidateQueries(["softCost", slug]);
    },
    onError: (error) => {
      console.error("Full mutation error:", error);
      console.error("Error response:", error.response?.data);
      const validationErrors = error.response?.data?.errors;
      const errorMessage = error.response?.data?.message;

      if (validationErrors) {
        Object.entries(validationErrors).forEach(([field, messages]) => {
          messages.forEach((msg) => {
            toast.error(`${field}: ${msg}`);
          });
        });
      } else if (errorMessage) {
        toast.error(errorMessage);
      } else {
        toast.error("Failed to save Soft Cost data");
      }
    },
  });

  const [formData, setFormData] = useState({
    section_type: "soft-cost",
    timekeeper: "",
    date: "",
    type: "",
    expense: "",
    description: "",
    quantity: "",
    rate: "",
    taxable: false,
  });

  useEffect(() => {
    if (softCostData && Object.keys(softCostData).length > 0) {
      setFormData({
        section_type: softCostData.section_type || "soft-cost",
        timekeeper: softCostData.timekeeper || softCostData.timekeeker || "",
        date: softCostData.date || "",
        type: softCostData.type || "",
        expense: softCostData.expense || softCostData.expesne || "",
        description: softCostData.description || "",
        quantity: softCostData.quantity || "",
        rate: softCostData.rate || "",
        taxable: softCostData.taxable || false,
      });
    }
  }, [softCostData]);

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Convert string values to proper types
    const payload = {
      section_type: formData.section_type,
      timekeeper: formData.timekeeper,
      date: formData.date,
      type: formData.type,
      expense: formData.expense,
      description: formData.description,
      quantity: formData.quantity ? Number(formData.quantity) : 0,
      rate: formData.rate ? Number(formData.rate) : 0,
      taxable: formData.taxable ? 1 : 0,
    };

    console.log("📤 Submitting payload:", payload);
    console.log("📤 With slug:", slug);

    // Pass data inside an object with 'data' key
    saveMutation.mutate({ slug, data: payload });
  };

  if (loadingMeta || loadingSoftCost) {
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
          <span className="text-gray-900 font-medium">Soft Cost</span>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-8 max-w-7xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Soft Cost</h1>

        {/* Display mutation error for debugging */}
        {saveMutation.isError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800 font-medium mb-2">
              Error Details (Check console for full details):
            </p>
            <pre className="text-sm text-red-700 overflow-x-auto">
              {JSON.stringify(saveMutation.error.response?.data, null, 2)}
            </pre>
          </div>
        )}

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
                  placeholder="soft-cost"
                  className="h-11"
                  readOnly
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">Timekeeper</Label>
                <Input
                  type="text"
                  value={formData.timekeeper}
                  onChange={(e) =>
                    handleFieldChange("timekeeper", e.target.value)
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
                  placeholder="e.g., Expense"
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">Expense</Label>
                <Input
                  type="text"
                  value={formData.expense}
                  onChange={(e) => handleFieldChange("expense", e.target.value)}
                  placeholder="e.g., Travel"
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) =>
                    handleFieldChange("description", e.target.value)
                  }
                  placeholder="Enter description"
                  rows={2}
                  className="resize-none"
                />
              </div>
            </div>

            {/* Row 3 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">Quantity</Label>
                <Input
                  type="number"
                  step="1"
                  value={formData.quantity}
                  onChange={(e) =>
                    handleFieldChange("quantity", e.target.value)
                  }
                  placeholder="0"
                  className="h-11"
                />
              </div>

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
