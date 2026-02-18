import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useDebounce } from "@uidotdev/usehooks";
import CustomActionMenu from "@/components/custom_action";
import MatterTable from "./components/MatterTable";
import { Navbar2 } from "@/components/navbar2";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";


const Matter = () => {
  const navigate = useNavigate();

  const paramInitialState = {
    page: 1,
    per_page: 50,
    search: "",
    status: "",
    date: "",
    month: "",
    year: "",
    start_date: "",
    end_date: "",
  };
  const [blogsLength, setBlogsLength] = useState(0);
  const [searchText, setSearchText] = useState("");
  const [params, setParams] = useState(paramInitialState);

  const debouncedSearch = useDebounce(searchText, 500);

  const handleSearch = (e) => {
    setSearchText(e.target.value);
  };

  const onAdd = () => {
    navigate("/dashboard/workstation/add");
  };

  const onRowsPerPageChange = (newRowsPerPage) => {
    setParams((prev) => ({
      ...prev,
      per_page: newRowsPerPage,
    }));
  };

  const handleFilterChange = (name, value) => {
    setParams((prev) => ({
      ...prev,
      [name]: value,
      page: 1,
    }));
  };

  const clearFilters = () => {
    setParams(paramInitialState);
    setSearchText("");
  };

  useEffect(() => {
    if (params.search !== debouncedSearch) {
      setParams((prev) => ({
        ...prev,
        search: debouncedSearch,
      }));
    }
  }, [debouncedSearch]);

  const months = [
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

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => (currentYear - i).toString());

  return (
    <div className="flex flex-col">
      <Navbar2 />
      <h1 className="text-xl md:text-xl font-semibold m-2">Matters</h1>
      <div className="px-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-3 items-end">
          {/* Status Filter */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap">Status</label>
            <Select
              value={params.status}
              onValueChange={(val) => handleFilterChange("status", val)}
            >
              <SelectTrigger className="h-9 w-full">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Wise Filter */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap">Specific Date</label>
            <Input
              type="date"
              className="h-9 w-full"
              value={params.date}
              onChange={(e) => handleFilterChange("date", e.target.value)}
            />
          </div>

          {/* Month Wise Filter */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap">Month</label>
            <Select
              value={params.month}
              onValueChange={(val) => handleFilterChange("month", val)}
            >
              <SelectTrigger className="h-9 w-full">
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent>
                {months.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Year Wise Filter */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap">Year</label>
            <Select
              value={params.year}
              onValueChange={(val) => handleFilterChange("year", val)}
            >
              <SelectTrigger className="h-9 w-full">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                {years.map((y) => (
                  <SelectItem key={y} value={y}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Start Date Filter */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap">Start Date</label>
            <Input
              type="date"
              className="h-9 w-full"
              value={params.start_date}
              onChange={(e) => handleFilterChange("start_date", e.target.value)}
            />
          </div>

          {/* End Date Filter */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap">End Date</label>
            <Input
              type="date"
              className="h-9 w-full"
              value={params.end_date}
              onChange={(e) => handleFilterChange("end_date", e.target.value)}
            />
          </div>

          {/* Clear Button */}
          <div className="w-full">
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="w-full h-9 gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive border border-dashed border-destructive/20"
            >
              <X className="w-4 h-4" />
              Clear Filter
            </Button>
          </div>
        </div>

        <div>
          <CustomActionMenu
            title="Matters"
            total={blogsLength}
            onAdd={onAdd}
            searchText={searchText}
            handleSearch={handleSearch}
            onRowsPerPageChange={onRowsPerPageChange}
            showRowSelection={true}
            rowsPerPage={params.per_page}
          />
          <MatterTable
            setBlogsLength={setBlogsLength}
            params={params}
            setParams={setParams}
          />
        </div>
      </div>
    </div>
  );
};

export default Matter;
