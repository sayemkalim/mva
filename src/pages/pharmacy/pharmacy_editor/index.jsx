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
import {
  Loader2,
  ChevronRight,
  CalendarIcon,
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

import { Navbar2 } from "@/components/navbar2";
import { getABMeta } from "../helpers/fetchABMeta";
import { fetchPharmacyBySlug } from "../helpers/fetchPharmacyBySlug";
import { createPharmacy } from "../helpers/createPharmacy";
import { deletePharmacy } from "../helpers/deletePharmacy";

const SearchableSelect = ({ label, options, value, onChange, placeholder }) => {
  const [open, setOpen] = useState(false);
  const selected = options.find((opt) => String(opt.id) === String(value));

  return (
    <div className="space-y-2">
      <Label className="text-gray-700 font-medium">{label}</Label>
      <Popover open={open} onOpenChange={setOpen}>
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
    </div>
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
    <div className="space-y-2">
      <Label className="text-gray-700 font-medium">{label}</Label>
      <Popover open={open} onOpenChange={setOpen}>
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

export default function PharmacyPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    data: metaResponse,
    isLoading: loadingMeta,
    isError: metaError,
    error: metaErrorObj,
  } = useQuery({
    queryKey: ["pharmacyMeta"],
    queryFn: getABMeta,
    staleTime: 300000,
  });

  const meta = metaResponse?.response || {};

  const { data: pharmacyResponse, isLoading: loadingPharmacy } = useQuery({
    queryKey: ["pharmacy", slug],
    queryFn: () => fetchPharmacyBySlug(slug),
    enabled: !!slug,
  });

  const pharmacyData = pharmacyResponse?.response || pharmacyResponse || [];

  const saveMutation = useMutation({
    mutationFn: createPharmacy,
    onSuccess: () => {
      toast.success("Pharmacy data saved successfully!");
      queryClient.invalidateQueries(["pharmacy", slug]);
    },
    onError: () => {
      toast.error("Failed to save Pharmacy data");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deletePharmacy,
    onSuccess: () => {
      toast.success("Record deleted successfully!");
      queryClient.invalidateQueries(["pharmacy", slug]);
    },
    onError: () => {
      toast.error("Failed to delete record");
    },
  });

  const [records, setRecords] = useState([
    {
      id: null,
      report_request: "",
      report_received: "",
      invoice_amount: "",
      cnr_submitted_to_ab: "",
      who_paid_the_invoice_payment_id: "",
      payment_status_id: "",
      date: "",
      via_id: "",
      police_report_submitted_to_ab: "",
      who_paid_the_invoice_payment_2_id: "",
      payment_status_2_id: "",
    },
  ]);

  useEffect(() => {
    if (
      pharmacyData &&
      Array.isArray(pharmacyData) &&
      pharmacyData.length > 0
    ) {
      setRecords(pharmacyData);
    }
  }, [pharmacyData]);

  const handleAddRecord = () => {
    setRecords([
      ...records,
      {
        id: null,
        report_request: "",
        report_received: "",
        invoice_amount: "",
        cnr_submitted_to_ab: "",
        who_paid_the_invoice_payment_id: "",
        payment_status_id: "",
        date: "",
        via_id: "",
        police_report_submitted_to_ab: "",
        who_paid_the_invoice_payment_2_id: "",
        payment_status_2_id: "",
      },
    ]);
  };

  const handleRemoveRecord = (index) => {
    const record = records[index];

    if (record.id) {
      deleteMutation.mutate(record.id);
    }

    const newRecords = records.filter((_, i) => i !== index);
    setRecords(
      newRecords.length > 0
        ? newRecords
        : [
            {
              id: null,
              report_request: "",
              report_received: "",
              invoice_amount: "",
              cnr_submitted_to_ab: "",
              who_paid_the_invoice_payment_id: "",
              payment_status_id: "",
              date: "",
              via_id: "",
              police_report_submitted_to_ab: "",
              who_paid_the_invoice_payment_2_id: "",
              payment_status_2_id: "",
            },
          ]
    );
  };

  const handleRecordChange = (index, field, value) => {
    const newRecords = [...records];
    newRecords[index][field] = value;
    setRecords(newRecords);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    saveMutation.mutate({ slug, data: records });
  };

  if (loadingMeta || loadingPharmacy) {
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
          <span className="text-gray-900 font-medium">Pharmacy</span>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-8 max-w-7xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Pharmacy</h1>
          <Button
            type="button"
            onClick={handleAddRecord}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Record
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {records.map((record, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-sm border p-6 space-y-6"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Record #{index + 1}
                </h3>
                {records.length > 1 && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRemoveRecord(index)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                )}
              </div>

              {/* Row 1 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <DatePicker
                  label="Report Request"
                  value={record.report_request}
                  onChange={(val) =>
                    handleRecordChange(index, "report_request", val)
                  }
                />

                <DatePicker
                  label="Report Received"
                  value={record.report_received}
                  onChange={(val) =>
                    handleRecordChange(index, "report_received", val)
                  }
                />

                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">
                    Invoice Amount
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={record.invoice_amount}
                    onChange={(e) =>
                      handleRecordChange(
                        index,
                        "invoice_amount",
                        e.target.value
                      )
                    }
                    placeholder="0.00"
                    className="h-11"
                  />
                </div>
              </div>

              {/* Row 2 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">
                    CNR Submitted to AB
                  </Label>
                  <Input
                    type="text"
                    value={record.cnr_submitted_to_ab}
                    onChange={(e) =>
                      handleRecordChange(
                        index,
                        "cnr_submitted_to_ab",
                        e.target.value
                      )
                    }
                    placeholder="Enter CNR"
                    className="h-11"
                  />
                </div>

                <SearchableSelect
                  label="Who Paid the Invoice Payment"
                  options={meta.tracking_who_paid || []}
                  value={record.who_paid_the_invoice_payment_id}
                  onChange={(val) =>
                    handleRecordChange(
                      index,
                      "who_paid_the_invoice_payment_id",
                      val
                    )
                  }
                  placeholder="Select who paid"
                />

                <SearchableSelect
                  label="Payment Status"
                  options={meta.tracking_who_paid || []}
                  value={record.payment_status_id}
                  onChange={(val) =>
                    handleRecordChange(index, "payment_status_id", val)
                  }
                  placeholder="Select status"
                />
              </div>

              {/* Row 3 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <DatePicker
                  label="Date"
                  value={record.date}
                  onChange={(val) => handleRecordChange(index, "date", val)}
                />

                <SearchableSelect
                  label="Via"
                  options={meta.tracking_via || []}
                  value={record.via_id}
                  onChange={(val) => handleRecordChange(index, "via_id", val)}
                  placeholder="Select via method"
                />

                <DatePicker
                  label="Police Report Submitted to AB"
                  value={record.police_report_submitted_to_ab}
                  onChange={(val) =>
                    handleRecordChange(
                      index,
                      "police_report_submitted_to_ab",
                      val
                    )
                  }
                />
              </div>

              {/* Row 4 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <SearchableSelect
                  label="Who Paid the Invoice Payment 2"
                  options={meta.tracking_who_paid || []}
                  value={record.who_paid_the_invoice_payment_2_id}
                  onChange={(val) =>
                    handleRecordChange(
                      index,
                      "who_paid_the_invoice_payment_2_id",
                      val
                    )
                  }
                  placeholder="Select who paid"
                />

                <SearchableSelect
                  label="Payment Status 2"
                  options={meta.tracking_who_paid || []}
                  value={record.payment_status_2_id}
                  onChange={(val) =>
                    handleRecordChange(index, "payment_status_2_id", val)
                  }
                  placeholder="Select status"
                />
              </div>
            </div>
          ))}

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
                "Save All Records"
              )}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
