import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, ChevronRight, X, Plus } from "lucide-react";
import { toast } from "sonner";
import { getEmploymentMeta } from "../helpers/fetchIEmploymentMetadata";
import { createEmployment } from "../helpers/createEmployment";
import { fetchEmploymentyBySlug } from "../helpers/fetchEmploymentBySlug";

export default function Employment() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch metadata
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

  // Mutation for creating employment
  const createMutation = useMutation({
    mutationFn: createEmployment,
    onSuccess: (apiResponse) => {
      console.log("✅ Success Response:", apiResponse);

      if (apiResponse?.response?.Apistatus) {
        toast.success("Employment information saved successfully!");
        navigate(`/dashboard/workstation/edit/${slug}/next-page`);
      }
    },
    onError: (error) => {
      console.error("❌ Mutation Error:", error);
      toast.error("Failed to save employment. Please try again.");
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
        income_type_id: "",
        income_period_id: "",
        income: "",
        description: "",
      },
    ],
  });

  // Check for valid slug
  useEffect(() => {
    if (!slug) {
      toast.error("Invalid URL - Slug not found!");
      navigate("/dashboard/workstation");
    }
  }, [slug, navigate]);

  // Populate form when employment data is loaded
  // Populate form when employment data is loaded
  useEffect(() => {
    if (employmentData) {
      console.log("📝 Populating form with existing data");

      setFormData({
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
        employed_id: employmentData.employed_id || null,
        not_employed_id: employmentData.not_employed_id || null,
        unemployed_and_id: employmentData.unemployed_and_id || null,

        // ✅ Map other_incomes (from response) to other_income (form state)
        other_income:
          employmentData.other_incomes &&
          employmentData.other_incomes.length > 0
            ? employmentData.other_incomes.map((income) => ({
                income_type_id: income.income_type_id || "",
                income_period_id: income.income_period_id || "",
                income: income.income || "",
                description: income.description || "",
              }))
            : [
                {
                  income_type_id: "",
                  income_period_id: "",
                  income: "",
                  description: "",
                },
              ],
      });

      toast.success("Data loaded successfully!");
    } else {
      console.log("📝 No existing data - showing empty form");
    }
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
    setFormData((prev) => ({
      ...prev,
      [name]: Number(value),
    }));
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
      other_income: prev.other_income.map((item, i) =>
        i === index ? { ...item, [field]: Number(value) } : item
      ),
    }));
  };

  const addIncome = () => {
    setFormData((prev) => ({
      ...prev,
      other_income: [
        ...prev.other_income,
        {
          income_type_id: "",
          income_period_id: "",
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

    // Helper to check if address has any filled field
    const isAddressFilled = (address) => {
      return Object.values(address).some(
        (value) => value && value.trim() !== ""
      );
    };

    // Build payload
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
      other_income: formData.other_income.filter(
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

  // Loading state
  if (isLoadingMetadata || isLoadingEmployment) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading form data...</span>
      </div>
    );
  }

  // Critical error: Metadata failed
  if (isMetadataError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="text-red-500 text-xl font-semibold">
          Error loading form
        </div>
        <p className="text-gray-600">
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
    <div className="min-h-screen bg-gray-50">
      {/* Header with Financial Stats */}
      <div className="bg-white border-b px-6 py-3">
        <div className="flex items-center justify-end gap-6 text-sm">
          <span className="text-gray-700">
            Unpaid: <span className="font-semibold">$ 0</span>
          </span>
          <span className="text-gray-700">
            Unbilled: <span className="font-semibold">$ 0</span>
          </span>
          <span className="text-gray-700">
            Client Funds-Operating: <span className="font-semibold">$ 0</span>
          </span>
          <span className="text-gray-700">
            Client Funds-Trust: <span className="font-semibold">$ 0</span>
          </span>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <button
            onClick={() => navigate("/dashboard")}
            className="hover:text-gray-900 transition"
          >
            Dashboard
          </button>
          <ChevronRight className="w-4 h-4" />
          <button
            onClick={() => navigate("/dashboard/workstation")}
            className="hover:text-gray-900 transition"
          >
            Workstation
          </button>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 font-medium">Employment</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <h1 className="text-2xl font-bold mb-8 text-gray-900 uppercase">
            Employment
          </h1>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Employment Status Section */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Employment Status
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Employed */}
                <div className="space-y-2">
                  <Label
                    htmlFor="employed_id"
                    className="text-gray-700 font-medium"
                  >
                    Employed
                  </Label>
                  <Select
                    value={formData.employed_id?.toString()}
                    onValueChange={(value) =>
                      handleSelectChange("employed_id", value)
                    }
                  >
                    <SelectTrigger className="bg-gray-50 border-gray-300">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {metadata?.employed?.map((option) => (
                        <SelectItem
                          key={option.id}
                          value={option.id.toString()}
                        >
                          {option.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Not Employed */}
                <div className="space-y-2">
                  <Label
                    htmlFor="not_employed_id"
                    className="text-gray-700 font-medium"
                  >
                    Not Employed
                  </Label>
                  <Select
                    value={formData.not_employed_id?.toString()}
                    onValueChange={(value) =>
                      handleSelectChange("not_employed_id", value)
                    }
                  >
                    <SelectTrigger className="bg-gray-50 border-gray-300">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {metadata?.not_employed?.map((option) => (
                        <SelectItem
                          key={option.id}
                          value={option.id.toString()}
                        >
                          {option.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Unemployed And */}
                <div className="space-y-2">
                  <Label
                    htmlFor="unemployed_and_id"
                    className="text-gray-700 font-medium"
                  >
                    Unemployed And
                  </Label>
                  <Select
                    value={formData.unemployed_and_id?.toString()}
                    onValueChange={(value) =>
                      handleSelectChange("unemployed_and_id", value)
                    }
                  >
                    <SelectTrigger className="bg-gray-50 border-gray-300">
                      <SelectValue placeholder="Select option" />
                    </SelectTrigger>
                    <SelectContent>
                      {metadata?.unemployed_and?.map((option) => (
                        <SelectItem
                          key={option.id}
                          value={option.id.toString()}
                        >
                          {option.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Employer Information Section */}
            <div className="space-y-6 pt-6 border-t">
              <h2 className="text-xl font-semibold text-gray-900">
                Employer Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Employer Name */}
                <div className="space-y-2">
                  <Label
                    htmlFor="employer_name"
                    className="text-gray-700 font-medium"
                  >
                    Employer Name
                  </Label>
                  <Input
                    id="employer_name"
                    name="employer_name"
                    value={formData.employer_name}
                    onChange={handleChange}
                    placeholder="Tech Solutions Inc."
                    className="bg-gray-50 border-gray-300"
                  />
                </div>

                {/* Telephone */}
                <div className="space-y-2">
                  <Label
                    htmlFor="telephone"
                    className="text-gray-700 font-medium"
                  >
                    Telephone
                  </Label>
                  <Input
                    id="telephone"
                    name="telephone"
                    value={formData.telephone}
                    onChange={handleChange}
                    placeholder="1234567890"
                    className="bg-gray-50 border-gray-300"
                  />
                </div>

                {/* Extension */}
                <div className="space-y-2">
                  <Label htmlFor="ext" className="text-gray-700 font-medium">
                    Extension
                  </Label>
                  <Input
                    id="ext"
                    name="ext"
                    value={formData.ext}
                    onChange={handleChange}
                    placeholder="101"
                    className="bg-gray-50 border-gray-300"
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700 font-medium">
                    Email
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="hr@techsolutions.com"
                    className="bg-gray-50 border-gray-300"
                  />
                </div>

                {/* Fax */}
                <div className="space-y-2">
                  <Label htmlFor="fax" className="text-gray-700 font-medium">
                    Fax
                  </Label>
                  <Input
                    id="fax"
                    name="fax"
                    value={formData.fax}
                    onChange={handleChange}
                    placeholder="0987654321"
                    className="bg-gray-50 border-gray-300"
                  />
                </div>

                {/* Job Period From */}
                <div className="space-y-2">
                  <Label
                    htmlFor="job_period_from"
                    className="text-gray-700 font-medium"
                  >
                    Job Period From
                  </Label>
                  <Input
                    id="job_period_from"
                    name="job_period_from"
                    type="date"
                    value={formData.job_period_from}
                    onChange={handleChange}
                    className="bg-gray-50 border-gray-300"
                  />
                </div>

                {/* Job Period To */}
                <div className="space-y-2">
                  <Label
                    htmlFor="job_period_to"
                    className="text-gray-700 font-medium"
                  >
                    Job Period To
                  </Label>
                  <Input
                    id="job_period_to"
                    name="job_period_to"
                    type="date"
                    value={formData.job_period_to}
                    onChange={handleChange}
                    className="bg-gray-50 border-gray-300"
                  />
                </div>
              </div>
            </div>

            {/* Employer Address Section */}
            <div className="space-y-6 pt-6 border-t">
              <h2 className="text-xl font-semibold text-gray-900">
                Employer Address
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">
                    Unit Number
                  </Label>
                  <Input
                    value={formData.address.unit_number}
                    onChange={(e) =>
                      handleAddressChange("unit_number", e.target.value)
                    }
                    placeholder="5B"
                    className="bg-gray-50 border-gray-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">
                    Street Number
                  </Label>
                  <Input
                    value={formData.address.street_number}
                    onChange={(e) =>
                      handleAddressChange("street_number", e.target.value)
                    }
                    placeholder="221"
                    className="bg-gray-50 border-gray-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">
                    Street Name
                  </Label>
                  <Input
                    value={formData.address.street_name}
                    onChange={(e) =>
                      handleAddressChange("street_name", e.target.value)
                    }
                    placeholder="King Street West"
                    className="bg-gray-50 border-gray-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">City</Label>
                  <Input
                    value={formData.address.city}
                    onChange={(e) =>
                      handleAddressChange("city", e.target.value)
                    }
                    placeholder="Toronto"
                    className="bg-gray-50 border-gray-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">Province</Label>
                  <Input
                    value={formData.address.province}
                    onChange={(e) =>
                      handleAddressChange("province", e.target.value)
                    }
                    placeholder="Ontario"
                    className="bg-gray-50 border-gray-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">
                    Postal Code
                  </Label>
                  <Input
                    value={formData.address.postal_code}
                    onChange={(e) =>
                      handleAddressChange("postal_code", e.target.value)
                    }
                    placeholder="M5H 1K5"
                    className="bg-gray-50 border-gray-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">Country</Label>
                  <Input
                    value={formData.address.country}
                    onChange={(e) =>
                      handleAddressChange("country", e.target.value)
                    }
                    placeholder="Canada"
                    className="bg-gray-50 border-gray-300"
                  />
                </div>
              </div>
            </div>

            {/* Other Income Section */}
            <div className="space-y-6 pt-6 border-t">
              <h2 className="text-xl font-semibold text-gray-900">
                Other Income
              </h2>

              {formData.other_income.map((income, index) => (
                <div
                  key={index}
                  className="border border-gray-200 p-6 rounded-lg space-y-4 bg-gray-50"
                >
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-gray-900">
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
                    {/* Income Type */}
                    <div className="space-y-2">
                      <Label className="text-gray-700 font-medium">
                        Income Type
                      </Label>
                      <Select
                        value={income.income_type_id?.toString()}
                        onValueChange={(value) =>
                          handleIncomeSelectChange(
                            index,
                            "income_type_id",
                            value
                          )
                        }
                      >
                        <SelectTrigger className="bg-white border-gray-300">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          {metadata?.income_type?.map((type) => (
                            <SelectItem
                              key={type.id}
                              value={type.id.toString()}
                            >
                              {type.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Income Period */}
                    <div className="space-y-2">
                      <Label className="text-gray-700 font-medium">
                        Income Period
                      </Label>
                      <Select
                        value={income.income_period_id?.toString()}
                        onValueChange={(value) =>
                          handleIncomeSelectChange(
                            index,
                            "income_period_id",
                            value
                          )
                        }
                      >
                        <SelectTrigger className="bg-white border-gray-300">
                          <SelectValue placeholder="Select period" />
                        </SelectTrigger>
                        <SelectContent>
                          {metadata?.income_period?.map((period) => (
                            <SelectItem
                              key={period.id}
                              value={period.id.toString()}
                            >
                              {period.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Income Amount */}
                    <div className="space-y-2">
                      <Label className="text-gray-700 font-medium">
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
                        className="bg-white border-gray-300"
                      />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                      <Label className="text-gray-700 font-medium">
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
                        placeholder="Monthly dividend from stock portfolio."
                        rows={1}
                        className="bg-white border-gray-300"
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

            {/* Submit Buttons */}
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
