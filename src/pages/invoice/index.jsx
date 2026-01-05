import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { fetchInvoiceList } from "./helpers/fetchInvoiceList";
import { fetchInvoiceDetails } from "./helpers/fetchInvoiceDetails";
import { Button } from "@/components/ui/button";
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
  const [currentPage] = useState(1);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [invoiceDetails, setInvoiceDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

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
          onClick={() => {}}
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
    </div>
  );
};

export default Invoice;