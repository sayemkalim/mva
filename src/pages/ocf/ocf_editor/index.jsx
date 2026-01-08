import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
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

import { Navbar2 } from "@/components/navbar2";
import { fetchOcfBySlug } from "../helpers/fetchOcfBySlug";
import { createOcf } from "../helpers/createOcf";
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

export default function OcfPage() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const {
    data: metaResponse,
    isLoading: loadingMeta,
    isError: metaError,
    error: metaErrorObj,
  } = useQuery({
    queryKey: ["ocfMeta"],
    queryFn: getABMeta,
    staleTime: 300000,
  });

  const meta = metaResponse?.response || {};

  const { data: ocfData, isLoading: loadingOcf } = useQuery({
    queryKey: ["ocf", slug],
    queryFn: () => fetchOcfBySlug(slug),
    enabled: !!slug,
  });

  const saveMutation = useMutation({
    mutationFn: createOcf,
    onSuccess: () => {
      toast.success("OCF data saved successfully!");
      // navigate("/dashboard/workstation");
    },
    onError: () => {
      toast.error("Failed to save OCF data");
    },
  });

  const [formData, setFormData] = useState({
    ocf_1_id: "",
    ocf_2_id: "",
    ocf_3_id: "",
    ocf_5_id: "",
    ocf_6_id: "",
    ocf_10_id: "",
  });

  useEffect(() => {
    if (ocfData) {
      setFormData({
        ocf_1_id: ocfData.ocf_1_id || "",
        ocf_2_id: ocfData.ocf_2_id || "",
        ocf_3_id: ocfData.ocf_3_id || "",
        ocf_5_id: ocfData.ocf_5_id || "",
        ocf_6_id: ocfData.ocf_6_id || "",
        ocf_10_id: ocfData.ocf_10_id || "",
      });
    }
  }, [ocfData]);

  const handleSelectChange = (name, val) => {
    setFormData((prev) => ({
      ...prev,
      [name]: val,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    saveMutation.mutate({ slug, data: formData });
  };

  if (loadingMeta || loadingOcf) {
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
          <span className="text-foreground font-medium">OCF Tracking</span>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-8 max-w-7xl">
        <h1 className="text-2xl font-bold mb-6 text-foreground">
          OCF Tracking Form
        </h1>
        <form
          className="bg-card rounded-lg shadow-sm border p-8 space-y-8"
          onSubmit={handleSubmit}
        >
          {/* Grid with 3 columns: 1 on mobile, 2 on tablet, 3 on desktop */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* OCF-1 */}
            <SearchableSelect
              label="OCF-1"
              options={meta.tracking_ocf || []}
              value={formData.ocf_1_id}
              onChange={(val) => handleSelectChange("ocf_1_id", val)}
              placeholder="Select OCF-1 status"
            />

            {/* OCF-2 */}
            <SearchableSelect
              label="OCF-2"
              options={meta.tracking_ocf || []}
              value={formData.ocf_2_id}
              onChange={(val) => handleSelectChange("ocf_2_id", val)}
              placeholder="Select OCF-2 status"
            />

            {/* OCF-3 */}
            <SearchableSelect
              label="OCF-3"
              options={meta.tracking_ocf || []}
              value={formData.ocf_3_id}
              onChange={(val) => handleSelectChange("ocf_3_id", val)}
              placeholder="Select OCF-3 status"
            />

            {/* OCF-5 */}
            <SearchableSelect
              label="OCF-5"
              options={meta.tracking_ocf || []}
              value={formData.ocf_5_id}
              onChange={(val) => handleSelectChange("ocf_5_id", val)}
              placeholder="Select OCF-5 status"
            />

            {/* OCF-6 */}
            <SearchableSelect
              label="OCF-6"
              options={meta.tracking_ocf || []}
              value={formData.ocf_6_id}
              onChange={(val) => handleSelectChange("ocf_6_id", val)}
              placeholder="Select OCF-6 status"
            />

            {/* OCF-10 */}
            <SearchableSelect
              label="OCF-10"
              options={meta.tracking_ocf || []}
              value={formData.ocf_10_id}
              onChange={(val) => handleSelectChange("ocf_10_id", val)}
              placeholder="Select OCF-10 status"
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
                "Save OCF Data"
              )}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
