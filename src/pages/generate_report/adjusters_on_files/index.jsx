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
import { exportAdjustersOnFiles } from "./helper/exportAdjustersOnFiles";
import ContactSearch from "@/pages/calender/components/ContactSearch";

const ExportAdjustersOnFiles = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    type: "ab_tort_adjusters",
  });

  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (e) => {
    e.preventDefault();

    if (!formData.type) {
      toast.error("Please select a type");
      return;
    }

    setIsExporting(true);

    try {
      let filters = {
        type: formData.type,
      };

      const response = await exportAdjustersOnFiles(filters);
      const csvData = response?.response || response || "";

      exportToExcel(csvData, "adjusters_on_files_export");

      toast.success("Export completed successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to export data");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      <Navbar2 />

      <nav className="bg-white border-b px-6 py-4 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate("/dashboard")}>Dashboard</button>
          <ChevronRight className="w-4 h-4" />
          <button onClick={() => navigate("/dashboard/workstation")}>
            Workstation
          </button>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 font-medium">Adjusters on Files</span>
        </div>
      </nav>

      <div className="flex-1 overflow-auto bg-gray-50">
        <div className="container mx-auto px-6 py-8 max-w-6xl">
          <h1 className="text-2xl font-bold mb-6 text-gray-900">EXPORT DATA</h1>

          <form
            onSubmit={handleExport}
            className="bg-white rounded-lg shadow-sm border p-6 sm:p-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-6">
                {/* Type Dropdown */}
                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        type: value,
                      }))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent side="bottom" avoidCollisions={false}>
                      <SelectItem value="ab_tort_adjusters">
                        AB + Tort Adjuster's on files
                      </SelectItem>
                      <SelectItem value="ab_adjusters">
                        AB Adjuster's on files
                      </SelectItem>
                      <SelectItem value="tort_adjusters">
                        Tort Adjuster's on files
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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

export default ExportAdjustersOnFiles;
