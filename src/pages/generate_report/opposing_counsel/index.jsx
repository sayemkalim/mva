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
import { exportOpposingCounsel } from "./helper/exportOpposingCounsel";
import ContactSearch from "@/pages/calender/components/ContactSearch";

const ExportOpposingCounsel = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    type: "all_files",
    select_file: "",
  });

  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (e) => {
    e.preventDefault();

    if (!formData.type) {
      toast.error("Please select a type");
      return;
    }

    if (formData.type === "find" && !formData.select_file) {
      toast.error("Please select a file");
      return;
    }

    setIsExporting(true);

    try {
      let filters = {
        type: formData.type,
      };

      if (formData.type === "find") {
        filters.select_file = formData.select_file;
      }

      const response = await exportOpposingCounsel(filters);
      const csvData = response?.response || response || "";

      exportToExcel(csvData, "opposing_counsel_export");

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
          <span className="text-foreground font-medium">Opposing Counsel</span>
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
                        select_file: "",
                      }))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent side="bottom" avoidCollisions={false}>
                      <SelectItem value="all_files">All files</SelectItem>
                      <SelectItem value="find">Find</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Find  */}
                {formData.type === "find" && (
                  <ContactSearch
                    label="Select Applicant"
                    onSelect={(contact) => {
                      setFormData((prev) => ({
                        ...prev,
                        select_file: contact.slug || "",
                      }));
                    }}
                  />
                )}
              </div>
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

export default ExportOpposingCounsel;
