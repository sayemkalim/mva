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
  getMvaCasesByMedicalCentreMeta,
  exportVehicleOwnershipInfo,
} from "./helper/exportMvaCases";

const ExportMvaCasesByMedicalCentre = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    type: "",
  });

  const [isExporting, setIsExporting] = useState(false);

  // Fetch dropdown options from API
  const { data: metadata, isLoading: isLoadingMetadata } = useQuery({
    queryKey: ["mvaCasesByMedicalCentreMeta"],
    queryFn: async () => {
      const response = await getMvaCasesByMedicalCentreMeta();
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

      const response = await exportVehicleOwnershipInfo(filters);
      const csvData = response?.response || response || "";

      exportToExcel(csvData, "mva_cases_by_medical_centre_export");

      toast.success("Export completed successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to export data");
    } finally {
      setIsExporting(false);
    }
  };

  // Get medical centre options from metadata or use defaults
  const medicalCentreOptions = metadata?.medical_centres || [
    { id: "all", name: "All Medical Centre" },
    { id: "medical_centre", name: "Medical Centre" },
    { id: "medical_clinic", name: "Medical Clinic" },
    { id: "walk_in_clinic", name: "Walk-in-Clinic" },
    { id: "physiotherapy", name: "Physiotherapy" },
    { id: "pharmacy", name: "Pharmacy" },
    { id: "laboratory", name: "Laboratory" },
    { id: "specialist", name: "Specialist" },
    { id: "chiropractor", name: "Chiropractor" },
    { id: "mental_health_clinic", name: "Mental health clinic" },
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
            MVA Cases by Medical Centre
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
                    <SelectValue placeholder="Medical Centre" />
                  </SelectTrigger>
                  <SelectContent side="bottom" avoidCollisions={false}>
                    {medicalCentreOptions.map((option) => (
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

export default ExportMvaCasesByMedicalCentre;
