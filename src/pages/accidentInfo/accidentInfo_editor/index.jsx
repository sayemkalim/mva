import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, ChevronRight, ChevronsUpDown, Check } from "lucide-react";
import { toast } from "sonner";
import { getAccidentInfoMeta } from "../helpers/fetchAccidentInfoMetadata";
import { fetchAccidentInfoBySlug } from "../helpers/fetchAccidentInfoBySlug";
import { createAccidentInfo } from "../helpers/createAccidentInfo";
import { Navbar2 } from "@/components/navbar2";

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
import Billing from "@/components/billing";

const SearchableDropdown = ({
  value,
  options,
  onSelect,
  placeholder,
  popoverKey,
  fieldName,
  popoverOpen,
  setPopoverOpen,
}) => {
  const selectedOption = options?.find((opt) => opt.id === value);

  return (
    <Popover
      open={popoverOpen[popoverKey]}
      onOpenChange={(open) =>
        setPopoverOpen((p) => ({ ...p, [popoverKey]: open }))
      }
    >
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className="w-full justify-between font-normal bg-muted"
          type="button"
        >
          {selectedOption ? selectedOption.name : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0"
        align="start"
      >
        <Command>
          <CommandInput placeholder="Search..." autoFocus />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {options?.map((opt) => (
                <CommandItem
                  key={opt.id}
                  value={opt.name}
                  onSelect={() => onSelect(fieldName, opt.id, popoverKey)}
                  className="cursor-pointer flex items-center"
                >
                  <Check
                    className={`mr-2 h-4 w-4 ${value === opt.id ? "opacity-100" : "opacity-0"
                      }`}
                  />
                  {opt.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default function AccidentalInformation() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    data: apiResponse,
    isLoading: isLoadingMetadata,
    error: metadataError,
    isError: isMetadataError,
  } = useQuery({
    queryKey: ["accidentalInfoMeta"],
    queryFn: getAccidentInfoMeta,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  const metadata = apiResponse?.response || {};

  const { data: accidentalInfoData, isLoading: isLoadingAccidentalInfo } =
    useQuery({
      queryKey: ["accidentalInfo", slug],
      queryFn: async () => {
        if (!slug) return null;
        try {
          const data = await fetchAccidentInfoBySlug(slug);
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
    mutationFn: createAccidentInfo,
    onSuccess: (apiResponse) => {
      console.log("✅ Success Response:", apiResponse);
      if (apiResponse?.response?.Apistatus) {
        toast.success("Accidental information saved successfully!");
        // navigate(`/dashboard/workstation/edit/${slug}/next-page`);
      }
    },
    onError: () => {
      toast.error("Failed to save information. Please try again.");
    },
  });

  const [formData, setFormData] = useState({
    date_of_accident: "",
    day_of_accident_id: null,
    time_of_accident: "",
    applicant_werea_id: null,
    accident_location: "",
    city: "",
    province: "",
    description_of_the_accident: "",
    accident_occur_while_you_were_id: null,
    workplace_safety_and_insurance_board_id: null,
    reported_to_police: null,
    Seatbelted_id: null,
    seating_arrangement: "",
    agency: "",
    client_at_fault_id: null,
    ticket_wlsb_id: null,
    tparty_charge_id: null,
    property_damage: "",
    police_department: "",
    officer_name: "",
    badge_no: "",
    date_accident_reported_to_the_police: "",
  });

  // ✅ Popover open state for all searchable dropdowns
  const [popoverOpen, setPopoverOpen] = useState({
    day_of_accident_id: false,
    applicant_werea_id: false,
    accident_occur_while_you_were_id: false,
    workplace_safety_and_insurance_board_id: false,
    reported_to_police: false,
    Seatbelted_id: false,
    client_at_fault_id: false,
    ticket_wlsb_id: false,
    tparty_charge_id: false,
  });

  useEffect(() => {
    if (!slug) {
      toast.error("Invalid URL - Slug not found!");
      navigate("/dashboard/workstation");
    }
  }, [slug, navigate]);

  useEffect(() => {
    if (accidentalInfoData) {
      setFormData({
        date_of_accident: accidentalInfoData.date_of_accident || "",
        day_of_accident_id: accidentalInfoData.day_of_accident_id || null,
        time_of_accident: accidentalInfoData.time_of_accident || "",
        applicant_werea_id: accidentalInfoData.applicant_werea_id || null,
        accident_location: accidentalInfoData.accident_location || "",
        city: accidentalInfoData.city || "",
        province: accidentalInfoData.province || "",
        description_of_the_accident:
          accidentalInfoData.description_of_the_accident || "",
        accident_occur_while_you_were_id:
          accidentalInfoData.accident_occur_while_you_were_id || null,
        workplace_safety_and_insurance_board_id:
          accidentalInfoData.workplace_safety_and_insurance_board_id || null,
        reported_to_police: accidentalInfoData.reported_to_police || null,
        Seatbelted_id: accidentalInfoData.Seatbelted_id || null,
        seating_arrangement: accidentalInfoData.seating_arrangement || "",
        agency: accidentalInfoData.agency || "",
        client_at_fault_id: accidentalInfoData.client_at_fault_id || null,
        ticket_wlsb_id: accidentalInfoData.ticket_wlsb_id || null,
        tparty_charge_id: accidentalInfoData.tparty_charge_id || null,
        property_damage: accidentalInfoData.property_damage || "",
        police_department: accidentalInfoData.police_department || "",
        officer_name: accidentalInfoData.officer_name || "",
        badge_no: accidentalInfoData.badge_no || "",
        date_accident_reported_to_the_police:
          accidentalInfoData.date_accident_reported_to_the_police || "",
      });
    }
  }, [accidentalInfoData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: Number(value),
    }));
  };

  const handleDropdownSelect = (fieldName, id, popoverKey) => {
    handleSelectChange(fieldName, id);
    setPopoverOpen((prev) => ({ ...prev, [popoverKey]: false }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      date_of_accident: formData.date_of_accident || null,
      day_of_accident_id: formData.day_of_accident_id || null,
      time_of_accident: formData.time_of_accident || null,
      applicant_werea_id: formData.applicant_werea_id || null,
      accident_location: formData.accident_location || null,
      city: formData.city || null,
      province: formData.province || null,
      description_of_the_accident: formData.description_of_the_accident || null,
      accident_occur_while_you_were_id:
        formData.accident_occur_while_you_were_id || null,
      workplace_safety_and_insurance_board_id:
        formData.workplace_safety_and_insurance_board_id || null,
      reported_to_police: formData.reported_to_police || null,
      Seatbelted_id: formData.Seatbelted_id || null,
      seating_arrangement: formData.seating_arrangement || null,
      agency: formData.agency || null,
      client_at_fault_id: formData.client_at_fault_id || null,
      ticket_wlsb_id: formData.ticket_wlsb_id || null,
      tparty_charge_id: formData.tparty_charge_id || null,
      property_damage: formData.property_damage || null,
      police_department: formData.police_department || null,
      officer_name: formData.officer_name || null,
      badge_no: formData.badge_no || null,
      date_accident_reported_to_the_police:
        formData.date_accident_reported_to_the_police || null,
    };

    console.log(
      "📤 Submitting Accidental Information Payload:",
      JSON.stringify(payload, null, 2)
    );

    createMutation.mutate({
      slug: slug,
      data: payload,
    });
  };

  if (isLoadingMetadata || isLoadingAccidentalInfo) {
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
            onClick={() =>
              queryClient.invalidateQueries(["accidentalInfoMeta"])
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
          <span className="text-foreground font-medium">
            Accidental Information
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        <div className="bg-card rounded-lg shadow-sm border p-8">
          <h1 className="text-2xl font-bold mb-8 text-foreground uppercase">
            Accidental Information
          </h1>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Accident Details Section */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-foreground">
                Accident Details
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Date of Accident */}
                <div className="space-y-2">
                  <Label
                    htmlFor="date_of_accident"
                    className="text-foreground font-medium"
                  >
                    Date of Accident
                  </Label>
                  <Input
                    id="date_of_accident"
                    name="date_of_accident"
                    type="date"
                    value={formData.date_of_accident}
                    onChange={handleChange}
                    className="bg-muted border-input"
                  />
                </div>

                {/* Day of Accident - Searchable */}
                <div className="space-y-2">
                  <Label
                    htmlFor="day_of_accident_id"
                    className="text-foreground font-medium"
                  >
                    Day of Accident
                  </Label>
                  <SearchableDropdown
                    value={formData.day_of_accident_id}
                    options={metadata?.accident_day}
                    onSelect={handleDropdownSelect}
                    placeholder="Select day"
                    popoverKey="day_of_accident_id"
                    fieldName="day_of_accident_id"
                    popoverOpen={popoverOpen}
                    setPopoverOpen={setPopoverOpen}
                  />
                </div>

                {/* Time of Accident */}
                <div className="space-y-2">
                  <Label
                    htmlFor="time_of_accident"
                    className="text-foreground font-medium"
                  >
                    Time of Accident
                  </Label>
                  <Input
                    id="time_of_accident"
                    name="time_of_accident"
                    type="time"
                    value={formData.time_of_accident}
                    onChange={handleChange}
                    className="bg-muted border-input"
                  />
                </div>

                {/* Applicant Were A - Searchable */}
                <div className="space-y-2">
                  <Label
                    htmlFor="applicant_werea_id"
                    className="text-foreground font-medium"
                  >
                    Applicant Were A
                  </Label>
                  <SearchableDropdown
                    value={formData.applicant_werea_id}
                    options={metadata?.accident_detail_applicant_were_a}
                    onSelect={handleDropdownSelect}
                    placeholder="Select type"
                    popoverKey="applicant_werea_id"
                    fieldName="applicant_werea_id"
                    popoverOpen={popoverOpen}
                    setPopoverOpen={setPopoverOpen}
                  />
                </div>

                {/* Accident Location */}
                <div className="space-y-2">
                  <Label
                    htmlFor="accident_location"
                    className="text-foreground font-medium"
                  >
                    Accident Location
                  </Label>
                  <Input
                    id="accident_location"
                    name="accident_location"
                    value={formData.accident_location}
                    onChange={handleChange}
                    placeholder="Enter accident location"
                    className="bg-muted border-input"
                  />
                </div>

                {/* City */}
                <div className="space-y-2">
                  <Label htmlFor="city" className="text-foreground font-medium">
                    City
                  </Label>
                  <Input
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Toronto"
                    className="bg-muted border-input"
                  />
                </div>

                {/* Province */}
                <div className="space-y-2">
                  <Label
                    htmlFor="province"
                    className="text-foreground font-medium"
                  >
                    Province
                  </Label>
                  <Input
                    id="province"
                    name="province"
                    value={formData.province}
                    onChange={handleChange}
                    placeholder="Ontario"
                    className="bg-muted border-input"
                  />
                </div>

                {/* Description - Full Width */}
                <div className="space-y-2 md:col-span-3">
                  <Label
                    htmlFor="description_of_the_accident"
                    className="text-foreground font-medium"
                  >
                    Description of the Accident
                  </Label>
                  <Textarea
                    id="description_of_the_accident"
                    name="description_of_the_accident"
                    value={formData.description_of_the_accident}
                    onChange={handleChange}
                    placeholder="Describe what happened..."
                    rows={4}
                    className="bg-muted border-input"
                  />
                </div>
              </div>
            </div>

            {/* Accident Circumstances Section */}
            <div className="space-y-6 pt-6 border-t">
              <h2 className="text-xl font-semibold text-foreground">
                Accident Circumstances
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Accident Occur While You Were - Searchable Yes/No */}
                <div className="space-y-2">
                  <Label
                    htmlFor="accident_occur_while_you_were_id"
                    className="text-foreground font-medium"
                  >
                    Accident Occur While You Were
                  </Label>
                  <SearchableDropdown
                    value={formData.accident_occur_while_you_were_id}
                    options={metadata?.yes_no_option}
                    onSelect={handleDropdownSelect}
                    placeholder="Select option"
                    popoverKey="accident_occur_while_you_were_id"
                    fieldName="accident_occur_while_you_were_id"
                    popoverOpen={popoverOpen}
                    setPopoverOpen={setPopoverOpen}
                  />
                </div>

                {/* Workplace Safety & Insurance Board - Searchable Yes/No */}
                <div className="space-y-2">
                  <Label
                    htmlFor="workplace_safety_and_insurance_board_id"
                    className="text-foreground font-medium"
                  >
                    Workplace Safety & Insurance Board
                  </Label>
                  <SearchableDropdown
                    value={formData.workplace_safety_and_insurance_board_id}
                    options={metadata?.yes_no_option}
                    onSelect={handleDropdownSelect}
                    placeholder="Select option"
                    popoverKey="workplace_safety_and_insurance_board_id"
                    fieldName="workplace_safety_and_insurance_board_id"
                    popoverOpen={popoverOpen}
                    setPopoverOpen={setPopoverOpen}
                  />
                </div>

                {/* Reported to Police - Searchable Yes/No */}
                <div className="space-y-2">
                  <Label
                    htmlFor="reported_to_police"
                    className="text-foreground font-medium"
                  >
                    Reported to Police
                  </Label>
                  <SearchableDropdown
                    value={formData.reported_to_police}
                    options={metadata?.yes_no_option}
                    onSelect={handleDropdownSelect}
                    placeholder="Select option"
                    popoverKey="reported_to_police"
                    fieldName="reported_to_police"
                    popoverOpen={popoverOpen}
                    setPopoverOpen={setPopoverOpen}
                  />
                </div>

                {/* Seatbelted - Searchable Yes/No */}
                <div className="space-y-2">
                  <Label
                    htmlFor="Seatbelted_id"
                    className="text-foreground font-medium"
                  >
                    Seatbelted
                  </Label>
                  <SearchableDropdown
                    value={formData.Seatbelted_id}
                    options={metadata?.yes_no_option}
                    onSelect={handleDropdownSelect}
                    placeholder="Select option"
                    popoverKey="Seatbelted_id"
                    fieldName="Seatbelted_id"
                    popoverOpen={popoverOpen}
                    setPopoverOpen={setPopoverOpen}
                  />
                </div>

                {/* Seating Arrangement */}
                <div className="space-y-2">
                  <Label
                    htmlFor="seating_arrangement"
                    className="text-foreground font-medium"
                  >
                    Seating Arrangement
                  </Label>
                  <Input
                    id="seating_arrangement"
                    name="seating_arrangement"
                    value={formData.seating_arrangement}
                    onChange={handleChange}
                    placeholder="Enter seating arrangement"
                    className="bg-muted border-input"
                  />
                </div>

                {/* Agency */}
                <div className="space-y-2">
                  <Label htmlFor="agency" className="text-foreground font-medium">
                    Agency
                  </Label>
                  <Input
                    id="agency"
                    name="agency"
                    value={formData.agency}
                    onChange={handleChange}
                    placeholder="Enter agency name"
                    className="bg-muted border-input"
                  />
                </div>
              </div>
            </div>

            {/* Fault and Charges Section */}
            <div className="space-y-6 pt-6 border-t">
              <h2 className="text-xl font-semibold text-foreground">
                Fault & Charges
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Client at Fault - Searchable Yes/No */}
                <div className="space-y-2">
                  <Label
                    htmlFor="client_at_fault_id"
                    className="text-foreground font-medium"
                  >
                    Client at Fault
                  </Label>
                  <SearchableDropdown
                    value={formData.client_at_fault_id}
                    options={metadata?.yes_no_option}
                    onSelect={handleDropdownSelect}
                    placeholder="Select option"
                    popoverKey="client_at_fault_id"
                    fieldName="client_at_fault_id"
                    popoverOpen={popoverOpen}
                    setPopoverOpen={setPopoverOpen}
                  />
                </div>

                {/* Ticket WLSB - Searchable Yes/No */}
                <div className="space-y-2">
                  <Label
                    htmlFor="ticket_wlsb_id"
                    className="text-foreground font-medium"
                  >
                    Ticket WLSB
                  </Label>
                  <SearchableDropdown
                    value={formData.ticket_wlsb_id}
                    options={metadata?.yes_no_option}
                    onSelect={handleDropdownSelect}
                    placeholder="Select option"
                    popoverKey="ticket_wlsb_id"
                    fieldName="ticket_wlsb_id"
                    popoverOpen={popoverOpen}
                    setPopoverOpen={setPopoverOpen}
                  />
                </div>

                {/* Third Party Charge - Searchable Yes/No */}
                <div className="space-y-2">
                  <Label
                    htmlFor="tparty_charge_id"
                    className="text-foreground font-medium"
                  >
                    Third Party Charge
                  </Label>
                  <SearchableDropdown
                    value={formData.tparty_charge_id}
                    options={metadata?.yes_no_option}
                    onSelect={handleDropdownSelect}
                    placeholder="Select option"
                    popoverKey="tparty_charge_id"
                    fieldName="tparty_charge_id"
                    popoverOpen={popoverOpen}
                    setPopoverOpen={setPopoverOpen}
                  />
                </div>

                {/* Property Damage */}
                <div className="space-y-2">
                  <Label
                    htmlFor="property_damage"
                    className="text-foreground font-medium"
                  >
                    Property Damage
                  </Label>
                  <Input
                    id="property_damage"
                    name="property_damage"
                    value={formData.property_damage}
                    onChange={handleChange}
                    placeholder="Describe property damage"
                    className="bg-muted border-input"
                  />
                </div>
              </div>
            </div>

            {/* Police Information Section */}
            <div className="space-y-6 pt-6 border-t">
              <h2 className="text-xl font-semibold text-foreground">
                Police Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Police Department */}
                <div className="space-y-2">
                  <Label
                    htmlFor="police_department"
                    className="text-foreground font-medium"
                  >
                    Police Department
                  </Label>
                  <Input
                    id="police_department"
                    name="police_department"
                    value={formData.police_department}
                    onChange={handleChange}
                    placeholder="Enter police department"
                    className="bg-muted border-input"
                  />
                </div>

                {/* Officer Name */}
                <div className="space-y-2">
                  <Label
                    htmlFor="officer_name"
                    className="text-foreground font-medium"
                  >
                    Officer Name
                  </Label>
                  <Input
                    id="officer_name"
                    name="officer_name"
                    value={formData.officer_name}
                    onChange={handleChange}
                    placeholder="Enter officer name"
                    className="bg-muted border-input"
                  />
                </div>

                {/* Badge No */}
                <div className="space-y-2">
                  <Label
                    htmlFor="badge_no"
                    className="text-foreground font-medium"
                  >
                    Badge Number
                  </Label>
                  <Input
                    id="badge_no"
                    name="badge_no"
                    value={formData.badge_no}
                    onChange={handleChange}
                    placeholder="Enter badge number"
                    className="bg-muted border-input"
                  />
                </div>

                {/* Date Reported to Police */}
                <div className="space-y-2">
                  <Label
                    htmlFor="date_accident_reported_to_the_police"
                    className="text-foreground font-medium"
                  >
                    Date Reported to Police
                  </Label>
                  <Input
                    id="date_accident_reported_to_the_police"
                    name="date_accident_reported_to_the_police"
                    type="date"
                    value={formData.date_accident_reported_to_the_police}
                    onChange={handleChange}
                    className="bg-muted border-input"
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
