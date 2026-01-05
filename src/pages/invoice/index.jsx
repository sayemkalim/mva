import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { fetchInvoiceList } from "./helpers/fetchInvoiceList";
import { fetchInvoiceDetails } from "./helpers/fetchInvoiceDetails";
import { fetchUnbilledList } from "./helpers/fetchUnbilledList";
import { createInvoice } from "./helpers/createInvoice";
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
  Eye,
  X,
  Loader2,
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
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [invoiceDetails, setInvoiceDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Add Invoice Dialog State
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceDate, setInvoiceDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [selectedBillingIds, setSelectedBillingIds] = useState([]);
  const [unbilledData, setUnbilledData] = useState([]);
  const [unbilledLoading, setUnbilledLoading] = useState(false);

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

  const handleViewDetails = async (item) => {
    setSelectedInvoice(item);
    setDetailsLoading(true);
    setDetailDialogOpen(true);

    try {
      const response = await fetchInvoiceDetails(item.id);
      setInvoiceDetails(response);
    } catch (error) {
      console.error("Failed to fetch invoice details:", error);
      toast.error("Failed to load invoice details");
      setInvoiceDetails(null);
    } finally {
      setDetailsLoading(false);
    }
  };

  const closeDetailDialog = () => {
    setDetailDialogOpen(false);
    setSelectedInvoice(null);
    setInvoiceDetails(null);
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
                      className="h-8 w-8 text-primary hover:text-primary/80"
                      onClick={() => handleViewDetails(item)}
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Invoice Details Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={(open) => !open && closeDetailDialog()}>
        <DialogContent className="w-[80vw] max-w-none max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">
              Invoice Details {invoiceDetails?.invoice?.invoice_number && `- ${invoiceDetails.invoice.invoice_number}`}
            </DialogTitle>
            <button
              onClick={closeDetailDialog}
              className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100"
            >
              <X className="h-4 w-4" />
            </button>
          </DialogHeader>

          {detailsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : invoiceDetails ? (
            <div className="space-y-6 py-4">
              {/* Invoice Info */}
              <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Invoice Number</p>
                  <p className="font-semibold">{invoiceDetails.invoice?.invoice_number || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Invoice Date</p>
                  <p className="font-semibold">{formatDate(invoiceDetails.invoice?.invoice_date)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Due Date</p>
                  <p className="font-semibold">{formatDate(invoiceDetails.invoice?.due_date)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <p className="font-semibold">{formatCurrency(invoiceDetails.invoice?.amount)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Balance</p>
                  <p className="font-semibold">{formatCurrency(invoiceDetails.invoice?.balance)}</p>
                </div>
              </div>

              {/* Attached Billings */}
              <div>
                <h3 className="font-semibold text-lg mb-3">Attached Billings</h3>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead>ID</TableHead>
                        <TableHead>Section Type</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Rate</TableHead>
                        <TableHead>Total Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invoiceDetails.attached_billings?.length > 0 ? (
                        invoiceDetails.attached_billings.map((billing) => (
                          <TableRow key={billing.id}>
                            <TableCell>{billing.id}</TableCell>
                            <TableCell>{getSectionTypeBadge(billing.section_type)}</TableCell>
                            <TableCell>{formatDate(billing.date)}</TableCell>
                            <TableCell>{billing.description || "-"}</TableCell>
                            <TableCell>{billing.quantity}</TableCell>
                            <TableCell>{formatCurrency(billing.rate)}</TableCell>
                            <TableCell>{formatCurrency(billing.total_amount)}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                            No attached billings
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Available Billings */}
              <div>
                <h3 className="font-semibold text-lg mb-3">Available Billings</h3>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead>ID</TableHead>
                        <TableHead>Section Type</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Rate</TableHead>
                        <TableHead>Total Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invoiceDetails.available_billings?.length > 0 ? (
                        invoiceDetails.available_billings.map((billing) => (
                          <TableRow key={billing.id}>
                            <TableCell>{billing.id}</TableCell>
                            <TableCell>{getSectionTypeBadge(billing.section_type)}</TableCell>
                            <TableCell>{formatDate(billing.date)}</TableCell>
                            <TableCell>{billing.description || "-"}</TableCell>
                            <TableCell>{billing.quantity}</TableCell>
                            <TableCell>{formatCurrency(billing.rate)}</TableCell>
                            <TableCell>{formatCurrency(billing.total_amount)}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                            No available billings
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Failed to load invoice details
            </div>
          )}

          <div className="flex justify-end pt-4 border-t">
            <Button variant="outline" onClick={closeDetailDialog}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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
    </div>
  );
};

export default Invoice;