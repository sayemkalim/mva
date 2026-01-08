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
import { fetchOhifBySlug } from "../helpers/fetchOhifBySlug";
import { createOhif } from "../helpers/createOhif";
import { deleteOhif } from "../helpers/deleteOhif";

const SearchableSelect = ({ label, options, value, onChange, placeholder }) => {
  const [open, setOpen] = useState(false);
  const selected = options.find((opt) => String(opt.id) === String(value));

  return (
    <div className="space-y-2">
      <Label className="text-foreground font-medium">{label}</Label>
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
      <Label className="text-foreground font-medium">{label}</Label>
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

export default function OhipPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    data: metaResponse,
    isLoading: loadingMeta,
    isError: metaError,
    error: metaErrorObj,
  } = useQuery({
    queryKey: ["ohipMeta"],
    queryFn: getABMeta,
    staleTime: 300000,
  });

  const meta = metaResponse?.response || {};

  const { data: ohipResponse, isLoading: loadingOhip } = useQuery({
    queryKey: ["ohip", slug],
    queryFn: () => fetchOhifBySlug(slug),
    enabled: !!slug,
  });

  const ohipData = ohipResponse?.response || ohipResponse || [];

  const saveMutation = useMutation({
    mutationFn: createOhif,
    onSuccess: () => {
      toast.success("OHIP data saved successfully!");
      queryClient.invalidateQueries(["ohip", slug]);
    },
    onError: () => {
      toast.error("Failed to save OHIP data");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteOhif,
    onSuccess: () => {
      toast.success("Record deleted successfully!");
      queryClient.invalidateQueries(["ohip", slug]);
    },
    onError: () => {
      toast.error("Failed to delete record");
    },
  });

  const [records, setRecords] = useState([
    {
      id: null,
      form_filled_by_id: "",
      communication_date: "",
      mode_of_communication_id: "",
      first_reminder: "",
      second_reminder: "",
      request_from: "",
      request_to: "",
      summary_received_id: "",
      summary_sent_to_id: "",
      invoice_amount: "",
      invoice_status_id: "",
      note: "",
    },
  ]);

  useEffect(() => {
    if (ohipData && Array.isArray(ohipData) && ohipData.length > 0) {
      setRecords(ohipData);
    }
  }, [ohipData]);

  const handleAddRecord = () => {
    setRecords([
      ...records,
      {
        id: null,
        form_filled_by_id: "",
        communication_date: "",
        mode_of_communication_id: "",
        first_reminder: "",
        second_reminder: "",
        request_from: "",
        request_to: "",
        summary_received_id: "",
        summary_sent_to_id: "",
        invoice_amount: "",
        invoice_status_id: "",
        note: "",
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
              form_filled_by_id: "",
              communication_date: "",
              mode_of_communication_id: "",
              first_reminder: "",
              second_reminder: "",
              request_from: "",
              request_to: "",
              summary_received_id: "",
              summary_sent_to_id: "",
              invoice_amount: "",
              invoice_status_id: "",
              note: "",
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

  if (loadingMeta || loadingOhip) {
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
          <span className="text-foreground font-medium">
            OHIP Decoded Summary
          </span>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-8 max-w-7xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-foreground">
            OHIP Decoded Summary
          </h1>
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
              className="bg-card rounded-lg shadow-sm border p-6 space-y-6"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-foreground">
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
                <SearchableSelect
                  label="Form Filled By"
                  options={meta.tracking_form_filled_by || []}
                  value={record.form_filled_by_id}
                  onChange={(val) =>
                    handleRecordChange(index, "form_filled_by_id", val)
                  }
                  placeholder="Select who filled"
                />

                <DatePicker
                  label="Communication Date"
                  value={record.communication_date}
                  onChange={(val) =>
                    handleRecordChange(index, "communication_date", val)
                  }
                />

                <SearchableSelect
                  label="Mode of Communication"
                  options={meta.insurance_mode_of_communication || []}
                  value={record.mode_of_communication_id}
                  onChange={(val) =>
                    handleRecordChange(index, "mode_of_communication_id", val)
                  }
                  placeholder="Select mode"
                />
              </div>

              {/* Row 2 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <DatePicker
                  label="First Reminder"
                  value={record.first_reminder}
                  onChange={(val) =>
                    handleRecordChange(index, "first_reminder", val)
                  }
                />

                <DatePicker
                  label="Second Reminder"
                  value={record.second_reminder}
                  onChange={(val) =>
                    handleRecordChange(index, "second_reminder", val)
                  }
                />

                <DatePicker
                  label="Request From"
                  value={record.request_from}
                  onChange={(val) =>
                    handleRecordChange(index, "request_from", val)
                  }
                />
              </div>

              {/* Row 3 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <DatePicker
                  label="Request To"
                  value={record.request_to}
                  onChange={(val) =>
                    handleRecordChange(index, "request_to", val)
                  }
                />

                <SearchableSelect
                  label="Summary Received"
                  options={meta.yes_no_option || []}
                  value={record.summary_received_id}
                  onChange={(val) =>
                    handleRecordChange(index, "summary_received_id", val)
                  }
                  placeholder="Select option"
                />

                <SearchableSelect
                  label="Summary Sent To"
                  options={meta.tracking_summary_sent_to_ab || []}
                  value={record.summary_sent_to_id}
                  onChange={(val) =>
                    handleRecordChange(index, "summary_sent_to_id", val)
                  }
                  placeholder="Select recipient"
                />
              </div>

              {/* Row 4 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label className="text-foreground font-medium">
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

                <SearchableSelect
                  label="Invoice Status"
                  options={meta.tracking_invoice_status || []}
                  value={record.invoice_status_id}
                  onChange={(val) =>
                    handleRecordChange(index, "invoice_status_id", val)
                  }
                  placeholder="Select status"
                />
              </div>

              {/* Note */}
              <div className="space-y-2">
                <Label className="text-foreground font-medium">Note</Label>
                <Textarea
                  value={record.note}
                  onChange={(e) =>
                    handleRecordChange(index, "note", e.target.value)
                  }
                  placeholder="Add notes..."
                  rows={3}
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
