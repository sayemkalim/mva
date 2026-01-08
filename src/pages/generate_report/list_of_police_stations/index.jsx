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
  getPoliceStationsMeta,
  exportPoliceStations,
} from "./helper/exportPoliceStations";

const ExportListOfPoliceStations = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    type: "",
    police_station: "",
  });

  const [isExporting, setIsExporting] = useState(false);

  // Fetch dropdown options from API
  const { data: metadata, isLoading: isLoadingMetadata } = useQuery({
    queryKey: ["policeStationsMeta"],
    queryFn: async () => {
      const response = await getPoliceStationsMeta();
      return response?.response || response;
    },
  });

  const handleExport = async (e) => {
    e.preventDefault();
    setIsExporting(true);

    try {
      let filters = {
        type: formData.type || "All",
        police_station: formData.police_station || "",
        from_date: "",
        to_date: "",
        year: "",
        month: "",
        assigned_by: "",
        select_file: "",
      };

      const response = await exportPoliceStations(filters);
      const csvData = response?.response || response || "";

      exportToExcel(csvData, "list_of_police_stations_export");

      toast.success("Export completed successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to export data");
    } finally {
      setIsExporting(false);
    }
  };

  // Get type options from metadata
  const typeOptions = metadata?.type || [
    { id: 1, name: "Applicant Vehicle" },
    { id: 2, name: "Third Party Vehicle" },
  ];

  // Get police stations from metadata
  const policeStationsOptions = metadata?.police_stations || [];

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
            List of Police Stations
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
              {/* Type Dropdown */}
              <div className="space-y-2">
                <Label className="text-foreground font-medium">Type</Label>
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
                    <SelectValue placeholder="Select Police Stations" />
                  </SelectTrigger>
                  <SelectContent side="bottom" avoidCollisions={false}>
                    {typeOptions.map((option) => (
                      <SelectItem key={option.id} value={String(option.id)}>
                        {option.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Select Police Stations Dropdown */}
              <div className="space-y-2">
                <Label className="text-foreground font-medium">
                  Select Police Stations
                </Label>
                <Select
                  value={formData.police_station}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      police_station: value,
                    }))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select police station" />
                  </SelectTrigger>
                  <SelectContent side="bottom" avoidCollisions={false}>
                    {policeStationsOptions.map((station) => (
                      <SelectItem key={station.id} value={String(station.id)}>
                        {station.police_department}
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

export default ExportListOfPoliceStations;
