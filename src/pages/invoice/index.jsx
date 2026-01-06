import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { fetchInvoiceList } from "./helpers/fetchInvoiceList";
import { fetchInvoiceDetails } from "./helpers/fetchInvoiceDetails";
import { fetchUnbilledList } from "./helpers/fetchUnbilledList";
import { createInvoice } from "./helpers/createInvoice";
import { deleteInvoice } from "./helpers/deleteInvoice";
import { updateInvoice } from "./helpers/updateInvoice";
import { fetchInvoicePaymentDetail } from "./helpers/fetchInvoicePaymentDetail";
import { saveInvoicePaymentTrust } from "./helpers/saveInvoicePaymentTrust";
import { saveInvoicePaymentOperating } from "./helpers/saveInvoicePaymentOperating";
import { fetchInvoicePaymentHistory } from "./helpers/fetchInvoicePaymentHistory";
import { deleteInvoicePayment } from "./helpers/deleteInvoicePayment";
import { fetchInvoiceWriteOff } from "./helpers/fetchInvoiceWriteOff";
import { saveInvoiceWriteOff } from "./helpers/saveInvoiceWriteOff";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { fetchMeta } from "../cost/helper/fetchMeta.js";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
  Pencil,
  MoreHorizontal,
  CreditCard,
  Building,
  ChevronDown,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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

  // Edit Invoice Dialog State
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editInvoiceId, setEditInvoiceId] = useState(null);
  const [editInvoiceNumber, setEditInvoiceNumber] = useState("");
  const [editInvoiceDate, setEditInvoiceDate] = useState("");
  const [editDueDate, setEditDueDate] = useState("");
  const [editSelectedBillingIds, setEditSelectedBillingIds] = useState([]);
  const [editBillingsData, setEditBillingsData] = useState([]);
  const [editLoading, setEditLoading] = useState(false);

  // Payment Popover State
  const [paymentPopoverOpen, setPaymentPopoverOpen] = useState(null);
  const [isPayToEditable, setIsPayToEditable] = useState(false);

  // Trust Payment Dialog State
  const [trustPaymentDialogOpen, setTrustPaymentDialogOpen] = useState(false);
  const [trustPaymentLoading, setTrustPaymentLoading] = useState(false);
  const [trustPaymentData, setTrustPaymentData] = useState(null);
  const [trustPaymentForm, setTrustPaymentForm] = useState({
    bankName: "",
    applyDate: "",
    payTo: "",
    bankBalance: "0.00",
    appliedCredit: "0.00",
    remainingCredit: "0.00",
    type: "withdrawal",
    method: "",
    refNumber: "",
    memo: "",
    memo2: "",
  });
  const [selectedPaymentInvoice, setSelectedPaymentInvoice] = useState(null);
  const [paymentInvoiceCredit, setPaymentInvoiceCredit] = useState("");
  const [isAppliedCreditEditable, setIsAppliedCreditEditable] = useState(false);

  // Operating Payment Dialog State
  const [operatingPaymentDialogOpen, setOperatingPaymentDialogOpen] =
    useState(false);
  const [operatingPaymentLoading, setOperatingPaymentLoading] = useState(false);
  const [operatingPaymentData, setOperatingPaymentData] = useState(null);
  const [operatingPaymentForm, setOperatingPaymentForm] = useState({
    applyDate: "",
    availableCredit: "0.00",
    appliedCredit: "0.00",
    remainingCredit: "0.00",
  });
  const [operatingPaymentInvoiceCredit, setOperatingPaymentInvoiceCredit] =
    useState("");
  const [
    isOperatingAppliedCreditEditable,
    setIsOperatingAppliedCreditEditable,
  ] = useState(false);

  // Payment History Dialog State
  const [paymentHistoryDialogOpen, setPaymentHistoryDialogOpen] =
    useState(false);
  const [paymentHistoryLoading, setPaymentHistoryLoading] = useState(false);
  const [paymentHistoryData, setPaymentHistoryData] = useState([]);
  const [selectedInvoiceForHistory, setSelectedInvoiceForHistory] =
    useState(null);

  // Delete Payment Dialog State
  const [deletePaymentDialogOpen, setDeletePaymentDialogOpen] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState(null);

  // Write Off Dialog State
  const [writeOffDialogOpen, setWriteOffDialogOpen] = useState(false);
  const [invoiceToWriteOff, setInvoiceToWriteOff] = useState(null);
  const [writeOffForm, setWriteOffForm] = useState({
    changeDate: new Date().toISOString().split("T")[0],
    changeExplanation: "",
    writeOffFullBalance: true,
  });
  const [writeOffTableData, setWriteOffTableData] = useState([
    { category: "Fee", original: "0.00", new: "0", change: "0", chartOfAccount: "4100:Fee Income (Income)", notes: "" },
    { category: "HST On Fee", original: "0.00", new: "0", change: "0", chartOfAccount: "2201:HST Collected/Paid", notes: "" },
    { category: "Soft Cost", original: "0.00", new: "0", change: "0", chartOfAccount: "4250:Inhouse Reimbursed", notes: "" },
    { category: "HST On Soft Cost", original: "0.00", new: "0", change: "0", chartOfAccount: "2201:HST Collected/Paid", notes: "" },
    { category: "Hard Cost-ACC", original: "0.00", new: "0", change: "0", chartOfAccount: "1700:Advanced Client Cost", notes: "" },
    { category: "HST On Hard Cost", original: "0.00", new: "0", change: "0", chartOfAccount: "2201:HST Collected/Paid", notes: "" },
  ]);
  const [writeOffData, setWriteOffData] = useState(null);
  const [writeOffLoading, setWriteOffLoading] = useState(false);

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
    const label =
      sectionType?.replace("-", " ").replace(/\b\w/g, (c) => c.toUpperCase()) ||
      "Unknown";
    return (
      <Badge className={typeColors[sectionType] || "bg-gray-100 text-gray-800"}>
        {label}
      </Badge>
    );
  };

  const handleOpenAddDialog = async () => {
    setAddDialogOpen(true);
    setUnbilledLoading(true);

    const nextNumber = String(invoices.length + 1).padStart(5, "0");
    setInvoiceNumber(nextNumber);

    const today = new Date().toISOString().split("T")[0];
    const nextMonth = new Date();
    nextMonth.setDate(nextMonth.getDate() + 15);
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

  const handleInvoiceDateChange = (e) => {
    const newDate = e.target.value;
    setInvoiceDate(newDate);

    // Calculate due date 15 days after invoice date
    if (newDate) {
      const date = new Date(newDate);
      date.setDate(date.getDate() + 15);
      const newDueDate = date.toISOString().split("T")[0];
      setDueDate(newDueDate);
    }
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

  const { data: metaData } = useQuery({
    queryKey: ["accountingMeta", slug],
    queryFn: () => fetchMeta(slug),
    enabled: !!slug,
  });

  const methodType = metaData?.accounting_banking_method || [];

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
        closeDeleteDialog();
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

  // Edit Invoice Handlers
  const handleOpenEditDialog = async (item) => {
    setEditDialogOpen(true);
    setEditLoading(true);
    setEditInvoiceId(item.id);
    setEditInvoiceNumber(item.invoice_number);

    try {
      const response = await fetchInvoiceDetails(item.id);
      const invoiceData = response;

      setEditInvoiceDate(invoiceData.invoice?.invoice_date || "");
      setEditDueDate(invoiceData.invoice?.due_date || "");

      // Combine attached and available billings
      const attached = (invoiceData.attached_billings || []).map((b) => ({
        ...b,
        is_attached: true,
      }));
      const available = (invoiceData.available_billings || []).map((b) => ({
        ...b,
        is_attached: false,
      }));
      const allBillings = [...attached, ...available];
      setEditBillingsData(allBillings);

      // Pre-select attached billings
      const attachedIds = attached.map((b) => b.id);
      setEditSelectedBillingIds(attachedIds);
    } catch (error) {
      console.error("Failed to fetch invoice details:", error);
      toast.error("Failed to load invoice details");
      setEditBillingsData([]);
    } finally {
      setEditLoading(false);
    }
  };

  const closeEditDialog = () => {
    setEditDialogOpen(false);
    setEditInvoiceId(null);
    setEditInvoiceNumber("");
    setEditInvoiceDate("");
    setEditDueDate("");
    setEditSelectedBillingIds([]);
    setEditBillingsData([]);
  };

  const handleEditSelectAll = (checked) => {
    if (checked) {
      setEditSelectedBillingIds(editBillingsData.map((item) => item.id));
    } else {
      setEditSelectedBillingIds([]);
    }
  };

  const handleEditSelectBilling = (id, checked) => {
    if (checked) {
      setEditSelectedBillingIds((prev) => [...prev, id]);
    } else {
      setEditSelectedBillingIds((prev) =>
        prev.filter((itemId) => itemId !== id)
      );
    }
  };

  const updateInvoiceMutation = useMutation({
    mutationFn: (data) => updateInvoice(editInvoiceId, data),
    onSuccess: (response) => {
      if (response?.response?.Apistatus === true) {
        toast.success("Invoice updated successfully");
        queryClient.invalidateQueries(["invoiceList", slug]);
        closeEditDialog();
      } else {
        toast.error(response?.response?.message || "Failed to update invoice");
      }
    },
    onError: (error) => {
      console.error("Failed to update invoice:", error);
      toast.error("Failed to update invoice");
    },
  });

  const handleUpdateInvoice = () => {
    if (!editInvoiceDate || !editDueDate) {
      toast.error("Please fill in invoice date and due date");
      return;
    }
    if (editSelectedBillingIds.length === 0) {
      toast.error("Please select at least one billing item");
      return;
    }

    updateInvoiceMutation.mutate({
      invoice_date: editInvoiceDate,
      due_date: editDueDate,
      billing_ids: editSelectedBillingIds,
    });
  };
  // Invoice Payment Handlers
  const handlePaymentFromTrust = async (item) => {
    setPaymentPopoverOpen(null);
    setTrustPaymentDialogOpen(true);
    setTrustPaymentLoading(true);

    // Set default date
    const today = new Date().toISOString().split("T")[0];
    setTrustPaymentForm((prev) => ({
      ...prev,
      applyDate: today,
      type: "withdrawal",
      bankName: "Trust Bank",
    }));

    try {
      const response = await fetchInvoicePaymentDetail(item.id);
      const data = response?.response?.data;
      setTrustPaymentData(data);

      setTrustPaymentForm((prev) => ({
        ...prev,
        payTo: data?.pay_to || "",
        bankBalance: data?.client_funds_trust || "0.00",
        appliedCredit: "0.00",
        remainingCredit: data?.client_funds_trust || "0.00",
      }));

      setIsPayToEditable(data?.is_pay_to || false);

      setSelectedPaymentInvoice(data?.id || null);
    } catch (error) {
      console.error("Failed to fetch payment details:", error);
      toast.error("Failed to load payment details");
      setTrustPaymentData(null);
    } finally {
      setTrustPaymentLoading(false);
    }
  };

  const closeTrustPaymentDialog = () => {
    setTrustPaymentDialogOpen(false);
    setTrustPaymentData(null);
    setTrustPaymentForm({
      bankName: "",
      applyDate: "",
      payTo: "",
      bankBalance: "0.00",
      appliedCredit: "0.00",
      remainingCredit: "0.00",
      type: "withdrawal",
      method: "",
      refNumber: "",
      memo: "",
      memo2: "",
    });
    setSelectedPaymentInvoice(null);
    setPaymentInvoiceCredit("");
    setIsAppliedCreditEditable(false);
  };

  const handleSelectPaymentInvoice = (invoiceId) => {
    setSelectedPaymentInvoice(invoiceId);
    setPaymentInvoiceCredit("");
    setIsAppliedCreditEditable(false);
  };

  const handleAppliedCreditChange = (value) => {
    const invoiceBalance = parseFloat(trustPaymentData?.balance) || 0;
    let appliedAmount = parseFloat(value) || 0;

    // Cap applied credit to invoice balance
    if (appliedAmount > invoiceBalance) {
      appliedAmount = invoiceBalance;
      toast.warning(
        `Applied Credit cannot exceed Invoice Balance (${formatCurrency(
          invoiceBalance
        )})`
      );
    }

    setPaymentInvoiceCredit(appliedAmount.toString());
    const bankBalance = parseFloat(trustPaymentForm.bankBalance) || 0;
    const remainingCredit = bankBalance - appliedAmount;

    setTrustPaymentForm((prev) => ({
      ...prev,
      appliedCredit: appliedAmount.toFixed(2),
      remainingCredit: remainingCredit.toFixed(2),
    }));
  };

  const handleReceivePayment = async () => {
    if (!trustPaymentForm.method) {
      toast.error("Please select a payment method");
      return;
    }
    if (!paymentInvoiceCredit || parseFloat(paymentInvoiceCredit) <= 0) {
      toast.error("Please enter applied credit amount");
      return;
    }

    // Map method name to method_id
    const methodMap = {
      cheque: 1,
      wire: 2,
      eft: 3,
      cash: 4,
    };

    const payload = {
      bank_name:
        trustPaymentForm.bankName === "trust-bank"
          ? "Trust Bank"
          : trustPaymentForm.bankName,
      apply_date: trustPaymentForm.applyDate,
      pay_to: trustPaymentForm.payTo,
      bank_balance: parseFloat(trustPaymentForm.bankBalance) || 0,
      applied_credit: parseFloat(paymentInvoiceCredit) || 0,
      remaining_credit: parseFloat(trustPaymentForm.remainingCredit) || 0,
      type:
        trustPaymentForm.type === "withdrawal"
          ? "Withdrawal"
          : trustPaymentForm.type,
      method_id: methodMap[trustPaymentForm.method] || 1,
      ref: trustPaymentForm.refNumber,
      memo_1: trustPaymentForm.memo,
      memo_2: trustPaymentForm.memo2,
      invoice_id: selectedPaymentInvoice,
    };

    try {
      await saveInvoicePaymentTrust(slug, payload);
      toast.success("Payment received successfully");
      closeTrustPaymentDialog();
      queryClient.invalidateQueries(["invoiceList", slug]);
    } catch (error) {
      console.error("Failed to save payment:", error);
      toast.error(error?.response?.data?.message || "Failed to save payment");
    }
  };

  const handlePaymentFromOperating = async (item) => {
    setPaymentPopoverOpen(null);
    setOperatingPaymentDialogOpen(true);
    setOperatingPaymentLoading(true);

    // Set default date
    const today = new Date().toISOString().split("T")[0];
    setOperatingPaymentForm((prev) => ({
      ...prev,
      applyDate: today,
    }));

    try {
      const response = await fetchInvoicePaymentDetail(item.id);
      const data = response?.response?.data;
      setOperatingPaymentData(data);

      setOperatingPaymentForm((prev) => ({
        ...prev,
        availableCredit: data?.client_funds_operating || "0.00",
        appliedCredit: "0.00",
        remainingCredit: data?.client_funds_operating || "0.00",
      }));
    } catch (error) {
      console.error("Failed to fetch payment details:", error);
      toast.error("Failed to load payment details");
      setOperatingPaymentData(null);
    } finally {
      setOperatingPaymentLoading(false);
    }
  };

  const closeOperatingPaymentDialog = () => {
    setOperatingPaymentDialogOpen(false);
    setOperatingPaymentData(null);
    setOperatingPaymentForm({
      applyDate: "",
      availableCredit: "0.00",
      appliedCredit: "0.00",
      remainingCredit: "0.00",
    });
    setOperatingPaymentInvoiceCredit("");
    setIsOperatingAppliedCreditEditable(false);
  };

  const handleOperatingAppliedCreditChange = (value) => {
    const invoiceBalance = parseFloat(operatingPaymentData?.balance) || 0;
    let appliedAmount = parseFloat(value) || 0;

    // Cap applied credit to invoice balance
    if (appliedAmount > invoiceBalance) {
      appliedAmount = invoiceBalance;
      toast.warning(
        `Applied Credit cannot exceed Invoice Balance (${formatCurrency(
          invoiceBalance
        )})`
      );
    }

    setOperatingPaymentInvoiceCredit(appliedAmount.toString());
    const availableCredit =
      parseFloat(operatingPaymentForm.availableCredit) || 0;
    const remainingCredit = availableCredit - appliedAmount;

    setOperatingPaymentForm((prev) => ({
      ...prev,
      appliedCredit: appliedAmount.toFixed(2),
      remainingCredit: remainingCredit.toFixed(2),
    }));
  };

  const handleReceiveOperatingPayment = async () => {
    if (
      !operatingPaymentInvoiceCredit ||
      parseFloat(operatingPaymentInvoiceCredit) <= 0
    ) {
      toast.error("Please enter applied credit amount");
      return;
    }

    const payload = {
      apply_date: operatingPaymentForm.applyDate,
      bank_balance: parseFloat(operatingPaymentForm.availableCredit) || 0,
      applied_credit: parseFloat(operatingPaymentInvoiceCredit) || 0,
      remaining_credit: parseFloat(operatingPaymentForm.remainingCredit) || 0,
      invoice_id: operatingPaymentData?.id,
    };

    try {
      await saveInvoicePaymentOperating(slug, payload);
      toast.success("Payment received successfully");
      closeOperatingPaymentDialog();
      queryClient.invalidateQueries(["invoiceList", slug]);
    } catch (error) {
      console.error("Failed to save payment:", error);
      toast.error(error?.response?.data?.message || "Failed to save payment");
    }
  };

  const handleViewPaymentHistory = async (item) => {
    setSelectedInvoiceForHistory(item);
    setPaymentHistoryDialogOpen(true);
    setPaymentHistoryLoading(true);

    try {
      const response = await fetchInvoicePaymentHistory(item.id);
      setPaymentHistoryData(response?.data || []);
    } catch (error) {
      console.error("Failed to fetch payment history:", error);
      toast.error("Failed to load payment history");
      setPaymentHistoryData([]);
    } finally {
      setPaymentHistoryLoading(false);
    }
  };

  const closePaymentHistoryDialog = () => {
    setPaymentHistoryDialogOpen(false);
    setPaymentHistoryData([]);
    setSelectedInvoiceForHistory(null);
  };

  const handleOpenDeletePaymentDialog = (payment) => {
    setPaymentToDelete(payment);
    setDeletePaymentDialogOpen(true);
  };

  const closeDeletePaymentDialog = () => {
    setDeletePaymentDialogOpen(false);
    setPaymentToDelete(null);
  };

  const deletePaymentMutation = useMutation({
    mutationFn: (paymentId) => deleteInvoicePayment(paymentId),
    onSuccess: (response) => {
      if (response?.response?.Apistatus === true) {
        toast.success("Payment deleted successfully");
        queryClient.invalidateQueries(["invoiceList", slug]);
        closeDeletePaymentDialog();
        // Refresh payment history after delete
        if (selectedInvoiceForHistory) {
          handleViewPaymentHistory(selectedInvoiceForHistory);
        }
      } else {
        toast.error(response?.response?.message || "Failed to delete payment");
        closeDeletePaymentDialog();
      }
    },
    onError: (error) => {
      console.error("Failed to delete payment:", error);
      toast.error("Failed to delete payment");
    },
  });

  const handleConfirmDeletePayment = () => {
    if (paymentToDelete) {
      deletePaymentMutation.mutate(paymentToDelete.id);
    }
  };

  // Write Off Handlers
  const handleOpenWriteOffDialog = async (item) => {
    setInvoiceToWriteOff(item);
    const today = new Date().toISOString().split("T")[0];
    setWriteOffForm({
      changeDate: today,
      changeExplanation: "",
      writeOffFullBalance: true,
    });
    setWriteOffDialogOpen(true);
    setWriteOffLoading(true);

    try {
      const response = await fetchInvoiceWriteOff(item.id);
      if (response?.Apistatus) {
        setWriteOffData(response);
        const feeOriginal = parseFloat(response.Fee || 0).toFixed(2);
        const feeNew = parseFloat(response.Fee - response?.RemainingBalance || 0).toFixed(2);
        const feeChange = (feeOriginal - feeNew).toFixed(2);    
        const hstOnFeeOriginal = parseFloat(response.hst_on_fee || 0).toFixed(2);
        const softCostOriginal = parseFloat(response.soft_cost || 0).toFixed(2);
        const hstOnSoftCostOriginal = parseFloat(response.hst_on_soft_cost || 0).toFixed(2);
        const hardCostOriginal = parseFloat(response.hard_cost || 0).toFixed(2);
        const hstOnHardCostOriginal = "0.00";
        
        setWriteOffTableData([
          { category: "Fee", original: feeOriginal, new: feeNew, change: feeChange, chartOfAccount: "4100:Fee Income (Income)", notes: "" },
          { category: "HST On Fee", original: hstOnFeeOriginal, new: hstOnFeeOriginal, change: "0", chartOfAccount: "2201:HST Collected/Paid", notes: "" },
          { category: "Soft Cost", original: softCostOriginal, new: softCostOriginal, change: "0", chartOfAccount: "4250:Inhouse Reimbursed", notes: "" },
          { category: "HST On Soft Cost", original: hstOnSoftCostOriginal, new: hstOnSoftCostOriginal, change: "0", chartOfAccount: "2201:HST Collected/Paid", notes: "" },
          { category: "Hard Cost-ACC", original: hardCostOriginal, new: hardCostOriginal, change: "0", chartOfAccount: "1700:Advanced Client Cost", notes: "" },
          { category: "HST On Hard Cost", original: hstOnHardCostOriginal, new: hstOnHardCostOriginal, change: "0", chartOfAccount: "2201:HST Collected/Paid", notes: "" },
        ]);
      }
    } catch (error) {
      console.error("Failed to fetch write-off data:", error);
      toast.error("Failed to fetch write-off data");
    } finally {
      setWriteOffLoading(false);
    }
  };

  const closeWriteOffDialog = () => {
    setWriteOffDialogOpen(false);
    setInvoiceToWriteOff(null);
    setWriteOffData(null);
    setWriteOffForm({
      changeDate: "",
      changeExplanation: "",
      writeOffFullBalance: false,
    });
  };

  const handleWriteOffTableChange = (index, field, value) => {
    setWriteOffTableData((prev) => {
      const newData = [...prev];
      newData[index] = { ...newData[index], [field]: value };
      return newData;
    });
  };

  const handleSaveWriteOff = async () => {
    const payload = {
      change_date: writeOffForm.changeDate,
      invoice_id: invoiceToWriteOff?.id,
      invoice_number: writeOffData?.invoice_number || invoiceToWriteOff?.invoice_number,
      change_fee: parseFloat(writeOffTableData[0]?.change || 0),
      notes_fee: writeOffTableData[0]?.notes || "",
      change_hst: parseFloat(writeOffTableData[1]?.change || 0),
      notes_hst: writeOffTableData[1]?.notes || "",
      change_soft: parseFloat(writeOffTableData[2]?.change || 0),
      notes_soft: writeOffTableData[2]?.notes || "",
      change_soft_hst: parseFloat(writeOffTableData[3]?.change || 0),
      notes_soft_hst: writeOffTableData[3]?.notes || "",
      change_hard: parseFloat(writeOffTableData[4]?.change || 0),
      notes_hard: writeOffTableData[4]?.notes || "",
    };

    try {
      const response = await saveInvoiceWriteOff(payload);
      if (response?.response?.Apistatus) {
        toast.success("Write-off saved successfully");
        queryClient.invalidateQueries(["invoiceList", slug]);
        closeWriteOffDialog();
      } else {
        toast.error(response?.message || "Failed to save write-off");
      }
    } catch (error) {
      console.error("Failed to save write-off:", error);
      toast.error("Failed to save write-off");
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
              <TableHead className="w-40">History</TableHead>
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
                  <TableCell className="font-medium">
                    {item.invoice_number || "-"}
                  </TableCell>
                  <TableCell>{formatDate(item.invoice_date)}</TableCell>
                  <TableCell>{formatDate(item.due_date)}</TableCell>
                  <TableCell>{formatCurrency(item.amount)}</TableCell>
                  <TableCell>{formatCurrency(item.balance)}</TableCell>
                  <TableCell>{getStatusBadge(item.status)}</TableCell>
                  <TableCell>{item.created_by || "-"}</TableCell>
                  <TableCell>
                    <button
                      className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent text-left"
                      onClick={() => handleViewPaymentHistory(item)}
                    >
                      <CreditCard className="h-4 w-4" />
                    </button>
                  </TableCell>
                  <TableCell>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent align="end" className="w-48 p-1">
                        <div className="flex flex-col">
                          <button
                            className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent text-left disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={() => handleOpenEditDialog(item)}
                            disabled={item.status !== "unpaid"}
                          >
                            <Pencil className="h-4 w-4" />
                            Edit
                          </button>
                          <button
                            className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent text-left text-destructive disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={() => handleOpenDeleteDialog(item)}
                            disabled={item.status !== "unpaid"}
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </button>
                          <button
                            className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent text-left disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={() => handleOpenWriteOffDialog(item)}
                          >
                            <X className="h-4 w-4" />
                            Write Off
                          </button>

                          {/* Invoice Payment Nested Popover */}
                          <Popover
                            open={paymentPopoverOpen === item.id}
                            onOpenChange={(open) =>
                              setPaymentPopoverOpen(open ? item.id : null)
                            }
                          >
                            <PopoverTrigger asChild>
                              <button className="flex items-center justify-between gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent text-left w-full">
                                <span className="flex items-center gap-2">
                                  <CreditCard className="h-4 w-4" />
                                  Invoice Payment
                                </span>
                                <ChevronDown className="h-3 w-3" />
                              </button>
                            </PopoverTrigger>
                            <PopoverContent
                              side="right"
                              align="start"
                              className="w-48 p-1"
                            >
                              <div className="flex flex-col">
                                <button
                                  className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent text-left"
                                  onClick={() => handlePaymentFromTrust(item)}
                                >
                                  <Building className="h-4 w-4" />
                                  Existing Trust Bank
                                </button>
                                <button
                                  className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent text-left"
                                  onClick={() =>
                                    handlePaymentFromOperating(item)
                                  }
                                >
                                  <Building className="h-4 w-4" />
                                  Existing Operating Bank
                                </button>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog
        open={addDialogOpen}
        onOpenChange={(open) => !open && closeAddDialog()}
      >
        <DialogContent className="w-[80vw] max-w-none max-h-[90vh] overflow-y-auto p-0 [&>button]:hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <DialogTitle className="text-xl font-semibold">
              Add Invoice
            </DialogTitle>
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
              <h3 className="text-sm font-medium text-muted-foreground mb-4">
                Enter Info
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Invoice #
                  </label>
                  <Input
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    placeholder="00001"
                    disabled
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Invoice Date
                  </label>
                  <Input
                    type="date"
                    value={invoiceDate}
                    onChange={handleInvoiceDateChange}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Due Date
                  </label>
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
                        <TableCell
                          colSpan={10}
                          className="text-center py-8 text-muted-foreground"
                        >
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
                          <TableCell>
                            {getSectionTypeBadge(item.section_type)}
                          </TableCell>
                          <TableCell>{item.description || "-"}</TableCell>
                          <TableCell>{item.time_quantity}</TableCell>
                          <TableCell>{formatCurrency(item.rate)}</TableCell>
                          <TableCell>
                            {formatCurrency(item.total_amount)}
                          </TableCell>
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
      <Dialog
        open={deleteDialogOpen}
        onOpenChange={(open) => !open && closeDeleteDialog()}
      >
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

      {/* Edit Invoice Dialog */}
      <Dialog
        open={editDialogOpen}
        onOpenChange={(open) => !open && closeEditDialog()}
      >
        <DialogContent className="w-[80vw] max-w-none max-h-[90vh] overflow-y-auto p-0 [&>button]:hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <DialogTitle className="text-xl font-semibold">
              Edit Invoice - {editInvoiceNumber}
            </DialogTitle>
            <Button
              className="bg-primary hover:bg-primary/90"
              onClick={handleUpdateInvoice}
              disabled={updateInvoiceMutation.isPending}
            >
              {updateInvoiceMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Update
            </Button>
          </div>

          <div className="flex gap-6 p-6">
            {/* Left Side - Edit Info */}
            <div className="w-64 shrink-0">
              <h3 className="text-sm font-medium text-muted-foreground mb-4">
                Edit Info
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Invoice #
                  </label>
                  <Input
                    value={editInvoiceNumber}
                    placeholder="00001"
                    disabled
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Invoice Date
                  </label>
                  <Input
                    type="date"
                    value={editInvoiceDate}
                    onChange={(e) => setEditInvoiceDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Due Date
                  </label>
                  <Input
                    type="date"
                    value={editDueDate}
                    onChange={(e) => setEditDueDate(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Right Side - Billings Table */}
            <div className="flex-1 overflow-auto">
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="w-12">
                        <Checkbox
                          checked={
                            editBillingsData.length > 0 &&
                            editSelectedBillingIds.length ===
                              editBillingsData.length
                          }
                          onCheckedChange={handleEditSelectAll}
                        />
                      </TableHead>
                      <TableHead>ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Task / Expense</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>Rate</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {editLoading ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                        </TableCell>
                      </TableRow>
                    ) : editBillingsData.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={9}
                          className="text-center py-8 text-muted-foreground"
                        >
                          No billing items available
                        </TableCell>
                      </TableRow>
                    ) : (
                      editBillingsData.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <Checkbox
                              checked={editSelectedBillingIds.includes(item.id)}
                              onCheckedChange={(checked) =>
                                handleEditSelectBilling(item.id, checked)
                              }
                            />
                          </TableCell>
                          <TableCell>{item.id}</TableCell>
                          <TableCell>{formatDate(item.date)}</TableCell>
                          <TableCell>
                            {getSectionTypeBadge(item.section_type)}
                          </TableCell>
                          <TableCell>{item.description || "-"}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>{formatCurrency(item.rate)}</TableCell>
                          <TableCell>
                            {formatCurrency(item.total_amount)}
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={
                                item.is_attached
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                              }
                            >
                              {item.is_attached ? "Attached" : "Available"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>

          <div className="flex justify-end px-6 py-4 border-t">
            <Button variant="outline" onClick={closeEditDialog}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={trustPaymentDialogOpen}
        onOpenChange={(open) => !open && closeTrustPaymentDialog()}
      >
        <DialogContent className="w-[70vw] max-w-none max-h-[90vh] overflow-y-auto p-0 [&>button]:hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <DialogTitle className="text-xl font-semibold">
              Invoice Payments from Existing Trust Retainers
            </DialogTitle>
            <div className="flex items-center gap-3">
              <button
                onClick={closeTrustPaymentDialog}
                className="rounded-sm opacity-70 hover:opacity-100"
              >
                <X className="h-5 w-5" />
              </button>
              <Button
                className="bg-primary hover:bg-primary/90"
                onClick={handleReceivePayment}
              >
                Receive Payment
              </Button>
            </div>
          </div>

          {trustPaymentLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="flex gap-6 p-6">
              <div className="w-80 shrink-0 border rounded-lg p-4">
                <h3 className="text-sm font-medium text-muted-foreground mb-4">
                  Funds Drawn From
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <label className="text-sm w-28 shrink-0">Bank Name</label>
                    <Select
                      value={trustPaymentForm.bankName}
                      onValueChange={(value) =>
                        setTrustPaymentForm((prev) => ({
                          ...prev,
                          bankName: value,
                        }))
                      }
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select bank" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Trust Bank">Trust Bank</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="text-sm w-28 shrink-0">Apply Date</label>
                    <Input
                      type="date"
                      value={trustPaymentForm.applyDate}
                      onChange={(e) =>
                        setTrustPaymentForm((prev) => ({
                          ...prev,
                          applyDate: e.target.value,
                        }))
                      }
                      className="flex-1"
                    />
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="text-sm w-28 shrink-0">Pay To</label>
                    <Input
                      value={trustPaymentForm.payTo}
                      onChange={(e) =>
                        setTrustPaymentForm((prev) => ({
                          ...prev,
                          payTo: e.target.value,
                        }))
                      }
                      className="flex-1"
                      disabled={!isPayToEditable}
                    />
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="text-sm w-28 shrink-0">
                      Bank Balance
                    </label>
                    <Input
                      value={trustPaymentForm.bankBalance}
                      className="flex-1"
                      disabled
                    />
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="text-sm w-28 shrink-0">
                      Applied Credit
                    </label>
                    <Input
                      value={trustPaymentForm.appliedCredit}
                      className="flex-1"
                      disabled
                    />
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="text-sm w-28 shrink-0">
                      Remaining Credit
                    </label>
                    <Input
                      value={trustPaymentForm.remainingCredit}
                      className="flex-1"
                      disabled
                    />
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="text-sm w-28 shrink-0">Type</label>
                    <Select
                      value={trustPaymentForm.type}
                      onValueChange={(value) =>
                        setTrustPaymentForm((prev) => ({
                          ...prev,
                          type: value,
                        }))
                      }
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="withdrawal">Withdrawal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="text-sm w-28 shrink-0">Method</label>
                    <Select
                      value={trustPaymentForm.method}
                      onValueChange={(value) =>
                        setTrustPaymentForm((prev) => ({
                          ...prev,
                          method: value,
                        }))
                      }
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select method" />
                      </SelectTrigger>
                      <SelectContent>
                        {methodType.map((item) => (
                          <SelectItem key={item.id} value={String(item.id)}>
                            {item.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="text-sm w-28 shrink-0">Ref#</label>
                    <Input
                      value={trustPaymentForm.refNumber}
                      onChange={(e) =>
                        setTrustPaymentForm((prev) => ({
                          ...prev,
                          refNumber: e.target.value,
                        }))
                      }
                      className="flex-1"
                    />
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="text-sm w-28 shrink-0">Memo</label>
                    <Input
                      value={trustPaymentForm.memo}
                      onChange={(e) =>
                        setTrustPaymentForm((prev) => ({
                          ...prev,
                          memo: e.target.value,
                        }))
                      }
                      className="flex-1"
                    />
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="text-sm w-28 shrink-0">Memo2</label>
                    <Input
                      value={trustPaymentForm.memo2}
                      onChange={(e) =>
                        setTrustPaymentForm((prev) => ({
                          ...prev,
                          memo2: e.target.value,
                        }))
                      }
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              {/* Right Side - Credit Applied To */}
              <div className="flex-1 border rounded-lg p-4">
                <h3 className="text-sm font-medium text-muted-foreground mb-4">
                  Credit Applied To
                </h3>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="w-12"></TableHead>
                        <TableHead>Invoice #</TableHead>
                        <TableHead>Invoice Date</TableHead>
                        <TableHead>Invoice Amount</TableHead>
                        <TableHead>Invoice Balance</TableHead>
                        <TableHead>Applied Credit</TableHead>
                        <TableHead className="w-16"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {trustPaymentData ? (
                        <TableRow>
                          <TableCell>
                            <RadioGroup
                              value={selectedPaymentInvoice?.toString()}
                              onValueChange={(value) =>
                                handleSelectPaymentInvoice(Number(value))
                              }
                            >
                              <RadioGroupItem
                                value={trustPaymentData.id?.toString()}
                              />
                            </RadioGroup>
                          </TableCell>
                          <TableCell>
                            {trustPaymentData.invoice_number}
                          </TableCell>
                          <TableCell>
                            {formatDate(trustPaymentData.invoice_date)}
                          </TableCell>
                          <TableCell>
                            {formatCurrency(trustPaymentData.amount)}
                          </TableCell>
                          <TableCell>
                            {formatCurrency(trustPaymentData.balance)}
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              step="0.01"
                              value={paymentInvoiceCredit}
                              onChange={(e) =>
                                handleAppliedCreditChange(e.target.value)
                              }
                              className="w-24 h-8"
                              placeholder="0.00"
                              disabled={!isAppliedCreditEditable}
                            />
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 bg-primary text-white hover:bg-primary/90"
                              onClick={() =>
                                setIsAppliedCreditEditable(
                                  !isAppliedCreditEditable
                                )
                              }
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={7}
                            className="text-center py-8 text-muted-foreground"
                          >
                            No invoice data available
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Operating Payment Dialog */}
      <Dialog
        open={operatingPaymentDialogOpen}
        onOpenChange={(open) => !open && closeOperatingPaymentDialog()}
      >
        <DialogContent className="w-[70vw] max-w-none max-h-[90vh] overflow-y-auto p-0 [&>button]:hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <DialogTitle className="text-xl font-semibold">
              Invoice Payments from Existing Operating Retainers
            </DialogTitle>
            <div className="flex items-center gap-3">
              <button
                onClick={closeOperatingPaymentDialog}
                className="rounded-sm opacity-70 hover:opacity-100"
              >
                <X className="h-5 w-5" />
              </button>
              <Button
                className="bg-primary hover:bg-primary/90"
                onClick={handleReceiveOperatingPayment}
              >
                Receive Payment
              </Button>
            </div>
          </div>

          {operatingPaymentLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="flex gap-6 p-6">
              <div className="w-80 shrink-0 border rounded-lg p-4">
                <h3 className="text-sm font-medium text-muted-foreground mb-4">
                  Credit Summary
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <label className="text-sm w-28 shrink-0">Apply Date</label>
                    <Input
                      type="date"
                      value={operatingPaymentForm.applyDate}
                      onChange={(e) =>
                        setOperatingPaymentForm((prev) => ({
                          ...prev,
                          applyDate: e.target.value,
                        }))
                      }
                      className="flex-1"
                    />
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="text-sm w-28 shrink-0">
                      Available Credit
                    </label>
                    <Input
                      value={operatingPaymentForm.availableCredit}
                      className="flex-1"
                      disabled
                    />
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="text-sm w-28 shrink-0">
                      Applied Credit
                    </label>
                    <Input
                      value={operatingPaymentForm.appliedCredit}
                      className="flex-1"
                      disabled
                    />
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="text-sm w-28 shrink-0">
                      Remaining Credit
                    </label>
                    <Input
                      value={operatingPaymentForm.remainingCredit}
                      className="flex-1"
                      disabled
                    />
                  </div>
                </div>
              </div>

              {/* Right Side - Credit Applied To */}
              <div className="flex-1 border rounded-lg p-4">
                <h3 className="text-sm font-medium text-muted-foreground mb-4">
                  Credit Applied To
                </h3>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="w-12"></TableHead>
                        <TableHead>Invoice #</TableHead>
                        <TableHead>Invoice Date</TableHead>
                        <TableHead>Invoice Amount</TableHead>
                        <TableHead>Invoice Balance</TableHead>
                        <TableHead>Applied Credit</TableHead>
                        <TableHead className="w-16"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {operatingPaymentData ? (
                        <TableRow>
                          <TableCell>
                            <RadioGroup
                              value={operatingPaymentData.id?.toString()}
                            >
                              <RadioGroupItem
                                value={operatingPaymentData.id?.toString()}
                              />
                            </RadioGroup>
                          </TableCell>
                          <TableCell>
                            {operatingPaymentData.invoice_number}
                          </TableCell>
                          <TableCell>
                            {formatDate(operatingPaymentData.invoice_date)}
                          </TableCell>
                          <TableCell>
                            {formatCurrency(operatingPaymentData.amount)}
                          </TableCell>
                          <TableCell>
                            {formatCurrency(operatingPaymentData.balance)}
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              step="0.01"
                              value={operatingPaymentInvoiceCredit}
                              onChange={(e) =>
                                handleOperatingAppliedCreditChange(
                                  e.target.value
                                )
                              }
                              className="w-24 h-8"
                              placeholder="0.00"
                              disabled={!isOperatingAppliedCreditEditable}
                            />
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 bg-primary text-white hover:bg-primary/90"
                              onClick={() =>
                                setIsOperatingAppliedCreditEditable(
                                  !isOperatingAppliedCreditEditable
                                )
                              }
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={7}
                            className="text-center py-8 text-muted-foreground"
                          >
                            No invoice data available
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Payment History Dialog */}
      <Dialog
        open={paymentHistoryDialogOpen}
        onOpenChange={(open) => !open && closePaymentHistoryDialog()}
      >
        <DialogContent className="w-[60vw] max-w-none max-h-[90vh] overflow-y-auto [&>button]:hidden">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Payment History - Invoice{" "}
              {selectedInvoiceForHistory?.invoice_number}
            </DialogTitle>
            <div className="flex items-center gap-3 absolute right-4 top-4">
              <Button
                className="bg-primary hover:bg-primary/90 gap-2"
              >
                Print History
              </Button>
              <button
                onClick={closePaymentHistoryDialog}
                className=" rounded-sm opacity-70 hover:opacity-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </DialogHeader>

          <div className="py-4">
            {paymentHistoryLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : paymentHistoryData.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No payment history available
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead>Payment ID</TableHead>
                      <TableHead>Bank Type</TableHead>
                      <TableHead>Applied Credit</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Created By</TableHead>
                      <TableHead>Created Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paymentHistoryData.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-medium">
                          {payment.id}
                        </TableCell>
                        <TableCell>
                          {payment.bank_type
                            ? payment.bank_type.replace("-", " ").toUpperCase()
                            : "-"}
                        </TableCell>
                        <TableCell>
                          {formatCurrency(payment.applied_credit)}
                        </TableCell>
                        <TableCell>{payment.type || "-"}</TableCell>
                        <TableCell>
                          {payment.creator?.first_name}{" "}
                          {payment.creator?.last_name}
                        </TableCell>
                        <TableCell>{formatDate(payment.created_at)}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-red-50 hover:text-red-600"
                            onClick={() =>
                              handleOpenDeletePaymentDialog(payment)
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={deletePaymentDialogOpen}
        onOpenChange={setDeletePaymentDialogOpen}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Payment</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete payment Id {paymentToDelete?.id}?
              This action cannot be undone.
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={closeDeletePaymentDialog}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDeletePayment}
              disabled={deletePaymentMutation.isPending}
            >
              {deletePaymentMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Payment"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Write Off Dialog */}
      <Dialog open={writeOffDialogOpen} onOpenChange={setWriteOffDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Write Off</DialogTitle>
          </DialogHeader>
          {writeOffLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
          <div className="space-y-4">
            {/* Top Section - Matter, Change Date, Invoice# */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Matter</label>
                <Input
                  value={writeOffData?.name || invoiceToWriteOff?.client_name || ""}
                  readOnly
                  className="bg-muted"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Change Date</label>
                <Input
                  type="date"
                  value={writeOffForm.changeDate}
                  onChange={(e) =>
                    setWriteOffForm((prev) => ({ ...prev, changeDate: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Invoice#</label>
                <Input
                  value={writeOffData?.invoice_number || invoiceToWriteOff?.id || ""}
                  readOnly
                  className="bg-muted"
                />
              </div>
            </div>

            {/* Change Explanation */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Change Explanation</label>
              <Input
                placeholder="Enter explanation for write off"
                value={writeOffForm.changeExplanation}
                onChange={(e) =>
                  setWriteOffForm((prev) => ({
                    ...prev,
                    changeExplanation: e.target.value,
                  }))
                }
              />
            </div>

            {/* Write-off full remaining balance checkbox */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="writeOffFullBalance"
                checked={writeOffForm.writeOffFullBalance}
                onCheckedChange={(checked) =>
                  setWriteOffForm((prev) => ({
                    ...prev,
                    writeOffFullBalance: checked,
                  }))
                }
              />
              <label
                htmlFor="writeOffFullBalance"
                className="text-sm font-medium cursor-pointer"
              >
                Write-off full remaining balance
              </label>
            </div>

            {/* Summary Row */}
            <div className="grid grid-cols-4 gap-4 p-4 bg-muted rounded-lg">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Original Amount</p>
                <p className="text-lg font-semibold">
                  {parseFloat(writeOffData?.Fee || 0)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Payments</p>
                <p className="text-lg font-semibold">
                  {parseFloat(writeOffData?.Fee  - writeOffData?.RemainingBalance|| 0).toFixed(2)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Change Amount</p>
                <p className="text-lg font-semibold">
                  {parseFloat(writeOffData?.changeBalance|| 0).toFixed(2)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Balance</p>
                <p className="text-lg font-semibold">
                  {parseFloat(writeOffData?.RemainingBalance || invoiceToWriteOff?.total_amount || 0).toFixed(2)}
                </p>
              </div>
            </div>

            {/* Write Off Table */}
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[150px]">Category</TableHead>
                    <TableHead className="w-[100px]">Original</TableHead>
                    <TableHead className="w-[100px]">New</TableHead>
                    <TableHead className="w-[100px]">Change</TableHead>
                    <TableHead className="w-[250px]">Chart of Account</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {writeOffTableData.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{row.category}</TableCell>
                      <TableCell>{row.original}</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={row.new}
                          onChange={(e) =>
                            handleWriteOffTableChange(index, "new", e.target.value)
                          }
                          className="w-20 h-8"
                          disabled
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={row.change}
                          onChange={(e) =>
                            handleWriteOffTableChange(index, "change", e.target.value)
                          }
                          className="w-20 h-8"
                          disabled={index !== 0}
                        />
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{row.chartOfAccount}</span>
                      </TableCell>
                      <TableCell>
                        <Input
                          value={row.notes}
                          onChange={(e) =>
                            handleWriteOffTableChange(index, "notes", e.target.value)
                          }
                          placeholder="Add notes..."
                          className="h-8"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={closeWriteOffDialog}>
                Cancel
              </Button>
              <Button onClick={handleSaveWriteOff}>Save</Button>
            </div>
          </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Invoice;
