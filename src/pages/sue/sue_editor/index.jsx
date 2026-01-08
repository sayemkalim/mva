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
import { fetchSueBySlug } from "../helpers/fetchSueBySlug";
import { createSue } from "../helpers/createSue";
import { deleteSue } from "../helpers/deleteSue";
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

export default function SuePage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    data: metaResponse,
    isLoading: loadingMeta,
    isError: metaError,
    error: metaErrorObj,
  } = useQuery({
    queryKey: ["sueMeta"],
    queryFn: getABMeta,
    staleTime: 300000,
  });

  const meta = metaResponse?.response || {};

  const { data: sueResponse, isLoading: loadingSue } = useQuery({
    queryKey: ["sue", slug],
    queryFn: () => fetchSueBySlug(slug),
    enabled: !!slug,
  });

  const sueData = sueResponse?.response || sueResponse || [];

  const saveMutation = useMutation({
    mutationFn: createSue,
    onSuccess: () => {
      toast.success("Sue data saved successfully!");
      queryClient.invalidateQueries(["sue", slug]);
    },
    onError: () => {
      toast.error("Failed to save Sue data");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSue,
    onSuccess: () => {
      toast.success("Record deleted successfully!");
      queryClient.invalidateQueries(["sue", slug]);
    },
    onError: () => {
      toast.error("Failed to delete record");
    },
  });

  const [records, setRecords] = useState([
    {
      id: null,
      status_id: "",
      name: "",
      issued: "",
      via_id: "",
    },
  ]);

  useEffect(() => {
    if (sueData && Array.isArray(sueData) && sueData.length > 0) {
      setRecords(sueData);
    }
  }, [sueData]);

  const handleAddRecord = () => {
    setRecords([
      ...records,
      {
        id: null,
        status_id: "",
        name: "",
        issued: "",
        via_id: "",
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
              status_id: "",
              name: "",
              issued: "",
              via_id: "",
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

  if (loadingMeta || loadingSue) {
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
          <span className="text-foreground font-medium">Sue</span>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-8 max-w-7xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-foreground">Sue</h1>
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

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <SearchableSelect
                  label="Status"
                  options={meta.tracking_status || []}
                  value={record.status_id}
                  onChange={(val) =>
                    handleRecordChange(index, "status_id", val)
                  }
                  placeholder="Select status"
                />

                <div className="space-y-2">
                  <Label className="text-foreground font-medium">Name</Label>
                  <Input
                    type="text"
                    value={record.name}
                    onChange={(e) =>
                      handleRecordChange(index, "name", e.target.value)
                    }
                    placeholder="Enter name"
                    className="h-11"
                  />
                </div>

                <DatePicker
                  label="Issued"
                  value={record.issued}
                  onChange={(val) => handleRecordChange(index, "issued", val)}
                />

                <SearchableSelect
                  label="Via"
                  options={meta.tracking_via || []}
                  value={record.via_id}
                  onChange={(val) => handleRecordChange(index, "via_id", val)}
                  placeholder="Select via method"
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
