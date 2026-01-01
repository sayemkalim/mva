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
import { getVsrMeta, exportVsr } from "./helper/exportVsr";

const ExportVsrExamination = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    type_of_assessment: "",
  });

  const [isExporting, setIsExporting] = useState(false);

  // Fetch dropdown options from API
  const { data: metadata, isLoading: isLoadingMetadata } = useQuery({
    queryKey: ["vsrMeta"],
    queryFn: async () => {
      const response = await getVsrMeta();
      console.log("VSR Meta Response:", response);
      return response;
    },
  });

  const handleExport = async (e) => {
    e.preventDefault();
    setIsExporting(true);

    try {
      let filters = {
        type_of_assessment: formData.type_of_assessment || "",
      };

      const response = await exportVsr(filters);
      const csvData = response?.response || response || "";

      exportToExcel(csvData, "vsr_examination_export");

      toast.success("Export completed successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to export data");
    } finally {
      setIsExporting(false);
    }
  };

  // Get assessment type options from metadata - handle various response structures
  const getAssessmentOptions = () => {
    if (!metadata) return [];
    // Check response.type (matches the API response structure)
    if (metadata?.response?.type) return metadata.response.type;
    // Check direct type
    if (metadata?.type) return metadata.type;
    // If response is an array
    if (Array.isArray(metadata?.response)) return metadata.response;
    if (Array.isArray(metadata)) return metadata;
    return [];
  };

  const assessmentTypeOptions = getAssessmentOptions();

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
          <span className="text-gray-900 font-medium">VSR Examination</span>
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
              {/* Type of Assessment Dropdown */}
              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">
                  Type of Assessment
                </Label>
                <Select
                  value={formData.type_of_assessment}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      type_of_assessment: value,
                    }))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select type of assessment" />
                  </SelectTrigger>
                  <SelectContent side="bottom" avoidCollisions={false}>
                    {assessmentTypeOptions.map((option) => (
                      <SelectItem
                        key={option.id || option.value}
                        value={String(option.id || option.value)}
                      >
                        {option.name || option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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

export default ExportVsrExamination;
