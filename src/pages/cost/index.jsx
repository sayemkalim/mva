import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { fetchList } from "./helper/fetchList";
import { addCost } from "./helper/addCost";
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
import { Plus, ChevronDown, X } from "lucide-react";
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

const CostList = () => {
  const { slug } = useParams();
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(null);
  const [timecardDate, setTimecardDate] = useState("");
  const [hardCostDate, setHardCostDate] = useState("");

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

  // Add Cost Mutation
  const addCostMutation = useMutation({
    mutationFn: (payload) => addCost(payload, slug),
    onSuccess: () => {
      queryClient.invalidateQueries(["costList", slug]);
      setDialogOpen(null);
      resetSoftCostForm();
    },
    onError: (error) => {
      console.error("Failed to add cost:", error);
    },
  });

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

      {/* Add New Button with Popover */}
      <div className="mb-6">
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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Timekeeper</Label>
                <Input placeholder="" />
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={timecardDate}
                  onChange={(e) => setTimecardDate(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Task</Label>
              <Input placeholder="" />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea className="min-h-[100px]" placeholder="" />
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4">Time & Amount</h3>
              <div className="grid grid-cols-6 gap-4 mb-4">
                <div className="space-y-2 col-span-3">
                  <Label>Time Spent</Label>
                  <Select>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0.25">0.25 hours</SelectItem>
                      <SelectItem value="0.5">0.5 hours</SelectItem>
                      <SelectItem value="1">1 hour</SelectItem>
                      <SelectItem value="2">2 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 col-span-3">
                  <Label>Time Billed</Label>
                  <Input placeholder="" className="w-full" />
                </div>
              </div>

              <div className="grid grid-cols-6 gap-4">
                <div className="space-y-2 col-span-2">
                  <Label>Rate Level</Label>
                  <Select>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="junior">Junior</SelectItem>
                      <SelectItem value="senior">Senior</SelectItem>
                      <SelectItem value="partner">Partner</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Rate/Price</Label>
                  <Input type="number" defaultValue="0" className="w-full" />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Rate Type</Label>
                  <Select defaultValue="hourly">
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="fixed">Fixed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="text-right mt-4">
                <span className="text-sm text-muted-foreground">Value: $0.00</span>
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
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="billed">Billed</SelectItem>
                        <SelectItem value="unbilled">Unbilled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2 pt-8">
                    <Checkbox id="hold" />
                    <Label htmlFor="hold" className="font-normal">Hold</Label>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Flag</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>
              <TabsContent value="note" className="pt-4">
                <Textarea className="min-h-[100px]" placeholder="Add notes..." />
              </TabsContent>
              <TabsContent value="tax" className="pt-4">
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">Tax information will be displayed here</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setDialogOpen(null)}>
              Close
            </Button>
            <Button>Save changes</Button>
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
            <div className="grid grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={hardCostDate}
                  onChange={(e) => setHardCostDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Bank Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="trust">Trust</SelectItem>
                    <SelectItem value="operating">Operating</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Input defaultValue="withdrawal" />
              </div>
              <div className="space-y-2">
                <Label>Method</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="check">Check</SelectItem>
                    <SelectItem value="transfer">Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Pay to</Label>
                <Input placeholder="" />
              </div>
              <div className="space-y-2">
                <Label>Amount</Label>
                <Input type="number" placeholder="" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Address 1</Label>
                <Input placeholder="" />
              </div>
              <div className="space-y-2">
                <Label>Address 2</Label>
                <Input placeholder="" />
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>City</Label>
                <Input placeholder="" />
              </div>
              <div className="space-y-2">
                <Label>State/Province</Label>
                <Input placeholder="" />
              </div>
              <div className="space-y-2">
                <Label>Zip/Postal code</Label>
                <Input placeholder="" />
              </div>
              <div className="space-y-2">
                <Label>Country</Label>
                <Input placeholder="" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Memo</Label>
                <Textarea className="min-h-[80px]" placeholder="" />
              </div>
              <div className="space-y-2">
                <Label>Memo 2</Label>
                <Textarea className="min-h-[80px]" placeholder="" />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setDialogOpen(null)}>
              Close
            </Button>
            <Button>Save changes</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CostList;