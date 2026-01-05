import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { fetchInvoiceList } from "./helpers/fetchInvoiceList";
import { fetchInvoiceDetails } from "./helpers/fetchInvoiceDetails";
import { fetchUnbilledList } from "./helpers/fetchUnbilledList";
import { createInvoice } from "./helpers/createInvoice";
import { deleteInvoice } from "./helpers/deleteInvoice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  ChevronRight,
  Lock,
  Unlock,
  X,
  Loader2,
  Trash2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Navbar2 } from "@/components/navbar2";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const Invoice = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentPage] = useState(1);

  // Add Invoice Dialog State
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceDate, setInvoiceDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [selectedBillingIds, setSelectedBillingIds] = useState([]);
  const [unbilledData, setUnbilledData] = useState([]);
  const [unbilledLoading, setUnbilledLoading] = useState(false);

  // Delete Invoice Dialog State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ["invoiceList", slug, currentPage],
    queryFn: () => fetchInvoiceList(slug, currentPage, 25),
    enabled: !!slug,
  });

  const invoices = data?.data || [];
  const unpaid = data?.unpaid || "0.00";
  const unbilled = data?.unbilled || "0.00";
  const clientFundsOperating = data?.client_funds_operating || "0.00";
  const clientFundsTrust = data?.client_funds_trust || "0.00";

  const formatCurrency = (amount) => {
    return `${parseFloat(amount || 0).toFixed(2)}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return dateString.split("T")[0];
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      paid: "bg-green-100 text-green-800",
      unpaid: "bg-red-100 text-red-800",
      partial: "bg-yellow-100 text-yellow-800",
    };
    return (
      <Badge className={statusColors[status] || "bg-gray-100 text-gray-800"}>
        {status?.charAt(0).toUpperCase() + status?.slice(1) || "Unknown"}
      </Badge>
    );
  };

  const getSectionTypeBadge = (sectionType) => {
    const typeColors = {
      "soft-cost": "bg-blue-100 text-blue-800",
      "hard-cost": "bg-purple-100 text-purple-800",
      "time-card": "bg-orange-100 text-orange-800",
    };
    const label = sectionType?.replace("-", " ").replace(/\b\w/g, (c) => c.toUpperCase()) || "Unknown";
    return (
      <Badge className={typeColors[sectionType] || "bg-gray-100 text-gray-800"}>
        {label}
      </Badge>
    );
  };

  // Add Invoice Dialog Handlers
  const handleOpenAddDialog = async () => {
    setAddDialogOpen(true);
    setUnbilledLoading(true);
    
    // Generate invoice number (you can customize this)
    const nextNumber = String(invoices.length + 1).padStart(5, "0");
    setInvoiceNumber(nextNumber);
    
    // Set default dates
    const today = new Date().toISOString().split("T")[0];
    const nextMonth = new Date();
    nextMonth.setDate(nextMonth.getDate() + 30);
    setInvoiceDate(today);
    setDueDate(nextMonth.toISOString().split("T")[0]);
    
    try {
      const response = await fetchUnbilledList(slug);
      console.log("Unbilled Response: >>>>", response);
      setUnbilledData(response?.response?.data || []);
    } catch (error) {
      console.error("Failed to fetch unbilled list:", error);
      toast.error("Failed to load unbilled items");
      setUnbilledData([]);
    } finally {
      setUnbilledLoading(false);
    }
  };

  const closeAddDialog = () => {
    setAddDialogOpen(false);
    setInvoiceNumber("");
    setInvoiceDate("");
    setDueDate("");
    setSelectedBillingIds([]);
    setUnbilledData([]);
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedBillingIds(unbilledData.map((item) => item.id));
    } else {
      setSelectedBillingIds([]);
    }
  };

  const handleSelectBilling = (id, checked) => {
    if (checked) {
      setSelectedBillingIds((prev) => [...prev, id]);
    } else {
      setSelectedBillingIds((prev) => prev.filter((itemId) => itemId !== id));
    }
  };

  const createInvoiceMutation = useMutation({
    mutationFn: (data) => createInvoice(slug, data),
    onSuccess: (response) => {
      if (response?.response?.Apistatus === true) {
        toast.success("Invoice created successfully");
        queryClient.invalidateQueries(["invoiceList", slug]);
        closeAddDialog();
      } else {
        toast.error(response?.message || "Failed to create invoice");
      }
    },
    onError: (error) => {
      console.error("Failed to create invoice:", error);
      toast.error("Failed to create invoice");
    },
  });

  const handleGenerateInvoice = () => {
    if (!invoiceDate || !dueDate) {
      toast.error("Please fill in invoice date and due date");
      return;
    }
    if (selectedBillingIds.length === 0) {
      toast.error("Please select at least one billing item");
      return;
    }

    createInvoiceMutation.mutate({
      invoice_date: invoiceDate,
      due_date: dueDate,
      billing_ids: selectedBillingIds,
    });
  };

  // Delete Invoice Handlers
  const handleOpenDeleteDialog = (item) => {
    setInvoiceToDelete(item);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setInvoiceToDelete(null);
  };

  const deleteInvoiceMutation = useMutation({
    mutationFn: (invoiceId) => deleteInvoice(invoiceId),
    onSuccess: (response) => {
      if (response?.response?.Apistatus === true) {
        toast.success("Invoice deleted successfully");
        queryClient.invalidateQueries(["invoiceList", slug]);
        closeDeleteDialog();
      } else {
        toast.error(response?.response?.message || "Failed to delete invoice");
      }
    },
    onError: (error) => {
      console.error("Failed to delete invoice:", error);
      toast.error("Failed to delete invoice");
    },
  });

  const handleConfirmDelete = () => {
    if (invoiceToDelete) {
      deleteInvoiceMutation.mutate(invoiceToDelete.id);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar2 />
      <header className="bg-white border-b px-6 py-3">
        <div className="flex items-center justify-end gap-6 text-sm text-gray-700">
          <div>
            Unpaid:{" "}
            <span className="font-semibold">{formatCurrency(unpaid)}</span>
          </div>
          <div>
            Unbilled:{" "}
            <span className="font-semibold">{formatCurrency(unbilled)}</span>
          </div>
          <div>
            Client Funds-Operating:{" "}
            <span className="font-semibold">
              {formatCurrency(clientFundsOperating)}
            </span>
          </div>
          <div>
            Client Funds-Trust:{" "}
            <span className="font-semibold">
              {formatCurrency(clientFundsTrust)}
            </span>
          </div>
        </div>
      </header>

      <nav className="bg-white border-b px-6 py-4 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/dashboard")}
            className="hover:text-gray-900 transition"
            type="button"
          >
            Dashboard
          </button>
          <ChevronRight className="w-4 h-4" />
          <button
            onClick={() => navigate("/dashboard/workstation")}
            className="hover:text-gray-900 transition"
            type="button"
          >
            Workstation
          </button>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 font-medium">Invoice</span>
        </div>
      </nav>

      <div className="mb-6 px-6 pt-6">
        <Button
          className="bg-primary hover:bg-primary/90 gap-2"
          onClick={handleOpenAddDialog}
        >
          <Plus className="size-4" />
          Add New Invoice
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-border overflow-hidden mx-6 mb-6">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead>Invoice #</TableHead>
              <TableHead>Invoice Date</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Balance</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created By</TableHead>
              <TableHead className="w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="text-center py-8 text-muted-foreground"
                >
                  Loading...
                </TableCell>
              </TableRow>
            ) : invoices.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="text-center py-8 text-muted-foreground"
                >
                  No data available
                </TableCell>
              </TableRow>
            ) : (
              invoices.map((item) => (
                <TableRow key={item.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium">{item.invoice_number || "-"}</TableCell>
                  <TableCell>{formatDate(item.invoice_date)}</TableCell>
                  <TableCell>{formatDate(item.due_date)}</TableCell>
                  <TableCell>{formatCurrency(item.amount)}</TableCell>
                  <TableCell>{formatCurrency(item.balance)}</TableCell>
                  <TableCell>{getStatusBadge(item.status)}</TableCell>
                  <TableCell>{item.created_by || "-"}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive/80"
                      onClick={() => handleOpenDeleteDialog(item)}
                      title="Delete Invoice"
                      disabled={item.status !== "unpaid"}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={addDialogOpen} onOpenChange={(open) => !open && closeAddDialog()}>
        <DialogContent className="w-[80vw] max-w-none max-h-[90vh] overflow-y-auto p-0 [&>button]:hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <DialogTitle className="text-xl font-semibold">Add Invoice</DialogTitle>
            <Button
              className="bg-primary hover:bg-primary/90"
              onClick={handleGenerateInvoice}
              disabled={createInvoiceMutation.isPending}
            >
              {createInvoiceMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Generate
            </Button>
          </div>

          <div className="flex gap-6 p-6">
            {/* Left Side - Enter Info */}
            <div className="w-64 shrink-0">
              <h3 className="text-sm font-medium text-muted-foreground mb-4">Enter Info</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Invoice #</label>
                  <Input
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    placeholder="00001"
                    disabled
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Invoice Date</label>
                  <Input
                    type="date"
                    value={invoiceDate}
                    onChange={(e) => setInvoiceDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Due Date</label>
                  <Input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Right Side - Unbilled Table */}
            <div className="flex-1 overflow-auto">
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="w-12">
                        <Checkbox
                          checked={
                            unbilledData.length > 0 &&
                            selectedBillingIds.length === unbilledData.length
                          }
                          onCheckedChange={handleSelectAll}
                        />
                      </TableHead>
                      <TableHead>ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>TimeKeeper</TableHead>
                      <TableHead>Task / Expense</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Time/Qty</TableHead>
                      <TableHead>Rate/Price</TableHead>
                      <TableHead>Value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {unbilledLoading ? (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                        </TableCell>
                      </TableRow>
                    ) : unbilledData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                          No unbilled items available
                        </TableCell>
                      </TableRow>
                    ) : (
                      unbilledData.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedBillingIds.includes(item.id)}
                              onCheckedChange={(checked) =>
                                handleSelectBilling(item.id, checked)
                              }
                            />
                          </TableCell>
                          <TableCell>{item.id}</TableCell>
                          <TableCell>{formatDate(item.date)}</TableCell>
                          <TableCell>{item.timekeeker || "-"}</TableCell>
                          <TableCell>{getSectionTypeBadge(item.section_type)}</TableCell>
                          <TableCell>{item.description || "-"}</TableCell>
                          <TableCell>{item.time_quantity}</TableCell>
                          <TableCell>{formatCurrency(item.rate)}</TableCell>
                          <TableCell>{formatCurrency(item.total_amount)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>

          <div className="flex justify-end px-6 py-4 border-t">
            <Button variant="outline" onClick={closeAddDialog}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={(open) => !open && closeDeleteDialog()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Invoice</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-muted-foreground">
              Are you sure you want to delete invoice{" "}
              <span className="font-semibold text-foreground">
                {invoiceToDelete?.invoice_number}
              </span>
              ? This action cannot be undone.
            </p>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={closeDeleteDialog}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deleteInvoiceMutation.isPending}
            >
              {deleteInvoiceMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Invoice;