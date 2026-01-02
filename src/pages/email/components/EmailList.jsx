import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchInbox, fetchSent, fetchDraft, fetchTrash, trashEmail, starEmail } from "../helpers";
import { formatDistanceToNow, isValid } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

import { Button } from "@/components/ui/button";
import { Mail, Paperclip, RefreshCw, MoreVertical, Trash2, Star } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { fetchStarred } from "../helpers/fetchStarred";

const formatRelativeTime = (dateStr) => {
  if (!dateStr) return "-";
  const dateObj = new Date(dateStr);
  return isValid(dateObj) ? formatDistanceToNow(dateObj, { addSuffix: true }) : "-";
};

const parseAddress = (address) => {
  if (!address) return "";
  if (Array.isArray(address)) {
    const first = address[0];
    if (typeof first === "string") return first;
    if (typeof first === "object") return first.email || first.address || first.name || "";
    return "";
  }
  try {
    if (typeof address === "string" && (address.startsWith("[") || address.startsWith("{"))) {
      const parsed = JSON.parse(address);
      if (Array.isArray(parsed)) {
        const first = parsed[0];
        if (typeof first === "string") return first;
        if (typeof first === "object") return first.email || first.address || first.name || "";
      }
      if (typeof parsed === "object") return parsed.email || parsed.address || parsed.name || "";
    }
  } catch (e) {
  }
  return address;
};

