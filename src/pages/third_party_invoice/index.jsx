import React, { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { fetchList } from "./helpers/fetchList";
import { addInvoice } from "./helpers/addInvoice";
import { deleteInvoice } from "./helpers/deleteInvoice";
import { showThirdPartyInvoice } from "./helpers/showInvoice";
import { updateInvoice } from "./helpers/updateInvoice";
import { unlinkInvoice } from "./helpers/unlinkInvoice";
import { fetchPayBillsList } from "./helpers/fetchPayBillsList";
import { payBill } from "./helpers/payBill";
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
  X,
  ChevronRight,
  Upload,
  Loader2,
  Check,
  FileIcon,
  Trash2,
  Pencil,
  Unlink,
  DollarSign,
  MoreHorizontal,
  Lock,
  Unlock,
  Eye,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  FloatingInput,
  FloatingTextarea,
  FloatingWrapper,
} from "@/components/ui/floating-label";
import { Navbar2 } from "@/components/navbar2";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { uploadAttachment } from "@/pages/task/helpers/uploadAttachment";
import { deleteAttachment } from "@/pages/task/helpers/deleteTask";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { fetchMeta } from "../bank_transcation/helper/fetchMeta";
import { Select } from "@radix-ui/react-select";
import { SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const AttachmentUploader = ({ files, onFilesChange, onUpload, onDelete }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrls, setPreviewUrls] = useState({});
  const fileInputRef = useRef(null);

  useEffect(() => {
    const newPreviewUrls = {};
    files.forEach((file) => {
      if (file.fileObject) {
        const fileType = file.fileObject.type;
        if (fileType.startsWith("image/")) {
          const url = URL.createObjectURL(file.fileObject);
          newPreviewUrls[file.tempId] = url;
        }
      }
    });
    setPreviewUrls(newPreviewUrls);
    return () => {
      Object.values(newPreviewUrls).forEach((url) => URL.revokeObjectURL(url));
    };
  }, [files]);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  };

  const handleBoxClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    handleFiles(selectedFiles);
    e.target.value = "";
  };

  const handleFiles = (fileList) => {
    const newFiles = fileList.map((file) => ({
      tempId: `temp_${Date.now()}_${Math.random()}`,
      name: file.name,
      size: file.size,
      type: file.type,
      fileObject: file,
      uploaded: false,
      uploading: true,
    }));

    onFilesChange([...files, ...newFiles]);

    newFiles.forEach((fileData) => {
      onUpload(fileData);
    });
  };

  const handleRemoveFile = (e, fileToRemove) => {
    e.stopPropagation();
    if (fileToRemove.uploaded && fileToRemove.id) {
      onDelete(fileToRemove.id, fileToRemove.tempId);
    } else {
      onFilesChange(
        files.filter((file) => file.tempId !== fileToRemove.tempId)
      );
    }
    if (previewUrls[fileToRemove.tempId]) {
      URL.revokeObjectURL(previewUrls[fileToRemove.tempId]);
    }
  };

  const isImageFile = (fileType) => {
    return fileType && fileType.startsWith("image/");
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const isAnyFileUploading = files.some(
    (file) => file.uploading && !file.uploaded
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b pb-2">
        <h3 className="font-semibold text-sm text-foreground">Attachments</h3>
        <div className="text-sm text-muted-foreground">
          {files.length} file{files.length !== 1 ? "s" : ""}
        </div>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileInputChange}
        className="hidden"
        accept="*/*"
      />
      <div
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative border-2 border-dashed rounded-lg p-4 transition-all",
          isDragging && "border-primary bg-primary/10 scale-[1.02]",
          "border-input"
        )}
      >
        {files.length === 0 ? (
          <div
            onClick={handleBoxClick}
            className="flex flex-col items-center justify-center space-y-2 py-6 cursor-pointer hover:bg-primary/5 rounded-lg transition-colors"
          >
            <div className="rounded-full bg-primary/10 p-3">
              <Upload className="h-6 w-6 text-primary" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                All file types supported
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {files.map((file) => (
                <div
                  key={file.tempId}
                  className="relative bg-card border rounded-lg overflow-hidden hover:shadow-md transition-shadow group"
                >
                  {file.uploaded && file.id && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        const link = document.createElement('a');
                        link.href = `${import.meta.env.VITE_API_BASE_URL}/storage/attachments/${file.id}`;
                        link.download = file.name || 'attachment';
                        link.target = '_blank';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                      className="absolute top-1 left-1 z-10 bg-blue-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-600"
                      title="Download attachment"
                    >
                      <Eye className="h-3 w-3" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={(e) => handleRemoveFile(e, file)}
                    className="absolute top-1 right-1 z-10 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                  <div className="aspect-video bg-gray-100 flex items-center justify-center relative">
                    {isImageFile(file.type) && previewUrls[file.tempId] ? (
                      <img
                        src={previewUrls[file.tempId]}
                        alt={file.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <FileIcon className="h-8 w-8 text-gray-400" />
                    )}

                    {file.uploading && !file.uploaded && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Loader2 className="h-5 w-5 animate-spin text-white" />
                      </div>
                    )}

                    {file.uploaded && (
                      <div className="absolute top-1 left-1 bg-green-500 text-white rounded-full p-0.5">
                        <Check className="h-2.5 w-2.5" />
                      </div>
                    )}
                    {file.deleting && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Loader2 className="h-5 w-5 animate-spin text-white" />
                      </div>
                    )}
                  </div>
                  <div className="p-2 space-y-0.5">
                    <p
                      className="text-xs font-medium truncate"
                      title={file.name}
                    >
                      {file.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)}
                    </p>
                    {file.uploading && !file.uploaded && (
                      <p className="text-xs text-blue-600">Uploading...</p>
                    )}
                    {file.uploaded && file.id && (
                      <p className="text-xs text-green-600">✓ Uploaded</p>
                    )}
                    {file.deleting && (
                      <p className="text-xs text-red-600">Deleting...</p>
                    )}
                    {file.uploadFailed && (
                      <p className="text-xs text-red-600">Upload failed</p>
                    )}
                  </div>
                </div>
              ))}
              <div
                onClick={handleBoxClick}
                className="relative bg-gradient-to-br from-primary/5 to-primary/10 border-2 border-dashed border-primary/30 rounded-lg overflow-hidden hover:shadow-md hover:border-primary transition-all cursor-pointer group"
              >
                <div className="aspect-video flex flex-col items-center justify-center gap-1 p-3">
                  <div className="rounded-full bg-primary/10 p-2 group-hover:bg-primary/20 transition-colors">
                    <Plus className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-xs font-medium text-primary">Add More</p>
                </div>
              </div>
            </div>
          </div>
        )}
        {isAnyFileUploading && (
          <div className="absolute bottom-2 right-2 bg-blue-500 text-white px-2 py-1 rounded-full flex items-center gap-1 text-xs pointer-events-none">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>Uploading...</span>
          </div>
        )}
      </div>
    </div>
  );
};

