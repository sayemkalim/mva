import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";

import { ChevronRight, Loader2, Check, ChevronsUpDown } from "lucide-react";
import { toast } from "sonner";
import { Navbar2 } from "@/components/navbar2";

import { getABMeta } from "../helpers/fetchABMeta";
import { fetchDriverInfoBySlug } from "../helpers/fetchDriverInfoBySlug";
import { createDriverInfo } from "../helpers/createDriverInfo";
import Billing from "@/components/billing";
function SearchableDropdown({
  label = "",
  placeholder = "Select...",
  options = [],
  value,
  onChange,
}) {
  const [open, setOpen] = useState(false);

  const selected =
    (options || []).find((o) => String(o.id) === String(value)) || null;

  return (
    <div className="space-y-2">
      {label && <label className="text-foreground font-medium">{label}</label>}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            type="button"
            className="justify-between w-full"
          >
            {selected ? selected.name : placeholder}
            <ChevronsUpDown className="w-4 h-4 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-[300px] p-0">
          <Command>
            <CommandInput placeholder="Search..." />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup>
                {(options || []).map((option) => (
                  <CommandItem
                    key={option.id}
                    value={option.name}
                    onSelect={() => {
                      const newVal = String(option.id) === String(value) ? "" : option.id;
                      onChange(newVal);
                      setOpen(false);
                    }}
                    className="cursor-pointer"
                  >
                    <Check
                      className={`mr-2 w-5 h-5 ${String(option.id) === String(value)
                        ? "opacity-100"
                        : "opacity-0"
                        }`}
                    />
                    {option.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

// ---------------- Form Setup ----------------
const emptyAddress = {
  unit_number: "",
  street_number: "",
  street_name: "",
  city: "",
  province: "",
  postal_code: "",
  country: "", // no default here
};

const emptyForm = {
  policy_holder_same_as_applican: true,
  policy_holder_name: "",
  conflict_search: "",
  address: { ...emptyAddress },
  drivers_licence_state: "",
  drivers_licence_number: "",
  drivers_licence_expiry_date: "",
  driver_location_id: "",
  dl_searched_date: "",
  same_as_above: true,
  address_2nd: { ...emptyAddress },
};

export default function DriverInfoForm() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(emptyForm);

  // -------- META QUERY ----------
  const {
    data: metaRaw,
    isLoading: loadingMeta,
    error: metaError,
  } = useQuery({
    queryKey: ["abMeta"],
    queryFn: getABMeta,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
  const metadata = metaRaw?.response ?? metaRaw?.data ?? metaRaw ?? {};

  const yesNoOptions = metadata?.yes_no_option || [];
  const driverLocationOptions =
    metadata?.driver_information_driver_location || [];

  // -------- DRIVER INFO FETCH ----------
  const {
    data: driverRaw,
    isLoading: loadingDriver,
    error: fetchError,
  } = useQuery({
    queryKey: ["driverInfo", slug],
    queryFn: () => fetchDriverInfoBySlug(slug),
    enabled: !!slug,
    onError: (err) =>
      toast.error(err?.message || "Failed to fetch driver information"),
  });
  const fetchedDriver =
    driverRaw?.response ?? driverRaw?.data ?? driverRaw ?? null;

  // -------- PREFILL FORM ----------
  useEffect(() => {
    if (!fetchedDriver) return;

    setForm((prev) => ({
      ...prev,
      policy_holder_same_as_applican:
        !!fetchedDriver.policy_holder_same_as_applican,
      policy_holder_name: fetchedDriver.policy_holder_name || "",
      conflict_search: fetchedDriver.conflict_search || "",
      address: {
        ...emptyAddress,
        ...(fetchedDriver.address || {}),
      },
      drivers_licence_state: fetchedDriver.drivers_licence_state || "",
      drivers_licence_number: fetchedDriver.drivers_licence_number || "",
      drivers_licence_expiry_date:
        fetchedDriver.drivers_licence_expiry_date || "",
      driver_location_id: fetchedDriver.driver_location_id ?? "",
      dl_searched_date: fetchedDriver.dl_searched_date || "",
      same_as_above:
        typeof fetchedDriver.same_as_above === "boolean"
          ? fetchedDriver.same_as_above
          : !!fetchedDriver.same_as_above,
      address_2nd: {
        ...emptyAddress,
        ...(fetchedDriver.address_2nd || {}),
      },
    }));
  }, [fetchedDriver]);

  // -------- HELPERS ----------
  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateAddressField = (which, key, value) => {
    setForm((prev) => ({
      ...prev,
      [which]: {
        ...prev[which],
        [key]: value,
      },
    }));
  };

  const normalizeAddress = (addr) => {
    const merged = { ...emptyAddress, ...(addr || {}) };

    // final fallback only at submit time so DB NOT NULL passes
    if (!merged.country) {
      merged.country = "Canada";
    }

    return merged;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.driver_location_id) {
      toast.error("Please select Driver Location.");
      return;
    }

    const primaryAddress = normalizeAddress(form.address);
    const mailingAddress =
      !form.policy_holder_same_as_applican && !form.same_as_above
        ? normalizeAddress(form.address_2nd)
        : primaryAddress;

    const payload = {
      ...form,
      address: primaryAddress,
      address_2nd: mailingAddress,
    };

    createMutation.mutate(payload);
  };
  const createMutation = useMutation({
    mutationFn: (payload) => createDriverInfo({ slug, data: payload }),
    onSuccess: (data) => {
      const resp = data?.response;
      if (resp?.Apistatus === false) {
        toast.error(resp?.message || "Validation failed");
        return;
      }
      toast.success(resp?.message || "Driver information saved successfully!");
    },
    onError: (error) => {
      console.error("Mutation Error:", error);
      const errorData = error.response?.data;
      if (errorData?.Apistatus === false) {
        toast.error(errorData?.message || "Validation failed");
      } else {
        toast.error(errorData?.message || "Failed to save driver information");
      }
    },
  });
  if (loadingDriver || loadingMeta) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading driver info...</span>
      </div>
    );
  }

  if (fetchError || metaError) {
    return (
      <div className="text-red-600 p-4">
        {fetchError && (
          <div>Error loading driver info: {fetchError.message}</div>
        )}
        {metaError && <div>Error loading meta: {metaError.message}</div>}
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-muted">
      <Navbar2 />
      <Billing />
      {/* Breadcrumb */}
      <div className="bg-card border-b px-6 py-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <button
            onClick={() => navigate("/dashboard")}
            className="hover:text-foreground transition"
          >
            Dashboard
          </button>
          <ChevronRight className="w-4 h-4" />
          <button
            onClick={() => navigate("/dashboard/workstation")}
            className="hover:text-foreground transition"
          >
            Workstation
          </button>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground font-medium">Driver Information</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        <div className="bg-card rounded-lg shadow-sm border p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            <h2 className="text-3xl font-extrabold text-foreground mb-4">
              Driver Information
            </h2>

            {/* Policy holder same as applicant (checkbox) */}
            <div className="border rounded-2xl p-6  space-y-4">
              <div className="flex items-center gap-3">
                <input
                  id="policy_same_yes"
                  type="checkbox"
                  className="h-4 w-4"
                  checked={form.policy_holder_same_as_applican}
                  onChange={(e) =>
                    updateField(
                      "policy_holder_same_as_applican",
                      e.target.checked
                    )
                  }
                />
                <Label htmlFor="policy_same_yes" className="font-medium">
                  Policy holder same as Driver                </Label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                {!form.policy_holder_same_as_applican && (
                  <div className="space-y-2">
                    <Label htmlFor="policy_holder_name">Name</Label>
                    <Input
                      id="policy_holder_name"
                      placeholder="Name"
                      value={form.policy_holder_name || ""}
                      onChange={(e) =>
                        updateField("policy_holder_name", e.target.value)
                      }
                      className="h-9 bg-muted border-input"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="conflict_search">Conflict Search Date</Label>
                  <Input
                    id="conflict_search"
                    type="date"
                    value={form.conflict_search || ""}
                    onChange={(e) =>
                      updateField("conflict_search", e.target.value)
                    }
                    className="h-9 bg-muted border-input"
                  />
                </div>
              </div>
            </div>

            {/* Primary Address */}
            <div className="border rounded-2xl p-6  space-y-4">
              <h3 className="text-xl font-bold text-foreground">
                Primary Address
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="unit_number_1">Unit Number</Label>
                  <Input
                    id="unit_number_1"
                    value={form.address.unit_number}
                    onChange={(e) =>
                      updateAddressField(
                        "address",
                        "unit_number",
                        e.target.value
                      )
                    }
                    className="h-9 bg-muted border-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="street_number_1">Street Number</Label>
                  <Input
                    id="street_number_1"
                    value={form.address.street_number}
                    onChange={(e) =>
                      updateAddressField(
                        "address",
                        "street_number",
                        e.target.value
                      )
                    }
                    className="h-9 bg-muted border-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="street_name_1">Street Name</Label>
                  <Input
                    id="street_name_1"
                    value={form.address.street_name}
                    onChange={(e) =>
                      updateAddressField(
                        "address",
                        "street_name",
                        e.target.value
                      )
                    }
                    className="h-9 bg-muted border-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city_1">City</Label>
                  <Input
                    id="city_1"
                    value={form.address.city}
                    onChange={(e) =>
                      updateAddressField("address", "city", e.target.value)
                    }
                    className="h-9 bg-muted border-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="province_1">Province</Label>
                  <Input
                    id="province_1"
                    value={form.address.province}
                    onChange={(e) =>
                      updateAddressField("address", "province", e.target.value)
                    }
                    className="h-9 bg-muted border-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postal_code_1">Postal Code</Label>
                  <Input
                    id="postal_code_1"
                    value={form.address.postal_code}
                    onChange={(e) =>
                      updateAddressField(
                        "address",
                        "postal_code",
                        e.target.value
                      )
                    }
                    className="h-9 bg-muted border-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country_1">Country</Label>
                  <Input
                    id="country_1"
                    value={form.address.country}
                    onChange={(e) =>
                      updateAddressField("address", "country", e.target.value)
                    }
                    className="h-9 bg-muted border-input"
                  />
                </div>
              </div>
            </div>

            {/* Licence + Driver location */}
            <div className="border rounded-2xl p-6  space-y-4">
              <h3 className="text-xl font-bold text-foreground">
                Driver Licence & Location
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="drivers_licence_state">
                    Driver's Licence State
                  </Label>
                  <Input
                    id="drivers_licence_state"
                    value={form.drivers_licence_state}
                    onChange={(e) =>
                      updateField("drivers_licence_state", e.target.value)
                    }
                    className="h-9 bg-muted border-input"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="drivers_licence_number">
                    Driver's Licence Number
                  </Label>
                  <Input
                    id="drivers_licence_number"
                    value={form.drivers_licence_number}
                    onChange={(e) =>
                      updateField("drivers_licence_number", e.target.value)
                    }
                    className="h-9 bg-muted border-input"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="drivers_licence_expiry_date">
                    Licence Expiry Date
                  </Label>
                  <Input
                    id="drivers_licence_expiry_date"
                    type="date"
                    value={form.drivers_licence_expiry_date || ""}
                    onChange={(e) =>
                      updateField("drivers_licence_expiry_date", e.target.value)
                    }
                    className="h-9 bg-muted border-input"
                  />
                </div>

                <SearchableDropdown
                  label="Driver Location"
                  placeholder="Select Driver Location"
                  options={driverLocationOptions}
                  value={form.driver_location_id}
                  onChange={(val) => updateField("driver_location_id", val)}
                />

                <div className="space-y-2">
                  <Label htmlFor="dl_searched_date">DL Search Date</Label>
                  <Input
                    id="dl_searched_date"
                    type="date"
                    value={form.dl_searched_date || ""}
                    onChange={(e) =>
                      updateField("dl_searched_date", e.target.value)
                    }
                    className="h-9 bg-muted border-input"
                  />
                </div>
              </div>
            </div>

            {/* Mailing Address same as above */}
            <div className="border rounded-2xl p-6  space-y-4">
              <div className="flex items-center gap-3">
                <input
                  id="same_as_above"
                  type="checkbox"
                  className="h-4 w-4"
                  checked={form.same_as_above}
                  onChange={(e) =>
                    updateField("same_as_above", e.target.checked)
                  }
                />
                <Label htmlFor="same_as_above" className="font-medium">
                  Mailing Address same as above
                </Label>
              </div>

              {!form.same_as_above && (
                <>
                  <h3 className="text-xl font-bold text-foreground mt-4">
                    Second Address
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="unit_number_2">Unit Number</Label>
                      <Input
                        id="unit_number_2"
                        value={form.address_2nd.unit_number}
                        onChange={(e) =>
                          updateAddressField(
                            "address_2nd",
                            "unit_number",
                            e.target.value
                          )
                        }
                        className="h-9 bg-muted border-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="street_number_2">Street Number</Label>
                      <Input
                        id="street_number_2"
                        value={form.address_2nd.street_number}
                        onChange={(e) =>
                          updateAddressField(
                            "address_2nd",
                            "street_number",
                            e.target.value
                          )
                        }
                        className="h-9 bg-muted border-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="street_name_2">Street Name</Label>
                      <Input
                        id="street_name_2"
                        value={form.address_2nd.street_name}
                        onChange={(e) =>
                          updateAddressField(
                            "address_2nd",
                            "street_name",
                            e.target.value
                          )
                        }
                        className="h-9 bg-muted border-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city_2">City</Label>
                      <Input
                        id="city_2"
                        value={form.address_2nd.city}
                        onChange={(e) =>
                          updateAddressField(
                            "address_2nd",
                            "city",
                            e.target.value
                          )
                        }
                        className="h-9 bg-muted border-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="province_2">Province</Label>
                      <Input
                        id="province_2"
                        value={form.address_2nd.province}
                        onChange={(e) =>
                          updateAddressField(
                            "address_2nd",
                            "province",
                            e.target.value
                          )
                        }
                        className="h-9 bg-muted border-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="postal_code_2">Postal Code</Label>
                      <Input
                        id="postal_code_2"
                        value={form.address_2nd.postal_code}
                        onChange={(e) =>
                          updateAddressField(
                            "address_2nd",
                            "postal_code",
                            e.target.value
                          )
                        }
                        className="h-9 bg-muted border-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country_2">Country</Label>
                      <Input
                        id="country_2"
                        value={form.address_2nd.country}
                        onChange={(e) =>
                          updateAddressField(
                            "address_2nd",
                            "country",
                            e.target.value
                          )
                        }
                        className="h-9 bg-muted border-input"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            <Button type="submit" size="lg" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
