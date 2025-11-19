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
import { Loader2, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { getRepresentativeReferralMeta } from "../helpers/fetchIRepresentativeReferralMetadata";
import { fetchRepresentReferralBySlug } from "../helpers/fetchRepresentativeReferralBySlug";
import { createRepresentativeReferral } from "../helpers/createRepresentativeReferral";

export default function RepresentativeReferral() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const {
    data: apiResponse,
    isLoading: isLoadingMetadata,
    error: metadataError,
    isError: isMetadataError,
  } = useQuery({
    queryKey: ["representativeReferralMeta"],
    queryFn: getRepresentativeReferralMeta,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  const metadata = apiResponse?.response || {};
  const {
    data: representativeReferralData,
    isLoading: isLoadingRepresentativeReferral,
  } = useQuery({
    queryKey: ["representativeReferral", slug],
    queryFn: async () => {
      if (!slug) return null;
      try {
        const data = await fetchRepresentReferralBySlug(slug);
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
    mutationFn: createRepresentativeReferral,
    onSuccess: (apiResponse) => {
      if (apiResponse?.response?.Apistatus) {
        toast.success(
          "Representative & Referral information saved successfully!"
        );
        navigate(`/dashboard/workstation/edit/${slug}/primary-ehc`);
      }
    },
    onError: (error) => {
      toast.error("Failed to save information. Please try again.");
    },
  });

  const [formData, setFormData] = useState({
    last_name: "",
    first_name: "",
    middle_name: "",
    initial: "",
    representative_address: {
      unit_number: "",
      street_number: "",
      street_name: "",
      city: "",
      province: "",
      postal_code: "",
      country: "",
    },
    relationship_applicant_id: null,
    telephone: "",
    ext: "",
    fax: "",
    email: "",
    referral_type_id: null,
    referral_name: "",
    referral_address: {
      unit_number: "",
      street_number: "",
      street_name: "",
      city: "",
      province: "",
      postal_code: "",
      country: "",
    },
    referral_telephone: "",
    referral_ext: "",
    referral_fax: "",
    referral_email: "",
  });

  useEffect(() => {
    if (!slug) {
      toast.error("Invalid URL - Slug not found!");
      navigate("/dashboard/workstation");
    }
  }, [slug, navigate]);
  useEffect(() => {
    if (representativeReferralData) {
      console.log(
        "📝 Populating form with existing data:",
        representativeReferralData
      );
      setFormData({
        last_name: representativeReferralData.last_name || "",
        first_name: representativeReferralData.first_name || "",
        middle_name: representativeReferralData.middle_name || "",
        initial: representativeReferralData.initial || "",
        representative_address: {
          unit_number:
            representativeReferralData.representative_address?.unit_number ||
            "",
          street_number:
            representativeReferralData.representative_address?.street_number ||
            "",
          street_name:
            representativeReferralData.representative_address?.street_name ||
            "",
          city: representativeReferralData.representative_address?.city || "",
          province:
            representativeReferralData.representative_address?.province || "",
          postal_code:
            representativeReferralData.representative_address?.postal_code ||
            "",
          country:
            representativeReferralData.representative_address?.country || "",
        },
        relationship_applicant_id:
          representativeReferralData.relationship_applicant_id || null,
        telephone: representativeReferralData.telephone || "",
        ext: representativeReferralData.ext || "",
        fax: representativeReferralData.fax || "",
        email: representativeReferralData.email || "",

        referral_type_id: representativeReferralData.referral_type_id || null,
        referral_name: representativeReferralData.referral_name || "",
        referral_address: {
          unit_number:
            representativeReferralData.referral_address?.unit_number || "",
          street_number:
            representativeReferralData.referral_address?.street_number || "",
          street_name:
            representativeReferralData.referral_address?.street_name || "",
          city: representativeReferralData.referral_address?.city || "",
          province: representativeReferralData.referral_address?.province || "",
          postal_code:
            representativeReferralData.referral_address?.postal_code || "",
          country: representativeReferralData.referral_address?.country || "",
        },
        referral_telephone: representativeReferralData.referral_telephone || "",
        referral_ext: representativeReferralData.referral_ext || "",
        referral_fax: representativeReferralData.referral_fax || "",
        referral_email: representativeReferralData.referral_email || "",
      });

      toast.success("Data loaded successfully!");
    } else {
      console.log("📝 No existing data - showing empty form");
    }
  }, [representativeReferralData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddressChange = (addressType, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [addressType]: {
        ...prev[addressType],
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isAddressFilled = (address) => {
      return Object.values(address).some(
        (value) => value && value.trim() !== ""
      );
    };
    const payload = {
      last_name: formData.last_name || null,
      first_name: formData.first_name || null,
      middle_name: formData.middle_name || null,
      initial: formData.initial || null,
      representative_address: isAddressFilled(formData.representative_address)
        ? formData.representative_address
        : null,
      relationship_applicant_id: formData.relationship_applicant_id || null,
      telephone: formData.telephone || null,
      ext: formData.ext || null,
      fax: formData.fax || null,
      email: formData.email || null,

      referral_type_id: formData.referral_type_id || null,
      referral_name: formData.referral_name || null,
      referral_address: isAddressFilled(formData.referral_address)
        ? formData.referral_address
        : null,
      referral_telephone: formData.referral_telephone || null,
      referral_ext: formData.referral_ext || null,
      referral_fax: formData.referral_fax || null,
      referral_email: formData.referral_email || null,
    };

    console.log(
      "📤 Submitting Representative & Referral Payload:",
      JSON.stringify(payload, null, 2)
    );

    createMutation.mutate({
      slug: slug,
      data: payload,
    });
  };
  if (isLoadingMetadata || isLoadingRepresentativeReferral) {
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
        <p className="text-gray-600">
          {metadataError?.message || "Invalid response from server"}
        </p>
        <div className="flex gap-4">
          <Button
            onClick={() =>
              queryClient.invalidateQueries(["representativeReferralMeta"])
            }
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
          <span className="text-gray-900 font-medium">
            Representative & Referral
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <h1 className="text-2xl font-bold mb-8 text-gray-900 uppercase">
            Representative & Referral Information
          </h1>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Representative Information Section */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Representative Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Last Name */}
                <div className="space-y-2">
                  <Label
                    htmlFor="last_name"
                    className="text-gray-700 font-medium"
                  >
                    Last Name
                  </Label>
                  <Input
                    id="last_name"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    placeholder="Harvard"
                    className="bg-gray-50 border-gray-300"
                  />
                </div>

                {/* First Name */}
                <div className="space-y-2">
                  <Label
                    htmlFor="first_name"
                    className="text-gray-700 font-medium"
                  >
                    First Name
                  </Label>
                  <Input
                    id="first_name"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    placeholder="Harvard"
                    className="bg-gray-50 border-gray-300"
                  />
                </div>

                {/* Middle Name */}
                <div className="space-y-2">
                  <Label
                    htmlFor="middle_name"
                    className="text-gray-700 font-medium"
                  >
                    Middle Name
                  </Label>
                  <Input
                    id="middle_name"
                    name="middle_name"
                    value={formData.middle_name}
                    onChange={handleChange}
                    placeholder="middle name"
                    className="bg-gray-50 border-gray-300"
                  />
                </div>

                {/* Initial */}
                <div className="space-y-2">
                  <Label
                    htmlFor="initial"
                    className="text-gray-700 font-medium"
                  >
                    Initial
                  </Label>
                  <Input
                    id="initial"
                    name="initial"
                    value={formData.initial}
                    onChange={handleChange}
                    placeholder="M"
                    maxLength={1}
                    className="bg-gray-50 border-gray-300"
                  />
                </div>

                {/* Relationship to Applicant */}
                <div className="space-y-2">
                  <Label
                    htmlFor="relationship_applicant_id"
                    className="text-gray-700 font-medium"
                  >
                    Relationship to Applicant
                  </Label>
                  <Select
                    value={formData.relationship_applicant_id?.toString() || ""}
                    onValueChange={(value) =>
                      handleSelectChange("relationship_applicant_id", value)
                    }
                  >
                    <SelectTrigger className="bg-gray-50 border-gray-300">
                      <SelectValue placeholder="Select relationship" />
                    </SelectTrigger>
                    <SelectContent>
                      {metadata?.relationshipt_applicant?.map((option) => (
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
                    placeholder="(000)-000-0000"
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
                    placeholder="1"
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
                    placeholder="(000)-000-0000"
                    className="bg-gray-50 border-gray-300"
                  />
                </div>

                {/* Email */}
                <div className="space-y-2 lg:col-span-2">
                  <Label htmlFor="email" className="text-gray-700 font-medium">
                    Email
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="admin@gmail.com"
                    className="bg-gray-50 border-gray-300"
                  />
                </div>
              </div>
            </div>

            {/* Representative Address Section */}
            <div className="space-y-6 pt-6 border-t">
              <h2 className="text-xl font-semibold text-gray-900">
                Representative Address
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">
                    Unit Number
                  </Label>
                  <Input
                    value={formData.representative_address.unit_number}
                    onChange={(e) =>
                      handleAddressChange(
                        "representative_address",
                        "unit_number",
                        e.target.value
                      )
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
                    value={formData.representative_address.street_number}
                    onChange={(e) =>
                      handleAddressChange(
                        "representative_address",
                        "street_number",
                        e.target.value
                      )
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
                    value={formData.representative_address.street_name}
                    onChange={(e) =>
                      handleAddressChange(
                        "representative_address",
                        "street_name",
                        e.target.value
                      )
                    }
                    placeholder="King Street West"
                    className="bg-gray-50 border-gray-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">City</Label>
                  <Input
                    value={formData.representative_address.city}
                    onChange={(e) =>
                      handleAddressChange(
                        "representative_address",
                        "city",
                        e.target.value
                      )
                    }
                    placeholder="Toronto"
                    className="bg-gray-50 border-gray-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">Province</Label>
                  <Input
                    value={formData.representative_address.province}
                    onChange={(e) =>
                      handleAddressChange(
                        "representative_address",
                        "province",
                        e.target.value
                      )
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
                    value={formData.representative_address.postal_code}
                    onChange={(e) =>
                      handleAddressChange(
                        "representative_address",
                        "postal_code",
                        e.target.value
                      )
                    }
                    placeholder="M5H 1K5"
                    className="bg-gray-50 border-gray-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">Country</Label>
                  <Input
                    value={formData.representative_address.country}
                    onChange={(e) =>
                      handleAddressChange(
                        "representative_address",
                        "country",
                        e.target.value
                      )
                    }
                    placeholder="Canada"
                    className="bg-gray-50 border-gray-300"
                  />
                </div>
              </div>
            </div>

            {/* Referral Information Section */}
            <div className="space-y-6 pt-6 border-t">
              <h2 className="text-xl font-semibold text-gray-900">
                Referral Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Referral Type */}
                <div className="space-y-2">
                  <Label
                    htmlFor="referral_type_id"
                    className="text-gray-700 font-medium"
                  >
                    Referral Type
                  </Label>
                  <Select
                    value={formData.referral_type_id?.toString() || ""}
                    onValueChange={(value) =>
                      handleSelectChange("referral_type_id", value)
                    }
                  >
                    <SelectTrigger className="bg-gray-50 border-gray-300">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {metadata?.type?.map((option) => (
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

                {/* Referral Name */}
                <div className="space-y-2">
                  <Label
                    htmlFor="referral_name"
                    className="text-gray-700 font-medium"
                  >
                    Referral Name
                  </Label>
                  <Input
                    id="referral_name"
                    name="referral_name"
                    value={formData.referral_name}
                    onChange={handleChange}
                    placeholder="name"
                    className="bg-gray-50 border-gray-300"
                  />
                </div>

                {/* Referral Telephone */}
                <div className="space-y-2">
                  <Label
                    htmlFor="referral_telephone"
                    className="text-gray-700 font-medium"
                  >
                    Telephone
                  </Label>
                  <Input
                    id="referral_telephone"
                    name="referral_telephone"
                    value={formData.referral_telephone}
                    onChange={handleChange}
                    placeholder="(000)-000-0000"
                    className="bg-gray-50 border-gray-300"
                  />
                </div>

                {/* Referral Extension */}
                <div className="space-y-2">
                  <Label
                    htmlFor="referral_ext"
                    className="text-gray-700 font-medium"
                  >
                    Extension
                  </Label>
                  <Input
                    id="referral_ext"
                    name="referral_ext"
                    value={formData.referral_ext}
                    onChange={handleChange}
                    placeholder="1"
                    className="bg-gray-50 border-gray-300"
                  />
                </div>

                {/* Referral Fax */}
                <div className="space-y-2">
                  <Label
                    htmlFor="referral_fax"
                    className="text-gray-700 font-medium"
                  >
                    Fax
                  </Label>
                  <Input
                    id="referral_fax"
                    name="referral_fax"
                    value={formData.referral_fax}
                    onChange={handleChange}
                    placeholder="(000)-000-0000"
                    className="bg-gray-50 border-gray-300"
                  />
                </div>

                {/* Referral Email */}
                <div className="space-y-2">
                  <Label
                    htmlFor="referral_email"
                    className="text-gray-700 font-medium"
                  >
                    Email
                  </Label>
                  <Input
                    id="referral_email"
                    name="referral_email"
                    type="email"
                    value={formData.referral_email}
                    onChange={handleChange}
                    placeholder="admin@gmail.com"
                    className="bg-gray-50 border-gray-300"
                  />
                </div>
              </div>
            </div>

            {/* Referral Address Section */}
            <div className="space-y-6 pt-6 border-t">
              <h2 className="text-xl font-semibold text-gray-900">
                Referral Address
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">
                    Unit Number
                  </Label>
                  <Input
                    value={formData.referral_address.unit_number}
                    onChange={(e) =>
                      handleAddressChange(
                        "referral_address",
                        "unit_number",
                        e.target.value
                      )
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
                    value={formData.referral_address.street_number}
                    onChange={(e) =>
                      handleAddressChange(
                        "referral_address",
                        "street_number",
                        e.target.value
                      )
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
                    value={formData.referral_address.street_name}
                    onChange={(e) =>
                      handleAddressChange(
                        "referral_address",
                        "street_name",
                        e.target.value
                      )
                    }
                    placeholder="King Street West"
                    className="bg-gray-50 border-gray-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">City</Label>
                  <Input
                    value={formData.referral_address.city}
                    onChange={(e) =>
                      handleAddressChange(
                        "referral_address",
                        "city",
                        e.target.value
                      )
                    }
                    placeholder="Toronto"
                    className="bg-gray-50 border-gray-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">Province</Label>
                  <Input
                    value={formData.referral_address.province}
                    onChange={(e) =>
                      handleAddressChange(
                        "referral_address",
                        "province",
                        e.target.value
                      )
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
                    value={formData.referral_address.postal_code}
                    onChange={(e) =>
                      handleAddressChange(
                        "referral_address",
                        "postal_code",
                        e.target.value
                      )
                    }
                    placeholder="M5H 1K5"
                    className="bg-gray-50 border-gray-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">Country</Label>
                  <Input
                    value={formData.referral_address.country}
                    onChange={(e) =>
                      handleAddressChange(
                        "referral_address",
                        "country",
                        e.target.value
                      )
                    }
                    placeholder="Canada"
                    className="bg-gray-50 border-gray-300"
                  />
                </div>
              </div>
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
