import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { Navbar2 } from '@/components/navbar2';
import NavbarItem from '@/components/navbar/navbar_item';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Save, Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableFooter,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import Typography from '@/components/typography';
import { fetchFinalSettlement } from './helpers/fetchFinalSettlement';
import { saveFinalSettlement } from './helpers/saveFinalSettlement';
import { fetchMeta } from '../bank_transcation/helper/fetchMeta';
import { downloadSettlement } from './helpers/downloadSettlement';

const FinalSettlement = () => {
  const { slug } = useParams();
  const queryClient = useQueryClient();
  const [editableRecords, setEditableRecords] = useState([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newItem, setNewItem] = useState({ particular: '', expenditure: '' });

  const breadcrumbs = [
    { title: "Workstation", isNavigation: false },
    { title: "Banking", isNavigation: false },
    { title: "Final Settlement", isNavigation: false },
  ];

  const {
    data: apiResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["finalSettlement", slug],
    queryFn: () => fetchFinalSettlement(slug),
    enabled: !!slug,
  });

  const settlementData = apiResponse?.response?.data || {};
  const records = settlementData?.records || [];


  const { data: metaData } = useQuery({
    queryKey: ["accountingMeta", slug],
    queryFn: () => fetchMeta(slug),
    enabled: !!slug,
  });

  const hstRate = metaData?.hst || 13;

  useEffect(() => {
    if (records.length > 0) {
      setEditableRecords(records.map(record => ({
        ...record,
        expenditure: record.expenditure || '',
        receipts: record.receipts || '',
      })));
    }
  }, [records]);

  const isBalancePayoutRow = (record) => {
    return record.item_slug === 'balance_payout';
  };

  const totalExpenditure = editableRecords.reduce((sum, record) => {
    // if (isBalancePayoutRow(record)) return sum;
    return sum + (parseFloat(record.expenditure) || 0);
  }, 0);

  const totalReceipts = editableRecords.reduce((sum, record) => {
    // if (isBalancePayoutRow(record.particular)) return sum;
    return sum + (parseFloat(record.receipts) || 0);
  }, 0);

  const receivedFromInsurance = editableRecords.length > 0
    ? parseFloat(editableRecords[0].receipts) || 0
    : 0;
  const netBalance = receivedFromInsurance - totalExpenditure;

  const handleInputChange = (index, field, value) => {
    setEditableRecords(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: value,
      };

      if (field === 'expenditure' || field === 'receipts') {
        const contingencyFeeIndex = updated.findIndex(r =>
          r.item_slug === 'contingency_fee'
        );
        const disbursementsIndex = updated.findIndex(r =>
          r.item_slug === 'disbursements'
        );
        const hstIndex = updated.findIndex(r =>
          r.item_slug === 'hst'
        );

        if (hstIndex !== -1 && (contingencyFeeIndex !== -1 || disbursementsIndex !== -1)) {
          const contingencyFee = contingencyFeeIndex !== -1
            ? parseFloat(updated[contingencyFeeIndex].expenditure) || 0
            : 0;
          const disbursements = disbursementsIndex !== -1
            ? parseFloat(updated[disbursementsIndex].expenditure) || 0
            : 0;

          const hstValue = (contingencyFee + disbursements) * (Number(hstRate) / 100);
          updated[hstIndex] = {
            ...updated[hstIndex],
            expenditure: hstValue.toFixed(2),
          };
        }

        const balancePayoutIndex = updated.findIndex(r =>
          r.item_slug === 'balance_payout'
        );

        if (balancePayoutIndex !== -1) {
          const totalExp = updated.reduce((sum, record) => {
            if (record.item_slug === 'balance_payout') return sum;
            return sum + (parseFloat(record.expenditure) || 0);
          }, 0);

          const receivedAmount = parseFloat(updated[0].receipts) || 0;
          const balance = receivedAmount - totalExp;

          if (balance >= 0) {
            updated[balancePayoutIndex] = {
              ...updated[balancePayoutIndex],
              expenditure: balance.toFixed(2),
              receipts: '',
              particular: 'Balance payout after all the expenses – client name (auto fill)'
            };
          } else {
            updated[balancePayoutIndex] = {
              ...updated[balancePayoutIndex],
              expenditure: '',
              receipts: Math.abs(balance).toFixed(2),
              particular: 'Cash Shortfall',
            };
          }
        }
      }

      return updated;
    });
  };

  const handleAddItem = () => {
    const slug = newItem.particular.trim().toLowerCase().replace(/\s+/g, '_');
    const newRecord = {
      ...newItem,
      item_slug: slug,
      expenditure: parseFloat(newItem.expenditure) || 0,
      receipts: 0
    };

    setEditableRecords(prev => {
      const updated = [...prev];

      // Insert before balance_payout if it exists
      const balanceIndex = updated.findIndex(r => r.item_slug === 'balance_payout');
      if (balanceIndex !== -1) {
        updated.splice(balanceIndex, 0, newRecord);
      } else {
        updated.push(newRecord);
      }

      // Recalculate Balance Payout
      const balancePayoutIndex = updated.findIndex(r => r.item_slug === 'balance_payout');
      if (balancePayoutIndex !== -1) {
        const totalExp = updated.reduce((sum, record) => {
          if (record.item_slug === 'balance_payout') return sum;
          return sum + (parseFloat(record.expenditure) || 0);
        }, 0);

        const receivedAmount = parseFloat(updated[0].receipts) || 0;
        const balance = receivedAmount - totalExp;

        if (balance >= 0) {
          updated[balancePayoutIndex] = {
            ...updated[balancePayoutIndex],
            expenditure: balance.toFixed(2),
            receipts: '',
            particular: 'Balance payout after all the expenses – client name (auto fill)'
          };
        } else {
          updated[balancePayoutIndex] = {
            ...updated[balancePayoutIndex],
            expenditure: '',
            receipts: Math.abs(balance).toFixed(2),
            particular: 'Cash Shortfall',
          };
        }
      }
      return updated;
    });

    setIsAddDialogOpen(false);
    setNewItem({ particular: '', expenditure: '' });
  };

  // Save Mutation for final settlement
  const saveMutation = useMutation({
    mutationFn: (data) => saveFinalSettlement(slug, data),
    onSuccess: (response) => {
      if (response?.response?.Apistatus === true) {
        toast.success("Final settlement saved successfully");
        queryClient.invalidateQueries(["finalSettlement", slug]);
      } else {
        toast.error(response.response?.message);
        queryClient.invalidateQueries(["finalSettlement", slug]);
      }
    },
    onError: (error) => {
      console.error(error);
      toast.error("Failed to save final settlement");
    }
  });

  const handleSave = () => {
    const payload = {
      rows: [
        ...editableRecords.map(record => ({
          particular: record.particular,
          expenditure: parseFloat(record.expenditure) || 0,
          receipts: parseFloat(record.receipts) || 0,
          item_slug: record.item_slug
        })),
      ]
    };
    saveMutation.mutate(payload);
  };

  const downloadMutation = useMutation({
    mutationFn: () => downloadSettlement(slug),
    onSuccess: () => {
      toast.success("Settlement downloaded successfully");
    },
    onError: (error) => {
      console.error(error);
      toast.error("Failed to download settlement");
    }
  });

  const handleDownload = () => {
    downloadMutation.mutate();
  };

  const renderLoadingState = () => (
    <Card className="p-6">
      <Skeleton className="h-10 w-full mb-4" />
      {[...Array(8)].map((_, i) => (
        <Skeleton key={i} className="h-12 w-full mb-2" />
      ))}
      <Skeleton className="h-12 w-full mt-4" />
    </Card>
  );

  const renderErrorState = () => (
    <Alert variant="destructive" className="mb-4">
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>
        Failed to load final settlement data. Please try again.
      </AlertDescription>
    </Alert>
  );

  const renderEmptyState = () => (
    <Card className="p-6 text-center">
      <Typography variant="p" className="text-muted-foreground">
        No settlement records available.
      </Typography>
    </Card>
  );

  const renderTable = () => (
    <Card className="overflow-hidden p-0">
      <Table className="border-collapse">
        <TableHeader>
          <TableRow className="bg-muted/40">
            <TableHead className="font-semibold text-foreground py-4 px-6 w-[60%] border border-border">
              <Typography variant="p" className="font-semibold">
                Particulars/Description
              </Typography>
            </TableHead>
            <TableHead className="font-semibold text-foreground py-4 px-6 text-right border border-border">
              <Typography variant="p" className="font-semibold">
                Expenditure
              </Typography>
            </TableHead>
            <TableHead className="font-semibold text-foreground py-4 px-6 text-right border border-border">
              <Typography variant="p" className="font-semibold">
                Receipts
              </Typography>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {editableRecords.map((record, index) => (
            <TableRow
              key={record.id || index}
              className="hover:bg-muted/10 transition-colors"
            >
              <TableCell className="py-4 px-6 border border-border">
                <Typography variant="p" className="text-foreground">
                  {record.particular || '-'}
                </Typography>
              </TableCell>
              <TableCell className="py-3 px-6 border border-border">
                {index > 0 ? (
                  record.item_slug === 'hst' ||
                    record.item_slug === 'balance_payout' ? (
                    record.expenditure > 0 ? (
                      <input
                        type="text"
                        value={parseFloat(record.expenditure).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        readOnly
                        disabled
                        className="text-right w-full font-mono bg-transparent border-none outline-none text-foreground cursor-default"
                      />
                    ) : null
                  ) : (
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={record.expenditure}
                      onChange={(e) => handleInputChange(index, 'expenditure', e.target.value)}
                      className="text-right w-full font-mono bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground/50 focus:bg-muted/30 rounded px-1 transition-colors"
                    />
                  )
                ) : null}
              </TableCell>
              <TableCell className="py-3 px-6 border border-border">
                {index === 0 ? (
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={record.receipts}
                    onChange={(e) => handleInputChange(index, 'receipts', e.target.value)}
                    className="text-right w-full font-mono bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground/50 focus:bg-muted/30 rounded px-1 transition-colors"
                  />
                ) : record.item_slug === 'balance_payout' && record.receipts > 0 ? (
                  <input
                    type="text"
                    value={parseFloat(record.receipts).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    readOnly
                    disabled
                    className="text-right w-full font-mono bg-transparent border-none outline-none text-foreground cursor-default"
                  />
                ) : null}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow className="bg-muted/50">
            <TableCell className="py-4 px-6 border border-border">
              <Typography variant="p" className="font-semibold">
                Total
              </Typography>
            </TableCell>
            <TableCell className="py-4 px-6 text-right border border-border">
              <Typography variant="p" className="font-semibold font-mono">
                {totalExpenditure.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Typography>
            </TableCell>
            <TableCell className="py-4 px-6 text-right border border-border">
              <Typography variant="p" className="font-semibold font-mono">
                {totalReceipts.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Typography>
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </Card>
  );

  return (
    <div className="flex flex-col">
      <Navbar2 />
      <NavbarItem title="Final Settlement" slug={slug} breadcrumbs={breadcrumbs} />

      <div className="px-4">
        <div className="flex justify-start mb-4 gap-2">
          <Button
            onClick={handleSave}
            className="flex items-center gap-2 cursor-pointer"
            disabled={saveMutation.isPending}
          >
            <Save className="h-4 w-4" />
            {saveMutation.isPending ? 'Saving...' : 'Save'}
          </Button>
          <Button
            onClick={handleDownload}
            className="flex items-center gap-2 cursor-pointer"
            disabled={downloadMutation.isPending}
          >
            <Download className="h-4 w-4" />
            {downloadMutation.isPending ? 'Downloading...' : 'Download'}
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2 cursor-pointer">
                <Plus className="h-4 w-4" />
                Add Item
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Item</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="particular" className="text-right">
                    Particular
                  </Label>
                  <Input
                    id="particular"
                    value={newItem.particular}
                    onChange={(e) => setNewItem({ ...newItem, particular: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="expenditure" className="text-right">
                    Expenditure
                  </Label>
                  <Input
                    id="expenditure"
                    type="number"
                    min="0"
                    step="0.01"
                    value={newItem.expenditure}
                    onChange={(e) => setNewItem({ ...newItem, expenditure: e.target.value })}
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" onClick={handleAddItem}>Save changes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        {isLoading && renderLoadingState()}
        {error && renderErrorState()}
        {!isLoading && !error && records.length === 0 && renderEmptyState()}
        {!isLoading && !error && records.length > 0 && renderTable()}
      </div>
    </div>
  );
};

export default FinalSettlement;
