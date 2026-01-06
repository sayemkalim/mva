import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { Navbar2 } from '@/components/navbar2';
import NavbarItem from '@/components/navbar/navbar_item';
import { Card } from '@/components/ui/card';
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

const FinalSettlement = () => {
  const { slug } = useParams();
  const [editableRecords, setEditableRecords] = useState([]);

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

  useEffect(() => {
    if (records.length > 0) {
      setEditableRecords(records.map(record => ({
        ...record,
        expenditure: record.expenditure || '',
        receipts: record.receipts || '',
      })));
    }
  }, [records]);

  const isBalancePayoutRow = (particular) => {
    return particular?.toLowerCase().includes('balance payout');
  };

  const totalExpenditure = editableRecords.reduce((sum, record) => {
    if (isBalancePayoutRow(record.particular)) return sum;
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
          r.particular?.toLowerCase().includes('contingency fee')
        );
        const disbursementsIndex = updated.findIndex(r =>
          r.particular?.toLowerCase().includes('disbursement')
        );
        const hstIndex = updated.findIndex(r =>
          r.particular?.toLowerCase().includes('hst')
        );

        if (hstIndex !== -1 && (contingencyFeeIndex !== -1 || disbursementsIndex !== -1)) {
          const contingencyFee = contingencyFeeIndex !== -1
            ? parseFloat(updated[contingencyFeeIndex].expenditure) || 0
            : 0;
          const disbursements = disbursementsIndex !== -1
            ? parseFloat(updated[disbursementsIndex].expenditure) || 0
            : 0;

          const hstValue = (contingencyFee + disbursements) * 0.13;
          updated[hstIndex] = {
            ...updated[hstIndex],
            expenditure: hstValue.toFixed(2),
          };
        }

        const balancePayoutIndex = updated.findIndex(r =>
          r.particular?.toLowerCase().includes('balance payout')
        );

        if (balancePayoutIndex !== -1) {
          const totalExp = updated.reduce((sum, record) => {
            if (record.particular?.toLowerCase().includes('balance payout')) return sum;
            return sum + (parseFloat(record.expenditure) || 0);
          }, 0);

          const receivedAmount = parseFloat(updated[0].receipts) || 0;
          const balance = receivedAmount - totalExp;

          if (balance >= 0) {
            updated[balancePayoutIndex] = {
              ...updated[balancePayoutIndex],
              expenditure: balance.toFixed(2),
              receipts: '',
            };
          } else {
            updated[balancePayoutIndex] = {
              ...updated[balancePayoutIndex],
              expenditure: '',
              receipts: Math.abs(balance).toFixed(2),
            };
          }
        }
      }

      return updated;
    });
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
                  record.particular?.toLowerCase().includes('hst') ||
                    record.particular?.toLowerCase().includes('balance payout') ? (
                    record.expenditure ? (
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
                ) : record.particular?.toLowerCase().includes('balance payout') && record.receipts ? (
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
        {isLoading && renderLoadingState()}
        {error && renderErrorState()}
        {!isLoading && !error && records.length === 0 && renderEmptyState()}
        {!isLoading && !error && records.length > 0 && renderTable()}
      </div>
    </div>
  );
};

export default FinalSettlement;
