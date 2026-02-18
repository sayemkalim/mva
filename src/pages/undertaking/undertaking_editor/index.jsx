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
  CommandList,
} from "@/components/ui/command";
import { Loader2, ChevronRight, Check } from "lucide-react";
import { toast } from "sonner";
import { getABMeta } from "../helpers/fetchABMeta";
import { createUndertaking } from "../helpers/createUndertaking";
import { fetchUndertakingBySlug } from "../helpers/fetchUndertakingBySlug";
import { Navbar2 } from "@/components/navbar2";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import Billing from "@/components/billing";

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
            <CommandList>
              <CommandEmpty>No options found.</CommandEmpty>
              <CommandGroup className="max-h-64 overflow-auto">
                <CommandItem
                  onSelect={() => {
                    onChange("");
                    setOpen(false);
                  }}
                  className="cursor-pointer italic text-muted-foreground"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      !value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  None
                </CommandItem>
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
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default function UndertakingPage() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const {
    data: metaResponse,
    isLoading: loadingMeta,
    isError: metaError,
    error: metaErrObj,
  } = useQuery({
    queryKey: ["undertakingMeta"],
    queryFn: getABMeta,
    staleTime: 300000,
  });

  const meta = metaResponse?.response || metaResponse || {};

  const { data: undertakingData, isLoading: loadingUndertaking } = useQuery({
    queryKey: ["undertakingData", slug],
    queryFn: () => fetchUndertakingBySlug(slug),
    enabled: !!slug,
  });

  const mutation = useMutation({
    mutationFn: (data) => createUndertaking({ slug, data }),
    onSuccess: () => {
      toast.success("Undertaking information saved successfully!");
      // navigate("/dashboard/workstation");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to save undertaking data");
    },
  });

  const [formData, setFormData] = useState({
    undertakings_to_be_fulfilled_id: "",
    deadline: "",
    informed_client_id: "",
    undertakings_request_from_tps_counsel: "",
  });

  useEffect(() => {
    if (undertakingData) {
      setFormData({
        undertakings_to_be_fulfilled_id:
          undertakingData.undertakings_to_be_fulfilled_id || "",
        deadline: undertakingData.deadline
          ? undertakingData.deadline.split("T")[0]
          : "",
        informed_client_id: undertakingData.informed_client_id || "",
        undertakings_request_from_tps_counsel:
          undertakingData.undertakings_request_from_tps_counsel
            ? undertakingData.undertakings_request_from_tps_counsel.split(
              "T"
            )[0]
            : "",
      });
    }
  }, [undertakingData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => {
      const finalValue = String(prev[name]) === String(value) ? "" : value;
      return { ...prev, [name]: finalValue };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  if (loadingMeta || loadingUndertaking) {
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

  return (
    <div className="min-h-screen bg-muted">
      <Navbar2 />

      <Billing />

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
          <span className="text-foreground font-medium">Undertaking</span>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-6xl">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-foreground">
          Undertaking
        </h1>

        <form
          className="bg-card rounded-lg shadow-sm border p-6 sm:p-8 space-y-6"
          onSubmit={handleSubmit}
        >
          {/* Undertaking Information */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Undertaking Information
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SearchableSelect
                label="Undertakings to be Fulfilled"
                options={meta.yes_no_option || []}
                value={formData.undertakings_to_be_fulfilled_id}
                onChange={(val) =>
                  handleSelectChange("undertakings_to_be_fulfilled_id", val)
                }
                placeholder="Select option"
              />

              <div className="space-y-2">
                <Label className="text-foreground font-medium">Deadline</Label>
                <Input
                  type="date"
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleChange}
                  className="h-11"
                />
              </div>
            </div>
          </div>

          {/* Client Information */}
          <div className="pt-6 border-t">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Client Information
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SearchableSelect
                label="Informed Client"
                options={meta.yes_no_option || []}
                value={formData.informed_client_id}
                onChange={(val) =>
                  handleSelectChange("informed_client_id", val)
                }
                placeholder="Select option"
              />
            </div>
          </div>

          {/* Third Party Counsel */}
          <div className="pt-6 border-t">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Third Party Counsel Request
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-foreground font-medium">
                  Undertakings Request from TP's Counsel
                </Label>
                <Input
                  type="date"
                  name="undertakings_request_from_tps_counsel"
                  value={formData.undertakings_request_from_tps_counsel}
                  onChange={handleChange}
                  className="h-11"
                />
              </div>
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
              disabled={mutation.isLoading}
              className="w-full sm:w-auto"
            >
              {mutation.isLoading ? "Saving..." : "Save Undertaking"}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
