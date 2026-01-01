import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
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
import { ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { exportToExcel } from "@/utils/exportToExcel";
import {
  getVehicleOwnershipMeta,
  exportMvaCases,
} from "./helper/exportVehicleOwnership";

const ExportVehicleOwnershipInfo = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    type: "",
  });

  const [isExporting, setIsExporting] = useState(false);

  // Fetch dropdown options from API
  const { data: metadata, isLoading: isLoadingMetadata } = useQuery({
    queryKey: ["vehicleOwnershipMeta"],
    queryFn: async () => {
      const response = await getVehicleOwnershipMeta();
      return response?.response || response;
    },
  });

  const handleExport = async (e) => {
    e.preventDefault();

    if (!formData.type) {
      toast.error("Please select a type");
      return;
    }

    setIsExporting(true);

    try {
      const filters = { type: formData.type };

      const response = await exportMvaCases(filters);
      const csvData = response?.response || response || "";

      exportToExcel(csvData, "vehicle_ownership_information_export");

      toast.success("Export completed successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to export data");
    } finally {
      setIsExporting(false);
    }
  };

  // Get vehicle options from metadata or use defaults
  const vehicleOptions = metadata?.vehicle_types || [
    { id: "all_files", name: "All files" },
    { id: "applicant_vehicle", name: "Applicant Vehicle" },
    { id: "third_party_vehicle", name: "Third Party Vehicle" },
  ];

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
          <span className="text-gray-900 font-medium">
            Vehicle Ownership Information
          </span>
        </div>
      </nav>

      <div className="flex-1 overflow-auto bg-gray-50">
        <div className="container mx-auto px-6 py-8 max-w-6xl">
          <h1 className="text-2xl font-bold mb-6 text-gray-900">EXPORT DATA</h1>

          <form
            onSubmit={handleExport}
            className="bg-white rounded-lg shadow-sm border p-6 sm:p-8"
          >
            <div className="flex items-end gap-6 mb-8">
              {/* Type Dropdown */}
              <div className="space-y-2 w-64">
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
                    {vehicleOptions.map((option) => (
                      <SelectItem key={option.id} value={String(option.id)}>
                        {option.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Export Button */}
              <Button
                type="submit"
                disabled={isExporting || isLoadingMetadata}
                className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-2 h-9"
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

export default ExportVehicleOwnershipInfo;
