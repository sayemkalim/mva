import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar2 } from "@/components/navbar2";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import {
  exportApplicantInfo,
  getExportMetadata,
} from "./helpers/exportApplicantInfo";
import { ChevronRight, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { exportToExcel } from "@/utils/exportToExcel";
import ContactSearch from "@/pages/calender/components/ContactSearch";

const ExportApplicantInfo = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    user_type: "All",
    from_date: null,
    to_date: null,
    mig_status: null,
    file_status: null,
    claim_type: null,
    select_file: "",
  });

  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [fromDatePickerOpen, setFromDatePickerOpen] = useState(false);
  const [toDatePickerOpen, setToDatePickerOpen] = useState(false);

  const isSpecificUser = formData.user_type === "Specific";

  const { data: metadata, isLoading: isLoadingMetadata } = useQuery({
    queryKey: ["exportApplicantMetadata"],
    queryFn: async () => {
      const response = await getExportMetadata();
      return response?.response || response;
    },
  });

  useEffect(() => {
    if (metadata && !isSpecificUser) {
      setFormData((prev) => ({
        ...prev,
        mig_status:
          prev.mig_status ?? String(metadata?.mig_status?.[0]?.id ?? ""),
        file_status:
          prev.file_status ?? String(metadata?.file_status?.[0]?.id ?? ""),
        claim_type:
          prev.claim_type ?? String(metadata?.claim_type?.[0]?.id ?? ""),
      }));
    }
  }, [metadata, isSpecificUser]);

  const handleFromDateChange = (date) => {
    if (!date) return;
    setFromDate(date);
    setFormData((prev) => ({
      ...prev,
      from_date: format(date, "yyyy-MM-dd"),
    }));
    setFromDatePickerOpen(false);
  };

  const handleToDateChange = (date) => {
    if (!date) return;
    setToDate(date);
    setFormData((prev) => ({
      ...prev,
      to_date: format(date, "yyyy-MM-dd"),
    }));
    setToDatePickerOpen(false);
  };

  const handleExport = async (e) => {
    e.preventDefault();
    setIsExporting(true);

    try {
      const filters =
        formData.user_type === "Specific"
          ? {
              user_type: "Specific",
              select_file: formData.select_file,
            }
          : {
              user_type: formData.user_type,
              from_date: formData.from_date,
              to_date: formData.to_date,
              mig_status: formData.mig_status,
              file_status: formData.file_status,
              claim_type: formData.claim_type,
            };

      const response = await exportApplicantInfo(filters);
      const csvData = response?.response || response || "";

      exportToExcel(csvData, "applicant_information_export");

      toast.success("Export completed successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to export data");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-card">
      <Navbar2 />

      <nav className="bg-card border-b px-6 py-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate("/dashboard")}>Dashboard</button>
          <ChevronRight className="w-4 h-4" />
          <button onClick={() => navigate("/dashboard/workstation")}>
            Workstation
          </button>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground font-medium">
            Applicant Information
          </span>
        </div>
      </nav>

      <div className="flex-1 overflow-auto bg-muted">
        <div className="container mx-auto px-6 py-8 max-w-6xl">
          <h1 className="text-2xl font-bold mb-6 text-foreground">EXPORT DATA</h1>

          <form
            onSubmit={handleExport}
            className="bg-card rounded-lg shadow-sm border p-6 sm:p-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-6">
                {/* User Type */}
                <div className="space-y-2">
                  <Label className="text-foreground font-medium">User Type</Label>
                  <Select
                    value={formData.user_type}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        user_type: value,
                        user_id: "",
                      }))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select user type" />
                    </SelectTrigger>
                    <SelectContent side="bottom" avoidCollisions={false}>
                      <SelectItem value="All">All</SelectItem>
                      <SelectItem value="Specific">Specific User</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Select User  */}
                {isSpecificUser && (
                  <ContactSearch
                    label="Select User"
                    onSelect={(contact) => {
                      setFormData((prev) => ({
                        ...prev,
                        select_file: contact.slug || "",
                      }));
                    }}
                  />
                )}

                {/* From Date */}
                {!isSpecificUser && (
                  <div className="space-y-2">
                    <Label className="text-foreground font-medium">
                      From Date
                    </Label>
                    <Popover
                      open={fromDatePickerOpen}
                      onOpenChange={setFromDatePickerOpen}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal h-9",
                            !fromDate && "text-muted-foreground"
                          )}
                        >
                          {fromDate
                            ? format(fromDate, "yyyy-MM-dd")
                            : "Select from date"}
                          <CalendarIcon className="ml-auto h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={fromDate}
                          onSelect={handleFromDateChange}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                )}

                {/* To Date */}
                {!isSpecificUser && (
                  <div className="space-y-2">
                    <Label className="text-foreground font-medium">To Date</Label>
                    <Popover
                      open={toDatePickerOpen}
                      onOpenChange={setToDatePickerOpen}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal h-9",
                            !toDate && "text-muted-foreground"
                          )}
                        >
                          {toDate
                            ? format(toDate, "yyyy-MM-dd")
                            : "Select to date"}
                          <CalendarIcon className="ml-auto h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={toDate}
                          onSelect={handleToDateChange}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                )}

                {/* MIG Status */}
                {!isSpecificUser && (
                  <div className="space-y-2">
                    <Label className="text-foreground font-medium">
                      MIG Status
                    </Label>
                    <Select
                      value={formData.mig_status}
                      onValueChange={(value) =>
                        setFormData((prev) => ({
                          ...prev,
                          mig_status: value,
                        }))
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select MIG status" />
                      </SelectTrigger>
                      <SelectContent side="bottom" avoidCollisions={false}>
                        {metadata?.mig_status?.map((status) => (
                          <SelectItem key={status.id} value={String(status.id)}>
                            {status.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                {/* File Status */}
                {!isSpecificUser && (
                  <div className="space-y-2">
                    <Label className="text-foreground font-medium">
                      File Status
                    </Label>
                    <Select
                      value={formData.file_status}
                      onValueChange={(value) =>
                        setFormData((prev) => ({
                          ...prev,
                          file_status: value,
                        }))
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select file status" />
                      </SelectTrigger>
                      <SelectContent side="bottom" avoidCollisions={false}>
                        {metadata?.file_status?.map((status) => (
                          <SelectItem key={status.id} value={String(status.id)}>
                            {status.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Claim Type */}
                {!isSpecificUser && (
                  <div className="space-y-2">
                    <Label className="text-foreground font-medium">
                      Claim Type
                    </Label>
                    <Select
                      value={formData.claim_type}
                      onValueChange={(value) =>
                        setFormData((prev) => ({
                          ...prev,
                          claim_type: value,
                        }))
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select claim type" />
                      </SelectTrigger>
                      <SelectContent side="bottom" avoidCollisions={false}>
                        {metadata?.claim_type?.map((type) => (
                          <SelectItem key={type.id} value={String(type.id)}>
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-center mt-8">
              <Button
                type="submit"
                disabled={isExporting || isLoadingMetadata}
                className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-2 h-auto"
              >
                {isExporting ? "Exporting..." : "Export"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ExportApplicantInfo;
