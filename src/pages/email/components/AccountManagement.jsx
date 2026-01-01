import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trash2, Plus, X, ChevronDown, ChevronUp } from "lucide-react";
import {
  createAccount,
  unlinkAccount,
} from "../helpers";
import { toast } from "sonner";
import { CustomDialog } from "@/components/custom_dialog";

const AccountManagement = ({
  open,
  onClose,
  accounts: accountsProp,
  defaultAccount,
  onAccountAdded,
  onAccountDeleted,
}) => {
  const accounts = Array.isArray(accountsProp) ? accountsProp : [];
  const queryClient = useQueryClient();
  const [isAddingAccount, setIsAddingAccount] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    imap_host: "",
    imap_port: 993,
    imap_encryption: "ssl",
    smtp_host: "",
    smtp_port: 587,
    smtp_encryption: "tls",
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState(null);

  const createMutation = useMutation({
    mutationFn: createAccount,
    onSuccess: () => {
      toast.success("Account added successfully");
      queryClient.invalidateQueries(["emailAccounts"]);
      onAccountAdded?.();
      setIsAddingAccount(false);
      setShowAdvanced(false);
      setFormData({
        email: "",
        password: "",
        imap_host: "",
        imap_port: 993,
        imap_encryption: "ssl",
        smtp_host: "",
        smtp_port: 587,
        smtp_encryption: "tls",
      });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to add account");
    },
  });


  const unlinkMutation = useMutation({
    mutationFn: unlinkAccount,
    onSuccess: () => {
      toast.success("Account unlinked successfully");
      queryClient.invalidateQueries(["emailAccounts"]);
      queryClient.invalidateQueries(["defaultAccount"]);
      onAccountDeleted?.();
      setDeleteDialogOpen(false);
      setAccountToDelete(null);
    },
    onError: () => {
      toast.error("Failed to unlink account");
    },
  });

  const handleAddAccount = (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast.error("Please fill in email and password");
      return;
    }
    if (!formData.imap_host || !formData.smtp_host) {
      toast.error("Please fill in IMAP and SMTP host");
      return;
    }

    // Prepare payload according to API structure
    const payload = {
      email: formData.email,
      password: formData.password,
      imap_host: formData.imap_host,
      imap_port: Number(formData.imap_port),
      imap_encryption: formData.imap_encryption,
      smtp_host: formData.smtp_host,
      smtp_port: Number(formData.smtp_port),
      smtp_encryption: formData.smtp_encryption,
    };

    createMutation.mutate(payload);
  };


  const handleDeleteClick = (account) => {
    setAccountToDelete(account);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (accountToDelete) {
      unlinkMutation.mutate(accountToDelete.id);
    }
  };

  const resetForm = () => {
    setFormData({
      email: "",
      password: "",
      imap_host: "",
      imap_port: 993,
      imap_encryption: "ssl",
      smtp_host: "",
      smtp_port: 587,
      smtp_encryption: "tls",
    });
    setShowAdvanced(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col" >
          <DialogHeader>
            <DialogTitle>Manage Email Accounts</DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-4">
            {isAddingAccount ? (
              <div className="border border-border rounded-lg p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Add New Account</h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setIsAddingAccount(false);
                      resetForm();
                    }}
                  >
                    <X className="size-4" />
                  </Button>
                </div>
                <form onSubmit={handleAddAccount} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">
                        Email <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                        placeholder="your.email@example.com"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="password">
                        Password <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            password: e.target.value,
                          }))
                        }
                        placeholder="Enter password"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={() => setShowAdvanced(!showAdvanced)}
                      className="flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      {showAdvanced ? (
                        <>
                          <ChevronUp className="size-4" />
                          Hide IMAP/SMTP Settings
                        </>
                      ) : (
                        <>
                          <ChevronDown className="size-4" />
                          Show IMAP/SMTP Settings
                        </>
                      )}
                    </button>
                  </div>

                  {showAdvanced && (
                    <div className="space-y-4 pt-4 border-t border-border">
                      <div>
                        <h4 className="font-medium mb-3">IMAP Settings</h4>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="col-span-2">
                            <Label htmlFor="imap_host">
                              IMAP Host <span className="text-destructive">*</span>
                            </Label>
                            <Input
                              id="imap_host"
                              value={formData.imap_host}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  imap_host: e.target.value,
                                }))
                              }
                              placeholder="mail.example.com"
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="imap_port">IMAP Port</Label>
                            <Input
                              id="imap_port"
                              type="number"
                              value={formData.imap_port}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  imap_port: parseInt(e.target.value) || 993,
                                }))
                              }
                              required
                            />
                          </div>
                        </div>
                        <div className="mt-2">
                          <Label htmlFor="imap_encryption">IMAP Encryption</Label>
                          <Select
                            value={formData.imap_encryption}
                            onValueChange={(value) =>
                              setFormData((prev) => ({
                                ...prev,
                                imap_encryption: value,
                              }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ssl">SSL</SelectItem>
                              <SelectItem value="tls">TLS</SelectItem>
                              <SelectItem value="none">None</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-3">SMTP Settings</h4>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="col-span-2">
                            <Label htmlFor="smtp_host">
                              SMTP Host <span className="text-destructive">*</span>
                            </Label>
                            <Input
                              id="smtp_host"
                              value={formData.smtp_host}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  smtp_host: e.target.value,
                                }))
                              }
                              placeholder="mail.example.com"
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="smtp_port">SMTP Port</Label>
                            <Input
                              id="smtp_port"
                              type="number"
                              value={formData.smtp_port}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  smtp_port: parseInt(e.target.value) || 587,
                                }))
                              }
                              required
                            />
                          </div>
                        </div>
                        <div className="mt-2">
                          <Label htmlFor="smtp_encryption">SMTP Encryption</Label>
                          <Select
                            value={formData.smtp_encryption}
                            onValueChange={(value) =>
                              setFormData((prev) => ({
                                ...prev,
                                smtp_encryption: value,
                              }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ssl">SSL</SelectItem>
                              <SelectItem value="tls">TLS</SelectItem>
                              <SelectItem value="none">None</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 pt-4">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        setIsAddingAccount(false);
                        resetForm();
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={createMutation.isPending}
                    >
                      {createMutation.isPending ? "Adding..." : "Add Account"}
                    </Button>
                  </div>
                </form>
              </div>
            ) : (
              <Button
                onClick={() => setIsAddingAccount(true)}
                className="w-full gap-2"
              >
                <Plus className="size-4" />
                Add New Account
              </Button>
            )}

            {/* Accounts List */}
            <div className="border border-border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>IMAP Host</TableHead>
                    <TableHead>SMTP Host</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accounts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8">
                        No accounts added yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    accounts.map((account) => (
                      <TableRow key={account.id}>
                        <TableCell className="font-medium">
                          {account.email}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {account.imap_host || "-"}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {account.smtp_host || "-"}
                        </TableCell>

                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteClick(account)}
                            disabled={defaultAccount?.id === account.id}
                          >
                            <Trash2 className="size-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-border">
            <Button onClick={onClose}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>

      <CustomDialog
        onOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setAccountToDelete(null);
        }}
        title={accountToDelete?.email}
        modalType="Delete"
        onDelete={handleDeleteConfirm}
        id={accountToDelete?.id}
        isLoading={unlinkMutation.isPending}
      />
    </>
  );
};

export default AccountManagement;
