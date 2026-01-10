import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Loader2, ChevronRight, Check } from "lucide-react";
import { toast } from "sonner";
import { getABMeta } from "../helpers/fetchABMeta";
import { createSoc } from "../helpers/createSoc";
import { fetchSocBySlug } from "../helpers/fetchSocBySlug";
import { Navbar2 } from "@/components/navbar2";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import Billing from "@/components/billing";

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const SearchableSelect = ({ label, options, value, onChange, placeholder }) => {
  const [open, setOpen] = useState(false);
  const selected = options?.find((opt) => String(opt.id) === String(value));

  return (
    <div className="space-y-2">
      <Label className="text-foreground font-medium">{label}</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
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
            <CommandGroup className="max-h-64 overflow-auto">
              {options?.map((opt) => (
                <CommandItem
                  key={opt.id}
                  value={opt.name}
                  onSelect={() => {
                    onChange(opt.id);
                    setOpen(false);
                  }}
                  className="cursor-pointer"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      String(value) === String(opt.id)
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
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

export default function SocPage() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const {
    data: metaResponse,
    isLoading: loadingMeta,
    isError: metaError,
    error: metaErrObj,
  } = useQuery({
    queryKey: ["socMeta"],
    queryFn: getABMeta,
    staleTime: 300000,
  });

  const meta = metaResponse?.response || metaResponse || {};

  const { data: socData, isLoading: loadingSoc } = useQuery({
    queryKey: ["socData", slug],
    queryFn: () => fetchSocBySlug(slug),
    enabled: !!slug,
  });

  const mutation = useMutation({
    mutationFn: (data) => createSoc({ slug, data }),
    onSuccess: () => {
      toast.success("SOC data saved successfully!");
      // navigate("/dashboard/workstation");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to save SOC data");
    },
  });

  const [formData, setFormData] = useState({
    soc_issued_id: "",
    issued_under_id: "",
    reason: "",
    deadline: "",
    soc_serviced_id: "",
    serviced_reason: "",
    serviced_deadline: "",
    process_server_company: "",
    process_server_name: "",
    telephone_number: "",
    email: "",
    fax: "",
    communication_date: "",
    mode_of_communication_id: "",
    date_of_service: "",
    affidavit_of_service_received_id: "",
    reminder_1st: "",
    reminder_2nd: "",
  });

  useEffect(() => {
    if (socData) {
      setFormData({
        soc_issued_id: socData.soc_issued_id || "",
        issued_under_id: socData.issued_under_id || "",
        reason: socData.reason || "",
        deadline: socData.deadline ? socData.deadline.split("T")[0] : "",
        soc_serviced_id: socData.soc_serviced_id || "",
        serviced_reason: socData.serviced_reason || "",
        serviced_deadline: socData.serviced_deadline
          ? socData.serviced_deadline.split("T")[0]
          : "",
        process_server_company: socData.process_server_company || "",
        process_server_name: socData.process_server_name || "",
        telephone_number: socData.telephone_number || "",
        email: socData.email || "",
        fax: socData.fax || "",
        communication_date: socData.communication_date
          ? socData.communication_date.split("T")[0]
          : "",
        mode_of_communication_id: socData.mode_of_communication_id || "",
        date_of_service: socData.date_of_service
          ? socData.date_of_service.split("T")[0]
          : "",
        affidavit_of_service_received_id:
          socData.affidavit_of_service_received_id || "",
        reminder_1st: socData.reminder_1st
          ? socData.reminder_1st.split("T")[0]
          : "",
        reminder_2nd: socData.reminder_2nd
          ? socData.reminder_2nd.split("T")[0]
          : "",
      });
    }
  }, [socData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  const isNoSelected = (fieldId) => {
    const option = meta.yes_no_option?.find(
      (opt) => String(opt.id) === String(fieldId)
    );
    return option?.name?.toLowerCase() === "no";
  };

  const isYesSelected = (fieldId) => {
    const option = meta.yes_no_option?.find(
      (opt) => String(opt.id) === String(fieldId)
    );
    return option?.name?.toLowerCase() === "yes";
  };

  const showIssuedUnder = !isNoSelected(formData.soc_issued_id);
  const showReasonAndDeadline = !isYesSelected(formData.soc_issued_id);
  const isSocServicedNo = isNoSelected(formData.soc_serviced_id);
  const showProcessServerSection = !isSocServicedNo;
  const showReminders = !isYesSelected(
    formData.affidavit_of_service_received_id
  );

  if (loadingMeta || loadingSoc) {
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
        Failed to load metadata: {metaErrObj?.message || "Unknown error"}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted">
      <Navbar2 />

      <Billing/>
      {/* Breadcrumb Navigation */}
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
          <span className="text-foreground font-medium">Statement of Claim</span>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-6xl">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-foreground">
          Statement of Claim (SOC)
        </h1>

        <form
          className="bg-card rounded-lg shadow-sm border p-6 sm:p-8 space-y-6"
          onSubmit={handleSubmit}
        >
          {/* Basic SOC Information */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Basic Information
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SearchableSelect
                label="SOC Issued"
                options={meta.yes_no_option || []}
                value={formData.soc_issued_id}
                onChange={(val) => handleSelectChange("soc_issued_id", val)}
                placeholder="Select option"
              />

              {showIssuedUnder && (
                <SearchableSelect
                  label="Issued Under"
                  options={meta.issued_under || []}
                  value={formData.issued_under_id}
                  onChange={(val) => handleSelectChange("issued_under_id", val)}
                  placeholder="Select issued under"
                />
              )}
            </div>

            {showReasonAndDeadline && (
              <div className="mt-6 space-y-6">
                <div className="space-y-2">
                  <Label className="text-foreground font-medium">Reason</Label>
                  <Textarea
                    name="reason"
                    value={formData.reason}
                    onChange={handleChange}
                    placeholder="Enter reason for SOC"
                    rows={4}
                    className="resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-foreground font-medium">
                      Deadline
                    </Label>
                    <Input
                      type="date"
                      name="deadline"
                      value={formData.deadline}
                      onChange={handleChange}
                      className="h-11"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              <SearchableSelect
                label="SOC Serviced"
                options={meta.yes_no_option || []}
                value={formData.soc_serviced_id}
                onChange={(val) => handleSelectChange("soc_serviced_id", val)}
                placeholder="Select option"
              />
            </div>
          </div>

          {/* SOC Serviced Details */}
          {isSocServicedNo && (
            <div className="pt-6 border-t">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                SOC Serviced Details
              </h2>

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-foreground font-medium">Reason</Label>
                  <Textarea
                    name="serviced_reason"
                    value={formData.serviced_reason}
                    onChange={handleChange}
                    placeholder="Enter reason why SOC is not serviced"
                    rows={4}
                    className="resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-foreground font-medium">
                      Deadline
                    </Label>
                    <Input
                      type="date"
                      name="serviced_deadline"
                      value={formData.serviced_deadline}
                      onChange={handleChange}
                      className="h-11"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Process Server Information */}
          {showProcessServerSection && (
            <div className="pt-6 border-t">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Process Server Information
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-foreground font-medium">
                    Process Server Company
                  </Label>
                  <Input
                    name="process_server_company"
                    value={formData.process_server_company}
                    onChange={handleChange}
                    placeholder="Company Name"
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground font-medium">
                    Process Server Name
                  </Label>
                  <Input
                    name="process_server_name"
                    value={formData.process_server_name}
                    onChange={handleChange}
                    placeholder="Server Name"
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground font-medium">
                    Telephone Number
                  </Label>
                  <Input
                    name="telephone_number"
                    value={formData.telephone_number}
                    onChange={handleChange}
                    placeholder="Phone Number"
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground font-medium">Email</Label>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Email Address"
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground font-medium">Fax</Label>
                  <Input
                    name="fax"
                    value={formData.fax}
                    onChange={handleChange}
                    placeholder="Fax Number"
                    className="h-11"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Communication & Service */}
          {showProcessServerSection && (
            <div className="pt-6 border-t">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Communication & Service
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-foreground font-medium">
                    Communication Date
                  </Label>
                  <Input
                    type="date"
                    name="communication_date"
                    value={formData.communication_date}
                    onChange={handleChange}
                    className="h-11"
                  />
                </div>

                <SearchableSelect
                  label="Mode of Communication"
                  options={meta.insurance_mode_of_communication || []}
                  value={formData.mode_of_communication_id}
                  onChange={(val) =>
                    handleSelectChange("mode_of_communication_id", val)
                  }
                  placeholder="Select mode"
                />

                <div className="space-y-2">
                  <Label className="text-foreground font-medium">
                    Date of Service
                  </Label>
                  <Input
                    type="date"
                    name="date_of_service"
                    value={formData.date_of_service}
                    onChange={handleChange}
                    className="h-11"
                  />
                </div>

                <SearchableSelect
                  label="Affidavit of Service Received"
                  options={meta.yes_no_option || []}
                  value={formData.affidavit_of_service_received_id}
                  onChange={(val) =>
                    handleSelectChange("affidavit_of_service_received_id", val)
                  }
                  placeholder="Select option"
                />
              </div>
            </div>
          )}

          {/* Reminders */}
          {showProcessServerSection && showReminders && (
            <div className="pt-6 border-t">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Reminders
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-foreground font-medium">
                    1st Reminder
                  </Label>
                  <Input
                    type="date"
                    name="reminder_1st"
                    value={formData.reminder_1st}
                    onChange={handleChange}
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground font-medium">
                    2nd Reminder
                  </Label>
                  <Input
                    type="date"
                    name="reminder_2nd"
                    value={formData.reminder_2nd}
                    onChange={handleChange}
                    className="h-11"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t">
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              type="button"
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={mutation.isLoading}
              className="w-full sm:w-auto"
            >
              {mutation.isLoading ? "Saving..." : "Save SOC"}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
