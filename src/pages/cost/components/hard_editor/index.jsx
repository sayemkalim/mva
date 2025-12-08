import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Loader2, ChevronRight, CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

import { Navbar2 } from "@/components/navbar2";

import { createCost } from "../../helpers/createCost";
import { fetchSoftCostBySlug } from "../../helpers/fetchSoftCostBySlug";
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

export default function HardCostPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    data: metaResponse,
    isLoading: loadingMeta,
    isError: metaError,
    error: metaErrorObj,
  } = useQuery({
    queryKey: ["hardCostMeta"],
    queryFn: getABMeta,
    staleTime: 300000,
  });

  const meta = metaResponse?.response || {};

  const { data: hardCostResponse, isLoading: loadingHardCost } = useQuery({
    queryKey: ["hardCost", slug],
    queryFn: () => fetchSoftCostBySlug(slug),
    enabled: !!slug,
  });

  const hardCostData = hardCostResponse?.response || hardCostResponse || {};

  const saveMutation = useMutation({
    mutationFn: createCost,
    onSuccess: () => {
      toast.success("Hard Cost data saved successfully!");
      queryClient.invalidateQueries(["hardCost", slug]);
    },
    onError: () => {
      toast.error("Failed to save Hard Cost data");
    },
  });

  const [formData, setFormData] = useState({
    section_type: "hard-cost",
    date: "",
    bank_type_id: "",
    type: "",
    method_id: "",
    quantity: "",
    pay_to: "",
    amount: "",
    memo_1: "",
    memo_2: "",
    address_1: "",
    address_2: "",
  });

  useEffect(() => {
    if (hardCostData && Object.keys(hardCostData).length > 0) {
      setFormData({
        section_type: hardCostData.section_type || "hard-cost",
        date: hardCostData.date || "",
        bank_type_id: hardCostData.bank_type_id || "",
        type: hardCostData.type || "",
        method_id: hardCostData.method_id || "",
        quantity: hardCostData.quantity || "",
        pay_to: hardCostData.pay_to || "",
        amount: hardCostData.amount || "",
        memo_1: hardCostData.memo_1 || "",
        memo_2: hardCostData.memo_2 || "",
        address_1: hardCostData.address_1 || "",
        address_2: hardCostData.address_2 || "",
      });
    }
  }, [hardCostData]);

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

  if (loadingMeta || loadingHardCost) {
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
          <span className="text-gray-900 font-medium">Hard Cost</span>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-8 max-w-7xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Hard Cost</h1>

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
                  placeholder="hard-cost"
                  className="h-11"
                  readOnly
                />
              </div>

              <DatePicker
                label="Date"
                value={formData.date}
                onChange={(val) => handleFieldChange("date", val)}
              />

              <SearchableSelect
                label="Bank Type"
                options={meta.accounting_bank_type || []}
                value={formData.bank_type_id}
                onChange={(val) => handleFieldChange("bank_type_id", val)}
                placeholder="Select bank type"
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
                  placeholder="e.g., Payment"
                  className="h-11"
                />
              </div>

              <SearchableSelect
                label="Method"
                options={meta.accounting_method || []}
                value={formData.method_id}
                onChange={(val) => handleFieldChange("method_id", val)}
                placeholder="Select method"
              />

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
            </div>

            {/* Row 3 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">Pay To</Label>
                <Input
                  type="text"
                  value={formData.pay_to}
                  onChange={(e) => handleFieldChange("pay_to", e.target.value)}
                  placeholder="e.g., ABC Supplies"
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">Amount</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => handleFieldChange("amount", e.target.value)}
                  placeholder="0.00"
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">Memo 1</Label>
                <Input
                  type="text"
                  value={formData.memo_1}
                  onChange={(e) => handleFieldChange("memo_1", e.target.value)}
                  placeholder="Enter memo"
                  className="h-11"
                />
              </div>
            </div>

            {/* Row 4 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">Memo 2</Label>
                <Input
                  type="text"
                  value={formData.memo_2}
                  onChange={(e) => handleFieldChange("memo_2", e.target.value)}
                  placeholder="Enter additional memo"
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">Address 1</Label>
                <Input
                  type="text"
                  value={formData.address_1}
                  onChange={(e) =>
                    handleFieldChange("address_1", e.target.value)
                  }
                  placeholder="e.g., 123 Main Street"
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">Address 2</Label>
                <Input
                  type="text"
                  value={formData.address_2}
                  onChange={(e) =>
                    handleFieldChange("address_2", e.target.value)
                  }
                  placeholder="e.g., Suite 45"
                  className="h-11"
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
