import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { fetchList } from "./helper/fetchList";
import { fetchMeta } from "./helper/fetchMeta";
import { addDeposit } from "./helper/addDeposit";
import { deleteDeposit } from "./helper/deleteDeposit";
import { updateDeposit } from "./helper/updateDeposit";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, ChevronDown, X, Trash2, Pencil, ChevronRight  } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Navbar2 } from "@/components/navbar2";
import { useNavigate } from "react-router-dom";

const BankTransaction = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [editingDeposit, setEditingDeposit] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // Form State
  const [form, setForm] = useState({
    banktype_id: "",
    method_id: "",
    type_id: "",
    pay_or: "",
    amount: "",
    refffrence: "",
    date: "",
    address_1st: "",
    address_2nd: "",
    city: "",
    state_province: "",
    zip_postal_code: "",
    country: "",
    memo_1st: "",
    memo_2nd: "",
  });

  const resetForm = () => {
    setForm({
      banktype_id: "",
      method_id: "",
      type_id: "",
      pay_or: "",
      amount: "",
      refffrence: "",
      date: "",
      address_1st: "",
      address_2nd: "",
      city: "",
      state_province: "",
      zip_postal_code: "",
      country: "",
      memo_1st: "",
      memo_2nd: "",
    });
  };

  const addMutation = useMutation({
    mutationFn: (payload) => addDeposit(payload, slug),
    onSuccess: () => {
      queryClient.invalidateQueries(["depositList", slug]);
      setDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      console.error("Failed to add deposit:", error);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteDeposit(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["depositList", slug]);
    },
    onError: (error) => {
      console.error("Failed to delete deposit:", error);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ payload, id }) => updateDeposit(payload, id),
    onSuccess: () => {
      queryClient.invalidateQueries(["depositList", slug]);
      setEditDialogOpen(false);
      setEditingDeposit(null);
    },
    onError: (error) => {
      console.error("Failed to update deposit:", error);
    },
  });

  const handleEditDeposit = (item) => {
    setEditingDeposit(item);
    setEditDialogOpen(true);
  };

  const handleDeleteDeposit = (id) => {
    setDeleteConfirmId(id);
  };

  const confirmDelete = () => {
    if (deleteConfirmId) {
      deleteMutation.mutate(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  const handleSubmit = () => {
    const payload = {
      banktype_id: parseInt(form.banktype_id) || null,
      method_id: parseInt(form.method_id) || null,
      type_id: parseInt(form.type_id) || null,
      pay_or: form.pay_or,
      amount: parseFloat(form.amount) || 0,
      refffrence: form.refffrence,
      date: form.date,
      address_1st: form.address_1st,
      address_2nd: form.address_2nd,
      city: form.city,
      state_province: form.state_province,
      zip_postal_code: form.zip_postal_code,
      country: form.country,
      memo_1st: form.memo_1st,
      memo_2nd: form.memo_2nd,
    };
    addMutation.mutate(payload);
  };

  const handleEditSubmit = () => {
    const payload = {
      banktype_id: parseInt(editingDeposit.banktype_id) || null,
      method_id: parseInt(editingDeposit.method_id) || null,
      type_id: parseInt(editingDeposit.type_id) || null,
      pay_or: editingDeposit.pay_or,
      amount: parseFloat(editingDeposit.amount) || 0,
      refffrence: editingDeposit.refffrence,
      date: editingDeposit.date,
      address_1st: editingDeposit.address_1st,
      address_2nd: editingDeposit.address_2nd,
      city: editingDeposit.city,
      state_province: editingDeposit.state_province,
      zip_postal_code: editingDeposit.zip_postal_code,
      country: editingDeposit.country,
      memo_1st: editingDeposit.memo_1st,
      memo_2nd: editingDeposit.memo_2nd,
    };
    updateMutation.mutate({ payload, id: editingDeposit.id });
  };

  const { data, isLoading } = useQuery({
    queryKey: ["depositList", slug, currentPage],
    queryFn: () => fetchList(slug, currentPage, 25),
    enabled: !!slug,
  });

  const { data: metaData } = useQuery({
    queryKey: ["accountingMeta", slug],
    queryFn: () => fetchMeta(slug),
    enabled: !!slug,
  });

  const bankTypes = metaData?.accounting_banking_bank_type || [];
  const accountingMethods = metaData?.accounting_banking_method || [];
  const depositTypes = metaData?.accounting_banking_type || [];

  const deposits = data?.data || [];
  const unpaid = data?.unpaid || "0.00";
  const unbilled = data?.unbilled || "0.00";
  const clientFundsOperating = data?.client_funds_operating || "0.00";
  const clientFundsTrust = data?.client_funds_trust || "0.00";

  const formatCurrency = (amount) => {
    return `$ ${parseFloat(amount || 0).toFixed(2)}`;
  };


const formatDate = (dateString) => {
  if (!dateString) return "-";
  return dateString.split("T")[0];
};

  return (
    <div className="min-h-screen bg-background">
      <Navbar2 />
      <header className="bg-white border-b px-6 py-3">
        <div className="flex items-center justify-end gap-6 text-sm text-gray-700">
          <div>
            Unpaid: <span className="font-semibold">{formatCurrency(unpaid)}</span>
          </div>
          <div>
            Unbilled: <span className="font-semibold">{formatCurrency(unbilled)}</span>
          </div>
          <div>
            Client Funds-Operating: <span className="font-semibold">{formatCurrency(clientFundsOperating)}</span>
          </div>
          <div>
            Client Funds-Trust: <span className="font-semibold">{formatCurrency(clientFundsTrust)}</span>
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
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
          <span className="text-gray-900 font-medium">Bank Transcation</span>
        </div>
      </nav>

      {/* Add New Button */}
      <div className="mb-6 px-6">
        <Button 
          className="bg-primary hover:bg-primary/90 gap-2"
          onClick={() => setDialogOpen(true)}
        >
          <Plus className="size-4" />
          Add New Transaction
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-border overflow-hidden mx-6 mb-6">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead>Date</TableHead>
              <TableHead>Bank Type</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Pay/Depoist</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                  Loading...
                </TableCell>
              </TableRow>
            ) : deposits.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                  No data available
                </TableCell>
              </TableRow>
            ) : (
              deposits.map((item) => (
                <TableRow key={item.id} className="hover:bg-gray-50">
                  <TableCell>{formatDate(item.Date)}</TableCell>
                  <TableCell>{item["Bank Type"]}</TableCell>
                  <TableCell>{item.Method}</TableCell>
                  <TableCell>{item.Type}</TableCell>
                  <TableCell>{item.Payor || "-"}</TableCell>
                  <TableCell>{parseFloat(item.Amount || 0).toFixed(2)}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => handleEditDeposit(item)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleDeleteDeposit(item.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add Transaction Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => !open && setDialogOpen(false)}>
        <DialogContent className="w-[70vw] max-w-none max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Add Bank Transaction</DialogTitle>
            <DialogDescription>Add a new bank transaction</DialogDescription>
            <button
              onClick={() => setDialogOpen(false)}
              className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100"
            >
              <X className="h-4 w-4" />
            </button>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({...form, date: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Bank Type</Label>
                <Select
                  value={form.banktype_id}
                  onValueChange={(value) => setForm({...form, banktype_id: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {bankTypes.map((item) => (
                      <SelectItem key={item.id} value={String(item.id)}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Method</Label>
                <Select
                  value={form.method_id}
                  onValueChange={(value) => setForm({...form, method_id: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {accountingMethods.map((item) => (
                      <SelectItem key={item.id} value={String(item.id)}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={form.type_id}
                  onValueChange={(value) => setForm({...form, type_id: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {depositTypes.map((item) => (
                      <SelectItem key={item.id} value={String(item.id)}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Pay/Or</Label>
                <Input 
                  placeholder="" 
                  value={form.pay_or}
                  onChange={(e) => setForm({...form, pay_or: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Amount</Label>
                <Input 
                  type="number" 
                  placeholder="" 
                  value={form.amount}
                  onChange={(e) => setForm({...form, amount: e.target.value})}
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label>Reference</Label>
                <Input 
                  placeholder="" 
                  value={form.refffrence}
                  onChange={(e) => setForm({...form, refffrence: e.target.value})}
                />
              </div>
            </div>

            {/* Address Section */}
            <div className="space-y-4">
              <h3 className="text-md font-medium">Address</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Address Line 1</Label>
                  <Input 
                    placeholder="" 
                    value={form.address_1st}
                    onChange={(e) => setForm({...form, address_1st: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Address Line 2</Label>
                  <Input 
                    placeholder="" 
                    value={form.address_2nd}
                    onChange={(e) => setForm({...form, address_2nd: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>City</Label>
                  <Input 
                    placeholder="" 
                    value={form.city}
                    onChange={(e) => setForm({...form, city: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>State/Province</Label>
                  <Input 
                    placeholder="" 
                    value={form.state_province}
                    onChange={(e) => setForm({...form, state_province: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Zip/Postal Code</Label>
                  <Input 
                    placeholder="" 
                    value={form.zip_postal_code}
                    onChange={(e) => setForm({...form, zip_postal_code: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Country</Label>
                  <Input 
                    placeholder="" 
                    value={form.country}
                    onChange={(e) => setForm({...form, country: e.target.value})}
                  />
                </div>
              </div>
            </div>

            {/* Memos */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Memo 1</Label>
                <Textarea 
                  className="min-h-[80px]" 
                  placeholder="" 
                  value={form.memo_1st}
                  onChange={(e) => setForm({...form, memo_1st: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Memo 2</Label>
                <Textarea 
                  className="min-h-[80px]" 
                  placeholder="" 
                  value={form.memo_2nd}
                  onChange={(e) => setForm({...form, memo_2nd: e.target.value})}
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Close
            </Button>
            <Button onClick={handleSubmit} disabled={addMutation.isPending}>
              {addMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Transaction Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={(open) => { if (!open) { setEditDialogOpen(false); setEditingDeposit(null); } }}>
        <DialogContent className="w-[70vw] max-w-none max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Edit Bank Transaction</DialogTitle>
            <DialogDescription>Edit the bank transaction</DialogDescription>
            <button
              onClick={() => { setEditDialogOpen(false); setEditingDeposit(null); }}
              className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100"
            >
              <X className="h-4 w-4" />
            </button>
          </DialogHeader>
          {editingDeposit && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={editingDeposit.date || ""}
                    onChange={(e) => setEditingDeposit({...editingDeposit, date: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Bank Type</Label>
                  <Select
                    value={String(editingDeposit.banktype_id || "")}
                    onValueChange={(value) => setEditingDeposit({...editingDeposit, banktype_id: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {bankTypes.map((item) => (
                        <SelectItem key={item.id} value={String(item.id)}>
                          {item.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Method</Label>
                  <Select
                    value={String(editingDeposit.method_id || "")}
                    onValueChange={(value) => setEditingDeposit({...editingDeposit, method_id: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {accountingMethods.map((item) => (
                        <SelectItem key={item.id} value={String(item.id)}>
                          {item.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select
                    value={String(editingDeposit.type_id || "")}
                    onValueChange={(value) => setEditingDeposit({...editingDeposit, type_id: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {depositTypes.map((item) => (
                        <SelectItem key={item.id} value={String(item.id)}>
                          {item.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Pay/Or</Label>
                  <Input 
                    placeholder="" 
                    value={editingDeposit.pay_or || ""}
                    onChange={(e) => setEditingDeposit({...editingDeposit, pay_or: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Amount</Label>
                  <Input 
                    type="number" 
                    placeholder="" 
                    value={editingDeposit.amount || ""}
                    onChange={(e) => setEditingDeposit({...editingDeposit, amount: e.target.value})}
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Reference</Label>
                  <Input 
                    placeholder="" 
                    value={editingDeposit.refffrence || ""}
                    onChange={(e) => setEditingDeposit({...editingDeposit, refffrence: e.target.value})}
                  />
                </div>
              </div>

              {/* Address Section */}
              <div className="space-y-4">
                <h3 className="text-md font-medium">Address</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Address Line 1</Label>
                    <Input 
                      placeholder="" 
                      value={editingDeposit.address_1st || ""}
                      onChange={(e) => setEditingDeposit({...editingDeposit, address_1st: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Address Line 2</Label>
                    <Input 
                      placeholder="" 
                      value={editingDeposit.address_2nd || ""}
                      onChange={(e) => setEditingDeposit({...editingDeposit, address_2nd: e.target.value})}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>City</Label>
                    <Input 
                      placeholder="" 
                      value={editingDeposit.city || ""}
                      onChange={(e) => setEditingDeposit({...editingDeposit, city: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>State/Province</Label>
                    <Input 
                      placeholder="" 
                      value={editingDeposit.state_province || ""}
                      onChange={(e) => setEditingDeposit({...editingDeposit, state_province: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Zip/Postal Code</Label>
                    <Input 
                      placeholder="" 
                      value={editingDeposit.zip_postal_code || ""}
                      onChange={(e) => setEditingDeposit({...editingDeposit, zip_postal_code: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Country</Label>
                    <Input 
                      placeholder="" 
                      value={editingDeposit.country || ""}
                      onChange={(e) => setEditingDeposit({...editingDeposit, country: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              {/* Memos */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Memo 1</Label>
                  <Textarea 
                    className="min-h-[80px]" 
                    placeholder="" 
                    value={editingDeposit.memo_1st || ""}
                    onChange={(e) => setEditingDeposit({...editingDeposit, memo_1st: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Memo 2</Label>
                  <Textarea 
                    className="min-h-[80px]" 
                    placeholder="" 
                    value={editingDeposit.memo_2nd || ""}
                    onChange={(e) => setEditingDeposit({...editingDeposit, memo_2nd: e.target.value})}
                  />
                </div>
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => { setEditDialogOpen(false); setEditingDeposit(null); }}>
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
            <DialogTitle>Delete Transaction</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this transaction? This action cannot be undone.
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
    </div>
  );
};

export default BankTransaction;