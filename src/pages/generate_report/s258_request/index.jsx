import React, { useState } from "react";
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
import { exportS258Request } from "./helper/exportS258Request";

const ExportS258Request = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    type: "all_files",
    year: "",
    month: "",
    from_date: null,
    to_date: null,
  });

  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [fromDatePickerOpen, setFromDatePickerOpen] = useState(false);
  const [toDatePickerOpen, setToDatePickerOpen] = useState(false);

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
      let filters = { type: formData.type };

      switch (formData.type) {
        case "year_wise":
          filters.year = formData.year;
          break;
        case "month_wise":
          filters.month = formData.month;
          filters.year = formData.year;
          break;
        case "from_to":
          filters.from_date = formData.from_date;
          filters.to_date = formData.to_date;
          break;
        default:
          break;
      }

      const response = await exportS258Request(filters);
      const csvData = response?.response || response || "";

      exportToExcel(csvData, "s258_request_export");

      toast.success("Export completed successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to export data");
    } finally {
      setIsExporting(false);
    }
  };

  // Generate year options (last 10 years)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 10 }, (_, i) => currentYear - i);

  // Month options
  const monthOptions = [
    { value: "01", label: "January" },
    { value: "02", label: "February" },
    { value: "03", label: "March" },
    { value: "04", label: "April" },
    { value: "05", label: "May" },
    { value: "06", label: "June" },
    { value: "07", label: "July" },
    { value: "08", label: "August" },
    { value: "09", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

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
          <span className="text-foreground font-medium">S258 Request</span>
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
                {/* Type Dropdown */}
                <div className="space-y-2">
                  <Label className="text-foreground font-medium">Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        type: value,
                        year: "",
                        month: "",
                        from_date: null,
                        to_date: null,
                      }))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent side="bottom" avoidCollisions={false}>
                      <SelectItem value="all_files">All files</SelectItem>
                      <SelectItem value="year_wise">Year Wise</SelectItem>
                      <SelectItem value="month_wise">Month Wise</SelectItem>
                      <SelectItem value="from_to">From - To</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Year Wise */}
                {formData.type === "year_wise" && (
                  <div className="space-y-2">
                    <Label className="text-foreground font-medium">
                      Select Year
                    </Label>
                    <Select
                      value={formData.year}
                      onValueChange={(value) =>
                        setFormData((prev) => ({
                          ...prev,
                          year: value,
                        }))
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                      <SelectContent side="bottom" avoidCollisions={false}>
                        {yearOptions.map((year) => (
                          <SelectItem key={year} value={String(year)}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Month Wise */}
                {formData.type === "month_wise" && (
                  <>
                    <div className="space-y-2">
                      <Label className="text-foreground font-medium">
                        Select Year
                      </Label>
                      <Select
                        value={formData.year}
                        onValueChange={(value) =>
                          setFormData((prev) => ({
                            ...prev,
                            year: value,
                          }))
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select year" />
                        </SelectTrigger>
                        <SelectContent side="bottom" avoidCollisions={false}>
                          {yearOptions.map((year) => (
                            <SelectItem key={year} value={String(year)}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-foreground font-medium">
                        Select Month
                      </Label>
                      <Select
                        value={formData.month}
                        onValueChange={(value) =>
                          setFormData((prev) => ({
                            ...prev,
                            month: value,
                          }))
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select month" />
                        </SelectTrigger>
                        <SelectContent side="bottom" avoidCollisions={false}>
                          {monthOptions.map((month) => (
                            <SelectItem key={month.value} value={month.value}>
                              {month.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                {/* From - To Date Range */}
                {formData.type === "from_to" && (
                  <>
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
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {fromDate
                              ? format(fromDate, "yyyy-MM-dd")
                              : "Select from date"}
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
                    <div className="space-y-2">
                      <Label className="text-foreground font-medium">
                        To Date
                      </Label>
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
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {toDate
                              ? format(toDate, "yyyy-MM-dd")
                              : "Select to date"}
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
                  </>
                )}
              </div>

              {/* Right Column */}
              <div className="space-y-6"></div>
            </div>

            <div className="flex justify-center mt-8">
              <Button
                type="submit"
                disabled={isExporting}
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

export default ExportS258Request;