const getInitials = (name) => {
  const cleanName = parseAddress(name);
  if (!cleanName) return "?";
  const parts = cleanName.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

const EmailList = ({ folder, accountId, onEmailSelect, onRefresh }) => {
  const queryClient = useQueryClient();
  const [emailToDelete, setEmailToDelete] = useState(null);

  const getFetchFunction = () => {
    switch (folder) {
      case "inbox":
        return fetchInbox;
      case "sent":
        return fetchSent;
      case "draft":
        return fetchDraft;
      case "trash":
        return fetchTrash;
      case "starred":
        return fetchStarred;
      default:
        return fetchInbox;
    }
  };

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["emails", folder, accountId],
    queryFn: () => getFetchFunction()(1),
    enabled: !!accountId && !!folder,
  });
  const emails = Array.isArray(data?.response?.emails)
    ? data.response.emails
    : Array.isArray(data?.response?.data)
      ? data.response.data
      : Array.isArray(data?.response)
        ? data.response
        : Array.isArray(data?.emails)
          ? data.emails
          : Array.isArray(data?.data)
            ? data.data
            : [];

  const handleEmailClick = (email) => {
    onEmailSelect(email);
  };

  const deleteMutation = useMutation({
    mutationFn: (emailId) => trashEmail(emailId),
    onSuccess: () => {
      queryClient.invalidateQueries(["emails", folder, accountId]);
      toast.success("Email moved to trash");
    },
    onError: (error) => {
      console.error("Error deleting email:", error);
      toast.error("Failed to delete email");
    },
  });

  const starMutation = useMutation({
    mutationFn: (emailId) => starEmail(emailId),
    onSuccess: () => {
      queryClient.invalidateQueries(["emails", folder, accountId]);
      toast.success("Email updated");
    },
    onError: (error) => {
      console.error("Error starring email:", error);
      toast.error("Failed to update star status");
    },
  });

  const handleStarEmail = (e, email) => {
    e.stopPropagation();
    starMutation.mutate(email.id);
  };

  const handleDeleteEmail = (e, email) => {
    e.stopPropagation();
    setEmailToDelete(email);
  };

  const confirmDelete = () => {
    if (emailToDelete) {
      deleteMutation.mutate(emailToDelete.id);
      setEmailToDelete(null);
    }
  };

  const handleRefresh = () => {
    refetch();
    onRefresh?.();
  };

  if (isLoading) {
    return (
      <div className="flex-1 overflow-y-auto bg-background">
        <div className="p-4 space-y-2">
          {[...Array(10)].map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-destructive mb-2">Error loading emails</p>
          <Button onClick={handleRefresh} variant="outline" size="sm">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (emails.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center">
          <Mail className="size-16 mx-auto text-muted-foreground mb-4 opacity-50" />
          <p className="text-muted-foreground text-lg">No emails in {folder}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-background">
      {/* Toolbar */}
      <div className="sticky top-0 z-10 bg-card border-b border-border px-4 py-2 flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="size-8"
          onClick={handleRefresh}
        >
          <RefreshCw className="size-4" />
        </Button>
        <div className="ml-auto text-sm text-muted-foreground">
          {data?.response?.pagination
            ? `${data.response.pagination.from}-${data.response.pagination.to} of ${data.response.pagination.total}`
            : `1-${emails.length} of ${emails.length}`}
        </div>
      </div>

      {/* Email List */}
      <div className="flex-1 overflow-y-auto">
        <div className="divide-y divide-border">
          {emails.map((email) => {
            const isUnread = email.is_read === false;
            return (
              <div
                key={email.id}
                onClick={() => handleEmailClick(email)}
                className={cn(
                  "flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors group relative",
                  isUnread
                    ? "bg-blue-50/40 hover:bg-blue-50/60"
                    : "hover:bg-accent/50"
                )}
              >
                {/* Unread Indicator Bar */}
                {isUnread && (
                  <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-blue-500" />
                )}

                {/* Avatar */}
                <Avatar className="size-10 shrink-0">
                  <AvatarFallback className={cn(
                    "text-sm font-medium",
                    isUnread ? "bg-blue-50 text-blue-500" : "bg-primary/10 text-primary"
                  )}>
                    {getInitials(
                      folder === "sent"
                        ? email.to || email.recipient
                        : email.from || email.sender
                    )}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      {isUnread && <div className="size-2 rounded-full bg-blue-500 shrink-0" />}
                      <span
                        className={cn(
                          "text-sm truncate",
                          isUnread ? "font-semibold text-foreground" : "font-medium text-muted-foreground/80"
                        )}
                      >
                        {parseAddress(
                          folder === "sent"
                            ? email.to || email.recipient || "No recipient"
                            : email.from || email.sender || "Unknown sender"
                        )}
                      </span>
                    </div>
                    <span className={cn(
                      "text-xs shrink-0",
                      isUnread ? "font-medium text-blue-500" : "text-muted-foreground"
                    )}>
                      {formatRelativeTime(email.created_at)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "text-sm truncate flex-1",
                        isUnread ? "font-medium text-foreground" : "text-muted-foreground"
                      )}
                    >
                      {email.subject || "(No Subject)"}
                    </span>
                    {email.attachments && Array.isArray(email.attachments) && email.attachments.length > 0 && (
                      <Paperclip className="size-4 text-muted-foreground shrink-0" />
                    )}
                  </div>

                  {(() => {
                    // Extract snippet from HTML body if no snippet field
                    const getSnippet = (body) => {
                      if (!body) return "";
                      const text = body.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();
                      return text.length > 100 ? text.substring(0, 100) + "..." : text;
                    };
                    const snippet = email.snippet || getSnippet(email.body);
                    return snippet ? (
                      <p className="text-xs text-muted-foreground truncate mt-1">
                        {snippet}
                      </p>
                    ) : null;
                  })()}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    onClick={(e) => handleStarEmail(e, email)}
                    disabled={starMutation.isPending}
                  >
                    <Star className={cn(
                      "size-4",
                      email.is_starred ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground hover:text-yellow-400"
                    )} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    onClick={(e) => handleDeleteEmail(e, email)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="size-4 text-muted-foreground hover:text-destructive" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Dialog open={!!emailToDelete} onOpenChange={(open) => !open && setEmailToDelete(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Move to Trash</DialogTitle>
            <DialogDescription>
              Are you sure you want to move {emailToDelete?.subject ? `"${emailToDelete.subject}"` : "this email"} to trash? This action can be undone from the trash folder.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setEmailToDelete(null)}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Moving..." : "Move to Trash"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmailList;
