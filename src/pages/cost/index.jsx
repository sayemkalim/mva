import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { fetchList } from "./helper/fetchList";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, ChevronDown } from "lucide-react";
import { format } from "date-fns";

const CostList = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["costList", slug, currentPage],
    queryFn: () => fetchList(slug, currentPage, 25),
    enabled: !!slug,
  });

  const costs = data?.data || [];
  const unpaid = data?.unpaid || "0.00";
  const unbilled = data?.unbilled || "0.00";
  const clientFundsOperating = data?.client_funds_operating || "0.00";
  const clientFundsTrust = data?.client_funds_trust || "0.00";

  const formatCurrency = (amount) => {
    return `$ ${parseFloat(amount || 0).toFixed(2)}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      return format(new Date(dateString), "yyyy-MM-dd");
    } catch {
      return dateString;
    }
  };

  const getSectionTypeLabel = (sectionType) => {
    switch (sectionType) {
      case "soft-cost":
        return "soft cost";
      case "hard-cost":
        return "hard cost";
      case "time-card":
        return "time card";
      default:
        return sectionType || "-";
    }
  };

  const getStatusLabel = (item) => {
    return "Unbilled";
  };

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header Section with Financial Summary */}
      <div className="mb-6 bg-white border border-border p-4 rounded-lg">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-6">
            <span>
              <span className="font-medium">Unpaid:</span> {formatCurrency(unpaid)}
            </span>
            <span>
              <span className="font-medium">Unbilled:</span> {formatCurrency(unbilled)}
            </span>
            <span>
              <span className="font-medium">Client Funds-Operating:</span>{" "}
              {formatCurrency(clientFundsOperating)}
            </span>
            <span>
              <span className="font-medium">Client Funds-Trust:</span>{" "}
              {formatCurrency(clientFundsTrust)}
            </span>
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <span className="cursor-pointer hover:text-foreground">CRM</span>
        <span>&gt;</span>
        <span className="cursor-pointer hover:text-foreground">Accounting</span>
        <span>&gt;</span>
        <span className="text-foreground font-medium">List</span>
      </div>

      {/* Add New Button with Dropdown */}
      <div className="mb-6">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 gap-2">
              <Plus className="size-4" />
              Add New
              <ChevronDown className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => navigate(`/dashboard/cost/soft-cost/create/${slug}`)}>
              Soft Cost
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate(`/dashboard/cost/hard-cost/create/${slug}`)}>
              Hard Cost
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate(`/dashboard/cost/timecard/create/${slug}`)}>
              Add Timecard
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="w-12">
                <Checkbox />
              </TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Cost Type</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Memo</TableHead>
              <TableHead>Payment Amount</TableHead>
              <TableHead>Balance</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                  Loading...
                </TableCell>
              </TableRow>
            ) : costs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                  No data available
                </TableCell>
              </TableRow>
            ) : (
              costs.map((item, index) => {
                const runningBalance = costs
                  .slice(0, index + 1)
                  .reduce((sum, cost) => sum + parseFloat(cost.amount || 0), 0);

                return (
                  <TableRow key={item.id} className="hover:bg-gray-50">
                    <TableCell>
                      <Checkbox />
                    </TableCell>
                    <TableCell>{formatDate(item.date)}</TableCell>
                    <TableCell>{item.type || "-"}</TableCell>
                    <TableCell>{getSectionTypeLabel(item.section_type)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {item.timekeeker || "null"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {item.description || "null"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">null</TableCell>
                    <TableCell>{parseFloat(item.amount || 0).toFixed(2)}</TableCell>
                    <TableCell>{runningBalance.toFixed(2)}</TableCell>
                    <TableCell className="text-orange-500">{getStatusLabel(item)}</TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default CostList;