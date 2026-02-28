import { useQuery } from "@tanstack/react-query";
import { fetchEmailById, fetchThreadView, deleteEmail, moveEmail, trashEmail, starEmail, linkEmailToLabel, unlinkEmailFromLabel, fetchLabels } from "../helpers";
import { format, isValid } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Trash2,
  Reply,
  Paperclip,
  Move,
  Star,
  Tag,
  Unlink,
  Download,
  Eye,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import ComposeEmail from "./ComposeEmail";
import { cn } from "@/lib/utils";

const safeFormat = (dateStr, formatStr) => {
  if (!dateStr) return "-";
  const dateObj = new Date(dateStr);
  return isValid(dateObj) ? format(dateObj, formatStr) : "-";
};

const EmailDetail = ({ email, onBack, onDelete, onMove, onReply, accounts, defaultAccount, selectedFolder }) => {
  console.log("selectedFolder >>>>>>>>>>>>>>>>>>>>>>>>>>>", selectedFolder);
  const queryClient = useQueryClient();
  const emailId = email?.id;

  const { data: emailData, isLoading } = useQuery({
    queryKey: ["email", emailId],
    queryFn: () => fetchEmailById(emailId),
    enabled: !!emailId,
    initialData: email,
  });

  const [isTrashDialogOpen, setIsTrashDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isMoveDialogOpen, setIsMoveDialogOpen] = useState(false);
  const [fileNo, setFileNo] = useState("");
  const [isReplying, setIsReplying] = useState(false);
  const [replyInitialData, setReplyInitialData] = useState(null);

  const emailDetail = emailData?.response?.data || emailData || email;

  // Download attachment function
  const downloadAttachment = async (attachment) => {
    try {
      const response = await fetch(attachment.path);
      if (!response.ok) throw new Error('Download failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = attachment.file_name || attachment.original_name || `attachment_${attachment.id}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success(`Downloaded ${attachment.file_name || 'attachment'}`);
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Failed to download attachment');
    }
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${Math.round(size * 100) / 100} ${units[unitIndex]}`;
  };

  const handleReply = () => {
    if (!emailDetail) return;

    const parseEmails = (str) => {
      if (!str) return [];
      try {
        if (typeof str === "string" && str.startsWith("[")) {
          return JSON.parse(str);
        }
        if (Array.isArray(str)) return str;
        return str.split(",").map(e => e.trim()).filter(Boolean);
      } catch (e) {
        return [str];
      }
    };

    const fromEmail = emailDetail.from || emailDetail.sender;
    const toEmails = parseEmails(emailDetail.to);
    const ccEmails = parseEmails(emailDetail.cc);
    const bccEmails = parseEmails(emailDetail.bcc);

    setReplyInitialData({
      to: emailDetail.folder === "sent" ? parseEmails(emailDetail.to) : [fromEmail],
      cc: ccEmails,
      bcc: bccEmails,
      subject: emailDetail.subject?.trim().toLowerCase().startsWith("re:") ? emailDetail.subject : `Re: ${emailDetail.subject}`,
      body: ``,
    });
    setIsReplying(true);
  };

  const deleteMutation = useMutation({
    mutationFn: deleteEmail,
    onSuccess: () => {
      toast.success("Email deleted successfully");
      onDelete(emailDetail.id);
    },
    onError: () => {
      toast.error("Failed to delete email");
    },
  });

  const trashMutation = useMutation({
    mutationFn: trashEmail,
    onSuccess: () => {
      toast.success("Email moved to trash");
      queryClient.invalidateQueries(["emails"]);
      onBack();
    },
    onError: () => {
      toast.error("Failed to move email to trash");
    },
  });

  const moveMutation = useMutation({
    mutationFn: (data) => moveEmail(data),
    onSuccess: () => {
      toast.success("Email moved successfully");
      queryClient.invalidateQueries(["emails"]);
      onMove(emailDetail.id, "archive");
    },
    onError: () => {
      toast.error("Failed to move email");
    },
  });

  const starMutation = useMutation({
    mutationFn: (emailId) => starEmail(emailId),
    onSuccess: () => {
      queryClient.invalidateQueries(["emails"]);
      queryClient.invalidateQueries(["email", emailId]);
      toast.success("Updated star status");
    },
    onError: (error) => {
      console.error("Error starring email:", error);
      toast.error("Failed to update star status");
    },
  });

  const handleStarEmail = () => {
    starMutation.mutate(emailDetail.id);
  };

  const { data: labelsData } = useQuery({
    queryKey: ["labels", defaultAccount?.id],
    queryFn: () => fetchLabels({ account_id: defaultAccount?.id }),
    enabled: !!defaultAccount?.id,
  });

  const linkLabelMutation = useMutation({
    mutationFn: (labelId) => linkEmailToLabel({
      label_id: labelId,
      email_id: emailDetail.id
    }),
    onSuccess: () => {
      toast.success("Label linked successfully");
      queryClient.invalidateQueries(["emails"]);
      queryClient.invalidateQueries(["email", emailId]);
      onBack();
    },
    onError: () => {
      toast.error("Failed to link label");
    },
  });

  const handleLabelClick = (labelId) => {
    linkLabelMutation.mutate(labelId);
  };

  const unlinkLabelMutation = useMutation({
    mutationFn: (labelId) => unlinkEmailFromLabel({
      label_id: labelId,
      email_id: emailDetail.id
    }),
    onSuccess: () => {
      toast.success("Label unlinked successfully");
      queryClient.invalidateQueries(["emails"]);
      queryClient.invalidateQueries(["email", emailId]);
      onBack();
    },
    onError: () => {
      toast.error("Failed to unlink label");
    },
  });

  const isLabelView = selectedFolder && !["inbox", "sent", "draft", "trash", "starred"].includes(selectedFolder);
  const currentLabel = isLabelView ? labelsData?.response?.labels?.find(l => l.id === selectedFolder) : null;

  const confirmDelete = () => {
    deleteMutation.mutate(emailDetail.id);
    setIsDeleteDialogOpen(false);
  };

  const handleTrash = () => {
    setIsTrashDialogOpen(true);
  };

  const confirmTrash = () => {
    trashMutation.mutate(emailDetail.id);
    setIsTrashDialogOpen(false);
  };

  const handleMove = () => {
    setIsMoveDialogOpen(true);
  };

  const confirmMove = () => {
    if (!fileNo.trim()) {
      toast.error("Please enter a File Number");
      return;
    }
    const parsedFileNo = isNaN(Number(fileNo)) ? fileNo : Number(fileNo);
    const emailId = emailDetail.id;
    moveMutation.mutate({
      fileNo: parsedFileNo,
      emailId: emailId,
    });
    setIsMoveDialogOpen(false);
    setFileNo("");
  };

  if (isLoading && !emailDetail) {
    return (
      <div className="flex-1 overflow-y-auto p-6">
        <Skeleton className="h-8 w-32 mb-4" />
        <Skeleton className="h-6 w-full mb-2" />
        <Skeleton className="h-6 w-3/4 mb-4" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card p-4">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="size-4" />
          </Button>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleStarEmail}
              disabled={starMutation.isPending}
            >
              <Star className={cn(
                "size-4",
                emailDetail.is_starred ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground hover:text-yellow-400"
              )} />
            </Button>
            {isLabelView && currentLabel ? (
              <Button
                variant="ghost"
                size="icon"
                title={`Unlink from ${currentLabel.name}`}
                onClick={() => unlinkLabelMutation.mutate(currentLabel.id)}
                disabled={unlinkLabelMutation.isPending}
              >
                <Unlink className="size-4" />
              </Button>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" title="Labels">
                    <Tag className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {labelsData?.response?.labels?.map((label) => (
                    <DropdownMenuItem
                      key={label.id}
                      onClick={() => handleLabelClick(label.id)}
                    >
                      {label.name}
                    </DropdownMenuItem>
                  ))}
                  {!labelsData?.response?.labels?.length && (
                    <DropdownMenuItem disabled>No labels found</DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleTrash}
              disabled={trashMutation.isPending || deleteMutation.isPending}
            >
              <Trash2 className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleMove}
              disabled={trashMutation.isPending || deleteMutation.isPending || moveMutation.isPending}
            >
              <Move className="size-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-semibold">
            {emailDetail.subject || "(No Subject)"}
          </h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div>
              <span className="font-medium">From: </span>
              {emailDetail.from || emailDetail.sender || "-"}
            </div>
            <div>
              <span className="font-medium">To: </span>
              {emailDetail.to.startsWith("[") ? JSON.parse(emailDetail.to).join(", ") : emailDetail.to}
            </div>
            <div>
              <span className="font-medium">Date: </span>
              {safeFormat(
                emailDetail.created_at || emailDetail.date,
                "PPpp"
              )}
            </div>
          </div>
          {emailDetail.cc && (
            <div className="text-sm text-muted-foreground">
              <span className="font-medium">CC: </span>
              {emailDetail.cc}
            </div>
          )}
          {emailDetail.bcc && (
            <div className="text-sm text-muted-foreground">
              <span className="font-medium">BCC: </span>
              {emailDetail.bcc}
            </div>
          )}
        </div>
      </div>

      <div className="border-b border-border bg-card px-4 py-2 flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={handleReply}>
          <Reply className="size-4 mr-2" />
          Reply
        </Button>
      </div>

      {emailDetail.attachments && emailDetail.attachments.length > 0 && (
        <div className="border-b border-border bg-card px-4 py-3">
          <div className="flex items-center gap-2 text-sm mb-3">
            <Paperclip className="size-4 text-muted-foreground" />
            <span className="font-medium">
              {emailDetail.attachments.length} Attachment{emailDetail.attachments.length > 1 ? 's' : ''}
            </span>
          </div>
          <div className="space-y-2">
            {emailDetail.attachments.map((attachment, index) => (
              <div
                key={attachment.id || index}
                className="flex items-center justify-between gap-3 p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded flex items-center justify-center">
                    <Paperclip className="size-4 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-sm truncate">
                      {attachment.file_name || attachment.original_name || `Attachment ${index + 1}`}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {attachment.mime_type} • {formatFileSize(attachment.file_size)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(attachment.path, '_blank')}
                    className="h-8 px-2"
                    title="View attachment"
                  >
                    <Eye className="size-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => downloadAttachment(attachment)}
                    className="h-8 px-2"
                    title="Download attachment"
                  >
                    <Download className="size-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col">
        <div
          className="prose prose-sm max-w-none dark:prose-invert flex-1"
          dangerouslySetInnerHTML={{
            __html: emailDetail.body || emailDetail.content || emailDetail.text || "",
          }}
        />

        {isReplying && (
          <div className="mt-8 border-t border-border pt-4">
            <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground px-4">
              <Reply className="size-4" />
              <span>Replying to {emailDetail.from || emailDetail.sender}</span>
            </div>
            <ComposeEmail
              variant="inline"
              open={isReplying}
              onClose={() => setIsReplying(false)}
              initialData={replyInitialData}
              accounts={accounts}
              defaultAccount={defaultAccount}
              onSuccess={() => {
                setIsReplying(false);
                queryClient.invalidateQueries(["emails"]);
              }}
            />
          </div>
        )}
      </div>

      <div className="px-6 py-4 border-t border-border bg-card">
        {!isReplying && (
          <Button variant="outline" className="gap-2" onClick={handleReply}>
            <Reply className="size-4" />
            Reply
          </Button>
        )}
      </div>
      <Dialog open={isTrashDialogOpen} onOpenChange={setIsTrashDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Move to Trash</DialogTitle>
            <DialogDescription>
              Are you sure you want to move {emailDetail?.subject ? `"${emailDetail.subject}"` : "this email"} to trash? This action can be undone from the trash folder.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setIsTrashDialogOpen(false)}
              disabled={trashMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmTrash}
              disabled={trashMutation.isPending}
            >
              {trashMutation.isPending ? "Moving..." : "Move to Trash"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Permanently</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {emailDetail?.subject ? `"${emailDetail.subject}"` : "this email"} permanently? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete Permanently"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={isMoveDialogOpen} onOpenChange={setIsMoveDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Move Email</DialogTitle>
            <DialogDescription>
              Enter the File Number where you want to move this email.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="file_no">File Number</Label>
              <Input
                id="file_no"
                placeholder="Enter file number..."
                value={fileNo}
                onChange={(e) => setFileNo(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") confirmMove();
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsMoveDialogOpen(false)}
              disabled={moveMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmMove}
              disabled={moveMutation.isPending}
            >
              {moveMutation.isPending ? "Moving..." : "Move"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmailDetail;

