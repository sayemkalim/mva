import { useQuery } from "@tanstack/react-query";
import { fetchEmailById, fetchThreadView, deleteEmail, moveEmail, trashEmail } from "../helpers";
import { format, isValid } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Trash2,
  Archive,
  Reply,
  ReplyAll,
  Forward,
  MoreVertical,
  Paperclip,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const safeFormat = (dateStr, formatStr) => {
  if (!dateStr) return "-";
  const dateObj = new Date(dateStr);
  return isValid(dateObj) ? format(dateObj, formatStr) : "-";
};

const EmailDetail = ({ email, onBack, onDelete, onMove }) => {
  const queryClient = useQueryClient();
  const emailId = email?.id;

  const { data: emailData, isLoading } = useQuery({
    queryKey: ["email", emailId],
    queryFn: () => fetchEmailById(emailId),
    enabled: !!emailId,
    initialData: email,
  });

  const emailDetail = emailData?.response?.data || emailData || email;

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
    mutationFn: ({ emailId, folder }) => moveEmail(emailId, folder),
    onSuccess: () => {
      toast.success("Email moved successfully");
      queryClient.invalidateQueries(["emails"]);
      onMove(emailDetail.id, "archive");
    },
    onError: () => {
      toast.error("Failed to move email");
    },
  });

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this email?")) {
      deleteMutation.mutate(emailDetail.id);
    }
  };

  const handleTrash = () => {
    trashMutation.mutate(emailDetail.id);
  };

  const handleMove = (folder) => {
    moveMutation.mutate({ emailId: emailDetail.id, folder });
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
              onClick={handleTrash}
              disabled={trashMutation.isPending}
            >
              <Trash2 className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleMove("archive")}
              disabled={moveMutation.isPending}
            >
              <Archive className="size-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleDelete}>
                  <Trash2 className="size-4 mr-2" />
                  Delete Permanently
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
              {emailDetail.to || emailDetail.recipient || "-"}
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

      {/* Actions */}
      <div className="border-b border-border bg-card px-4 py-2 flex items-center gap-2">
        <Button variant="ghost" size="sm">
          <Reply className="size-4 mr-2" />
          Reply
        </Button>
        <Button variant="ghost" size="sm">
          <ReplyAll className="size-4 mr-2" />
          Reply All
        </Button>
        <Button variant="ghost" size="sm">
          <Forward className="size-4 mr-2" />
          Forward
        </Button>
      </div>

      {/* Attachments */}
      {emailDetail.attachments && emailDetail.attachments.length > 0 && (
        <div className="border-b border-border bg-card px-4 py-2">
          <div className="flex items-center gap-2 text-sm">
            <Paperclip className="size-4 text-muted-foreground" />
            <span className="font-medium">Attachments:</span>
            <div className="flex gap-2">
              {emailDetail.attachments.map((attachment, index) => (
                <a
                  key={index}
                  href={attachment.path || attachment.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {attachment.name || attachment.original_name || `Attachment ${index + 1}`}
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-6">
        <div
          className="prose prose-sm max-w-none dark:prose-invert"
          dangerouslySetInnerHTML={{
            __html: emailDetail.body || emailDetail.content || emailDetail.text || "<p>No content</p>",
          }}
        />
      </div>
    </div>
  );
};

export default EmailDetail;

