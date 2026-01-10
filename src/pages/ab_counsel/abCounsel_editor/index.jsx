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
import { Loader2, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { getABMeta } from "../helpers/fetchABMeta";
import { fetchAbCounselBySlug } from "../helpers/fetchAbCounselBySlug";
import { createAbCounsel } from "../helpers/createAbCounsel";
import { Textarea } from "@/components/ui/textarea";
import { Navbar2 } from "@/components/navbar2";
import { formatPhoneNumber } from "@/lib/utils";
import Billing from "@/components/billing";

const SearchableSelect = ({ label, options, value, onChange, placeholder }) => {
  const selected = options.find((opt) => String(opt.id) === String(value));
  return (
    <div className="space-y-2 max-w-sm">
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

export default function AbCounselPage() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const {
    data: metaResponse,
    isLoading: loadingMeta,
    isError: metaError,
    error: metaErrorObj,
  } = useQuery({
    queryKey: ["counselMeta"],
    queryFn: getABMeta,
    staleTime: 300000,
  });

  const meta = metaResponse?.response || {};

  const { data: counselData, isLoading: loadingCounsel } = useQuery({
    queryKey: ["abCounsel", slug],
    queryFn: () => fetchAbCounselBySlug(slug),
    enabled: !!slug,
  });

  const saveMutation = useMutation({
    mutationFn: createAbCounsel,
    onSuccess: () => {
      toast.success("Counsel data saved!");
      // navigate("/dashboard/workstation");
    },
    onError: () => {
      toast.error("Failed to save counsel data");
    },
  });

  const [formData, setFormData] = useState({
    firm_name: "",
    address: {
      unit_number: "",
      street_number: "",
      street_name: "",
      city: "",
      province: "",
      postal_code: "",
      country: "",
    },
    telephone: "",
    ext: "",
    fax: "",
    email: "",
    type_id: "",
    telephone_2nd: "",
    ext_2nd: "",
    fax_2nd: "",
    email_2nd: "",
    note: "",
  });

  useEffect(() => {
    if (counselData) {
      setFormData({
        firm_name: counselData.firm_name || "",
        address: {
          unit_number: counselData.address?.unit_number || "",
          street_number: counselData.address?.street_number || "",
          street_name: counselData.address?.street_name || "",
          city: counselData.address?.city || "",
          province: counselData.address?.province || "",
          postal_code: counselData.address?.postal_code || "",
          country: counselData.address?.country || "",
        },
        telephone: counselData.telephone || "",
        ext: counselData.ext || "",
        fax: counselData.fax || "",
        email: counselData.email || "",
        type_id: counselData.type_id || "",
        telephone_2nd: counselData.telephone_2nd || "",
        ext_2nd: counselData.ext_2nd || "",
        fax_2nd: counselData.fax_2nd || "",
        email_2nd: counselData.email_2nd || "",
        note: counselData.note || "",
      });
    }
  }, [counselData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith("address.")) {
      const key = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [key]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

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

  if (loadingMeta || loadingCounsel) {
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
     <Billing/>

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
          <span className="text-foreground font-medium">Counsel</span>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-8 max-w-7xl">
        <h1 className="text-2xl font-bold mb-6 text-foreground">
          Counsel Information
        </h1>
        <form
          className="bg-card rounded-lg shadow-sm border p-8 space-y-8"
          onSubmit={handleSubmit}
        >
          {/* Firm Name */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
            <Label className="md:col-span-1">Firm Name</Label>
            <Input
              name="firm_name"
              value={formData.firm_name}
              onChange={handleInputChange}
              placeholder="Firm Name"
              className="md:col-span-3"
            />
          </div>

          {/* Address Fields */}
          <div className="grid grid-cols-1 md:grid-cols-7 gap-6">
            <div className="space-y-2">
              <Label>Unit Number</Label>
              <Input
                name="address.unit_number"
                value={formData.address.unit_number}
                onChange={handleInputChange}
                placeholder="Unit Number"
              />
            </div>
            <div className="space-y-2">
              <Label>Street Number</Label>
              <Input
                name="address.street_number"
                value={formData.address.street_number}
                onChange={handleInputChange}
                placeholder="Street Number"
              />
            </div>
            <div className="space-y-2">
              <Label>Street Name</Label>
              <Input
                name="address.street_name"
                value={formData.address.street_name}
                onChange={handleInputChange}
                placeholder="Street Name"
              />
            </div>
            <div className="space-y-2">
              <Label>City</Label>
              <Input
                name="address.city"
                value={formData.address.city}
                onChange={handleInputChange}
                placeholder="City"
              />
            </div>
            <div className="space-y-2">
              <Label>Province</Label>
              <Input
                name="address.province"
                value={formData.address.province}
                onChange={handleInputChange}
                placeholder="Province"
              />
            </div>
            <div className="space-y-2">
              <Label>Postal Code</Label>
              <Input
                name="address.postal_code"
                value={formData.address.postal_code}
                onChange={handleInputChange}
                placeholder="Postal Code"
              />
            </div>
            <div className="space-y-2">
              <Label>Country</Label>
              <Input
                name="address.country"
                value={formData.address.country}
                onChange={handleInputChange}
                placeholder="Country"
              />
            </div>
          </div>

          {/* Primary Contact Details */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <Label>Telephone</Label>
              <Input
                name="telephone"
                value={formData.telephone}
                onChange={(e) => setFormData(prev => ({ ...prev, telephone: formatPhoneNumber(e.target.value) }))}
                placeholder="(888) 888-8888"
              />
            </div>
            <div className="space-y-2">
              <Label>Ext</Label>
              <Input
                name="ext"
                value={formData.ext}
                onChange={handleInputChange}
                placeholder="Ext"
              />
            </div>
            <div className="space-y-2">
              <Label>Fax</Label>
              <Input
                name="fax"
                value={formData.fax}
                onChange={(e) => setFormData(prev => ({ ...prev, fax: formatPhoneNumber(e.target.value) }))}
                placeholder="(888) 888-8888"
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Email"
              />
            </div>
          </div>

          {/* Secondary Contact Details */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <Label>Telephone 2nd</Label>
              <Input
                name="telephone_2nd"
                value={formData.telephone_2nd}
                onChange={(e) => setFormData(prev => ({ ...prev, telephone_2nd: formatPhoneNumber(e.target.value) }))}
                placeholder="(888) 888-8888"
              />
            </div>
            <div className="space-y-2">
              <Label>Ext 2nd</Label>
              <Input
                name="ext_2nd"
                value={formData.ext_2nd}
                onChange={handleInputChange}
                placeholder="Ext 2nd"
              />
            </div>
            <div className="space-y-2">
              <Label>Fax 2nd</Label>
              <Input
                name="fax_2nd"
                value={formData.fax_2nd}
                onChange={(e) => setFormData(prev => ({ ...prev, fax_2nd: formatPhoneNumber(e.target.value) }))}
                placeholder="(888) 888-8888"
              />
            </div>
            <div className="space-y-2">
              <Label>Email 2nd</Label>
              <Input
                name="email_2nd"
                value={formData.email_2nd}
                onChange={handleInputChange}
                placeholder="Email 2nd"
              />
            </div>
          </div>

          {/* Type Selector */}
          <div className="max-w-sm">
            <SearchableSelect
              label="Type"
              options={meta.insurance_role_type || []}
              value={formData.type_id}
              onChange={(val) => handleSelectChange("type_id", val)}
              placeholder="Select type"
            />
          </div>

          {/* Note */}
          <div className="space-y-2 max-w-3xl">
            <Label>Note</Label>
            <Textarea
              name="note"
              value={formData.note}
              onChange={handleInputChange}
              placeholder="Add note if any..."
              rows={4}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              type="button"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saveMutation.isLoading}>
              {saveMutation.isLoading ? "Saving..." : "Save Counsel"}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
