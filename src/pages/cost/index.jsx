import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { fetchList } from "./helper/fetchList";
import { fetchMeta } from "./helper/fetchMeta";
import { addCost } from "./helper/addCost";
import { deleteCost } from "./helper/deleteCost";
import { updateCost } from "./helper/updateCost";
import { fetchSingleCost } from "./helper/fetchSingleCost";
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
import { Plus, ChevronDown, X, Trash2, Pencil, ChevronRight } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Navbar2 } from "@/components/navbar2";

const CostList = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [editingCost, setEditingCost] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(null);

  // Soft Cost Form State
  const [softCostForm, setSoftCostForm] = useState({
    timekeeper: "",
    date: "",
    type: "Expense",
    expense: "",
    description: "",
    quantity: "",
    rate: "",
    taxable: true,
  });

  // Hard Cost Form State
  const [hardCostForm, setHardCostForm] = useState({
    date: "",
    bank_type_id: "",
    type: "Payment",
    method_id: "",
    quantity: "",
    pay_to: "",
    amount: "",
    memo_1: "",
    memo_2: "",
    address_1: {
      unit_number: "",
      street_number: "",
      street_name: "",
      city: "",
      province: "",
      postal_code: "",
      country: "",
    },
    address_2: {
      unit_number: "",
      street_number: "",
      street_name: "",
      city: "",
      province: "",
      postal_code: "",
      country: "",
    },
  });

  // TimeCard Form State
  const [timeCardForm, setTimeCardForm] = useState({
    timekeeper: "",
    date: "",
    type: "Lawyer Work",
    task: "",
    description: "",
    time_spent_id: "",
    time_billed: "",
    rate_level_id: "",
    rate: "",
    rate_type_id: "",
    billing_status_id: "",
    hold: false,
    flag_id: "",
    note: "",
    taxable: true,
  });

  const resetSoftCostForm = () => {
    setSoftCostForm({
      timekeeper: "",
      date: "",
      type: "Expense",
      expense: "",
      description: "",
      quantity: "",
      rate: "",
      taxable: true,
    });
  };

  const resetHardCostForm = () => {
    setHardCostForm({
      date: "",
      bank_type_id: "",
      type: "Payment",
      method_id: "",
      quantity: "",
      pay_to: "",
      amount: "",
      memo_1: "",
      memo_2: "",
      address_1: {
        unit_number: "",
        street_number: "",
        street_name: "",
        city: "",
        province: "",
        postal_code: "",
        country: "",
      },
      address_2: {
        unit_number: "",
        street_number: "",
        street_name: "",
        city: "",
        province: "",
        postal_code: "",
        country: "",
      },
    });
  };

  const resetTimeCardForm = () => {
    setTimeCardForm({
      timekeeper: "",
      date: "",
      type: "Lawyer Work",
      task: "",
      description: "",
      time_spent_id: "",
      time_billed: "",
      rate_level_id: "",
      rate: "",
      rate_type_id: "",
      billing_status_id: "",
      hold: false,
      flag_id: "",
      note: "",
      taxable: true,
    });
  };

  const addCostMutation = useMutation({
    mutationFn: (payload) => addCost(payload, slug),
    onSuccess: () => {
      queryClient.invalidateQueries(["costList", slug]);
      setDialogOpen(null);
      resetSoftCostForm();
      resetHardCostForm();
      resetTimeCardForm();
    },
    onError: (error) => {
      console.error("Failed to add cost:", error);
    },
  });

  const deleteCostMutation = useMutation({
    mutationFn: (id) => deleteCost(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["costList", slug]);
    },
    onError: (error) => {
      console.error("Failed to delete cost:", error);
    },
  });

  const updateCostMutation = useMutation({
    mutationFn: ({ payload, id }) => updateCost(payload, id),
    onSuccess: () => {
      queryClient.invalidateQueries(["costList", slug]);
      setEditDialogOpen(null);
      setEditingCost(null);
    },
    onError: (error) => {
      console.error("Failed to update cost:", error);
    },
  });

  const handleEditCost = async (item) => {
    try {
      const costDetail = await fetchSingleCost(item.id);
      setEditingCost(costDetail.data || costDetail);
      setEditDialogOpen(item.section_type);
    } catch (error) {
      console.error("Failed to fetch cost details:", error);
      // Fallback to using the item data from the list
      setEditingCost(item);
      setEditDialogOpen(item.section_type);
    }
  };

  const handleDeleteCost = (id) => {
    setDeleteConfirmId(id);
  };

  const confirmDelete = () => {
    if (deleteConfirmId) {
      deleteCostMutation.mutate(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  const handleEditSoftCostSubmit = () => {
    const payload = {
      section_type: "soft-cost",
      timekeeker: editingCost.timekeeker,
      date: editingCost.date,
      type: editingCost.type,
      expesne: editingCost.expesne,
      description: editingCost.description,
      quantity: parseFloat(editingCost.quantity) || 0,
      rate: parseFloat(editingCost.rate) || 0,
      taxable: editingCost.taxable,
    };
    updateCostMutation.mutate({ payload, id: editingCost.id });
  };

  const handleEditTimeCardSubmit = () => {
    const payload = {
      section_type: "time-card",
      timekeeker: editingCost.timekeeker,
      date: editingCost.date,
      type: editingCost.type,
      task: editingCost.task,
      description: editingCost.description,
      time_spent_id: parseInt(editingCost.time_spent_id) || null,
      time_billed: editingCost.time_billed,
      rate_level_id: parseInt(editingCost.rate_level_id) || null,
      rate: parseFloat(editingCost.rate) || 0,
      rate_type_id: parseInt(editingCost.rate_type_id) || null,
      billing_status_id: parseInt(editingCost.billing_status_id) || null,
      hold: editingCost.hold,
      flag_id: parseInt(editingCost.flag_id) || null,
      note: editingCost.note,
      taxable: editingCost.taxable,
    };
    updateCostMutation.mutate({ payload, id: editingCost.id });
  };

  const handleEditHardCostSubmit = () => {
    const payload = {
      section_type: "hard-cost",
      date: editingCost.date,
      bank_type_id: parseInt(editingCost.bank_type_id) || null,
      type: editingCost.type,
      method_id: parseInt(editingCost.method_id) || null,
      quantity: parseFloat(editingCost.quantity) || 1,
      pay_to: editingCost.pay_to,
      amount: parseFloat(editingCost.amount) || 0,
      memo_1: editingCost.memo_1,
      memo_2: editingCost.memo_2,
      address_1: editingCost.address_1 || {},
      address_2: editingCost.address_2 || {},
    };
    updateCostMutation.mutate({ payload, id: editingCost.id });
  };

  const handleSoftCostSubmit = () => {
    const payload = {
      section_type: "soft-cost",
      timekeeker: softCostForm.timekeeper,
      date: softCostForm.date,
      type: softCostForm.type,
      expesne: softCostForm.expense,
      description: softCostForm.description,
      quantity: parseFloat(softCostForm.quantity) || 0,
      rate: parseFloat(softCostForm.rate) || 0,
      taxable: softCostForm.taxable,
    };
    addCostMutation.mutate(payload, slug);
  };

  const handleTimeCardSubmit = () => {
    const payload = {
      section_type: "time-card",
      timekeeker: timeCardForm.timekeeper,
      date: timeCardForm.date,
      type: timeCardForm.type,
      task: timeCardForm.task,
      description: timeCardForm.description,
      time_spent_id: parseInt(timeCardForm.time_spent_id) || null,
      time_billed: timeCardForm.time_billed,
      rate_level_id: parseInt(timeCardForm.rate_level_id) || null,
      rate: parseFloat(timeCardForm.rate) || 0,
      rate_type_id: parseInt(timeCardForm.rate_type_id) || null,
      billing_status_id: parseInt(timeCardForm.billing_status_id) || null,
      hold: timeCardForm.hold,
      flag_id: parseInt(timeCardForm.flag_id) || null,
      note: timeCardForm.note,
      taxable: timeCardForm.taxable,
    };
    addCostMutation.mutate(payload, slug);
  };

  const handleHardCostSubmit = () => {
    const payload = {
      section_type: "hard-cost",
      date: hardCostForm.date,
      bank_type_id: parseInt(hardCostForm.bank_type_id) || null,
      type: hardCostForm.type,
      method_id: parseInt(hardCostForm.method_id) || null,
      quantity: parseFloat(hardCostForm.quantity) || 1,
      pay_to: hardCostForm.pay_to,
      amount: parseFloat(hardCostForm.amount) || 0,
      memo_1: hardCostForm.memo_1,
      memo_2: hardCostForm.memo_2,
      address_1: hardCostForm.address_1,
      address_2: hardCostForm.address_2,
    };
    addCostMutation.mutate(payload, slug);
  };

  const { data, isLoading } = useQuery({
    queryKey: ["costList", slug, currentPage],
    queryFn: () => fetchList(slug, currentPage, 25),
    enabled: !!slug,
  });

  const { data: metaData } = useQuery({
    queryKey: ["accountingMeta", slug],
    queryFn: () => fetchMeta(slug),
    enabled: !!slug,
  });

  const bankTypes = metaData?.accounting_bank_type || [];
  const accountingMethods = metaData?.accounting_method || [];
  const timeSpentOptions = metaData?.timeentries || [];
  const rateLevelOptions = metaData?.rateentries || [];
  const rateTypeOptions = metaData?.accounting_rate_type || [];
  const billingStatusOptions = metaData?.accounting_billing_status || [];
  const flagOptions = metaData?.accounting_flag || [];

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
          <span className="text-gray-900 font-medium">Cost</span>
        </div>
      </nav>

      {/* Add New Button with Popover */}
      <div className="mb-6 px-6">
        <Popover>
          <PopoverTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 gap-2">
              <Plus className="size-4" />
              Add New
              <ChevronDown className="size-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-2" align="start">
            <div className="flex flex-col gap-1">
              <Button
                variant="ghost"
                className="justify-start"
                onClick={() => setDialogOpen("soft-cost")}
              >
                Soft Cost
              </Button>
              <Button
                variant="ghost"
                className="justify-start"
                onClick={() => setDialogOpen("hard-cost")}
              >
                Hard Cost
              </Button>
              <Button
                variant="ghost"
                className="justify-start"
                onClick={() => setDialogOpen("timecard")}
              >
                Add Timecard
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-border overflow-hidden mx-6 mb-6">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Cost Type</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Memo</TableHead>
              <TableHead>Payment Amount</TableHead>
              <TableHead>Balance</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-20">Actions</TableHead>
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
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          onClick={() => handleEditCost(item)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDeleteCost(item.id)}
                          disabled={deleteCostMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen === "timecard"} onOpenChange={(open) => !open && setDialogOpen(null)}>
        <DialogContent className="w-[70vw] max-w-none max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Add TimeCard</DialogTitle>
            <DialogDescription>Add a new timecard entry</DialogDescription>
            <button
              onClick={() => setDialogOpen(null)}
              className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100"
            >
              <X className="h-4 w-4" />
            </button>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Timekeeper</Label>
                <Input 
                  placeholder="" 
                  value={timeCardForm.timekeeper}
                  onChange={(e) => setTimeCardForm({...timeCardForm, timekeeper: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={timeCardForm.date}
                  onChange={(e) => setTimeCardForm({...timeCardForm, date: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Input 
                  value={timeCardForm.type}
                  disabled
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Task</Label>
              <Input 
                placeholder="" 
                value={timeCardForm.task}
                onChange={(e) => setTimeCardForm({...timeCardForm, task: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea 
                className="min-h-[100px]" 
                placeholder="" 
                value={timeCardForm.description}
                onChange={(e) => setTimeCardForm({...timeCardForm, description: e.target.value})}
              />
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4">Time & Amount</h3>
              <div className="grid grid-cols-6 gap-4 mb-4">
                <div className="space-y-2 col-span-3">
                  <Label>Time Spent</Label>
                  <Select
                    value={timeCardForm.time_spent_id}
                    onValueChange={(value) => setTimeCardForm({...timeCardForm, time_spent_id: value})}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSpentOptions.map((item) => (
                        <SelectItem key={item.id} value={String(item.id)}>
                          {item.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 col-span-3">
                  <Label>Time Billed</Label>
                  <Input 
                    placeholder="00:00" 
                    className="w-full" 
                    value={timeCardForm.time_billed}
                    onChange={(e) => setTimeCardForm({...timeCardForm, time_billed: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-6 gap-4">
                <div className="space-y-2 col-span-2">
                  <Label>Rate Level</Label>
                  <Select
                    value={timeCardForm.rate_level_id}
                    onValueChange={(value) => setTimeCardForm({...timeCardForm, rate_level_id: value})}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {rateLevelOptions.map((item) => (
                        <SelectItem key={item.id} value={String(item.id)}>
                          {item.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Rate/Price</Label>
                  <Input 
                    type="number" 
                    className="w-full" 
                    value={timeCardForm.rate}
                    onChange={(e) => setTimeCardForm({...timeCardForm, rate: e.target.value})}
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Rate Type</Label>
                  <Select
                    value={timeCardForm.rate_type_id}
                    onValueChange={(value) => setTimeCardForm({...timeCardForm, rate_type_id: value})}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {rateTypeOptions.map((item) => (
                        <SelectItem key={item.id} value={String(item.id)}>
                          {item.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* <div className="text-right mt-4">
                <span className="text-sm text-muted-foreground">
                  Value: ${((parseFloat(timeCardForm.rate) || 0) * (parseFloat(timeCardForm.time_billed?.split(':')[0]) || 0)).toFixed(2)}
                </span>
              </div> */}
            </div>

            <Tabs defaultValue="billing" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="billing">Billing Info</TabsTrigger>
                <TabsTrigger value="note">Note</TabsTrigger>
                <TabsTrigger value="tax">Tax</TabsTrigger>
              </TabsList>
              <TabsContent value="billing" className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Billing Status</Label>
                    <Select
                      value={timeCardForm.billing_status_id}
                      onValueChange={(value) => setTimeCardForm({...timeCardForm, billing_status_id: value})}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {billingStatusOptions.map((item) => (
                          <SelectItem key={item.id} value={String(item.id)}>
                            {item.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2 pt-8">
                    <Checkbox 
                      id="hold" 
                      checked={timeCardForm.hold}
                      onCheckedChange={(checked) => setTimeCardForm({...timeCardForm, hold: checked})}
                    />
                    <Label htmlFor="hold" className="font-normal">Hold</Label>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Flag</Label>
                  <Select
                    value={timeCardForm.flag_id}
                    onValueChange={(value) => setTimeCardForm({...timeCardForm, flag_id: value})}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {flagOptions.map((item) => (
                        <SelectItem key={item.id} value={String(item.id)}>
                          {item.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>
              <TabsContent value="note" className="pt-4">
                <Textarea 
                  className="min-h-[100px]" 
                  placeholder="Add notes..." 
                  value={timeCardForm.note}
                  onChange={(e) => setTimeCardForm({...timeCardForm, note: e.target.value})}
                />
              </TabsContent>
              <TabsContent value="tax" className="pt-4">
                <div className="space-y-4">
                  <Select 
                    value={timeCardForm.taxable ? "taxable" : "non-taxable"}
                    onValueChange={(value) => setTimeCardForm({...timeCardForm, taxable: value === "taxable"})}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="taxable">Taxable</SelectItem>
                      <SelectItem value="non-taxable">Non-Taxable</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>
            </Tabs>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setDialogOpen(null)}>
              Close
            </Button>
            <Button onClick={handleTimeCardSubmit} disabled={addCostMutation.isPending}>
              {addCostMutation.isPending ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={dialogOpen === "soft-cost"} onOpenChange={(open) => !open && setDialogOpen(null)}>
        <DialogContent className="w-[70vw] max-w-none max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Add Soft Cost</DialogTitle>
            <DialogDescription>Add a new soft cost entry</DialogDescription>
            <button
              onClick={() => setDialogOpen(null)}
              className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100"
            >
              <X className="h-4 w-4" />
            </button>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Timekeeper</Label>
                <Input 
                  placeholder="" 
                  value={softCostForm.timekeeper}
                  onChange={(e) => setSoftCostForm({...softCostForm, timekeeper: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={softCostForm.date}
                  onChange={(e) => setSoftCostForm({...softCostForm, date: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Input 
                  value={softCostForm.type} 
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label>Expense</Label>
                <Input 
                  placeholder="" 
                  value={softCostForm.expense}
                  onChange={(e) => setSoftCostForm({...softCostForm, expense: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea 
                className="min-h-[100px]" 
                placeholder="" 
                value={softCostForm.description}
                onChange={(e) => setSoftCostForm({...softCostForm, description: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Quantity</Label>
                <Input 
                  type="number" 
                  placeholder="" 
                  value={softCostForm.quantity}
                  onChange={(e) => setSoftCostForm({...softCostForm, quantity: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Rate</Label>
                <Input 
                  type="number" 
                  placeholder="" 
                  value={softCostForm.rate}
                  onChange={(e) => setSoftCostForm({...softCostForm, rate: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Value</Label>
                <Input 
                  type="number" 
                  placeholder="" 
                  value={(parseFloat(softCostForm.quantity) || 0) * (parseFloat(softCostForm.rate) || 0)}
                  disabled
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Tax</Label>
              <Select 
                value={softCostForm.taxable ? "taxable" : "non-taxable"}
                onValueChange={(value) => setSoftCostForm({...softCostForm, taxable: value === "taxable"})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="taxable">Taxable</SelectItem>
                  <SelectItem value="non-taxable">Non-Taxable</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setDialogOpen(null)}>
              Close
            </Button>
            <Button onClick={handleSoftCostSubmit} disabled={addCostMutation.isPending}>
              {addCostMutation.isPending ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={dialogOpen === "hard-cost"} onOpenChange={(open) => !open && setDialogOpen(null)}>
        <DialogContent className="w-[70vw] max-w-none max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Add Hard Cost</DialogTitle>
            <DialogDescription>Add a new hard cost entry</DialogDescription>
            <button
              onClick={() => setDialogOpen(null)}
              className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100"
            >
              <X className="h-4 w-4" />
            </button>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-5 gap-4">
              <div className="space-y-2">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={hardCostForm.date}
                  onChange={(e) => setHardCostForm({...hardCostForm, date: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Bank Type</Label>
                <Select
                  value={hardCostForm.bank_type_id}
                  onValueChange={(value) => setHardCostForm({...hardCostForm, bank_type_id: value})}
                >
                  <SelectTrigger className="w-full">
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
                <Label>Type</Label>
                <Input 
                  disabled
                  value={hardCostForm.type}
                  onChange={(e) => setHardCostForm({...hardCostForm, type: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Method</Label>
                <Select
                  value={hardCostForm.method_id}
                  onValueChange={(value) => setHardCostForm({...hardCostForm, method_id: value})}
                >
                  <SelectTrigger className="w-full">
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
                <Label>Quantity</Label>
                <Input 
                  type="number" 
                  value={hardCostForm.quantity}
                  onChange={(e) => setHardCostForm({...hardCostForm, quantity: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Pay to</Label>
                <Input 
                  placeholder="" 
                  value={hardCostForm.pay_to}
                  onChange={(e) => setHardCostForm({...hardCostForm, pay_to: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Amount</Label>
                <Input 
                  type="number" 
                  placeholder="" 
                  value={hardCostForm.amount}
                  onChange={(e) => setHardCostForm({...hardCostForm, amount: e.target.value})}
                />
              </div>
            </div>

            {/* Address 1 */}
            <div className="space-y-4">
              <h3 className="text-md font-medium">Address 1</h3>
              <div className="grid grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Unit Number</Label>
                  <Input 
                    placeholder="" 
                    value={hardCostForm.address_1.unit_number}
                    onChange={(e) => setHardCostForm({
                      ...hardCostForm, 
                      address_1: {...hardCostForm.address_1, unit_number: e.target.value}
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Street Number</Label>
                  <Input 
                    placeholder="" 
                    value={hardCostForm.address_1.street_number}
                    onChange={(e) => setHardCostForm({
                      ...hardCostForm, 
                      address_1: {...hardCostForm.address_1, street_number: e.target.value}
                    })}
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Street Name</Label>
                  <Input 
                    placeholder="" 
                    value={hardCostForm.address_1.street_name}
                    onChange={(e) => setHardCostForm({
                      ...hardCostForm, 
                      address_1: {...hardCostForm.address_1, street_name: e.target.value}
                    })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>City</Label>
                  <Input 
                    placeholder="" 
                    value={hardCostForm.address_1.city}
                    onChange={(e) => setHardCostForm({
                      ...hardCostForm, 
                      address_1: {...hardCostForm.address_1, city: e.target.value}
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Province</Label>
                  <Input 
                    placeholder="" 
                    value={hardCostForm.address_1.province}
                    onChange={(e) => setHardCostForm({
                      ...hardCostForm, 
                      address_1: {...hardCostForm.address_1, province: e.target.value}
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Postal Code</Label>
                  <Input 
                    placeholder="" 
                    value={hardCostForm.address_1.postal_code}
                    onChange={(e) => setHardCostForm({
                      ...hardCostForm, 
                      address_1: {...hardCostForm.address_1, postal_code: e.target.value}
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Country</Label>
                  <Input 
                    placeholder="" 
                    value={hardCostForm.address_1.country}
                    onChange={(e) => setHardCostForm({
                      ...hardCostForm, 
                      address_1: {...hardCostForm.address_1, country: e.target.value}
                    })}
                  />
                </div>
              </div>
            </div>

            {/* Address 2 */}
            <div className="space-y-4">
              <h3 className="text-md font-medium">Address 2</h3>
              <div className="grid grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Unit Number</Label>
                  <Input 
                    placeholder="" 
                    value={hardCostForm.address_2.unit_number}
                    onChange={(e) => setHardCostForm({
                      ...hardCostForm, 
                      address_2: {...hardCostForm.address_2, unit_number: e.target.value}
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Street Number</Label>
                  <Input 
                    placeholder="" 
                    value={hardCostForm.address_2.street_number}
                    onChange={(e) => setHardCostForm({
                      ...hardCostForm, 
                      address_2: {...hardCostForm.address_2, street_number: e.target.value}
                    })}
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Street Name</Label>
                  <Input 
                    placeholder="" 
                    value={hardCostForm.address_2.street_name}
                    onChange={(e) => setHardCostForm({
                      ...hardCostForm, 
                      address_2: {...hardCostForm.address_2, street_name: e.target.value}
                    })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>City</Label>
                  <Input 
                    placeholder="" 
                    value={hardCostForm.address_2.city}
                    onChange={(e) => setHardCostForm({
                      ...hardCostForm, 
                      address_2: {...hardCostForm.address_2, city: e.target.value}
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Province</Label>
                  <Input 
                    placeholder="" 
                    value={hardCostForm.address_2.province}
                    onChange={(e) => setHardCostForm({
                      ...hardCostForm, 
                      address_2: {...hardCostForm.address_2, province: e.target.value}
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Postal Code</Label>
                  <Input 
                    placeholder="" 
                    value={hardCostForm.address_2.postal_code}
                    onChange={(e) => setHardCostForm({
                      ...hardCostForm, 
                      address_2: {...hardCostForm.address_2, postal_code: e.target.value}
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Country</Label>
                  <Input 
                    placeholder="" 
                    value={hardCostForm.address_2.country}
                    onChange={(e) => setHardCostForm({
                      ...hardCostForm, 
                      address_2: {...hardCostForm.address_2, country: e.target.value}
                    })}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Memo 1</Label>
                <Textarea 
                  className="min-h-[80px]" 
                  placeholder="" 
                  value={hardCostForm.memo_1}
                  onChange={(e) => setHardCostForm({...hardCostForm, memo_1: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Memo 2</Label>
                <Textarea 
                  className="min-h-[80px]" 
                  placeholder="" 
                  value={hardCostForm.memo_2}
                  onChange={(e) => setHardCostForm({...hardCostForm, memo_2: e.target.value})}
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setDialogOpen(null)}>
              Close
            </Button>
            <Button onClick={handleHardCostSubmit} disabled={addCostMutation.isPending}>
              {addCostMutation.isPending ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmId !== null} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Cost Entry</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this cost entry? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDelete}
              disabled={deleteCostMutation.isPending}
            >
              {deleteCostMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={editDialogOpen === "soft-cost"} onOpenChange={(open) => { if (!open) { setEditDialogOpen(null); setEditingCost(null); } }}>
        <DialogContent className="w-[70vw] max-w-none max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Edit Soft Cost</DialogTitle>
            <DialogDescription>Edit the soft cost entry</DialogDescription>
            <button
              onClick={() => { setEditDialogOpen(null); setEditingCost(null); }}
              className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100"
            >
              <X className="h-4 w-4" />
            </button>
          </DialogHeader>
          {editingCost && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Timekeeper</Label>
                  <Input 
                    placeholder="" 
                    value={editingCost.timekeeker || ""}
                    onChange={(e) => setEditingCost({...editingCost, timekeeker: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={editingCost.date || ""}
                    onChange={(e) => setEditingCost({...editingCost, date: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Input 
                    value={editingCost.type || "Expense"} 
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label>Expense</Label>
                  <Input 
                    placeholder="" 
                    value={editingCost.expesne || ""}
                    onChange={(e) => setEditingCost({...editingCost, expesne: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea 
                  className="min-h-[100px]" 
                  placeholder="" 
                  value={editingCost.description || ""}
                  onChange={(e) => setEditingCost({...editingCost, description: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Quantity</Label>
                  <Input 
                    type="number" 
                    placeholder="" 
                    value={editingCost.quantity || ""}
                    onChange={(e) => setEditingCost({...editingCost, quantity: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Rate</Label>
                  <Input 
                    type="number" 
                    placeholder="" 
                    value={editingCost.rate || ""}
                    onChange={(e) => setEditingCost({...editingCost, rate: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Value</Label>
                  <Input 
                    type="number" 
                    placeholder="" 
                    value={(parseFloat(editingCost.quantity) || 0) * (parseFloat(editingCost.rate) || 0)}
                    disabled
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Tax</Label>
                <Select 
                  value={editingCost.taxable ? "taxable" : "non-taxable"}
                  onValueChange={(value) => setEditingCost({...editingCost, taxable: value === "taxable"})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="taxable">Taxable</SelectItem>
                    <SelectItem value="non-taxable">Non-Taxable</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => { setEditDialogOpen(null); setEditingCost(null); }}>
              Close
            </Button>
            <Button onClick={handleEditSoftCostSubmit} disabled={updateCostMutation.isPending}>
              {updateCostMutation.isPending ? "Updating..." : "Update"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Time Card Dialog */}
      <Dialog open={editDialogOpen === "time-card"} onOpenChange={(open) => { if (!open) { setEditDialogOpen(null); setEditingCost(null); } }}>
        <DialogContent className="w-[70vw] max-w-none max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Edit TimeCard</DialogTitle>
            <DialogDescription>Edit the timecard entry</DialogDescription>
            <button
              onClick={() => { setEditDialogOpen(null); setEditingCost(null); }}
              className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100"
            >
              <X className="h-4 w-4" />
            </button>
          </DialogHeader>
          {editingCost && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Timekeeper</Label>
                  <Input 
                    placeholder="" 
                    value={editingCost.timekeeker || ""}
                    onChange={(e) => setEditingCost({...editingCost, timekeeker: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={editingCost.date || ""}
                    onChange={(e) => setEditingCost({...editingCost, date: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Input 
                    value={editingCost.type || "Lawyer Work"}
                    disabled
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Task</Label>
                <Input 
                  placeholder="" 
                  value={editingCost.task || ""}
                  onChange={(e) => setEditingCost({...editingCost, task: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea 
                  className="min-h-[100px]" 
                  placeholder="" 
                  value={editingCost.description || ""}
                  onChange={(e) => setEditingCost({...editingCost, description: e.target.value})}
                />
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">Time & Amount</h3>
                <div className="grid grid-cols-6 gap-4 mb-4">
                  <div className="space-y-2 col-span-3">
                    <Label>Time Spent</Label>
                    <Select
                      value={String(editingCost.time_spent_id || "")}
                      onValueChange={(value) => setEditingCost({...editingCost, time_spent_id: value})}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeSpentOptions.map((item) => (
                          <SelectItem key={item.id} value={String(item.id)}>
                            {item.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 col-span-3">
                    <Label>Time Billed</Label>
                    <Input 
                      placeholder="00:00" 
                      className="w-full" 
                      value={editingCost.time_billed || ""}
                      onChange={(e) => setEditingCost({...editingCost, time_billed: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-6 gap-4">
                  <div className="space-y-2 col-span-2">
                    <Label>Rate Level</Label>
                    <Select
                      value={String(editingCost.rate_level_id || "")}
                      onValueChange={(value) => setEditingCost({...editingCost, rate_level_id: value})}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {rateLevelOptions.map((item) => (
                          <SelectItem key={item.id} value={String(item.id)}>
                            {item.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label>Rate/Price</Label>
                    <Input 
                      type="number" 
                      className="w-full" 
                      value={editingCost.rate || ""}
                      onChange={(e) => setEditingCost({...editingCost, rate: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label>Rate Type</Label>
                    <Select
                      value={String(editingCost.rate_type_id || "")}
                      onValueChange={(value) => setEditingCost({...editingCost, rate_type_id: value})}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {rateTypeOptions.map((item) => (
                          <SelectItem key={item.id} value={String(item.id)}>
                            {item.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Tabs defaultValue="billing" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="billing">Billing Info</TabsTrigger>
                  <TabsTrigger value="note">Note</TabsTrigger>
                  <TabsTrigger value="tax">Tax</TabsTrigger>
                </TabsList>
                <TabsContent value="billing" className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Billing Status</Label>
                      <Select
                        value={String(editingCost.billing_status_id || "")}
                        onValueChange={(value) => setEditingCost({...editingCost, billing_status_id: value})}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          {billingStatusOptions.map((item) => (
                            <SelectItem key={item.id} value={String(item.id)}>
                              {item.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center space-x-2 pt-8">
                      <Checkbox 
                        id="edit-hold" 
                        checked={editingCost.hold || false}
                        onCheckedChange={(checked) => setEditingCost({...editingCost, hold: checked})}
                      />
                      <Label htmlFor="edit-hold" className="font-normal">Hold</Label>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Flag</Label>
                    <Select
                      value={String(editingCost.flag_id || "")}
                      onValueChange={(value) => setEditingCost({...editingCost, flag_id: value})}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {flagOptions.map((item) => (
                          <SelectItem key={item.id} value={String(item.id)}>
                            {item.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>
                <TabsContent value="note" className="pt-4">
                  <Textarea 
                    className="min-h-[100px]" 
                    placeholder="Add notes..." 
                    value={editingCost.note || ""}
                    onChange={(e) => setEditingCost({...editingCost, note: e.target.value})}
                  />
                </TabsContent>
                <TabsContent value="tax" className="pt-4">
                  <div className="space-y-4">
                    <Select 
                      value={editingCost.taxable ? "taxable" : "non-taxable"}
                      onValueChange={(value) => setEditingCost({...editingCost, taxable: value === "taxable"})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="taxable">Taxable</SelectItem>
                        <SelectItem value="non-taxable">Non-Taxable</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => { setEditDialogOpen(null); setEditingCost(null); }}>
              Close
            </Button>
            <Button onClick={handleEditTimeCardSubmit} disabled={updateCostMutation.isPending}>
              {updateCostMutation.isPending ? "Updating..." : "Update"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Hard Cost Dialog */}
      <Dialog open={editDialogOpen === "hard-cost"} onOpenChange={(open) => { if (!open) { setEditDialogOpen(null); setEditingCost(null); } }}>
        <DialogContent className="w-[70vw] max-w-none max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Edit Hard Cost</DialogTitle>
            <DialogDescription>Edit the hard cost entry</DialogDescription>
            <button
              onClick={() => { setEditDialogOpen(null); setEditingCost(null); }}
              className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100"
            >
              <X className="h-4 w-4" />
            </button>
          </DialogHeader>
          {editingCost && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-5 gap-4">
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={editingCost.date || ""}
                    onChange={(e) => setEditingCost({...editingCost, date: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Bank Type</Label>
                  <Select
                    value={String(editingCost.bank_type_id || "")}
                    onValueChange={(value) => setEditingCost({...editingCost, bank_type_id: value})}
                  >
                    <SelectTrigger className="w-full">
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
                  <Label>Type</Label>
                  <Input 
                    disabled
                    value={editingCost.type || "Payment"}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Method</Label>
                  <Select
                    value={String(editingCost.method_id || "")}
                    onValueChange={(value) => setEditingCost({...editingCost, method_id: value})}
                  >
                    <SelectTrigger className="w-full">
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
                  <Label>Quantity</Label>
                  <Input 
                    type="number" 
                    value={editingCost.quantity || ""}
                    onChange={(e) => setEditingCost({...editingCost, quantity: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Pay to</Label>
                  <Input 
                    placeholder="" 
                    value={editingCost.pay_to || ""}
                    onChange={(e) => setEditingCost({...editingCost, pay_to: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Amount</Label>
                  <Input 
                    type="number" 
                    placeholder="" 
                    value={editingCost.amount || ""}
                    onChange={(e) => setEditingCost({...editingCost, amount: e.target.value})}
                  />
                </div>
              </div>

              {/* Address 1 */}
              <div className="space-y-4">
                <h3 className="text-md font-medium">Address 1</h3>
                <div className="grid grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>Unit Number</Label>
                    <Input 
                      placeholder="" 
                      value={editingCost.address_1?.unit_number || ""}
                      onChange={(e) => setEditingCost({
                        ...editingCost, 
                        address_1: {...(editingCost.address_1 || {}), unit_number: e.target.value}
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Street Number</Label>
                    <Input 
                      placeholder="" 
                      value={editingCost.address_1?.street_number || ""}
                      onChange={(e) => setEditingCost({
                        ...editingCost, 
                        address_1: {...(editingCost.address_1 || {}), street_number: e.target.value}
                      })}
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label>Street Name</Label>
                    <Input 
                      placeholder="" 
                      value={editingCost.address_1?.street_name || ""}
                      onChange={(e) => setEditingCost({
                        ...editingCost, 
                        address_1: {...(editingCost.address_1 || {}), street_name: e.target.value}
                      })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>City</Label>
                    <Input 
                      placeholder="" 
                      value={editingCost.address_1?.city || ""}
                      onChange={(e) => setEditingCost({
                        ...editingCost, 
                        address_1: {...(editingCost.address_1 || {}), city: e.target.value}
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Province</Label>
                    <Input 
                      placeholder="" 
                      value={editingCost.address_1?.province || ""}
                      onChange={(e) => setEditingCost({
                        ...editingCost, 
                        address_1: {...(editingCost.address_1 || {}), province: e.target.value}
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Postal Code</Label>
                    <Input 
                      placeholder="" 
                      value={editingCost.address_1?.postal_code || ""}
                      onChange={(e) => setEditingCost({
                        ...editingCost, 
                        address_1: {...(editingCost.address_1 || {}), postal_code: e.target.value}
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Country</Label>
                    <Input 
                      placeholder="" 
                      value={editingCost.address_1?.country || ""}
                      onChange={(e) => setEditingCost({
                        ...editingCost, 
                        address_1: {...(editingCost.address_1 || {}), country: e.target.value}
                      })}
                    />
                  </div>
                </div>
              </div>

              {/* Address 2 */}
              <div className="space-y-4">
                <h3 className="text-md font-medium">Address 2</h3>
                <div className="grid grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>Unit Number</Label>
                    <Input 
                      placeholder="" 
                      value={editingCost.address_2?.unit_number || ""}
                      onChange={(e) => setEditingCost({
                        ...editingCost, 
                        address_2: {...(editingCost.address_2 || {}), unit_number: e.target.value}
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Street Number</Label>
                    <Input 
                      placeholder="" 
                      value={editingCost.address_2?.street_number || ""}
                      onChange={(e) => setEditingCost({
                        ...editingCost, 
                        address_2: {...(editingCost.address_2 || {}), street_number: e.target.value}
                      })}
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label>Street Name</Label>
                    <Input 
                      placeholder="" 
                      value={editingCost.address_2?.street_name || ""}
                      onChange={(e) => setEditingCost({
                        ...editingCost, 
                        address_2: {...(editingCost.address_2 || {}), street_name: e.target.value}
                      })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>City</Label>
                    <Input 
                      placeholder="" 
                      value={editingCost.address_2?.city || ""}
                      onChange={(e) => setEditingCost({
                        ...editingCost, 
                        address_2: {...(editingCost.address_2 || {}), city: e.target.value}
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Province</Label>
                    <Input 
                      placeholder="" 
                      value={editingCost.address_2?.province || ""}
                      onChange={(e) => setEditingCost({
                        ...editingCost, 
                        address_2: {...(editingCost.address_2 || {}), province: e.target.value}
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Postal Code</Label>
                    <Input 
                      placeholder="" 
                      value={editingCost.address_2?.postal_code || ""}
                      onChange={(e) => setEditingCost({
                        ...editingCost, 
                        address_2: {...(editingCost.address_2 || {}), postal_code: e.target.value}
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Country</Label>
                    <Input 
                      placeholder="" 
                      value={editingCost.address_2?.country || ""}
                      onChange={(e) => setEditingCost({
                        ...editingCost, 
                        address_2: {...(editingCost.address_2 || {}), country: e.target.value}
                      })}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Memo 1</Label>
                  <Textarea 
                    className="min-h-[80px]" 
                    placeholder="" 
                    value={editingCost.memo_1 || ""}
                    onChange={(e) => setEditingCost({...editingCost, memo_1: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Memo 2</Label>
                  <Textarea 
                    className="min-h-[80px]" 
                    placeholder="" 
                    value={editingCost.memo_2 || ""}
                    onChange={(e) => setEditingCost({...editingCost, memo_2: e.target.value})}
                  />
                </div>
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => { setEditDialogOpen(null); setEditingCost(null); }}>
              Close
            </Button>
            <Button onClick={handleEditHardCostSubmit} disabled={updateCostMutation.isPending}>
              {updateCostMutation.isPending ? "Updating..." : "Update"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CostList;