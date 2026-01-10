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
import { Loader2, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import { Navbar2 } from "@/components/navbar2";
import Billing from "@/components/billing";
import { fetchClientSettlementBySlug } from "../helpers/fetchClientSettlementBySlug";
import { createClientSettlement } from "../helpers/createClientSettlement";
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

export default function ClientSettlementPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    data: metaResponse,
    isLoading: loadingMeta,
    isError: metaError,
    error: metaErrorObj,
  } = useQuery({
    queryKey: ["clientSettlementMeta"],
    queryFn: getABMeta,
    staleTime: 300000,
  });

  const meta = metaResponse?.response || {};
  const hstRate = meta.hst_rate || 13; // Default HST rate from meta

  const { data: clientSettlementResponse, isLoading: loadingClientSettlement } =
    useQuery({
      queryKey: ["clientSettlement", slug],
      queryFn: () => fetchClientSettlementBySlug(slug),
      enabled: !!slug,
    });

  const clientSettlementData =
    clientSettlementResponse?.response || clientSettlementResponse || {};

  const saveMutation = useMutation({
    mutationFn: createClientSettlement,
    onSuccess: () => {
      toast.success("Client Settlement data saved successfully!");
      queryClient.invalidateQueries(["clientSettlement", slug]);
    },
    onError: () => {
      toast.error("Failed to save Client Settlement data");
    },
  });

  const [formData, setFormData] = useState({
    billing_method_id: "",
    settlement_amount: "",
    percentage: "",
    price: "",
    tax: "",
    final_price: "",
  });

  useEffect(() => {
    if (clientSettlementData && Object.keys(clientSettlementData).length > 0) {
      setFormData({
        billing_method_id: clientSettlementData.billing_method_id || "",
        settlement_amount: clientSettlementData.settlement_amount || "",
        percentage: clientSettlementData.percentage || "",
        price: clientSettlementData.price || "",
        tax: clientSettlementData.tax || "",
        final_price: clientSettlementData.final_price || "",
      });
    }
  }, [clientSettlementData]);

  // Calculate tax and final price when price changes
  useEffect(() => {
    if (formData.price) {
      const priceValue = parseFloat(formData.price) || 0;
      const taxValue = (priceValue * hstRate) / 100;
      const finalPriceValue = priceValue + taxValue;

      setFormData((prev) => ({
        ...prev,
        tax: taxValue.toFixed(2),
        final_price: finalPriceValue.toFixed(2),
      }));
    }
  }, [formData.price, hstRate]);

  // Calculate price for contingency billing when settlement_amount or percentage changes
  useEffect(() => {
    if (
      formData.billing_method_id === "2" &&
      formData.settlement_amount &&
      formData.percentage
    ) {
      const settlementValue = parseFloat(formData.settlement_amount) || 0;
      const percentageValue = parseFloat(formData.percentage) || 0;
      const calculatedPrice = (settlementValue * percentageValue) / 100;

      setFormData((prev) => ({
        ...prev,
        price: calculatedPrice.toFixed(2),
      }));
    }
  }, [
    formData.billing_method_id,
    formData.settlement_amount,
    formData.percentage,
  ]);

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

  const isContingency = formData.billing_method_id === "2";
  const isFixed = formData.billing_method_id === "1";
  const isHourly = formData.billing_method_id === "3";

  // Show settlement_amount and percentage for both Fixed and Contingency
  const showSettlementFields = isFixed || isContingency;

  if (loadingMeta || loadingClientSettlement) {
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
          <span className="text-foreground font-medium">Client Settlement</span>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-8 max-w-7xl">
        <h1 className="text-2xl font-bold text-foreground mb-6">
          Client Settlement
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-card rounded-lg shadow-sm border p-6 space-y-6">
            {/* Row 1 - Billing Method */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <SearchableSelect
                label="Billing Method"
                options={meta.accounting_billing_method || []}
                value={formData.billing_method_id}
                onChange={(val) => handleFieldChange("billing_method_id", val)}
                placeholder="Select billing method"
              />
            </div>

            {/* Settlement Fields for Fixed and Contingency */}
            {showSettlementFields && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label className="text-foreground font-medium">
                    Settlement Amount
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.settlement_amount}
                    onChange={(e) =>
                      handleFieldChange("settlement_amount", e.target.value)
                    }
                    placeholder="0.00"
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground font-medium">
                    Percentage (%)
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.percentage}
                    onChange={(e) =>
                      handleFieldChange("percentage", e.target.value)
                    }
                    placeholder="0.00"
                    className="h-11"
                  />
                </div>
              </div>
            )}

            {/* Row 2 - Price, Tax, Final Price */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label className="text-foreground font-medium">Price</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => handleFieldChange("price", e.target.value)}
                  placeholder="0.00"
                  className="h-11"
                  disabled={isContingency || isHourly}
                  readOnly={isContingency || isHourly}
                />
                {isFixed && (
                  <p className="text-xs text-gray-500">Enter fixed price</p>
                )}
                {isContingency && (
                  <p className="text-xs text-gray-500">
                    Auto-calculated: (Settlement Amount × Percentage) / 100
                  </p>
                )}
                {isHourly && (
                  <p className="text-xs text-gray-500">
                    Readonly for hourly billing
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-foreground font-medium">
                  Tax (HST {hstRate}%)
                </Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.tax}
                  placeholder="0.00"
                  className="h-11 bg-muted"
                  disabled
                  readOnly
                />
                <p className="text-xs text-gray-500">
                  Auto-calculated: Price × {hstRate}%
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-foreground font-medium">Final Price</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.final_price}
                  placeholder="0.00"
                  className="h-11 bg-muted font-semibold"
                  disabled
                  readOnly
                />
                <p className="text-xs text-gray-500">
                  Auto-calculated: Price + Tax
                </p>
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
