import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, ChevronRight, Upload, X, Eye } from "lucide-react";
import { toast } from "sonner";
import { createApplicantInfo } from "../helpers/createApplicantInfo";
import { getApplicantMeta } from "../helpers/fetchApplicantInfoMetadata";
import { fetchApplicantInfoBySlug } from "../helpers/fetchApplicantInfoBySlug";
import { uploadAttachment } from "../helpers/uploadAttachment";
import { Navbar2 } from "@/components/navbar2";

/* shadcn-style components for searchable select */
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

function ShadcnSelect({ value, onValueChange, options, placeholder, label }) {
  const selected = options.find((o) => String(o.id) === String(value)) || null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className="w-full justify-between"
        >
          {selected ? selected.name : placeholder}
          <ChevronRight className="ml-2 h-4 w-4 rotate-90" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-300px p-0">
        <Command>
          <CommandInput placeholder={label.toLowerCase()} />
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup>
            {options.map((opt) => (
              <CommandItem
                key={opt.id}
                onSelect={() => onValueChange(opt.id)}
                value={opt.name}
              >
                {opt.name}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export default function ApplicantInformation() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    data: apiResponse,
    isLoading: isLoadingMetadata,
    error: metadataError,
    isError: isMetadataError,
  } = useQuery({
    queryKey: ["applicantMeta"],
    queryFn: getApplicantMeta,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  const metadata = apiResponse?.response || {};

  const { data: applicantData, isLoading: isLoadingApplicant } = useQuery({
    queryKey: ["applicantInfo", slug],
    queryFn: async () => {
      if (!slug) return null;
      try {
        const data = await fetchApplicantInfoBySlug(slug);
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

  const uploadMutation = useMutation({
    mutationFn: uploadAttachment,
    onSuccess: (data) => {
      console.log("✅ File uploaded:", data);
      const attachmentId = data?.response?.attachment_id;
      if (attachmentId) {
        setFormData((prev) => ({ ...prev, attachment_id: attachmentId }));
        toast.success("Photo uploaded successfully!");
      }
    },
    onError: (error) => {
      toast.error("Failed to upload photo. Please try again.");
      console.error("Upload error:", error);
    },
  });

  const createMutation = useMutation({
    mutationFn: createApplicantInfo,
    onSuccess: (data) => {
      toast.success("Application submitted successfully!");
    },
    onError: (error) => {
      toast.error("Failed to submit application. Please try again.");
      console.error("Mutation Error:", error);
    },
  });

  const [formData, setFormData] = useState({
    gender_id: "",
    last_name: "",
    first_name: "",
    middle_name: "",
    marital_status_id: "",
    dob: "",
    canadian_resident_id: "",
    resident_status_id: "",
    language_spoken: "",
    contact_method_id: "",
    telephone: "",
    ext: "",
    fax: "",
    email: "",
    attachment_id: null,
    file: null,
    fileName: "",
    filePreview: null,
    social_media_facebook: "",
    social_media_instagram: "",
    social_media_tiktok: "",
    social_media_x: "",
    social_media_snapchat: "",
    social_media_linkedin: "",
    reaches: [{ day_id: "", time: "" }],
    client_availability_away_id: "",
    client_availability_from: "",
    client_availability_to: "",
    current_address: {
      unit_number: "",
      street_number: "",
      street_name: "",
      city: "",
      province: "",
      postal_code: "",
      country: "",
    },
    mailing_address: {
      unit_number: "",
      street_number: "",
      street_name: "",
      city: "",
      province: "",
      postal_code: "",
      country: "",
    },
    family_member_first_name: "",
    family_member_middle_name: "",
    family_member_last_name: "",
    family_member_dob: "",
    family_member_spouse_status_id: "",
    family_member_employment_status_id: "",
    family_member_annual_income: "",
    family_member_telephone: "",
    family_member_email: "",
    family_member_note: "",
    family_member_address: {
      unit_number: "",
      street_number: "",
      street_name: "",
      city: "",
      province: "",
      postal_code: "",
      country: "",
    },
    children: [{ first_name: "", middle_number: "", last_name: "", dob: "" }],
    meeting_clients: [{ date: "" }],
  });

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  useEffect(() => {
    if (!slug) {
      toast.error("Invalid URL - Slug not found!");
      navigate("/dashboard/workstation");
    }
  }, [slug, navigate]);

  useEffect(() => {
    console.log(
      "DEBUG reaches before submit:",
      JSON.stringify(formData.reaches, null, 2)
    );

    if (applicantData) {
      // populate form using correct response keys
      setFormData({
        gender_id: applicantData.gender_id ?? "",
        last_name: applicantData.last_name ?? "",
        first_name: applicantData.first_name ?? "",
        middle_name: applicantData.middle_name ?? "",
        marital_status_id: applicantData.marital_status_id ?? "",
        dob: applicantData.dob ? applicantData.dob.split("T")[0] : "",
        canadian_resident_id: applicantData.canadian_resident_id ?? "",
        resident_status_id: applicantData.resident_status_id ?? "",
        language_spoken: applicantData.language_spoken ?? "",
        contact_method_id: applicantData.contact_method_id ?? "",
        telephone: applicantData.telephone ?? "",
        ext: applicantData.ext ?? "",
        fax: applicantData.fax ?? "",
        email: applicantData.email ?? "",
        attachment_id: applicantData.attachment_id ?? null,
        file: null,
        fileName: "",
        filePreview: null,
        social_media_facebook: applicantData.social_media_facebook ?? "",
        social_media_instagram: applicantData.social_media_instagram ?? "",
        social_media_tiktok: applicantData.social_media_tiktok ?? "",
        social_media_x: applicantData.social_media_x ?? "",
        social_media_snapchat: applicantData.social_media_snapchat ?? "",
        social_media_linkedin: applicantData.social_media_linkedin ?? "",
        reaches:
          applicantData.reach && applicantData.reach.length > 0
            ? applicantData.reach.map((r) => ({
                day_id: r.day_id ?? "",
                // trim seconds from "HH:MM:SS" => "HH:MM"
                time: r.time ? r.time.slice(0, 5) : "",
              }))
            : [{ day_id: "", time: "" }],
        client_availability_away_id:
          applicantData.client_availability_away_id ?? "",
        client_availability_from: applicantData.client_availability_from
          ? applicantData.client_availability_from.split("T")[0]
          : "",
        client_availability_to: applicantData.client_availability_to
          ? applicantData.client_availability_to.split("T")[0]
          : "",
        current_address: {
          unit_number: applicantData.current_address?.unit_number ?? "",
          street_number: applicantData.current_address?.street_number ?? "",
          street_name: applicantData.current_address?.street_name ?? "",
          city: applicantData.current_address?.city ?? "",
          province: applicantData.current_address?.province ?? "",
          postal_code: applicantData.current_address?.postal_code ?? "",
          country: applicantData.current_address?.country ?? "",
        },
        mailing_address: {
          unit_number: applicantData.mailing_address?.unit_number ?? "",
          street_number: applicantData.mailing_address?.street_number ?? "",
          street_name: applicantData.mailing_address?.street_name ?? "",
          city: applicantData.mailing_address?.city ?? "",
          province: applicantData.mailing_address?.province ?? "",
          postal_code: applicantData.mailing_address?.postal_code ?? "",
          country: applicantData.mailing_address?.country ?? "",
        },
        family_member_first_name: applicantData.family_member_first_name ?? "",
        family_member_middle_name:
          applicantData.family_member_middle_name ?? "",
        family_member_last_name: applicantData.family_member_last_name ?? "",
        family_member_dob: applicantData.family_member_dob
          ? applicantData.family_member_dob.split("T")[0]
          : "",
        family_member_spouse_status_id:
          applicantData.family_member_spouse_status_id ?? "",
        family_member_employment_status_id:
          applicantData.family_member_employment_status_id ?? "",
        family_member_annual_income:
          applicantData.family_member_annual_income ?? "",
        family_member_telephone: applicantData.family_member_telephone ?? "",
        family_member_email: applicantData.family_member_email ?? "",
        family_member_note: applicantData.family_member_note ?? "",
        family_member_address: {
          unit_number: applicantData.family_member_address?.unit_number ?? "",
          street_number:
            applicantData.family_member_address?.street_number ?? "",
          street_name: applicantData.family_member_address?.street_name ?? "",
          city: applicantData.family_member_address?.city ?? "",
          province: applicantData.family_member_address?.province ?? "",
          postal_code: applicantData.family_member_address?.postal_code ?? "",
          country: applicantData.family_member_address?.country ?? "",
        },
        children:
          applicantData.children && applicantData.children.length > 0
            ? applicantData.children.map((c) => ({
                first_name: c.first_name ?? "",
                middle_number: c.middle_number ?? "",
                last_name: c.last_name ?? "",
                dob: c.dob ? c.dob.split("T")[0] : "",
              }))
            : [{ first_name: "", middle_number: "", last_name: "", dob: "" }],
        meeting_clients:
          applicantData.meeting_client &&
          applicantData.meeting_client.length > 0
            ? applicantData.meeting_client.map((m) => ({
                date: m.date ? m.date.split("T")[0] : "",
              }))
            : [{ date: "" }],
      });
    } // end if applicantData
  }, [applicantData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddressChange = (addressType, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [addressType]: { ...prev[addressType], [field]: value },
    }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value === "" ? "" : value,
    }));
  };

  const handleArrayChange = (arrayName, index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [arrayName]: prev[arrayName].map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const addArrayItem = (arrayName, defaultItem) => {
    setFormData((prev) => ({
      ...prev,
      [arrayName]: [...prev[arrayName], defaultItem],
    }));
  };

  const removeArrayItem = (arrayName, index) => {
    setFormData((prev) => ({
      ...prev,
      [arrayName]: prev[arrayName].filter((_, i) => i !== index),
    }));
  };

  const handleFileChange = async (file) => {
    if (!file) return;
    if (file.size > 1048576) {
      toast.error("File size must be less than 1MB");
      return;
    }
    const previewUrl = URL.createObjectURL(file);
    setFormData((prev) => ({
      ...prev,
      file,
      fileName: file.name,
      filePreview: previewUrl,
    }));
    await uploadMutation.mutateAsync({ file });
  };

  const removeFile = () => {
    setFormData((prev) => ({
      ...prev,
      file: null,
      fileName: "",
      filePreview: null,
      attachment_id: null,
    }));
    const fileInput = document.getElementById("applicant_photo");
    if (fileInput) fileInput.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.first_name || !formData.last_name || !formData.email) {
      toast.error("Please fill all required fields!");
      return;
    }

    const isAddressFilled = (address) =>
      Object.values(address).some((value) => value && value.trim() !== "");

    const payload = {
      gender_id: formData.gender_id || null,
      last_name: formData.last_name,
      first_name: formData.first_name,
      middle_name: formData.middle_name || null,
      marital_status_id: formData.marital_status_id || null,
      dob: formData.dob || null,
      canadian_resident_id: formData.canadian_resident_id || null,
      resident_status_id: formData.resident_status_id || null,
      language_spoken: formData.language_spoken || null,
      contact_method_id: formData.contact_method_id || null,
      telephone: formData.telephone || null,
      ext: formData.ext || null,
      fax: formData.fax || null,
      email: formData.email,
      attachment_id: formData.attachment_id || null,
      social_media_facebook: formData.social_media_facebook || null,
      social_media_instagram: formData.social_media_instagram || null,
      social_media_tiktok: formData.social_media_tiktok || null,
      social_media_x: formData.social_media_x || null,
      social_media_snapchat: formData.social_media_snapchat || null,
      social_media_linkedin: formData.social_media_linkedin || null,

      reaches: formData.reaches
        .map((r, idx) => {
          const rawDay = r.day_id;
          const dayId =
            rawDay !== "" && rawDay !== null && !Number.isNaN(Number(rawDay))
              ? Number(rawDay)
              : null;

          // normalize time to HH:MM:SS (as earlier)
          let timeVal = null;
          if (r.time) {
            timeVal = r.time.length === 5 ? `${r.time}:00` : r.time;
          }

          return { day_id: dayId, time: timeVal };
        })
        .filter((r) => r.day_id !== null && r.time),

      client_availability_away_id: formData.client_availability_away_id || null,
      client_availability_from: formData.client_availability_from || null,
      client_availability_to: formData.client_availability_to || null,

      ...(isAddressFilled(formData.current_address) && {
        current_address: formData.current_address,
      }),
      ...(isAddressFilled(formData.mailing_address) && {
        mailing_address: formData.mailing_address,
      }),

      family_member_first_name: formData.family_member_first_name || null,
      family_member_middle_name: formData.family_member_middle_name || null,
      family_member_last_name: formData.family_member_last_name || null,
      family_member_dob: formData.family_member_dob || null,
      family_member_spouse_status_id:
        formData.family_member_spouse_status_id || null,
      family_member_employment_status_id:
        formData.family_member_employment_status_id || null,
      family_member_annual_income: formData.family_member_annual_income || null,
      family_member_telephone: formData.family_member_telephone || null,
      family_member_email: formData.family_member_email || null,
      family_member_note: formData.family_member_note || null,

      ...(isAddressFilled(formData.family_member_address) && {
        family_member_address: formData.family_member_address,
      }),

      children: formData.children
        .map((c) => ({
          first_name: c.first_name || null,
          middle_number: c.middle_number || null,
          last_name: c.last_name || null,
          dob: c.dob || null,
        }))
        .filter((c) => c.first_name || c.last_name || c.dob),

      meeting_clients: formData.meeting_clients
        .map((m) => (m.date ? { date: m.date } : null))
        .filter(Boolean),
    };

    console.log("📤 Final Payload:", JSON.stringify(payload, null, 2));

    createMutation.mutate({ slug, data: payload });
  };

  if (isLoadingMetadata || isLoadingApplicant) {
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
            onClick={() => queryClient.invalidateQueries(["applicantMeta"])}
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
            Applicant Information
          </span>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-7xl">
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <h1 className="text-2xl font-bold mb-8 text-gray-900 uppercase">
            Applicant Information
          </h1>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="space-y-2">
                <Label
                  htmlFor="gender_id"
                  className="text-gray-700 font-medium"
                >
                  Gender
                </Label>
                <ShadcnSelect
                  value={formData.gender_id}
                  onValueChange={(val) => handleSelectChange("gender_id", val)}
                  options={metadata?.contact_gender || []}
                  placeholder="Select gender"
                  label="Gender"
                />
              </div>

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
                  placeholder="Doe"
                  className="w-full h-9 bg-gray-50 border-gray-300"
                />
              </div>

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
                  placeholder="John"
                  className="w-full h-9 bg-gray-50 border-gray-300"
                />
              </div>

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
                  placeholder="john.doe@example.com"
                  className="w-full h-9 bg-gray-50 border-gray-300"
                />
              </div>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                  placeholder="Michael"
                  className="w-full h-9 bg-gray-50 border-gray-300"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="marital_status_id"
                  className="text-gray-700 font-medium"
                >
                  Marital Status
                </Label>
                <ShadcnSelect
                  value={formData.marital_status_id}
                  onValueChange={(val) =>
                    handleSelectChange("marital_status_id", val)
                  }
                  options={metadata?.marital_status || []}
                  placeholder="Select status"
                  label="Marital Status"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dob" className="text-gray-700 font-medium">
                  DOB
                </Label>
                <Input
                  id="dob"
                  name="dob"
                  type="date"
                  value={formData.dob}
                  onChange={handleChange}
                  className="w-full h-9 bg-gray-50 border-gray-300"
                />
              </div>
            </div>

            {/* Row 3 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label
                  htmlFor="canadian_resident_id"
                  className="text-gray-700 font-medium"
                >
                  Canadian Resident
                </Label>
                <ShadcnSelect
                  value={formData.canadian_resident_id}
                  onValueChange={(val) =>
                    handleSelectChange("canadian_resident_id", val)
                  }
                  options={metadata?.yes_no_option || []}
                  placeholder="Select option"
                  label="Canadian Resident"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="resident_status_id"
                  className="text-gray-700 font-medium"
                >
                  Resident Status
                </Label>
                <ShadcnSelect
                  value={formData.resident_status_id}
                  onValueChange={(val) =>
                    handleSelectChange("resident_status_id", val)
                  }
                  options={metadata?.resident_status || []}
                  placeholder="Select status"
                  label="Resident Status"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="language_spoken"
                  className="text-gray-700 font-medium"
                >
                  Language Spoken
                </Label>
                <Input
                  id="language_spoken"
                  name="language_spoken"
                  value={formData.language_spoken}
                  onChange={handleChange}
                  placeholder="English"
                  className="w-full h-9 bg-gray-50 border-gray-300"
                />
              </div>
            </div>

            {/* Row 4 */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="space-y-2">
                <Label
                  htmlFor="contact_method_id"
                  className="text-gray-700 font-medium"
                >
                  Contact Method
                </Label>
                <ShadcnSelect
                  value={formData.contact_method_id}
                  onValueChange={(val) =>
                    handleSelectChange("contact_method_id", val)
                  }
                  options={metadata?.contact_method || []}
                  placeholder="Select method"
                  label="Contact Method"
                />
              </div>

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
                  className="w-full h-9 bg-gray-50 border-gray-300"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ext" className="text-gray-700 font-medium">
                  Ext
                </Label>
                <Input
                  id="ext"
                  name="ext"
                  value={formData.ext}
                  onChange={handleChange}
                  placeholder="2"
                  className="w-full h-9 bg-gray-50 border-gray-300"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fax" className="text-gray-700 font-medium">
                  Fax
                </Label>
                <Input
                  id="fax"
                  name="fax"
                  value={formData.fax}
                  onChange={handleChange}
                  placeholder="2"
                  className="w-full h-9 bg-gray-50 border-gray-300"
                />
              </div>
            </div>

            {/* Photo Upload (unchanged) */}
            <div className="space-y-2">
              <Label className="text-gray-700 font-medium">
                Applicant Photo <span className="text-red-500">(Max 1MB)</span>
              </Label>
              <div
                className={`relative border-2 border-dashed rounded-lg transition-all overflow-hidden ${
                  formData.filePreview
                    ? "border-green-500 bg-green-50/50 h-[200px]"
                    : "border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100 h-[200px]"
                }`}
              >
                <input
                  id="applicant_photo"
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileChange(file);
                  }}
                  accept="image/*"
                />

                {formData.filePreview ? (
                  <div className="relative h-full flex flex-col items-center justify-center p-4">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile();
                      }}
                      className="absolute top-3 right-3 z-10 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors shadow-md"
                    >
                      <X className="w-4 h-4" />
                    </button>

                    <div
                      className="flex flex-col items-center justify-center gap-3 cursor-pointer group"
                      onClick={() => setIsPreviewOpen(true)}
                    >
                      <div className="relative">
                        <img
                          src={formData.filePreview}
                          alt="Preview"
                          className="w-28 h-28 object-cover rounded-xl border-2 border-green-500 shadow-md group-hover:shadow-lg transition-shadow"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-xl transition-colors flex items-center justify-center">
                          <Eye className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-green-700">
                          Photo Uploaded
                        </p>
                        <p className="text-xs text-gray-600 mt-1 max-w-[150px] truncate">
                          {formData.fileName}
                        </p>
                        <p className="text-xs text-green-600 mt-1 flex items-center gap-1 justify-center">
                          <Eye className="w-3 h-3" />
                          Click to view
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    className="h-full flex flex-col items-center justify-center cursor-pointer p-6 group"
                    onClick={() =>
                      document.getElementById("applicant_photo").click()
                    }
                  >
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center group-hover:from-blue-50 group-hover:to-blue-100 transition-all">
                        <Upload className="w-9 h-9 text-gray-400 group-hover:text-blue-500 transition-colors" />
                      </div>
                      <div className="text-center">
                        <p className="text-base font-semibold text-gray-700 group-hover:text-blue-600 transition-colors">
                          Upload
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Drag and drop or click
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          PNG, JPG (Max 1MB)
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Social Media */}
            <div className="space-y-6 pt-6 border-t">
              <h2 className="text-xl font-semibold text-gray-900">
                Social Media
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="social_media_facebook"
                    className="text-gray-700 font-medium"
                  >
                    Facebook
                  </Label>
                  <Input
                    id="social_media_facebook"
                    name="social_media_facebook"
                    value={formData.social_media_facebook}
                    onChange={handleChange}
                    placeholder="https://facebook.com/john.doe"
                    className="w-full h-9 bg-gray-50 border-gray-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="social_media_instagram"
                    className="text-gray-700 font-medium"
                  >
                    Instagram
                  </Label>
                  <Input
                    id="social_media_instagram"
                    name="social_media_instagram"
                    value={formData.social_media_instagram}
                    onChange={handleChange}
                    placeholder="https://instagram.com/johndoe"
                    className="w-full h-9 bg-gray-50 border-gray-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="social_media_tiktok"
                    className="text-gray-700 font-medium"
                  >
                    TikTok
                  </Label>
                  <Input
                    id="social_media_tiktok"
                    name="social_media_tiktok"
                    value={formData.social_media_tiktok}
                    onChange={handleChange}
                    placeholder="@johndoe"
                    className="w-full h-9 bg-gray-50 border-gray-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="social_media_x"
                    className="text-gray-700 font-medium"
                  >
                    X (Twitter)
                  </Label>
                  <Input
                    id="social_media_x"
                    name="social_media_x"
                    value={formData.social_media_x}
                    onChange={handleChange}
                    placeholder="@john_doe"
                    className="w-full h-9 bg-gray-50 border-gray-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="social_media_snapchat"
                    className="text-gray-700 font-medium"
                  >
                    Snapchat
                  </Label>
                  <Input
                    id="social_media_snapchat"
                    name="social_media_snapchat"
                    value={formData.social_media_snapchat}
                    onChange={handleChange}
                    placeholder="john_snap"
                    className="w-full h-9 bg-gray-50 border-gray-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="social_media_linkedin"
                    className="text-gray-700 font-medium"
                  >
                    LinkedIn
                  </Label>
                  <Input
                    id="social_media_linkedin"
                    name="social_media_linkedin"
                    value={formData.social_media_linkedin}
                    onChange={handleChange}
                    placeholder="https://linkedin.com/in/john-doe"
                    className="w-full h-9 bg-gray-50 border-gray-300"
                  />
                </div>
              </div>
            </div>

            {/* Best Times to Reach */}
            <div className="space-y-6 pt-6 border-t">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  Best Times to Reach
                </h2>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    addArrayItem("reaches", { day_id: "", time: "" })
                  }
                >
                  Add Time
                </Button>
              </div>

              {formData.reaches.map((reach, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 lg:grid-cols-3 gap-6"
                >
                  <div className="space-y-2">
                    <Label className="text-gray-700 font-medium">Day</Label>
                    <ShadcnSelect
                      value={reach.day_id}
                      onValueChange={(val) =>
                        handleArrayChange("reaches", index, "day_id", val)
                      }
                      options={metadata?.day || []}
                      placeholder="Select day"
                      label="Day"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-700 font-medium">Time</Label>
                    <Input
                      type="time"
                      value={reach.time}
                      onChange={(e) =>
                        handleArrayChange(
                          "reaches",
                          index,
                          "time",
                          e.target.value
                        )
                      }
                      className="w-full h-9 bg-gray-50 border-gray-300"
                    />
                  </div>

                  <div className="flex items-end">
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeArrayItem("reaches", index)}
                      disabled={formData.reaches.length === 1}
                      className="w-full h-11"
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Client Availability */}
            <div className="space-y-6 pt-6 border-t">
              <h2 className="text-xl font-semibold text-gray-900">
                Client Availability
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="client_availability_away_id"
                    className="text-gray-700 font-medium"
                  >
                    Away Status
                  </Label>
                  <ShadcnSelect
                    value={formData.client_availability_away_id}
                    onValueChange={(val) =>
                      handleSelectChange("client_availability_away_id", val)
                    }
                    options={metadata?.yes_no_option || []}
                    placeholder="Select status"
                    label="Away Status"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="client_availability_from"
                    className="text-gray-700 font-medium"
                  >
                    From Date
                  </Label>
                  <Input
                    id="client_availability_from"
                    name="client_availability_from"
                    type="date"
                    value={formData.client_availability_from}
                    onChange={handleChange}
                    className="w-full h-9 bg-gray-50 border-gray-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="client_availability_to"
                    className="text-gray-700 font-medium"
                  >
                    To Date
                  </Label>
                  <Input
                    id="client_availability_to"
                    name="client_availability_to"
                    type="date"
                    value={formData.client_availability_to}
                    onChange={handleChange}
                    className="w-full h-9 bg-gray-50 border-gray-300"
                  />
                </div>
              </div>
            </div>

            {/* Current Address */}
            <div className="space-y-6 pt-6 border-t">
              <h2 className="text-xl font-semibold text-gray-900">
                Current Address
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">
                    Unit Number
                  </Label>
                  <Input
                    value={formData.current_address.unit_number}
                    onChange={(e) =>
                      handleAddressChange(
                        "current_address",
                        "unit_number",
                        e.target.value
                      )
                    }
                    placeholder="5B"
                    className="w-full h-9 bg-gray-50 border-gray-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">
                    Street Number
                  </Label>
                  <Input
                    value={formData.current_address.street_number}
                    onChange={(e) =>
                      handleAddressChange(
                        "current_address",
                        "street_number",
                        e.target.value
                      )
                    }
                    placeholder="221"
                    className="w-full h-9 bg-gray-50 border-gray-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">
                    Street Name
                  </Label>
                  <Input
                    value={formData.current_address.street_name}
                    onChange={(e) =>
                      handleAddressChange(
                        "current_address",
                        "street_name",
                        e.target.value
                      )
                    }
                    placeholder="King Street West"
                    className="w-full h-9 bg-gray-50 border-gray-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">City</Label>
                  <Input
                    value={formData.current_address.city}
                    onChange={(e) =>
                      handleAddressChange(
                        "current_address",
                        "city",
                        e.target.value
                      )
                    }
                    placeholder="Toronto"
                    className="w-full h-9 bg-gray-50 border-gray-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">Province</Label>
                  <Input
                    value={formData.current_address.province}
                    onChange={(e) =>
                      handleAddressChange(
                        "current_address",
                        "province",
                        e.target.value
                      )
                    }
                    placeholder="Ontario"
                    className="w-full h-9 bg-gray-50 border-gray-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">
                    Postal Code
                  </Label>
                  <Input
                    value={formData.current_address.postal_code}
                    onChange={(e) =>
                      handleAddressChange(
                        "current_address",
                        "postal_code",
                        e.target.value
                      )
                    }
                    placeholder="M5H 1K5"
                    className="w-full h-9 bg-gray-50 border-gray-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">Country</Label>
                  <Input
                    value={formData.current_address.country}
                    onChange={(e) =>
                      handleAddressChange(
                        "current_address",
                        "country",
                        e.target.value
                      )
                    }
                    placeholder="Canada"
                    className="w-full h-9 bg-gray-50 border-gray-300"
                  />
                </div>
              </div>
            </div>

            {/* Mailing Address */}
            <div className="space-y-6 pt-6 border-t">
              <h2 className="text-xl font-semibold text-gray-900">
                Mailing Address
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">
                    Unit Number
                  </Label>
                  <Input
                    value={formData.mailing_address.unit_number}
                    onChange={(e) =>
                      handleAddressChange(
                        "mailing_address",
                        "unit_number",
                        e.target.value
                      )
                    }
                    placeholder="5B"
                    className="w-full h-9 bg-gray-50 border-gray-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">
                    Street Number
                  </Label>
                  <Input
                    value={formData.mailing_address.street_number}
                    onChange={(e) =>
                      handleAddressChange(
                        "mailing_address",
                        "street_number",
                        e.target.value
                      )
                    }
                    placeholder="221"
                    className="w-full h-9 bg-gray-50 border-gray-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">
                    Street Name
                  </Label>
                  <Input
                    value={formData.mailing_address.street_name}
                    onChange={(e) =>
                      handleAddressChange(
                        "mailing_address",
                        "street_name",
                        e.target.value
                      )
                    }
                    placeholder="King Street West"
                    className="w-full h-9 bg-gray-50 border-gray-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">City</Label>
                  <Input
                    value={formData.mailing_address.city}
                    onChange={(e) =>
                      handleAddressChange(
                        "mailing_address",
                        "city",
                        e.target.value
                      )
                    }
                    placeholder="Toronto"
                    className="w-full h-9 bg-gray-50 border-gray-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">Province</Label>
                  <Input
                    value={formData.mailing_address.province}
                    onChange={(e) =>
                      handleAddressChange(
                        "mailing_address",
                        "province",
                        e.target.value
                      )
                    }
                    placeholder="Ontario"
                    className="w-full h-9 bg-gray-50 border-gray-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">
                    Postal Code
                  </Label>
                  <Input
                    value={formData.mailing_address.postal_code}
                    onChange={(e) =>
                      handleAddressChange(
                        "mailing_address",
                        "postal_code",
                        e.target.value
                      )
                    }
                    placeholder="M5H 1K5"
                    className="w-full h-9 bg-gray-50 border-gray-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">Country</Label>
                  <Input
                    value={formData.mailing_address.country}
                    onChange={(e) =>
                      handleAddressChange(
                        "mailing_address",
                        "country",
                        e.target.value
                      )
                    }
                    placeholder="Canada"
                    className="w-full h-9 bg-gray-50 border-gray-300"
                  />
                </div>
              </div>
            </div>

            {/* Family Member Information */}
            <div className="space-y-6 pt-6 border-t">
              <h2 className="text-xl font-semibold text-gray-900">
                Family Member Information
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="family_member_first_name"
                    className="text-gray-700 font-medium"
                  >
                    First Name
                  </Label>
                  <Input
                    id="family_member_first_name"
                    name="family_member_first_name"
                    value={formData.family_member_first_name}
                    onChange={handleChange}
                    placeholder="Jane"
                    className="w-full h-9 bg-gray-50 border-gray-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="family_member_middle_name"
                    className="text-gray-700 font-medium"
                  >
                    Middle Name
                  </Label>
                  <Input
                    id="family_member_middle_name"
                    name="family_member_middle_name"
                    value={formData.family_member_middle_name}
                    onChange={handleChange}
                    placeholder="K"
                    className="w-full h-9 bg-gray-50 border-gray-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="family_member_last_name"
                    className="text-gray-700 font-medium"
                  >
                    Last Name
                  </Label>
                  <Input
                    id="family_member_last_name"
                    name="family_member_last_name"
                    value={formData.family_member_last_name}
                    onChange={handleChange}
                    placeholder="Doe"
                    className="w-full h-9 bg-gray-50 border-gray-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="family_member_dob"
                    className="text-gray-700 font-medium"
                  >
                    Date of Birth
                  </Label>
                  <Input
                    id="family_member_dob"
                    name="family_member_dob"
                    type="date"
                    value={formData.family_member_dob}
                    onChange={handleChange}
                    className="w-full h-9 bg-gray-50 border-gray-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="family_member_spouse_status_id"
                    className="text-gray-700 font-medium"
                  >
                    Spouse Status
                  </Label>
                  <ShadcnSelect
                    value={formData.family_member_spouse_status_id}
                    onValueChange={(val) =>
                      handleSelectChange("family_member_spouse_status_id", val)
                    }
                    options={metadata?.yes_no_option || []}
                    placeholder="Select status"
                    label="Spouse Status"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="family_member_employment_status_id"
                    className="text-gray-700 font-medium"
                  >
                    Employment Status
                  </Label>
                  <ShadcnSelect
                    value={formData.family_member_employment_status_id}
                    onValueChange={(val) =>
                      handleSelectChange(
                        "family_member_employment_status_id",
                        val
                      )
                    }
                    options={metadata?.contact_employed || []}
                    placeholder="Select status"
                    label="Employment Status"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="family_member_annual_income"
                    className="text-gray-700 font-medium"
                  >
                    Annual Income
                  </Label>
                  <Input
                    id="family_member_annual_income"
                    name="family_member_annual_income"
                    value={formData.family_member_annual_income}
                    onChange={handleChange}
                    placeholder="85000"
                    className="w-full h-9 bg-gray-50 border-gray-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="family_member_telephone"
                    className="text-gray-700 font-medium"
                  >
                    Telephone
                  </Label>
                  <Input
                    id="family_member_telephone"
                    name="family_member_telephone"
                    value={formData.family_member_telephone}
                    onChange={handleChange}
                    placeholder="1231231234"
                    className="w-full h-9 bg-gray-50 border-gray-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="family_member_email"
                    className="text-gray-700 font-medium"
                  >
                    Email
                  </Label>
                  <Input
                    id="family_member_email"
                    name="family_member_email"
                    type="email"
                    value={formData.family_member_email}
                    onChange={handleChange}
                    placeholder="jane.doe@example.com"
                    className="w-full h-9 bg-gray-50 border-gray-300"
                  />
                </div>

                <div className="space-y-2 lg:col-span-3">
                  <Label
                    htmlFor="family_member_note"
                    className="text-gray-700 font-medium"
                  >
                    Note
                  </Label>
                  <Textarea
                    id="family_member_note"
                    name="family_member_note"
                    value={formData.family_member_note}
                    onChange={handleChange}
                    placeholder="Available on weekends"
                    className="w-full bg-gray-50 border-gray-300 min-h-[100px]"
                  />
                </div>
              </div>
            </div>

            {/* Family Member Address */}
            <div className="space-y-6 pt-6 border-t">
              <h2 className="text-xl font-semibold text-gray-900">
                Family Member Address
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">
                    Unit Number
                  </Label>
                  <Input
                    value={formData.family_member_address.unit_number}
                    onChange={(e) =>
                      handleAddressChange(
                        "family_member_address",
                        "unit_number",
                        e.target.value
                      )
                    }
                    placeholder="5B"
                    className="w-full h-9 bg-gray-50 border-gray-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">
                    Street Number
                  </Label>
                  <Input
                    value={formData.family_member_address.street_number}
                    onChange={(e) =>
                      handleAddressChange(
                        "family_member_address",
                        "street_number",
                        e.target.value
                      )
                    }
                    placeholder="221"
                    className="w-full h-9 bg-gray-50 border-gray-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">
                    Street Name
                  </Label>
                  <Input
                    value={formData.family_member_address.street_name}
                    onChange={(e) =>
                      handleAddressChange(
                        "family_member_address",
                        "street_name",
                        e.target.value
                      )
                    }
                    placeholder="King Street West"
                    className="w-full h-9 bg-gray-50 border-gray-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">City</Label>
                  <Input
                    value={formData.family_member_address.city}
                    onChange={(e) =>
                      handleAddressChange(
                        "family_member_address",
                        "city",
                        e.target.value
                      )
                    }
                    placeholder="Toronto"
                    className="w-full h-9 bg-gray-50 border-gray-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">Province</Label>
                  <Input
                    value={formData.family_member_address.province}
                    onChange={(e) =>
                      handleAddressChange(
                        "family_member_address",
                        "province",
                        e.target.value
                      )
                    }
                    placeholder="Ontario"
                    className="w-full h-9 bg-gray-50 border-gray-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">
                    Postal Code
                  </Label>
                  <Input
                    value={formData.family_member_address.postal_code}
                    onChange={(e) =>
                      handleAddressChange(
                        "family_member_address",
                        "postal_code",
                        e.target.value
                      )
                    }
                    placeholder="M5H 1K5"
                    className="w-full h-9 bg-gray-50 border-gray-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">Country</Label>
                  <Input
                    value={formData.family_member_address.country}
                    onChange={(e) =>
                      handleAddressChange(
                        "family_member_address",
                        "country",
                        e.target.value
                      )
                    }
                    placeholder="Canada"
                    className="w-full h-9 bg-gray-50 border-gray-300"
                  />
                </div>
              </div>
            </div>

            {/* Children */}
            <div className="space-y-6 pt-6 border-t">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  Children
                </h2>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    addArrayItem("children", {
                      first_name: "",
                      middle_number: "",
                      last_name: "",
                      dob: "",
                    })
                  }
                >
                  Add Child
                </Button>
              </div>

              {formData.children.map((child, index) => (
                <div
                  key={index}
                  className="space-y-6 p-6 border rounded-lg bg-gray-50"
                >
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium text-gray-900">
                      Child {index + 1}
                    </h3>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeArrayItem("children", index)}
                      disabled={formData.children.length === 1}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Remove
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <div className="space-y-2">
                      <Label className="text-gray-700 font-medium">
                        First Name
                      </Label>
                      <Input
                        value={child.first_name}
                        onChange={(e) =>
                          handleArrayChange(
                            "children",
                            index,
                            "first_name",
                            e.target.value
                          )
                        }
                        placeholder="Anna"
                        className="w-full h-9 bg-white border-gray-300"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-700 font-medium">
                        Middle Name
                      </Label>
                      <Input
                        value={child.middle_number}
                        onChange={(e) =>
                          handleArrayChange(
                            "children",
                            index,
                            "middle_number",
                            e.target.value
                          )
                        }
                        placeholder="M"
                        className="w-full h-9 bg-white border-gray-300"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-700 font-medium">
                        Last Name
                      </Label>
                      <Input
                        value={child.last_name}
                        onChange={(e) =>
                          handleArrayChange(
                            "children",
                            index,
                            "last_name",
                            e.target.value
                          )
                        }
                        placeholder="Doe"
                        className="w-full h-9 bg-white border-gray-300"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-700 font-medium">
                        Date of Birth
                      </Label>
                      <Input
                        type="date"
                        value={child.dob}
                        onChange={(e) =>
                          handleArrayChange(
                            "children",
                            index,
                            "dob",
                            e.target.value
                          )
                        }
                        className="w-full h-9 bg-white border-gray-300"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Meeting Clients */}
            <div className="space-y-6 pt-6 border-t">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  Meeting Dates with Clients
                </h2>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addArrayItem("meeting_clients", { date: "" })}
                >
                  Add Meeting Date
                </Button>
              </div>

              {formData.meeting_clients.map((meeting, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 lg:grid-cols-3 gap-6"
                >
                  <div className="space-y-2">
                    <Label className="text-gray-700 font-medium">
                      Meeting Date
                    </Label>
                    <Input
                      type="date"
                      value={meeting.date}
                      onChange={(e) =>
                        handleArrayChange(
                          "meeting_clients",
                          index,
                          "date",
                          e.target.value
                        )
                      }
                      className="w-full h-9 bg-gray-50 border-gray-300"
                    />
                  </div>

                  <div className="flex items-end">
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeArrayItem("meeting_clients", index)}
                      disabled={formData.meeting_clients.length === 1}
                      className="w-full h-11"
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Submit */}
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
                disabled={createMutation.isPending || uploadMutation.isPending}
                size="lg"
              >
                {createMutation.isPending || uploadMutation.isPending ? (
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

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Applicant Photo Preview</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center p-4">
            {formData.filePreview && (
              <img
                src={formData.filePreview}
                alt="Full Preview"
                className="max-w-full max-h-[70vh] object-contain rounded-lg"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