const ThirdPartyInvoice = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [unlinkConfirmItem, setUnlinkConfirmItem] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [attachmentIds, setAttachmentIds] = useState([]);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [editUploadedFiles, setEditUploadedFiles] = useState([]);
  const [editAttachmentIds, setEditAttachmentIds] = useState([]);
  const [payDialogOpen, setPayDialogOpen] = useState(false);
  const [payingInvoice, setPayingInvoice] = useState(null);
  const [payBillsData, setPayBillsData] = useState([]);
  const [payBillsLoading, setPayBillsLoading] = useState(false);
  const [initialAmount, setInitialAmount] = useState(0);
  const [payForm, setPayForm] = useState({
    pay_date: "",
    pay_type: "Withdrawal",
    amount: "",
    pay_method: "",
    pay_to: "",
    memo_1st: "",
    memo_2nd: "",
    to_be_printed: false,
  });
  const [appliedAmounts, setAppliedAmounts] = useState({});

  const [form, setForm] = useState({
    bill_date: "",
    due_date: "",
    amount: "",
    pay_to: "",
    reference: "",
    memo_1st: "",
    memo_2nd: "",
    category: "",
    hold_bill_payment: false,
    type_id: "",
    original_amount: "",
    date_of_service: "",
    mark_as_paid_by_other: false,
    paid_by: "",
  });

  const resetForm = () => {
    setForm({
      bill_date: "",
      due_date: "",
      amount: "",
      pay_to: "",
      reference: "",
      memo_1st: "",
      memo_2nd: "",
      category: "",
      hold_bill_payment: false,
      type_id: "",
      original_amount: "",
      date_of_service: "",
      mark_as_paid_by_other: false,
      paid_by: "",
    });
    setUploadedFiles([]);
    setAttachmentIds([]);
  };

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: uploadAttachment,
    onSuccess: (response, variables) => {
      const attachmentId = response?.response?.attachment?.id;
      const fileName =
        response?.response?.attachment?.original_name || "Uploaded File";
      const fileExtension = response?.response?.attachment?.extension;
      const fullFileName = fileExtension
        ? `${fileName}.${fileExtension}`
        : fileName;

      if (attachmentId) {
        setUploadedFiles((prev) =>
          prev.map((file) =>
            file.tempId === variables.tempId
              ? {
                  ...file,
                  id: attachmentId,
                  name: fullFileName,
                  uploaded: true,
                  uploading: false,
                }
              : file
          )
        );

        setAttachmentIds((prev) => [...prev, attachmentId]);
        toast.success(`File uploaded: ${fullFileName}`);
      } else {
        setUploadedFiles((prev) =>
          prev.map((file) =>
            file.tempId === variables.tempId
              ? { ...file, uploading: false, uploadFailed: true }
              : file
          )
        );
      }
    },
    onError: (error, variables) => {
      setUploadedFiles((prev) =>
        prev.map((file) =>
          file.tempId === variables.tempId
            ? { ...file, uploading: false, uploadFailed: true }
            : file
        )
      );
      toast.error("Failed to upload file");
    },
  });

  // Delete attachment mutation
  const deleteAttachmentMutation = useMutation({
    mutationFn: deleteAttachment,
    onMutate: async (attachmentId) => {
      setUploadedFiles((prev) =>
        prev.map((file) =>
          file.id === attachmentId ? { ...file, deleting: true } : file
        )
      );
    },
    onSuccess: (response, attachmentId) => {
      setUploadedFiles((prev) =>
        prev.filter((file) => file.id !== attachmentId)
      );
      setAttachmentIds((prev) => prev.filter((id) => id !== attachmentId));
      toast.success("Attachment deleted successfully");
    },
    onError: (error, attachmentId) => {
      setUploadedFiles((prev) =>
        prev.map((file) =>
          file.id === attachmentId ? { ...file, deleting: false } : file
        )
      );
      toast.error("Failed to delete attachment");
    },
  });

  const { data: metaData } = useQuery({
    queryKey: ["accountingMeta", slug],
    queryFn: () => fetchMeta(slug),
    enabled: !!slug,
  });

  const methodType = metaData?.accounting_banking_other_type || [];
  const categoryType = metaData?.accounting_banking_method || [];

  const handleFilesChange = (newFiles) => {
    setUploadedFiles(newFiles);
  };

  const handleFileUpload = (fileData) => {
    uploadMutation.mutate({
      file: fileData.fileObject,
      tempId: fileData.tempId,
    });
  };

  const handleFileDelete = (attachmentId) => {
    deleteAttachmentMutation.mutate(attachmentId);
  };

  const addMutation = useMutation({
    mutationFn: (payload) => addInvoice(payload, slug),
    onSuccess: (response) => {
      if (response?.Apistatus != false) {
        queryClient.invalidateQueries(["thirdPartyInvoiceList", slug]);
        setDialogOpen(false);
        resetForm();
        toast.success("Invoice added successfully");
      } else {
        toast.error(response?.message || "Failed to add invoice");
      }
    },
    onError: (error) => {
      console.error("Failed to add invoice:", error);
      toast.error("Failed to add invoice");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteInvoice(id),
    onSuccess: (response) => {
      if (response?.Apistatus != false) {
        queryClient.invalidateQueries(["thirdPartyInvoiceList", slug]);
        toast.success("Invoice deleted successfully");
      } else {
        toast.error(response?.message || "Failed to delete invoice");
      }
    },
    onError: (error) => {
      console.error("Failed to delete invoice:", error);
      toast.error("Failed to delete invoice");
    },
  });

  const unlinkMutation = useMutation({
    mutationFn: (paidId) => unlinkInvoice(paidId),
    onSuccess: (response) => {
      if (response?.Apistatus != false) {
        queryClient.invalidateQueries(["thirdPartyInvoiceList", slug]);
        toast.success("Invoice unlinked successfully");
        setUnlinkConfirmItem(null);
      } else {
        toast.error(response?.message || "Failed to unlink invoice");
      }
    },
    onError: (error) => {
      console.error("Failed to unlink invoice:", error);
      toast.error("Failed to unlink invoice");
    },
  });

  const payMutation = useMutation({
    mutationFn: (payload) => payBill(payload),
    onSuccess: (response) => {
      if (response?.Apistatus != false) {
        queryClient.invalidateQueries(["thirdPartyInvoiceList", slug]);
        toast.success(response?.message || "Payment successful");
        closePayDialog();
      } else {
        toast.error(response?.message || "Failed to process payment");
        closePayDialog();
      }
    },
    onError: (error) => {
      console.error("Failed to process payment:", error);
      toast.error(error?.response?.data?.message || "Failed to process payment");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ payload, id }) => updateInvoice(payload, id),
    onSuccess: (response) => {
      if (response?.Apistatus != false) {
        queryClient.invalidateQueries(["thirdPartyInvoiceList", slug]);
        setEditDialogOpen(false);
        setEditingInvoice(null);
        setEditUploadedFiles([]);
        setEditAttachmentIds([]);
        toast.success("Invoice updated successfully");
      } else {
        toast.error(response?.message || "Failed to update invoice");
      }
    },
    onError: (error) => {
      console.error("Failed to update invoice:", error);
      toast.error("Failed to update invoice");
    },
  });

  const handleDeleteInvoice = (id) => {
    setDeleteConfirmId(id);
  };

  const confirmDelete = () => {
    if (deleteConfirmId) {
      deleteMutation.mutate(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  const confirmUnlink = () => {
    if (unlinkConfirmItem?.paid_id) {
      unlinkMutation.mutate(unlinkConfirmItem.paid_id);
    }
  };

  const handlePayInvoice = async (item) => {
    setPayingInvoice(item);
    setPayBillsLoading(true);
    setPayDialogOpen(true);
    
    try {
      const response = await fetchPayBillsList(item.id);
      const billsData = response?.data || response || [];
      setPayBillsData(Array.isArray(billsData) ? billsData : [billsData]);
      setInitialAmount(item.amount || 0);
      
      const initialApplied = {};
      if (Array.isArray(billsData)) {
        billsData.forEach((bill) => {
          initialApplied[bill.id] = bill.applied_amount || "0.00";
        });
      }
      setAppliedAmounts(initialApplied);
    } catch (error) {
      console.error("Failed to fetch pay bills list:", error);
      toast.error("Failed to load payment details");
      setPayBillsData([]);
    } finally {
      setPayBillsLoading(false);
    }
  };

  const closePayDialog = () => {
    setPayDialogOpen(false);
    setPayingInvoice(null);
    setPayBillsData([]);
    setAppliedAmounts({});
    setPayForm({
      pay_date: "",
      pay_type: "Withdrawal",
      amount: "",
      pay_method: "",
      pay_to: "",
      memo_1st: "",
      memo_2nd: "",
      to_be_printed: false,
    });
  };

  const calculateRemaining = () => {
    const totalAmount = parseFloat(initialAmount) || 0;
    const totalApplied = Object.values(appliedAmounts).reduce(
      (sum, val) => sum + (parseFloat(val) || 0),
      0
    );
    return (totalAmount - totalApplied).toFixed(2);
  };

  const handlePaySubmit = () => {
    if (!payingInvoice) return;
    
    const totalApplied = Object.values(appliedAmounts).reduce(
      (sum, val) => sum + (parseFloat(val) || 0),
      0
    );
    
    const payload = {
      pay_date: payForm.pay_date,
      pay_type: payForm.pay_type,
      amount: parseFloat(payForm.amount) || 0,
      remaining_amount: parseFloat(calculateRemaining()) || 0,
      pay_method: payForm.pay_method,
      pay_to: payForm.pay_to,
      applied_credit: totalApplied,
      to_be_printed: payForm.to_be_printed,
      memo_1st: payForm.memo_1st,
      memo_2nd: payForm.memo_2nd,
      third_party_invoice_id: payingInvoice.id,
    };
    
    payMutation.mutate(payload);
  };

  const handleEditInvoice = async (item) => {
    try {
      const response = await showThirdPartyInvoice(item.id);
      const invoiceData = response?.data || response;
      
      // Set edit form data
      setEditingInvoice({
        id: item.id,
        bill_date: invoiceData.bill_date ? invoiceData.bill_date.split("T")[0] : "",
        due_date: invoiceData.due_date ? invoiceData.due_date.split("T")[0] : "",
        amount: invoiceData.amount || "",
        pay_to: invoiceData.pay_to || "",
        reference: invoiceData.reference || "",
        memo_1st: invoiceData.memo_1st || "",
        memo_2nd: invoiceData.memo_2nd || "",
        category: invoiceData.category || "",
        hold_bill_payment: invoiceData.hold_bill_payment || false,
        type_id: invoiceData.type_id ? String(invoiceData.type_id) : "",
        original_amount: invoiceData.original_amount || "",
        date_of_service: invoiceData.date_of_service ? invoiceData.date_of_service.split("T")[0] : "",
        mark_as_paid_by_other: invoiceData.mark_as_paid_by_other || false,
        paid_by: invoiceData.paid_by || "",
      });

      // Set existing attachments
      if (Array.isArray(invoiceData.attachments)) {
        const existingFiles = invoiceData.attachments.map((att) => ({
          tempId: `existing_${att.id}`,
          id: att.id,
          name: att.extension 
            ? `${att.original_name}.${att.extension}` 
            : (att.original_name || att.name || "File"),
          size: att.size || 0,
          type: att.mime_type || "",
          url: att.path,
          path: att.path,
          uploaded: true,
          uploading: false,
        }));
        setEditUploadedFiles(existingFiles);
        setEditAttachmentIds(invoiceData.attachments.map((att) => att.id));
      } else {
        setEditUploadedFiles([]);
        setEditAttachmentIds([]);
      }

      setEditDialogOpen(true);
    } catch (error) {
      console.error("Failed to fetch invoice details:", error);
      toast.error("Failed to load invoice details");
    }
  };

  const handleEditSubmit = () => {
    const payload = {
      bill_date: editingInvoice.bill_date,
      due_date: editingInvoice.due_date,
      amount: parseFloat(editingInvoice.amount) || 0,
      pay_to: editingInvoice.pay_to,
      reference: editingInvoice.reference,
      memo_1st: editingInvoice.memo_1st,
      memo_2nd: editingInvoice.memo_2nd,
      category: editingInvoice.category,
      hold_bill_payment: editingInvoice.hold_bill_payment,
      type_id: editingInvoice.type_id ? parseInt(editingInvoice.type_id) : null,
      original_amount: parseFloat(editingInvoice.original_amount) || parseFloat(editingInvoice.amount) || 0,
      date_of_service: editingInvoice.date_of_service,
      mark_as_paid_by_other: editingInvoice.mark_as_paid_by_other,
      paid_by: editingInvoice.paid_by || null,
      attachment_ids: editAttachmentIds,
    };
    updateMutation.mutate({ payload, id: editingInvoice.id });
  };

  // Edit file handlers
  const editUploadMutation = useMutation({
    mutationFn: uploadAttachment,
    onSuccess: (response, variables) => {
      const attachmentId = response?.response?.attachment?.id;
      const fileName = response?.response?.attachment?.original_name || "Uploaded File";
      const fileExtension = response?.response?.attachment?.extension;
      const fullFileName = fileExtension ? `${fileName}.${fileExtension}` : fileName;

      if (attachmentId) {
        setEditUploadedFiles((prev) =>
          prev.map((file) =>
            file.tempId === variables.tempId
              ? { ...file, id: attachmentId, name: fullFileName, uploaded: true, uploading: false }
              : file
          )
        );
        setEditAttachmentIds((prev) => [...prev, attachmentId]);
        toast.success(`File uploaded: ${fullFileName}`);
      } else {
        setEditUploadedFiles((prev) =>
          prev.map((file) =>
            file.tempId === variables.tempId
              ? { ...file, uploading: false, uploadFailed: true }
              : file
          )
        );
      }
    },
    onError: (error, variables) => {
      setEditUploadedFiles((prev) =>
        prev.map((file) =>
          file.tempId === variables.tempId
            ? { ...file, uploading: false, uploadFailed: true }
            : file
        )
      );
      toast.error("Failed to upload file");
    },
  });

  const editDeleteAttachmentMutation = useMutation({
    mutationFn: deleteAttachment,
    onMutate: async (attachmentId) => {
      setEditUploadedFiles((prev) =>
        prev.map((file) => (file.id === attachmentId ? { ...file, deleting: true } : file))
      );
    },
    onSuccess: (response, attachmentId) => {
      setEditUploadedFiles((prev) => prev.filter((file) => file.id !== attachmentId));
      setEditAttachmentIds((prev) => prev.filter((id) => id !== attachmentId));
      toast.success("Attachment deleted successfully");
    },
    onError: (error, attachmentId) => {
      setEditUploadedFiles((prev) =>
        prev.map((file) => (file.id === attachmentId ? { ...file, deleting: false } : file))
      );
      toast.error("Failed to delete attachment");
    },
  });

  const handleEditFilesChange = (newFiles) => {
    setEditUploadedFiles(newFiles);
  };

  const handleEditFileUpload = (fileData) => {
    editUploadMutation.mutate({
      file: fileData.fileObject,
      tempId: fileData.tempId,
    });
  };

  const handleEditFileDelete = (attachmentId) => {
    editDeleteAttachmentMutation.mutate(attachmentId);
  };

  const handleSubmit = () => {
    const payload = {
      bill_date: form.bill_date,
      due_date: form.due_date,
      amount: parseFloat(form.amount) || 0,
      pay_to: form.pay_to,
      reference: form.reference,
      memo_1st: form.memo_1st,
      memo_2nd: form.memo_2nd,
      category: form.category,
      hold_bill_payment: form.hold_bill_payment,
      type_id: form.type_id ? parseInt(form.type_id) : null,
      original_amount:
        parseFloat(form.original_amount) || parseFloat(form.amount) || 0,
      date_of_service: form.date_of_service,
      mark_as_paid_by_other: form.mark_as_paid_by_other,
      paid_by: form.paid_by || null,
      attachment_ids: attachmentIds,
    };
    addMutation.mutate(payload);
  };

  const { data, isLoading } = useQuery({
    queryKey: ["thirdPartyInvoiceList", slug, currentPage],
    queryFn: () => fetchList(slug, currentPage, 25),
    enabled: !!slug,
  });
  

  const invoices = data?.data?.data || [];
  const unpaid = data?.data?.unpaid || "0.00";
  const unbilled = data?.data?.unbilled || "0.00";
  const clientFundsOperating = data?.data?.client_funds_operating || "0.00";
  const clientFundsTrust = data?.data?.client_funds_trust || "0.00";

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
      <Badge className={statusColors[status] || "bg-gray-100 text-foreground"}>
        {status?.charAt(0).toUpperCase() + status?.slice(1) || "Unknown"}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar2 />
      <header className="bg-card border-b px-6 py-3">
        <div className="flex items-center justify-end gap-6 text-sm text-foreground">
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

      <nav className="bg-card border-b px-6 py-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/dashboard")}
            className="hover:text-foreground transition"
            type="button"
          >
            Dashboard
          </button>
          <ChevronRight className="w-4 h-4" />
          <button
            onClick={() => navigate("/dashboard/workstation")}
            className="hover:text-foreground transition"
            type="button"
          >
            Workstation
          </button>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground font-medium">Third Party Invoice</span>
        </div>
      </nav>

      <div className="mb-6 px-6 pt-6">
        <Button
          className="bg-primary hover:bg-primary/90 gap-2"
          onClick={() => setDialogOpen(true)}
        >
          <Plus className="size-4" />
          Add New Invoice
        </Button>
      </div>

      {/* Table */}
      <div className="bg-card rounded-lg border border-border overflow-hidden mx-6 mb-6">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted">
              <TableHead>#</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Matter</TableHead>
              <TableHead>Bill Date</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Payee</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Balance</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Memo</TableHead>
              <TableHead>Locked</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={11}
                  className="text-center py-8 text-muted-foreground"
                >
                  Loading...
                </TableCell>
              </TableRow>
            ) : invoices.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={11}
                  className="text-center py-8 text-muted-foreground"
                >
                  No data available
                </TableCell>
              </TableRow>
            ) : (
              invoices.map((item) => (
                <TableRow key={item.id} className="hover:bg-muted">
                  <TableCell>{item.index}</TableCell>
                  <TableCell>{item.client || "-"}</TableCell>
                  <TableCell>{item.matter || "-"}</TableCell>
                  <TableCell>{formatDate(item.bill_date)}</TableCell>
                  <TableCell>{formatDate(item.due_date)}</TableCell>
                  <TableCell>{item.payee || "-"}</TableCell>
                  <TableCell>{formatCurrency(item.amount)}</TableCell>
                  <TableCell>{formatCurrency(item.balance)}</TableCell>
                  <TableCell>{getStatusBadge(item.status)}</TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {item.memo || "-"}
                  </TableCell>
                  <TableCell>
                    {item.isLocked ? (
                      <Lock className="h-4 w-4 text-gray-600" />
                    ) : (
                      <Unlock className="h-4 w-4 text-gray-600" />
                    )}
                  </TableCell>
                  <TableCell>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent align="end" className="w-48 p-1">
                        <div className="flex flex-col">
                          <button
                            className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent text-left"
                            onClick={() => handleEditInvoice(item)}
                          >
                            <Pencil className="h-4 w-4" />
                            Edit
                          </button>
                          {item.paid_id ? (
                            <button
                              className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent text-left text-orange-500"
                              onClick={() => setUnlinkConfirmItem(item)}
                              disabled={unlinkMutation.isPending}
                            >
                              <Unlink className="h-4 w-4" />
                              Unlink Payment
                            </button>
                          ) : (
                            <button
                              className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent text-left text-green-500"
                              onClick={() => handlePayInvoice(item)}
                            >
                              <DollarSign className="h-4 w-4" />
                              Pay Bill
                            </button>
                          )}
                          <button
                            className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent text-left text-destructive"
                            onClick={() => handleDeleteInvoice(item.id)}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </button>
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

      {/* Add Invoice Dialog */}
      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setDialogOpen(false);
            resetForm();
          }
        }}
      >
        <DialogContent className="w-[70vw] max-w-none max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">
              Add Third Party Invoice
            </DialogTitle>
            <DialogDescription>Add a new third party invoice</DialogDescription>
            <button
              onClick={() => {
                setDialogOpen(false);
                resetForm();
              }}
              className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100"
            >
              <X className="h-4 w-4" />
            </button>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* Row 1: Pay To, Amount, Original Amount */}
            <div className="grid grid-cols-3 gap-4">
              <FloatingInput
                label="Pay To"
                placeholder="Enter payee name"
                value={form.pay_to}
                onChange={(e) => setForm({ ...form, pay_to: e.target.value })}
              />
              <FloatingInput
                label="Amount"
                type="number"
                placeholder="Enter amount"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
              />
              <FloatingInput
                label="Original Amount"
                type="number"
                placeholder="Enter original amount"
                value={form.original_amount}
                onChange={(e) =>
                  setForm({ ...form, original_amount: e.target.value })
                }
              />
            </div>

            {/* Row 2: Bill Date, Due Date, Date of Service */}
            <div className="grid grid-cols-3 gap-4">
              <FloatingInput
                label="Bill Date"
                type="date"
                value={form.bill_date}
                onChange={(e) =>
                  setForm({ ...form, bill_date: e.target.value })
                }
              />
              <FloatingInput
                label="Due Date"
                type="date"
                value={form.due_date}
                onChange={(e) =>
                  setForm({ ...form, due_date: e.target.value })
                }
              />
              <FloatingInput
                label="Date of Service"
                type="date"
                value={form.date_of_service}
                onChange={(e) =>
                  setForm({ ...form, date_of_service: e.target.value })
                }
              />
            </div>

            {/* Row 3: Reference, Category, Type */}
            <div className="grid grid-cols-3 gap-4">
              <FloatingInput
                label="Reference"
                placeholder="Enter reference"
                value={form.reference}
                onChange={(e) =>
                  setForm({ ...form, reference: e.target.value })
                }
              />
              <FloatingInput
                label="Category"
                placeholder="Enter category"
                value={form.category}
                onChange={(e) =>
                  setForm({ ...form, category: e.target.value })
                }
              />
              <FloatingWrapper
                label="Type ID"
                hasValue={!!form.type_id}
                isFocused={false}
              >
                <Select
                  value={String(form.type_id || "")}
                  onValueChange={(value) =>
                    setForm({ ...form, type_id: value })
                  }
                >
                  <SelectTrigger className="w-full h-[52px] bg-transparent border border-input">
                    <SelectValue placeholder="" />
                  </SelectTrigger>
                  <SelectContent>
                    {methodType.map((item) => (
                      <SelectItem key={item.id} value={String(item.id)}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FloatingWrapper>
            </div>

            {/* Row 4: Paid By */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Paid By</Label>
                <Input
                  placeholder="Enter paid by (optional)"
                  value={form.paid_by}
                  onChange={(e) =>
                    setForm({ ...form, paid_by: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Row 5: Checkboxes */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hold_bill_payment"
                  checked={form.hold_bill_payment}
                  onCheckedChange={(checked) =>
                    setForm({ ...form, hold_bill_payment: checked })
                  }
                />
                <Label htmlFor="hold_bill_payment" className="cursor-pointer">
                  Hold Bill Payment
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="mark_as_paid_by_other"
                  checked={form.mark_as_paid_by_other}
                  onCheckedChange={(checked) =>
                    setForm({ ...form, mark_as_paid_by_other: checked })
                  }
                />
                <Label
                  htmlFor="mark_as_paid_by_other"
                  className="cursor-pointer"
                >
                  Mark as Paid by Other
                </Label>
              </div>
            </div>

            {/* Row 6: Memos */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Memo 1</Label>
                <Textarea
                  className="min-h-[80px]"
                  placeholder="Enter memo"
                  value={form.memo_1st}
                  onChange={(e) =>
                    setForm({ ...form, memo_1st: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Memo 2</Label>
                <Textarea
                  className="min-h-[80px]"
                  placeholder="Enter additional memo"
                  value={form.memo_2nd}
                  onChange={(e) =>
                    setForm({ ...form, memo_2nd: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Row 7: Attachments */}
            <AttachmentUploader
              files={uploadedFiles}
              onFilesChange={handleFilesChange}
              onUpload={handleFileUpload}
              onDelete={handleFileDelete}
            />
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => {
                setDialogOpen(false);
                resetForm();
              }}
            >
              Close
            </Button>
            <Button onClick={handleSubmit} disabled={addMutation.isPending}>
              {addMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Invoice Dialog */}
      <Dialog
        open={editDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setEditDialogOpen(false);
            setEditingInvoice(null);
            setEditUploadedFiles([]);
            setEditAttachmentIds([]);
          }
        }}
      >
        <DialogContent className="w-[70vw] max-w-none max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Edit Third Party Invoice</DialogTitle>
            <DialogDescription>Update the invoice details</DialogDescription>
            <button
              onClick={() => {
                setEditDialogOpen(false);
                setEditingInvoice(null);
                setEditUploadedFiles([]);
                setEditAttachmentIds([]);
              }}
              className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100"
            >
              <X className="h-4 w-4" />
            </button>
          </DialogHeader>
          {editingInvoice && (
            <div className="space-y-6 py-4">
              {/* Row 1: Pay To, Amount, Original Amount */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Pay To</Label>
                  <Input
                    placeholder="Enter payee name"
                    value={editingInvoice.pay_to}
                    onChange={(e) => setEditingInvoice({ ...editingInvoice, pay_to: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Amount</Label>
                  <Input
                    type="number"
                    placeholder="Enter amount"
                    value={editingInvoice.amount}
                    onChange={(e) => setEditingInvoice({ ...editingInvoice, amount: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Original Amount</Label>
                  <Input
                    type="number"
                    placeholder="Enter original amount"
                    value={editingInvoice.original_amount}
                    onChange={(e) => setEditingInvoice({ ...editingInvoice, original_amount: e.target.value })}
                  />
                </div>
              </div>

              {/* Row 2: Bill Date, Due Date, Date of Service */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Bill Date</Label>
                  <Input
                    type="date"
                    value={editingInvoice.bill_date}
                    onChange={(e) => setEditingInvoice({ ...editingInvoice, bill_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Due Date</Label>
                  <Input
                    type="date"
                    value={editingInvoice.due_date}
                    onChange={(e) => setEditingInvoice({ ...editingInvoice, due_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Date of Service</Label>
                  <Input
                    type="date"
                    value={editingInvoice.date_of_service}
                    onChange={(e) => setEditingInvoice({ ...editingInvoice, date_of_service: e.target.value })}
                  />
                </div>
              </div>

              {/* Row 3: Reference, Category, Type */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Reference</Label>
                  <Input
                    placeholder="Enter reference"
                    value={editingInvoice.reference}
                    onChange={(e) => setEditingInvoice({ ...editingInvoice, reference: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Input
                    placeholder="Enter category"
                    value={editingInvoice.category}
                    onChange={(e) => setEditingInvoice({ ...editingInvoice, category: e.target.value })}
                  />
                </div>
              <FloatingWrapper
                label="Type ID"
                hasValue={!!editingInvoice.type_id}
                isFocused={false}
              >
                <Select
                  value={String(editingInvoice.type_id || "")}
                  onValueChange={(value) =>
                    setEditingInvoice({ ...editingInvoice, type_id: value })
                  }
                >
                  <SelectTrigger className="w-full h-[52px] bg-transparent border border-input">
                    <SelectValue placeholder="" />
                  </SelectTrigger>
                  <SelectContent>
                    {methodType.map((item) => (
                      <SelectItem key={item.id} value={String(item.id)}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FloatingWrapper>
              </div>

              {/* Row 4: Paid By */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Paid By</Label>
                  <Input
                    placeholder="Enter paid by (optional)"
                    value={editingInvoice.paid_by}
                    onChange={(e) => setEditingInvoice({ ...editingInvoice, paid_by: e.target.value })}
                  />
                </div>
              </div>

              {/* Row 5: Checkboxes */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="edit_hold_bill_payment"
                    checked={editingInvoice.hold_bill_payment}
                    onCheckedChange={(checked) => setEditingInvoice({ ...editingInvoice, hold_bill_payment: checked })}
                  />
                  <Label htmlFor="edit_hold_bill_payment" className="cursor-pointer">
                    Hold Bill Payment
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="edit_mark_as_paid_by_other"
                    checked={editingInvoice.mark_as_paid_by_other}
                    onCheckedChange={(checked) => setEditingInvoice({ ...editingInvoice, mark_as_paid_by_other: checked })}
                  />
                  <Label htmlFor="edit_mark_as_paid_by_other" className="cursor-pointer">
                    Mark as Paid by Other
                  </Label>
                </div>
              </div>

              {/* Row 6: Memos */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Memo 1</Label>
                  <Textarea
                    className="min-h-[80px]"
                    placeholder="Enter memo"
                    value={editingInvoice.memo_1st}
                    onChange={(e) => setEditingInvoice({ ...editingInvoice, memo_1st: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Memo 2</Label>
                  <Textarea
                    className="min-h-[80px]"
                    placeholder="Enter additional memo"
                    value={editingInvoice.memo_2nd}
                    onChange={(e) => setEditingInvoice({ ...editingInvoice, memo_2nd: e.target.value })}
                  />
                </div>
              </div>

              {/* Row 7: Attachments */}
              <AttachmentUploader
                files={editUploadedFiles}
                onFilesChange={handleEditFilesChange}
                onUpload={handleEditFileUpload}
                onDelete={handleEditFileDelete}
              />
            </div>
          )}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => {
                setEditDialogOpen(false);
                setEditingInvoice(null);
                setEditUploadedFiles([]);
                setEditAttachmentIds([]);
              }}
            >
              Close
            </Button>
            <Button onClick={handleEditSubmit} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Updating..." : "Update"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmId !== null} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Invoice</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this invoice? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={unlinkConfirmItem !== null} onOpenChange={(open) => !open && setUnlinkConfirmItem(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Unlink Payment</DialogTitle>
            <DialogDescription>
              Are you sure you want to unlink this payment from the invoice? This will remove the payment association.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setUnlinkConfirmItem(null)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmUnlink}
              disabled={unlinkMutation.isPending}
            >
              {unlinkMutation.isPending ? "Unlinking..." : "Unlink"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Pay Bills Dialog */}
      <Dialog open={payDialogOpen} onOpenChange={(open) => !open && closePayDialog()}>
        <DialogContent className="w-[80vw] max-w-none max-h-[90vh] overflow-y-auto">
          <DialogHeader className="flex flex-row items-center justify-between">
            <DialogTitle className="text-xl">Pay Bills</DialogTitle>
            <Button
              onClick={handlePaySubmit}
              disabled={payMutation.isPending}
              className="bg-primary hover:bg-primary/90"
            >
              {payMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Form Fields */}
            <div className="grid grid-cols-2 gap-x-12 gap-y-4">
              {/* Left Column */}
              <div className="space-y-4">
                <div className="grid grid-cols-[100px_1fr] items-center gap-2">
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={payForm.pay_date}
                    onChange={(e) => setPayForm({ ...payForm, pay_date: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-[100px_1fr] items-center gap-2">
                  <Label>Type</Label>
                  <Input
                    disabled
                    type="text"
                    value={payForm.pay_type}
                    onChange={(e) => setPayForm({ ...payForm, pay_type: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-[100px_1fr] items-center gap-2">
                  <Label>Method</Label>
                  <Select
                    value={payForm.pay_method}
                    onValueChange={(value) => setPayForm({ ...payForm, pay_method: value })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                    {categoryType.map((item) => (
                        <SelectItem key={item.id} value={String(item.id)}>
                          {item.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-[100px_1fr] items-center gap-2">
                  <Label>Pay To</Label>
                  <Input
                    placeholder="Enter payee"
                    value={payForm.pay_to}
                    onChange={(e) => setPayForm({ ...payForm, pay_to: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-[100px_1fr] items-center gap-2">
                  <Label>Memo 1</Label>
                  <Input
                    placeholder="Enter memo"
                    value={payForm.memo_1st}
                    onChange={(e) => setPayForm({ ...payForm, memo_1st: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-[100px_1fr] items-center gap-2">
                  <Label>Memo 2</Label>
                  <Input
                    placeholder="Enter memo"
                    value={payForm.memo_2nd}
                    onChange={(e) => setPayForm({ ...payForm, memo_2nd: e.target.value })}
                  />
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div className="grid grid-cols-[100px_1fr] items-center gap-2">
                  <Label>Amount</Label>
                  <Input
                    disabled
                    type="number"
                    placeholder="Enter amount"
                    value={payForm.amount | initialAmount}
                    onChange={(e) => setPayForm({ ...payForm, amount: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-[100px_1fr] items-center gap-2">
                    <Button variant="outline" size="sm">To print</Button>
                    <div className="flex items-center gap-1">
                      <Checkbox
                        id="to_be_printed"
                        checked={payForm.to_be_printed}
                        onCheckedChange={(checked) => setPayForm({ ...payForm, to_be_printed: checked })}
                      />
                      <Label htmlFor="to_be_printed" className="text-sm cursor-pointer">To be printed</Label>
                    </div>
                </div>
              </div>
            </div>

            {/* Remaining Amount */}
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Remaining</span>
              <span className="text-lg font-semibold text-primary">{calculateRemaining()}</span>
            </div>

            {/* Bills Table */}
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted">
                    <TableHead className="w-10">
                      <Checkbox />
                    </TableHead>
                    <TableHead>ID#</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Remaining Amount</TableHead>
                    <TableHead>Applied Amount</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payBillsLoading ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                      </TableCell>
                    </TableRow>
                  ) : payBillsData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                        No bills found
                      </TableCell>
                    </TableRow>
                  ) : (
                    payBillsData.map((bill, index) => (
                      <TableRow key={bill.id}>
                        <TableCell>
                          <Checkbox />
                        </TableCell>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{bill.applicant_name}</TableCell>
                        <TableCell>{formatCurrency(bill.amount)}</TableCell>
                        <TableCell>{formatCurrency(bill.remaining_amount || bill.balance)}</TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            className="w-28"
                            value={appliedAmounts[bill.id] || ""}
                            onChange={(e) => {
                              const enteredValue = parseFloat(e.target.value) || 0;
                              const maxAmount = parseFloat(bill.amount || 0) ;
                              
                              if (enteredValue > maxAmount) {
                                toast.error(`Applied amount cannot exceed remaining amount of ${formatCurrency(maxAmount)}`);
                                setAppliedAmounts({
                                  ...appliedAmounts,
                                  [bill.id]: maxAmount.toString(),
                                });
                              } else {
                                setAppliedAmounts({
                                  ...appliedAmounts,
                                  [bill.id]: e.target.value,
                                });
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" className="h-8 w-8 bg-primary text-white hover:bg-primary/90">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ThirdPartyInvoice;
