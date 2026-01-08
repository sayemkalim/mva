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
import { Loader2, ChevronRight, Check } from "lucide-react";
import { toast } from "sonner";
import { getABMeta } from "../helpers/fetchABMeta";
import { Navbar2 } from "@/components/navbar2";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { fetchStatementBySlug } from "../helpers/fetchStatementBySlug";
import { createStatement } from "../helpers/createStatement";

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const SearchableSelect = ({ label, options, value, onChange, placeholder }) => {
  const [open, setOpen] = useState(false);
  const selected = options?.find((opt) => String(opt.id) === String(value));

  return (
    <div className="space-y-2">
      <Label className="text-foreground font-medium">{label}</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
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
            <CommandGroup className="max-h-64 overflow-auto">
              {options?.map((opt) => (
                <CommandItem
                  key={opt.id}
                  value={opt.name}
                  onSelect={() => {
                    onChange(opt.id);
                    setOpen(false);
                  }}
                  className="cursor-pointer"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      String(value) === String(opt.id)
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
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

export default function StatementOfDefencePage() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const {
    data: metaResponse,
    isLoading: loadingMeta,
    isError: metaError,
    error: metaErrObj,
  } = useQuery({
    queryKey: ["sodMeta"],
    queryFn: getABMeta,
    staleTime: 300000,
  });

  const meta = metaResponse?.response || metaResponse || {};

  const { data: sodData, isLoading: loadingSod } = useQuery({
    queryKey: ["sodData", slug],
    queryFn: () => fetchStatementBySlug(slug),
    enabled: !!slug,
  });

  const mutation = useMutation({
    mutationFn: (data) => createStatement({ slug, data }),
    onSuccess: () => {
      toast.success("Statement of Defence saved successfully!");
      // navigate("/dashboard/workstation");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to save SOD data");
    },
  });

  const [formData, setFormData] = useState({
    received_sod_id: "",
    date: "",
    file_default_judgment: "",
  });

  useEffect(() => {
    if (sodData) {
      setFormData({
        received_sod_id: sodData.received_sod_id || "",
        date: sodData.date || "",
        file_default_judgment: sodData.file_default_judgment || "",
      });
    }
  }, [sodData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => {
      const newData = { ...prev, [name]: value };

      // Clear conditional fields when received_sod_id changes
      if (name === "received_sod_id") {
        newData.sod_date = "";
        newData.file_default_judgment = "";
      }

      return newData;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  if (loadingMeta || loadingSod) {
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
        Failed to load metadata: {metaErrObj?.message || "Unknown error"}
      </div>
    );
  }

  const selectedOption = meta.yes_no_option?.find(
    (opt) => String(opt.id) === String(formData.received_sod_id)
  );
  const isReceivedSodYes = selectedOption?.name?.toLowerCase() === "yes";
  const isReceivedSodNo = selectedOption?.name?.toLowerCase() === "no";

  return (
    <div className="min-h-screen bg-muted">
      <Navbar2 />

      {/* Financial Summary Header */}
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

      {/* Breadcrumb Navigation */}
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
            Statement of Defence
          </span>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-6xl">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-foreground">
          Statement of Defence (SOD)
        </h1>

        <form
          className="bg-card rounded-lg shadow-sm border p-6 sm:p-8 space-y-6"
          onSubmit={handleSubmit}
        >
          {/* Basic SOD Information */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Basic Information
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SearchableSelect
                label="Received SOD"
                options={meta.yes_no_option || []}
                value={formData.received_sod_id}
                onChange={(val) => handleSelectChange("received_sod_id", val)}
                placeholder="Select option"
              />

              {/* Conditional rendering based on Received SOD selection */}
              {isReceivedSodYes && (
                <div className="space-y-2">
                  <Label className="text-foreground font-medium">Date</Label>
                  <Input
                    type="date"
                    name="sod_date"
                    value={formData.date}
                    onChange={handleChange}
                    className="h-11"
                  />
                </div>
              )}

              {isReceivedSodNo && (
                <div className="space-y-2">
                  <Label className="text-foreground font-medium">
                    File Default Judgment
                  </Label>
                  <Input
                    name="file_default_judgment"
                    value={formData.file_default_judgment}
                    onChange={handleChange}
                    placeholder="Enter name or details"
                    className="h-11"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t">
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              type="button"
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={mutation.isPending}
              className="w-full sm:w-auto"
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save SOD"
              )}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
