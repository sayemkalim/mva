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
import { Loader2, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { fetchSchoolCaregiverBySlug } from "../helpers/fetchSchoolCaregiverBySlug";
import { getSchoolCaregiverMeta } from "../helpers/fetchISchoolCaregiverMetadata";
import { createSchoolorCaregiver } from "../helpers/createSchoolorCaregiver";
import { Navbar2 } from "@/components/navbar2";

export default function SchoolCaregiver() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const {
    data: apiResponse,
    isLoading: isLoadingMetadata,
    error: metadataError,
    isError: isMetadataError,
  } = useQuery({
    queryKey: ["schoolCaregiverMeta"],
    queryFn: getSchoolCaregiverMeta,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  const metadata = apiResponse?.response || {};
  const { data: schoolCaregiverData, isLoading: isLoadingSchoolCaregiver } =
    useQuery({
      queryKey: ["schoolCaregiver", slug],
      queryFn: async () => {
        if (!slug) return null;

        try {
          const data = await fetchSchoolCaregiverBySlug(slug);
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
    mutationFn: createSchoolorCaregiver,
    onSuccess: (apiResponse) => {
      // console.log("✅ Success Response:", apiResponse);

      if (apiResponse?.response?.Apistatus) {
        toast.success("School/Caregiver information saved successfully!");
        // navigate(`/dashboard/workstation/edit/${slug}/representative-referral`);
      }
    },
    onError: (error) => {
      console.error("❌ Mutation Error:", error);
      toast.error("Failed to save information. Please try again.");
    },
  });

  const [formData, setFormData] = useState({
    was_full_time_student_id: null,
    school_name: "",
    address: {
      unit_number: "",
      street_number: "",
      street_name: "",
      city: "",
      province: "",
      postal_code: "",
      country: "",
    },
    date_last_attended: "",
    program_and_level: "",
    projected_completion_date: "",
    currently_attending_id: null,
    returned_to_school_id: null,

    caregiving_description: "",
    injuries_prevented_caregiving_id: null,
    returned_to_caregiving_id: null,
    caregiver_name_1: "",
    caregiver_dob_1: "",
    caregiver_disabled_1: null,

    caregiver_name_2: "",
    caregiver_dob_2: "",
    caregiver_disabled_2: null,

    caregiver_name_3: "",
    caregiver_dob_3: "",
    caregiver_disabled_3: null,

    caregiver_name_4: "",
    caregiver_dob_4: "",
    caregiver_disabled_4: null,

    caregiver_name_5: "",
    caregiver_dob_5: "",
    caregiver_disabled_5: null,
  });

  useEffect(() => {
    if (!slug) {
      toast.error("Invalid URL - Slug not found!");
      navigate("/dashboard/workstation");
    }
  }, [slug, navigate]);

  useEffect(() => {
    if (schoolCaregiverData) {
      // console.log(
      //   "📝 Populating form with existing data:",
      //   schoolCaregiverData
      // );

      setFormData({
        was_full_time_student_id:
          schoolCaregiverData.was_full_time_student_id || null,
        school_name: schoolCaregiverData.school_name || "",
        address: {
          unit_number: schoolCaregiverData.address?.unit_number || "",
          street_number: schoolCaregiverData.address?.street_number || "",
          street_name: schoolCaregiverData.address?.street_name || "",
          city: schoolCaregiverData.address?.city || "",
          province: schoolCaregiverData.address?.province || "",
          postal_code: schoolCaregiverData.address?.postal_code || "",
          country: schoolCaregiverData.address?.country || "",
        },
        date_last_attended: schoolCaregiverData.date_last_attended || "",
        program_and_level: schoolCaregiverData.program_and_level || "",
        projected_completion_date:
          schoolCaregiverData.projected_completion_date || "",
        currently_attending_id:
          schoolCaregiverData.currently_attending_id || null,
        returned_to_school_id:
          schoolCaregiverData.returned_to_school_id || null,

        caregiving_description:
          schoolCaregiverData.caregiving_description || "",
        injuries_prevented_caregiving_id:
          schoolCaregiverData.injuries_prevented_caregiving_id || null,
        returned_to_caregiving_id:
          schoolCaregiverData.returned_to_caregiving_id || null,

        caregiver_name_1: schoolCaregiverData.caregiver_name_1 || "",
        caregiver_dob_1: schoolCaregiverData.caregiver_dob_1 || "",
        caregiver_disabled_1: schoolCaregiverData.caregiver_disabled_1 || null,

        caregiver_name_2: schoolCaregiverData.caregiver_name_2 || "",
        caregiver_dob_2: schoolCaregiverData.caregiver_dob_2 || "",
        caregiver_disabled_2: schoolCaregiverData.caregiver_disabled_2 || null,

        caregiver_name_3: schoolCaregiverData.caregiver_name_3 || "",
        caregiver_dob_3: schoolCaregiverData.caregiver_dob_3 || "",
        caregiver_disabled_3: schoolCaregiverData.caregiver_disabled_3 || null,

        caregiver_name_4: schoolCaregiverData.caregiver_name_4 || "",
        caregiver_dob_4: schoolCaregiverData.caregiver_dob_4 || "",
        caregiver_disabled_4: schoolCaregiverData.caregiver_disabled_4 || null,

        caregiver_name_5: schoolCaregiverData.caregiver_name_5 || "",
        caregiver_dob_5: schoolCaregiverData.caregiver_dob_5 || "",
        caregiver_disabled_5: schoolCaregiverData.caregiver_disabled_5 || null,
      });

      // toast.success("Data loaded successfully!");
    } else {
      console.log("📝 No existing data - showing empty form");
    }
  }, [schoolCaregiverData]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isAddressFilled = (address) => {
      return Object.values(address).some(
        (value) => value && value.trim() !== ""
      );
    };
    const payload = {
      was_full_time_student_id: formData.was_full_time_student_id || null,
      school_name: formData.school_name || null,
      address: isAddressFilled(formData.address) ? formData.address : null,
      date_last_attended: formData.date_last_attended || null,
      program_and_level: formData.program_and_level || null,
      projected_completion_date: formData.projected_completion_date || null,
      currently_attending_id: formData.currently_attending_id || null,
      returned_to_school_id: formData.returned_to_school_id || null,

      caregiving_description: formData.caregiving_description || null,
      injuries_prevented_caregiving_id:
        formData.injuries_prevented_caregiving_id || null,
      returned_to_caregiving_id: formData.returned_to_caregiving_id || null,

      caregiver_name_1: formData.caregiver_name_1 || null,
      caregiver_dob_1: formData.caregiver_dob_1 || null,
      caregiver_disabled_1: formData.caregiver_disabled_1 || null,

      caregiver_name_2: formData.caregiver_name_2 || null,
      caregiver_dob_2: formData.caregiver_dob_2 || null,
      caregiver_disabled_2: formData.caregiver_disabled_2 || null,

      caregiver_name_3: formData.caregiver_name_3 || null,
      caregiver_dob_3: formData.caregiver_dob_3 || null,
      caregiver_disabled_3: formData.caregiver_disabled_3 || null,

      caregiver_name_4: formData.caregiver_name_4 || null,
      caregiver_dob_4: formData.caregiver_dob_4 || null,
      caregiver_disabled_4: formData.caregiver_disabled_4 || null,

      caregiver_name_5: formData.caregiver_name_5 || null,
      caregiver_dob_5: formData.caregiver_dob_5 || null,
      caregiver_disabled_5: formData.caregiver_disabled_5 || null,
    };

    console.log(
      "📤 Submitting School/Caregiver Payload:",
      JSON.stringify(payload, null, 2)
    );

    createMutation.mutate({
      slug: slug,
      data: payload,
    });
  };

  if (isLoadingMetadata || isLoadingSchoolCaregiver) {
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
              queryClient.invalidateQueries(["schoolCaregiverMeta"])
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
      <Navbar2 />
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
          <span className="text-gray-900 font-medium">School or Caregiver</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <h1 className="text-2xl font-bold mb-8 text-gray-900 uppercase">
            School or Caregiver Information
          </h1>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* School Information Section */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">
                School Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Was Full Time Student */}
                <div className="space-y-2">
                  <Label
                    htmlFor="was_full_time_student_id"
                    className="text-gray-700 font-medium"
                  >
                    Was Full Time Student
                  </Label>
                  <Select
                    value={formData.was_full_time_student_id?.toString() || ""}
                    onValueChange={(value) =>
                      handleSelectChange("was_full_time_student_id", value)
                    }
                  >
                    <SelectTrigger className="bg-gray-50 border-gray-300">
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

                {/* School Name */}
                <div className="space-y-2">
                  <Label
                    htmlFor="school_name"
                    className="text-gray-700 font-medium"
                  >
                    School Name
                  </Label>
                  <Input
                    id="school_name"
                    name="school_name"
                    value={formData.school_name}
                    onChange={handleChange}
                    placeholder="Harvard University"
                    className="bg-gray-50 border-gray-300"
                  />
                </div>

                {/* Date Last Attended */}
                <div className="space-y-2">
                  <Label
                    htmlFor="date_last_attended"
                    className="text-gray-700 font-medium"
                  >
                    Date Last Attended
                  </Label>
                  <Input
                    id="date_last_attended"
                    name="date_last_attended"
                    type="date"
                    value={formData.date_last_attended}
                    onChange={handleChange}
                    className="bg-gray-50 border-gray-300"
                  />
                </div>

                {/* Program and Level */}
                <div className="space-y-2">
                  <Label
                    htmlFor="program_and_level"
                    className="text-gray-700 font-medium"
                  >
                    Program and Level
                  </Label>
                  <Input
                    id="program_and_level"
                    name="program_and_level"
                    value={formData.program_and_level}
                    onChange={handleChange}
                    placeholder="Bachelor of Science in Computer Science"
                    className="bg-gray-50 border-gray-300"
                  />
                </div>

                {/* Projected Completion Date */}
                <div className="space-y-2">
                  <Label
                    htmlFor="projected_completion_date"
                    className="text-gray-700 font-medium"
                  >
                    Projected Completion Date
                  </Label>
                  <Input
                    id="projected_completion_date"
                    name="projected_completion_date"
                    type="date"
                    value={formData.projected_completion_date}
                    onChange={handleChange}
                    className="bg-gray-50 border-gray-300"
                  />
                </div>

                {/* Currently Attending */}
                <div className="space-y-2">
                  <Label
                    htmlFor="currently_attending_id"
                    className="text-gray-700 font-medium"
                  >
                    Currently Attending
                  </Label>
                  <Select
                    value={formData.currently_attending_id?.toString() || ""}
                    onValueChange={(value) =>
                      handleSelectChange("currently_attending_id", value)
                    }
                  >
                    <SelectTrigger className="bg-gray-50 border-gray-300">
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

                {/* Returned to School */}
                <div className="space-y-2">
                  <Label
                    htmlFor="returned_to_school_id"
                    className="text-gray-700 font-medium"
                  >
                    Returned to School
                  </Label>
                  <Select
                    value={formData.returned_to_school_id?.toString() || ""}
                    onValueChange={(value) =>
                      handleSelectChange("returned_to_school_id", value)
                    }
                  >
                    <SelectTrigger className="bg-gray-50 border-gray-300">
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
              </div>
            </div>

            {/* School Address Section */}
            <div className="space-y-6 pt-6 border-t">
              <h2 className="text-xl font-semibold text-gray-900">
                School Address
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

            {/* Caregiving Information Section */}
            <div className="space-y-6 pt-6 border-t">
              <h2 className="text-xl font-semibold text-gray-900">
                Caregiving Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Injuries Prevented Caregiving */}
                <div className="space-y-2">
                  <Label
                    htmlFor="injuries_prevented_caregiving_id"
                    className="text-gray-700 font-medium"
                  >
                    Injuries Prevented Caregiving
                  </Label>
                  <Select
                    value={
                      formData.injuries_prevented_caregiving_id?.toString() ||
                      ""
                    }
                    onValueChange={(value) =>
                      handleSelectChange(
                        "injuries_prevented_caregiving_id",
                        value
                      )
                    }
                  >
                    <SelectTrigger className="bg-gray-50 border-gray-300">
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

                {/* Returned to Caregiving */}
                <div className="space-y-2">
                  <Label
                    htmlFor="returned_to_caregiving_id"
                    className="text-gray-700 font-medium"
                  >
                    Returned to Caregiving
                  </Label>
                  <Select
                    value={formData.returned_to_caregiving_id?.toString() || ""}
                    onValueChange={(value) =>
                      handleSelectChange("returned_to_caregiving_id", value)
                    }
                  >
                    <SelectTrigger className="bg-gray-50 border-gray-300">
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

                {/* Caregiving Description - Full Width */}
                <div className="space-y-2 md:col-span-2">
                  <Label
                    htmlFor="caregiving_description"
                    className="text-gray-700 font-medium"
                  >
                    Caregiving Description
                  </Label>
                  <Textarea
                    id="caregiving_description"
                    name="caregiving_description"
                    value={formData.caregiving_description}
                    onChange={handleChange}
                    placeholder="I provided daily care to my grandmother before the accident."
                    rows={3}
                    className="bg-gray-50 border-gray-300"
                  />
                </div>
              </div>
            </div>

            {/* Caregivers Section */}
            <div className="space-y-6 pt-6 border-t">
              <h2 className="text-xl font-semibold text-gray-900">
                Caregivers
              </h2>

              {[1, 2, 3, 4, 5].map((num) => (
                <div
                  key={num}
                  className="border border-gray-200 p-6 rounded-lg space-y-4 bg-gray-50"
                >
                  <h3 className="font-semibold text-gray-900">
                    Caregiver {num}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Caregiver Name */}
                    <div className="space-y-2">
                      <Label className="text-gray-700 font-medium">Name</Label>
                      <Input
                        name={`caregiver_name_${num}`}
                        value={formData[`caregiver_name_${num}`]}
                        onChange={handleChange}
                        placeholder="John Doe"
                        className="bg-white border-gray-300"
                      />
                    </div>

                    {/* Caregiver DOB */}
                    <div className="space-y-2">
                      <Label className="text-gray-700 font-medium">
                        Date of Birth
                      </Label>
                      <Input
                        type="date"
                        name={`caregiver_dob_${num}`}
                        value={formData[`caregiver_dob_${num}`]}
                        onChange={handleChange}
                        className="bg-white border-gray-300"
                      />
                    </div>

                    {/* Caregiver Disabled */}
                    <div className="space-y-2">
                      <Label className="text-gray-700 font-medium">
                        Disabled
                      </Label>
                      <Select
                        value={
                          formData[`caregiver_disabled_${num}`]?.toString() ||
                          ""
                        }
                        onValueChange={(value) =>
                          handleSelectChange(`caregiver_disabled_${num}`, value)
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
                  </div>
                </div>
              ))}
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
