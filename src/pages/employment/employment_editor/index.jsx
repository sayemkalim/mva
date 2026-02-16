import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Loader2,
  ChevronRight,
  X,
  Plus,
  ChevronsUpDown,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { getEmploymentMeta } from "../helpers/fetchIEmploymentMetadata";
import { createEmployment } from "../helpers/createEmployment";
import { fetchEmploymentyBySlug } from "../helpers/fetchEmploymentBySlug";
import { Navbar2 } from "@/components/navbar2";
import { formatPhoneNumber } from "@/lib/utils";

import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import Billing from "@/components/billing";

function SearchableDropdown({
  value,
  onValueChange,
  options = [],
  placeholder = "Select",
  label = "Search",
  popoverKey,
  popoverOpen,
  setPopoverOpen,
}) {
  const selected = options.find((o) => String(o.id) === String(value)) || null;
  const isOpen = !!(popoverOpen && popoverOpen[popoverKey]);

  const handleSelect = (id) => {
    const val = id == null ? "" : String(id);
    if (onValueChange) onValueChange(val);
    if (setPopoverOpen && popoverKey) {
      setPopoverOpen((prev = {}) => ({ ...prev, [popoverKey]: false }));
    }
  };

  return (
    <Popover
      open={isOpen}
      onOpenChange={(open) =>
        setPopoverOpen &&
        setPopoverOpen((p = {}) => ({ ...p, [popoverKey]: open }))
      }
    >
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className="w-full justify-between font-normal bg-muted h-11 text-sm"
          type="button"
        >
          {selected ? selected.name : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-60" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0"
        align="start"
      >
        <Command>
          <CommandInput placeholder={label.toLowerCase()} />
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup>
            {options.map((opt) => (
              <CommandItem
                key={opt.id}
                value={opt.name}
                onSelect={() => handleSelect(opt.id)}
              >
                <Check
                  className={`mr-2 h-4 w-4 ${String(value) === String(opt.id)
                    ? "opacity-100"
                    : "opacity-0"
                    }`}
                />
                {opt.name}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export default function Employment() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    data: apiResponse,
    isLoading: isLoadingMetadata,
    error: metadataError,
    isError: isMetadataError,
  } = useQuery({
    queryKey: ["employmentMeta"],
    queryFn: getEmploymentMeta,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  const metadata = apiResponse?.response || {};

  const { data: employmentData, isLoading: isLoadingEmployment } = useQuery({
    queryKey: ["employment", slug],
    queryFn: async () => {
      if (!slug) return null;
      try {
        const data = await fetchEmploymentyBySlug(slug);
        return data;
      } catch (error) {
        if (
          error.message?.includes("404") ||
          error.message?.includes("not found")
        ) {
          return null;
        }
        throw error;
      }
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const createMutation = useMutation({
    mutationFn: createEmployment,
    onSuccess: (data) => {
      const resp = data?.response || data;
      if (resp?.Apistatus === false) {
        toast.error(resp?.message || "Validation failed");
        return;
      }
      toast.success(resp?.message || "Employment information saved successfully!");
    },
    onError: (error) => {
      console.error("Mutation Error:", error);
      const errorData = error.response?.data;
      if (errorData?.Apistatus === false) {
        toast.error(errorData?.message || "Validation failed");
      } else {
        toast.error(errorData?.message || "Failed to save employment information");
      }
    },
  });

  const [formData, setFormData] = useState({
    employer_name: "",
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
    email: "",
    fax: "",
    job_period_from: "",
    job_period_to: "",
    employed_id: null,
    not_employed_id: null,
    unemployed_and_id: null,
    other_income: [
      {
        income_type_id: null,
        income_period_id: null,
        income: "",
        description: "",
      },
    ],
  });

  const [popoverOpen, setPopoverOpen] = useState({});

  useEffect(() => {
    if (!slug) {
      toast.error("Invalid URL - Slug not found!");
      navigate("/dashboard/workstation");
    }
  }, [slug, navigate]);

  useEffect(() => {
    if (!employmentData) return;

    setFormData((prev) => {
      const userEdited =
        Boolean(prev.employer_name) ||
        Boolean(prev.email) ||
        Boolean(prev.telephone) ||
        (prev.other_income &&
          prev.other_income.some((inc) => inc.income || inc.description));

      if (userEdited) return prev;

      return {
        employer_name: employmentData.employer_name || "",
        address: {
          unit_number: employmentData.address?.unit_number || "",
          street_number: employmentData.address?.street_number || "",
          street_name: employmentData.address?.street_name || "",
          city: employmentData.address?.city || "",
          province: employmentData.address?.province || "",
          postal_code: employmentData.address?.postal_code || "",
          country: employmentData.address?.country || "",
        },
        telephone: employmentData.telephone || "",
        ext: employmentData.ext || "",
        email: employmentData.email || "",
        fax: employmentData.fax || "",
        job_period_from: employmentData.job_period_from || "",
        job_period_to: employmentData.job_period_to || "",
        employed_id: employmentData.employed_id ?? null,
        not_employed_id: employmentData.not_employed_id ?? null,
        unemployed_and_id: employmentData.unemployed_and_id ?? null,
        other_income:
          employmentData.other_incomes &&
            employmentData.other_incomes.length > 0
            ? employmentData.other_incomes.map((income) => ({
              income_type_id: income.income_type_id ?? null,
              income_period_id: income.income_period_id ?? null,
              income: income.income ?? "",
              description: income.description ?? "",
            }))
            : [
              {
                income_type_id: null,
                income_period_id: null,
                income: "",
                description: "",
              },
            ],
      };
    });
  }, [employmentData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddressChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        [field]: value,
      },
    }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => {
      const numeric = value === "" ? null : Number(value);
      const isCurrentlySelected = prev[name] === numeric;
      const finalValue = isCurrentlySelected ? null : numeric;

      let next = {
        ...prev,
        [name]: finalValue,
      };
      if (name === "employed_id" && finalValue) {
        next.not_employed_id = null;
        next.unemployed_and_id = null;
      }
      if (name === "not_employed_id" && !finalValue) {
        next.unemployed_and_id = null;
      }
      return next;
    });
  };


  const handleIncomeChange = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      other_income: prev.other_income.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const handleIncomeSelectChange = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      other_income: prev.other_income.map((item, i) => {
        if (i !== index) return item;
        const numeric = value === "" ? null : Number(value);
        const isCurrentlySelected = item[field] === numeric;
        return {
          ...item,
          [field]: isCurrentlySelected ? null : numeric,
        };
      }),
    }));
  };

  const addIncome = () => {
    setFormData((prev) => ({
      ...prev,
      other_income: [
        ...prev.other_income,
        {
          income_type_id: null,
          income_period_id: null,
          income: "",
          description: "",
        },
      ],
    }));
  };

  const removeIncome = (index) => {
    if (formData.other_income.length === 1) {
      toast.error("At least one income entry is required!");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      other_income: prev.other_income.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isAddressFilled = (address) =>
      Object.values(address).some((value) => value && value.trim() !== "");
    const payload = {
      employer_name: formData.employer_name || null,
      address: isAddressFilled(formData.address) ? formData.address : null,
      telephone: formData.telephone || null,
      ext: formData.ext || null,
      email: formData.email || null,
      fax: formData.fax || null,
      job_period_from: formData.job_period_from || null,
      job_period_to: formData.job_period_to || null,
      employed_id: formData.employed_id || null,
      not_employed_id: formData.not_employed_id || null,
      unemployed_and_id: formData.unemployed_and_id || null,
      other_income: formData.other_income
        .map((income) => ({
          income_type_id: income.income_type_id || null,
          income_period_id: income.income_period_id || null,
          income: income.income || null,
          description: income.description || null,
        }))
        .filter(
          (income) =>
            income.income_type_id ||
            income.income_period_id ||
            income.income ||
            income.description
        ),
    };

    console.log(
      "📤 Submitting Employment Payload:",
      JSON.stringify(payload, null, 2)
    );
    createMutation.mutate({
      slug: slug,
      data: payload,
    });
  };

  if (isLoadingMetadata || isLoadingEmployment) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading form data...</span>
      </div>
    );
  }

  if (isMetadataError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="text-red-500 text-xl font-semibold">
          Error loading form
        </div>
        <p className="text-muted-foreground">
          {metadataError?.message || "Invalid response from server"}
        </p>
        <div className="flex gap-4">
          <Button
            onClick={() => queryClient.invalidateQueries(["employmentMeta"])}
          >
            Retry
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate("/dashboard/workstation")}
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted">
      <Navbar2 />
      <Billing />

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
          <span className="text-foreground font-medium">Employment</span>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-7xl">
        <div className="bg-card rounded-lg shadow-sm border p-8">
          <h1 className="text-2xl font-bold mb-8 text-foreground uppercase">
            Employment
          </h1>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-foreground">
                Employment Status
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="employed_id"
                    className="text-foreground font-medium"
                  >
                    Employed
                  </Label>
                  <SearchableDropdown
                    popoverKey="employed"
                    popoverOpen={popoverOpen}
                    setPopoverOpen={setPopoverOpen}
                    value={formData.employed_id?.toString() ?? ""}
                    onValueChange={(value) =>
                      handleSelectChange("employed_id", value)
                    }
                    options={metadata?.employed || []}
                    placeholder="Select status"
                    label="Employed"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="not_employed_id"
                    className="text-foreground font-medium"
                  >
                    Not Employed
                  </Label>
                  <SearchableDropdown
                    popoverKey="not_employed"
                    popoverOpen={popoverOpen}
                    setPopoverOpen={setPopoverOpen}
                    value={formData.not_employed_id?.toString() ?? ""}
                    onValueChange={(value) =>
                      handleSelectChange("not_employed_id", value)
                    }
                    options={metadata?.not_employed || []}
                    placeholder="Select status"
                    label="Not Employed"
                  />
                </div>
                {(() => {
                  const selectedNotEmployed = metadata?.not_employed?.find(
                    (o) => String(o.id) === String(formData.not_employed_id)
                  );
                  return selectedNotEmployed?.name === "Unemployed And";
                })() && (
                    <div className="space-y-2">
                      <Label
                        htmlFor="unemployed_and_id"
                        className="text-foreground font-medium"
                      >
                        Unemployed And
                      </Label>
                      <SearchableDropdown
                        popoverKey="unemployed_and"
                        popoverOpen={popoverOpen}
                        setPopoverOpen={setPopoverOpen}
                        value={formData.unemployed_and_id?.toString() ?? ""}
                        onValueChange={(value) =>
                          handleSelectChange("unemployed_and_id", value)
                        }
                        options={metadata?.unemployed_and || []}
                        placeholder="Select option"
                        label="Unemployed And"
                      />
                    </div>
                  )}
              </div>
            </div>

            <div className="space-y-6 pt-6 border-t">
              <h2 className="text-xl font-semibold text-foreground">
                Employer Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="employer_name"
                    className="text-foreground font-medium"
                  >
                    Employer Name
                  </Label>
                  <Input
                    id="employer_name"
                    name="employer_name"
                    value={formData.employer_name}
                    onChange={handleChange}
                    placeholder="Employer name"
                    className="bg-muted border-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="telephone"
                    className="text-foreground font-medium"
                  >
                    Telephone
                  </Label>
                  <Input
                    id="telephone"
                    name="telephone"
                    value={formData.telephone}
                    onChange={(e) => setFormData(prev => ({ ...prev, telephone: formatPhoneNumber(e.target.value) }))}
                    placeholder="(888) 888-8888"
                    className="bg-muted border-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ext" className="text-foreground font-medium">
                    Extension
                  </Label>
                  <Input
                    id="ext"
                    name="ext"
                    value={formData.ext}
                    onChange={handleChange}
                    placeholder="101"
                    className="bg-muted border-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground font-medium">
                    Email
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="email@example.com"
                    className="bg-muted border-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fax" className="text-foreground font-medium">
                    Fax
                  </Label>
                  <Input
                    id="fax"
                    name="fax"
                    value={formData.fax}
                    onChange={(e) => setFormData(prev => ({ ...prev, fax: formatPhoneNumber(e.target.value) }))}
                    placeholder="(888) 888-8888"
                    className="bg-muted border-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="job_period_from"
                    className="text-foreground font-medium"
                  >
                    Job Period From
                  </Label>
                  <Input
                    id="job_period_from"
                    name="job_period_from"
                    type="date"
                    value={formData.job_period_from}
                    onChange={handleChange}
                    className="bg-muted border-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="job_period_to"
                    className="text-foreground font-medium"
                  >
                    Job Period To
                  </Label>
                  <Input
                    id="job_period_to"
                    name="job_period_to"
                    type="date"
                    value={formData.job_period_to}
                    onChange={handleChange}
                    className="bg-muted border-input"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6 pt-6 border-t">
              <h2 className="text-xl font-semibold text-foreground">
                Employer Address
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label className="text-foreground font-medium">
                    Unit Number
                  </Label>
                  <Input
                    value={formData.address.unit_number}
                    onChange={(e) =>
                      handleAddressChange("unit_number", e.target.value)
                    }
                    placeholder="Unit"
                    className="bg-muted border-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground font-medium">
                    Street Number
                  </Label>
                  <Input
                    value={formData.address.street_number}
                    onChange={(e) =>
                      handleAddressChange("street_number", e.target.value)
                    }
                    placeholder="221"
                    className="bg-muted border-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground font-medium">
                    Street Name
                  </Label>
                  <Input
                    value={formData.address.street_name}
                    onChange={(e) =>
                      handleAddressChange("street_name", e.target.value)
                    }
                    placeholder="Street name"
                    className="bg-muted border-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground font-medium">City</Label>
                  <Input
                    value={formData.address.city}
                    onChange={(e) =>
                      handleAddressChange("city", e.target.value)
                    }
                    placeholder="City"
                    className="bg-muted border-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground font-medium">Province</Label>
                  <Input
                    value={formData.address.province}
                    onChange={(e) =>
                      handleAddressChange("province", e.target.value)
                    }
                    placeholder="Province"
                    className="bg-muted border-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground font-medium">
                    Postal Code
                  </Label>
                  <Input
                    value={formData.address.postal_code}
                    onChange={(e) =>
                      handleAddressChange("postal_code", e.target.value)
                    }
                    placeholder="Postal"
                    className="bg-muted border-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground font-medium">Country</Label>
                  <Input
                    value={formData.address.country}
                    onChange={(e) =>
                      handleAddressChange("country", e.target.value)
                    }
                    placeholder="Country"
                    className="bg-muted border-input"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6 pt-6 border-t">
              <h2 className="text-xl font-semibold text-foreground">
                Other Income
              </h2>
              {formData.other_income.map((income, index) => (
                <div
                  key={index}
                  className="border border-gray-200 p-6 rounded-lg space-y-4 "
                >
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-foreground">
                      Income {index + 1}
                    </h3>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeIncome(index)}
                      disabled={formData.other_income.length === 1}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Remove
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-foreground font-medium">
                        Income Type
                      </Label>
                      <SearchableDropdown
                        popoverKey={`income_type-${index}`}
                        popoverOpen={popoverOpen}
                        setPopoverOpen={setPopoverOpen}
                        value={income.income_type_id?.toString() ?? ""}
                        onValueChange={(value) =>
                          handleIncomeSelectChange(
                            index,
                            "income_type_id",
                            value
                          )
                        }
                        options={metadata?.income_type || []}
                        placeholder="Select type"
                        label="Income type"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-foreground font-medium">
                        Income Period
                      </Label>
                      <SearchableDropdown
                        popoverKey={`income_period-${index}`}
                        popoverOpen={popoverOpen}
                        setPopoverOpen={setPopoverOpen}
                        value={income.income_period_id?.toString() ?? ""}
                        onValueChange={(value) =>
                          handleIncomeSelectChange(
                            index,
                            "income_period_id",
                            value
                          )
                        }
                        options={metadata?.income_period || []}
                        placeholder="Select period"
                        label="Income period"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-foreground font-medium">
                        Income Amount
                      </Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={income.income}
                        onChange={(e) =>
                          handleIncomeChange(index, "income", e.target.value)
                        }
                        placeholder="500.00"
                        className="bg-card border-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-foreground font-medium">
                        Description
                      </Label>
                      <Textarea
                        value={income.description}
                        onChange={(e) =>
                          handleIncomeChange(
                            index,
                            "description",
                            e.target.value
                          )
                        }
                        placeholder="Income description"
                        rows={1}
                        className="bg-card border-input"
                      />
                    </div>
                  </div>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addIncome}
                className="w-full md:w-auto"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Another Income
              </Button>
            </div>

            <div className="flex justify-end gap-4 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/dashboard/workstation/edit/${slug}`)}
                disabled={createMutation.isPending}
                size="lg"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending}
                size="lg"
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save & Continue"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
