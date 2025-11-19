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
import { Loader2, ChevronRight, X, Plus } from "lucide-react";
import { toast } from "sonner";
import { createIdentification } from "../helpers/createIdentification";
import { getIdentificationMeta } from "../helpers/fetchIdentificationMetadata";
import { fetchIdentificationBySlug } from "../helpers/fetchIdentificationBySlug";
import { SidebarTrigger } from "@/components/ui/sidebar";

export default function Identification() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const {
    data: apiResponse,
    isLoading: isLoadingMetadata,
    error: metadataError,
    isError: isMetadataError,
  } = useQuery({
    queryKey: ["identificationMeta"],
    queryFn: getIdentificationMeta,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  const metadata = apiResponse?.response || {};
  const { data: identificationData, isLoading: isLoadingIdentification } =
    useQuery({
      queryKey: ["identification", slug],
      queryFn: async () => {
        if (!slug) return null;

        try {
          const data = await fetchIdentificationBySlug(slug);
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
    mutationFn: createIdentification,
    onSuccess: (apiResponse) => {
      if (apiResponse?.response?.Apistatus) {
        toast.success("Identification saved successfully!");
        navigate(`/dashboard/workstation/edit/${slug}/employment`);
      }
    },
    onError: (error) => {
      toast.error("Failed to save identification. Please try again.");
    },
  });

  const [identifications, setIdentifications] = useState([
    {
      attachment_id: 1,
      copy_in_file_id: "",
      id_verification_date: "",
      id_verification_by: "",
      identification_type: "",
      identification_country: "",
      identification_number: "",
    },
  ]);
  useEffect(() => {
    if (!slug) {
      toast.error("Invalid URL - Slug not found!");
      navigate("/dashboard/workstation");
    }
  }, [slug, navigate]);
  useEffect(() => {
    if (
      identificationData &&
      Array.isArray(identificationData) &&
      identificationData.length > 0
    ) {
      setIdentifications(
        identificationData.map((item) => ({
          attachment_id: item.attachment_id || 1,
          copy_in_file_id: item.copy_in_file_id || "",
          id_verification_date: item.id_verification_date || "",
          id_verification_by: item.id_verification_by || "",
          identification_type: item.identification_type || "",
          identification_country: item.identification_country || "",
          identification_number: item.identification_number || "",
        }))
      );

      // toast.success("Data loaded successfully!");
    } else {
      console.log("📝 No existing data - showing empty form");
    }
  }, [identificationData]);

  const handleChange = (index, field, value) => {
    setIdentifications((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const handleSelectChange = (index, field, value) => {
    setIdentifications((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, [field]: Number(value) } : item
      )
    );
  };

  const handleTypeChange = (index, value) => {
    const selectedType = metadata?.type?.find((t) => t.id === Number(value));

    setIdentifications((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              identification_type: selectedType?.name || "",
            }
          : item
      )
    );
  };

  const addIdentification = () => {
    setIdentifications((prev) => [
      ...prev,
      {
        attachment_id: 1,
        copy_in_file_id: "",
        id_verification_date: "",
        id_verification_by: "",
        identification_type: "",
        identification_country: "",
        identification_number: "",
      },
    ]);
  };

  const removeIdentification = (index) => {
    if (identifications.length === 1) {
      toast.error("At least one identification is required!");
      return;
    }
    setIdentifications((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    const hasValidData = identifications.some(
      (item) =>
        item.identification_type ||
        item.identification_number ||
        item.identification_country
    );

    if (!hasValidData) {
      toast.error("Please fill at least one identification!");
      return;
    }

    const payload = identifications
      .filter(
        (item) =>
          item.identification_type ||
          item.identification_number ||
          item.identification_country
      )
      .map((item) => ({
        attachment_id: item.attachment_id || 1,
        copy_in_file_id: item.copy_in_file_id || null,
        id_verification_date: item.id_verification_date || null,
        id_verification_by: item.id_verification_by || null,
        identification_type: item.identification_type || null,
        identification_country: item.identification_country || null,
        identification_number: item.identification_number || null,
      }));
    createMutation.mutate({
      slug: slug,
      data: payload,
    });
  };

  if (isLoadingMetadata || isLoadingIdentification) {
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
              queryClient.invalidateQueries(["identificationMeta"])
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
          <SidebarTrigger className="-ml-1" />

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
          <span className="text-gray-900 font-medium">Identification</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <h1 className="text-2xl font-bold mb-8 text-gray-900 uppercase">
            Identification
          </h1>

          <form onSubmit={handleSubmit} className="space-y-8">
            {identifications.map((identification, index) => (
              <div
                key={index}
                className="border border-gray-200 p-6 rounded-lg space-y-6 bg-gray-50"
              >
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-gray-900 text-lg">
                    Identification {index + 1}
                  </h3>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removeIdentification(index)}
                    disabled={identifications.length === 1}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Remove
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Copy in File */}
                  <div className="space-y-2">
                    <Label
                      htmlFor={`copy_in_file_id_${index}`}
                      className="text-gray-700 font-medium"
                    >
                      Copy in File
                    </Label>
                    <Select
                      value={identification.copy_in_file_id?.toString()}
                      onValueChange={(value) =>
                        handleSelectChange(index, "copy_in_file_id", value)
                      }
                    >
                      <SelectTrigger className="bg-white border-gray-300">
                        <SelectValue placeholder="Select option" />
                      </SelectTrigger>
                      <SelectContent>
                        {metadata?.yes_no_option?.map((option) => (
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

                  {/* Verification Date */}
                  <div className="space-y-2">
                    <Label
                      htmlFor={`id_verification_date_${index}`}
                      className="text-gray-700 font-medium"
                    >
                      ID Verification Date
                    </Label>
                    <Input
                      id={`id_verification_date_${index}`}
                      type="date"
                      value={identification.id_verification_date}
                      onChange={(e) =>
                        handleChange(
                          index,
                          "id_verification_date",
                          e.target.value
                        )
                      }
                      className="bg-white border-gray-300"
                    />
                  </div>

                  {/* Verification By */}
                  <div className="space-y-2">
                    <Label
                      htmlFor={`id_verification_by_${index}`}
                      className="text-gray-700 font-medium"
                    >
                      ID Verification By
                    </Label>
                    <Input
                      id={`id_verification_by_${index}`}
                      value={identification.id_verification_by}
                      onChange={(e) =>
                        handleChange(
                          index,
                          "id_verification_by",
                          e.target.value
                        )
                      }
                      placeholder="John Doe"
                      className="bg-white border-gray-300"
                    />
                  </div>

                  {/* Identification Type - FIXED */}
                  <div className="space-y-2">
                    <Label
                      htmlFor={`identification_type_${index}`}
                      className="text-gray-700 font-medium"
                    >
                      Identification Type
                    </Label>
                    <Select
                      value={
                        metadata?.type
                          ?.find(
                            (t) => t.name === identification.identification_type
                          )
                          ?.id?.toString() || ""
                      }
                      onValueChange={(value) => handleTypeChange(index, value)}
                    >
                      <SelectTrigger className="bg-white border-gray-300">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {metadata?.type?.map((type) => (
                          <SelectItem key={type.id} value={type.id.toString()}>
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Identification Country */}
                  <div className="space-y-2">
                    <Label
                      htmlFor={`identification_country_${index}`}
                      className="text-gray-700 font-medium"
                    >
                      Country
                    </Label>
                    <Input
                      id={`identification_country_${index}`}
                      value={identification.identification_country}
                      onChange={(e) =>
                        handleChange(
                          index,
                          "identification_country",
                          e.target.value
                        )
                      }
                      placeholder="USA"
                      className="bg-white border-gray-300"
                    />
                  </div>

                  {/* Identification Number */}
                  <div className="space-y-2">
                    <Label
                      htmlFor={`identification_number_${index}`}
                      className="text-gray-700 font-medium"
                    >
                      Identification Number
                    </Label>
                    <Input
                      id={`identification_number_${index}`}
                      value={identification.identification_number}
                      onChange={(e) =>
                        handleChange(
                          index,
                          "identification_number",
                          e.target.value
                        )
                      }
                      placeholder="A12345678"
                      className="bg-white border-gray-300"
                    />
                  </div>
                </div>
              </div>
            ))}

            {/* Add Identification Button */}
            <Button
              type="button"
              variant="outline"
              onClick={addIdentification}
              className="w-full md:w-auto"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Another Identification
            </Button>

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
