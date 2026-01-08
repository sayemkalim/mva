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

import {
  ChevronRight,
  Loader2,
  Check,
  ChevronsUpDown,
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Navbar2 } from "@/components/navbar2";
import { getABMeta } from "../helpers/fetchABMeta";
import { createOwnerInfo } from "../helpers/createOwnerInfo";
import { fetchTpOwnerInfoBySlug } from "../helpers/fetchTpOwnerInfoBySlug";
import { deleteOwnerInfo } from "../helpers/deleteOwnerInfo";
import { deleteOwnerDirector } from "../helpers/deleteOwnerDirector";
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
                      onChange(option.id);
                      setOpen(false);
                    }}
                    className="cursor-pointer"
                  >
                    <Check
                      className={`mr-2 w-5 h-5 ${
                        String(option.id) === String(value)
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

const emptyAddress = {
  unit_number: "",
  street_number: "",
  street_name: "",
  city: "",
  province: "",
  postal_code: "",
  country: "",
};

const emptyOwner = {
  id: undefined,
  type_of_ownership_id: "",
  name: "",
  conflict_search: "",
  address: { ...emptyAddress },
  drivers_licence_state: "",
  drivers_licence_number: "",
  drivers_licence_expiry_date: "",
  profile_search_id: "",
  profile_search_date: "",
};

const emptyDirector = {
  id: undefined,
  first_name: "",
  last_name: "",
  address: { ...emptyAddress },
};

const emptyForm = {
  OwnerInformation: [{ ...emptyOwner }],
  DirectorInformation: [{ ...emptyDirector }],
};

export default function OwnerInfoForm() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(emptyForm);

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

  const typeOfOwnershipOptions = metadata?.insurance_type_of_ownership || [];
  const profileSearchOptions = metadata?.yes_no_option || [];

  const {
    data: ownerRaw,
    isLoading: loadingOwner,
    error: fetchError,
  } = useQuery({
    queryKey: ["ownerInfo", slug],
    queryFn: () => fetchTpOwnerInfoBySlug(slug),
    enabled: !!slug,
    onError: (err) =>
      toast.error(err?.message || "Failed to fetch owner information"),
  });
  const fetchedOwner = ownerRaw?.response ?? ownerRaw?.data ?? ownerRaw ?? null;

  useEffect(() => {
    if (!fetchedOwner) return;

    const owners =
      Array.isArray(fetchedOwner.OwnerInformation) &&
      fetchedOwner.OwnerInformation.length > 0
        ? fetchedOwner.OwnerInformation.map((o) => ({
            ...emptyOwner,
            ...o,
            address: { ...emptyAddress, ...(o.address || {}) },
          }))
        : [{ ...emptyOwner }];

    const directors =
      Array.isArray(fetchedOwner.DirectorInformation) &&
      fetchedOwner.DirectorInformation.length > 0
        ? fetchedOwner.DirectorInformation.map((d) => ({
            ...emptyDirector,
            ...d,
            address: { ...emptyAddress, ...(d.address || {}) },
          }))
        : [{ ...emptyDirector }];

    setForm({
      OwnerInformation: owners,
      DirectorInformation: directors,
    });
  }, [fetchedOwner]);

  const getOwnershipLabel = (typeId) => {
    const opt = typeOfOwnershipOptions.find(
      (o) => String(o.id) === String(typeId)
    );
    const label = opt?.name?.toLowerCase() || "";

    if (label.includes("individual")) return "Individual Name";
    if (label.includes("corporation") || label.includes("corp"))
      return "Corporation Name";
    return "Name";
  };

  const getProfileDateLabel = (profileId) => {
    const opt = profileSearchOptions.find(
      (o) => String(o.id) === String(profileId)
    );
    const name = opt?.name?.toLowerCase() || "";
    if (name === "no") return "Protected Search Date";
    if (name === "yes") return "Profile Search Date";
    return "Profile Search Date";
  };

  const ownerDeleteMutation = useMutation({
    mutationFn: (id) => deleteOwnerInfo(id),
  });

  const directorDeleteMutation = useMutation({
    mutationFn: (id) => deleteOwnerDirector(id),
  });

  const addOwner = () => {
    setForm((prev) => ({
      ...prev,
      OwnerInformation: [...prev.OwnerInformation, { ...emptyOwner }],
    }));
  };

  const removeOwner = async (index) => {
    const target = form.OwnerInformation[index];
    const id = target?.id;

    if (!id) {
      if (form.OwnerInformation.length === 1) {
        toast.error("At least one owner is required");
        return;
      }
      setForm((prev) => ({
        ...prev,
        OwnerInformation: prev.OwnerInformation.filter((_, i) => i !== index),
      }));
      return;
    }

    if (form.OwnerInformation.length === 1) {
      toast.error("At least one owner is required");
      return;
    }

    ownerDeleteMutation.mutate(id, {
      onSuccess: () => {
        setForm((prev) => ({
          ...prev,
          OwnerInformation: prev.OwnerInformation.filter(
            (item) => item.id !== id
          ),
        }));
        toast.success("Owner deleted successfully");
      },
      onError: (error) => {
        toast.error(error?.message || "Failed to delete owner");
      },
    });
  };

  const updateOwner = (index, field, value) => {
    setForm((prev) => {
      const updated = [...prev.OwnerInformation];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, OwnerInformation: updated };
    });
  };

  const updateOwnerAddress = (index, key, value) => {
    setForm((prev) => {
      const updated = [...prev.OwnerInformation];
      updated[index] = {
        ...updated[index],
        address: { ...updated[index].address, [key]: value },
      };
      return { ...prev, OwnerInformation: updated };
    });
  };

  const addDirector = () => {
    setForm((prev) => ({
      ...prev,
      DirectorInformation: [...prev.DirectorInformation, { ...emptyDirector }],
    }));
  };

  const removeDirector = (index) => {
    const target = form.DirectorInformation[index];
    const id = target?.id;
    if (!id) {
      if (form.DirectorInformation.length === 1) {
        toast.error("At least one director is required");
        return;
      }
      setForm((prev) => ({
        ...prev,
        DirectorInformation: prev.DirectorInformation.filter(
          (_, i) => i !== index
        ),
      }));
      return;
    }

    if (form.DirectorInformation.length === 1) {
      toast.error("At least one director is required");
      return;
    }

    directorDeleteMutation.mutate(id, {
      onSuccess: () => {
        setForm((prev) => ({
          ...prev,
          DirectorInformation: prev.DirectorInformation.filter(
            (item) => item.id !== id
          ),
        }));
        toast.success("Director deleted successfully");
      },
      onError: (error) => {
        toast.error(error?.message || "Failed to delete director");
      },
    });
  };

  const updateDirector = (index, field, value) => {
    setForm((prev) => {
      const updated = [...prev.DirectorInformation];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, DirectorInformation: updated };
    });
  };

  const updateDirectorAddress = (index, key, value) => {
    setForm((prev) => {
      const updated = [...prev.DirectorInformation];
      updated[index] = {
        ...updated[index],
        address: { ...updated[index].address, [key]: value },
      };
      return { ...prev, DirectorInformation: updated };
    });
  };

  const normalizeAddress = (addr) => {
    const merged = { ...emptyAddress, ...(addr || {}) };
    if (!merged.country) merged.country = "Canada";
    return merged;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      OwnerInformation: form.OwnerInformation.map((owner) => ({
        ...owner,
        address: normalizeAddress(owner.address),
      })),
      DirectorInformation: form.DirectorInformation.map((director) => ({
        ...director,
        address: normalizeAddress(director.address),
      })),
    };

    createMutation.mutate(payload);
  };

  const createMutation = useMutation({
    mutationFn: (payload) => createOwnerInfo({ slug, data: payload }),
    onSuccess: () => {
      toast.success("Owner information saved successfully!");
      navigate("/dashboard/workstation");
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to save owner information");
    },
  });

  if (loadingOwner || loadingMeta) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading owner info...</span>
      </div>
    );
  }

  if (fetchError || metaError) {
    return (
      <div className="text-red-600 p-4">
        {fetchError && (
          <div>Error loading owner info: {fetchError.message}</div>
        )}
        {metaError && <div>Error loading meta: {metaError.message}</div>}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted">
      <Navbar2 />

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
          <span className="text-foreground font-medium">Owner Information</span>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-7xl">
        <div className="bg-card rounded-lg shadow-sm border p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            <h2 className="text-3xl font-extrabold text-foreground mb-4">
              Owner Information
            </h2>

            {/* OWNER INFORMATION */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-foreground">Owners</h3>
                <Button
                  type="button"
                  onClick={addOwner}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Add Owner
                </Button>
              </div>

              <div className="space-y-6">
                {form.OwnerInformation.map((owner, index) => (
                  <div
                    key={owner.id ?? index}
                    className="border rounded-2xl p-6 bg-muted space-y-4 relative"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold">
                        Owner {index + 1}
                      </h4>
                      <Button
                        type="button"
                        onClick={() => removeOwner(index)}
                        variant="destructive"
                        size="sm"
                        disabled={ownerDeleteMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <SearchableDropdown
                        label="Type of Ownership"
                        placeholder="Select Ownership Type"
                        options={typeOfOwnershipOptions}
                        value={owner.type_of_ownership_id}
                        onChange={(val) =>
                          updateOwner(index, "type_of_ownership_id", val)
                        }
                      />

                      <div className="space-y-2">
                        <Label>
                          {getOwnershipLabel(owner.type_of_ownership_id)}
                        </Label>
                        <Input
                          value={owner.name}
                          onChange={(e) =>
                            updateOwner(index, "name", e.target.value)
                          }
                          className="h-9 bg-card border-input"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Conflict Search</Label>
                        <Input
                          type="date"
                          value={owner.conflict_search || ""}
                          onChange={(e) =>
                            updateOwner(
                              index,
                              "conflict_search",
                              e.target.value
                            )
                          }
                          className="h-9 bg-card border-input"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Unit Number</Label>
                        <Input
                          value={owner.address.unit_number}
                          onChange={(e) =>
                            updateOwnerAddress(
                              index,
                              "unit_number",
                              e.target.value
                            )
                          }
                          className="h-9 bg-card border-input"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Street Number</Label>
                        <Input
                          value={owner.address.street_number}
                          onChange={(e) =>
                            updateOwnerAddress(
                              index,
                              "street_number",
                              e.target.value
                            )
                          }
                          className="h-9 bg-card border-input"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Street Name</Label>
                        <Input
                          value={owner.address.street_name}
                          onChange={(e) =>
                            updateOwnerAddress(
                              index,
                              "street_name",
                              e.target.value
                            )
                          }
                          className="h-9 bg-card border-input"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>City</Label>
                        <Input
                          value={owner.address.city}
                          onChange={(e) =>
                            updateOwnerAddress(index, "city", e.target.value)
                          }
                          className="h-9 bg-card border-input"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Province</Label>
                        <Input
                          value={owner.address.province}
                          onChange={(e) =>
                            updateOwnerAddress(
                              index,
                              "province",
                              e.target.value
                            )
                          }
                          className="h-9 bg-card border-input"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Postal Code</Label>
                        <Input
                          value={owner.address.postal_code}
                          onChange={(e) =>
                            updateOwnerAddress(
                              index,
                              "postal_code",
                              e.target.value
                            )
                          }
                          className="h-9 bg-card border-input"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Country</Label>
                        <Input
                          value={owner.address.country}
                          onChange={(e) =>
                            updateOwnerAddress(index, "country", e.target.value)
                          }
                          className="h-9 bg-card border-input"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Driver&apos;s Licence State</Label>
                        <Input
                          value={owner.drivers_licence_state}
                          onChange={(e) =>
                            updateOwner(
                              index,
                              "drivers_licence_state",
                              e.target.value
                            )
                          }
                          className="h-9 bg-card border-input"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Driver&apos;s Licence Number</Label>
                        <Input
                          value={owner.drivers_licence_number}
                          onChange={(e) =>
                            updateOwner(
                              index,
                              "drivers_licence_number",
                              e.target.value
                            )
                          }
                          className="h-9 bg-card border-input"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Licence Expiry Date</Label>
                        <Input
                          type="date"
                          value={owner.drivers_licence_expiry_date || ""}
                          onChange={(e) =>
                            updateOwner(
                              index,
                              "drivers_licence_expiry_date",
                              e.target.value
                            )
                          }
                          className="h-9 bg-card border-input"
                        />
                      </div>

                      <SearchableDropdown
                        label="Profile Search"
                        placeholder="Select Profile Search"
                        options={profileSearchOptions}
                        value={owner.profile_search_id}
                        onChange={(val) =>
                          updateOwner(index, "profile_search_id", val)
                        }
                      />

                      <div className="space-y-2">
                        <Label>
                          {getProfileDateLabel(owner.profile_search_id)}
                        </Label>
                        <Input
                          type="date"
                          value={owner.profile_search_date || ""}
                          onChange={(e) =>
                            updateOwner(
                              index,
                              "profile_search_date",
                              e.target.value
                            )
                          }
                          className="h-9 bg-card border-input"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* DIRECTOR INFORMATION */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-foreground">Directors</h3>
                <Button
                  type="button"
                  onClick={addDirector}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Add Director
                </Button>
              </div>

              <div className="space-y-6">
                {form.DirectorInformation.map((director, index) => (
                  <div
                    key={director.id ?? index}
                    className="border rounded-2xl p-6 bg-muted space-y-4 relative"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold">
                        Director {index + 1}
                      </h4>
                      <Button
                        type="button"
                        onClick={() => removeDirector(index)}
                        variant="destructive"
                        size="sm"
                        disabled={directorDeleteMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <Label>First Name</Label>
                        <Input
                          value={director.first_name}
                          onChange={(e) =>
                            updateDirector(index, "first_name", e.target.value)
                          }
                          className="h-9 bg-card border-input"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Last Name</Label>
                        <Input
                          value={director.last_name}
                          onChange={(e) =>
                            updateDirector(index, "last_name", e.target.value)
                          }
                          className="h-9 bg-card border-input"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Unit Number</Label>
                        <Input
                          value={director.address.unit_number}
                          onChange={(e) =>
                            updateDirectorAddress(
                              index,
                              "unit_number",
                              e.target.value
                            )
                          }
                          className="h-9 bg-card border-input"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Street Number</Label>
                        <Input
                          value={director.address.street_number}
                          onChange={(e) =>
                            updateDirectorAddress(
                              index,
                              "street_number",
                              e.target.value
                            )
                          }
                          className="h-9 bg-card border-input"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Street Name</Label>
                        <Input
                          value={director.address.street_name}
                          onChange={(e) =>
                            updateDirectorAddress(
                              index,
                              "street_name",
                              e.target.value
                            )
                          }
                          className="h-9 bg-card border-input"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>City</Label>
                        <Input
                          value={director.address.city}
                          onChange={(e) =>
                            updateDirectorAddress(index, "city", e.target.value)
                          }
                          className="h-9 bg-card border-input"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Province</Label>
                        <Input
                          value={director.address.province}
                          onChange={(e) =>
                            updateDirectorAddress(
                              index,
                              "province",
                              e.target.value
                            )
                          }
                          className="h-9 bg-card border-input"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Postal Code</Label>
                        <Input
                          value={director.address.postal_code}
                          onChange={(e) =>
                            updateDirectorAddress(
                              index,
                              "postal_code",
                              e.target.value
                            )
                          }
                          className="h-9 bg-card border-input"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Country</Label>
                        <Input
                          value={director.address.country}
                          onChange={(e) =>
                            updateDirectorAddress(
                              index,
                              "country",
                              e.target.value
                            )
                          }
                          className="h-9 bg-card border-input"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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
