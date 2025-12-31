import { useQuery } from "@tanstack/react-query";
import { fetchInbox, fetchSent, fetchDraft, fetchTrash } from "../helpers";
import { formatDistanceToNow, isValid } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Mail, Star, Paperclip, RefreshCw, MoreVertical, Archive, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const formatRelativeTime = (dateStr) => {
  if (!dateStr) return "-";
  const dateObj = new Date(dateStr);
  return isValid(dateObj) ? formatDistanceToNow(dateObj, { addSuffix: true }) : "-";
};

const EmailList = ({ folder, accountId, onEmailSelect, onRefresh }) => {
  const [selectedEmails, setSelectedEmails] = useState([]);

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
      default:
        return fetchInbox;
    }
  };

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["emails", folder, accountId],
    queryFn: () => getFetchFunction()(1),
    enabled: !!accountId && !!folder,
  });

  // Handle API response structure: { ApiStatus: true, folder: "inbox", emails: [...] }
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

  const handleSelectEmail = (emailId, checked) => {
    if (checked) {
      setSelectedEmails([...selectedEmails, emailId]);
    } else {
      setSelectedEmails(selectedEmails.filter((id) => id !== emailId));
    }
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedEmails(emails.map((email) => email.id));
    } else {
      setSelectedEmails([]);
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
        <Checkbox
          checked={selectedEmails.length === emails.length && emails.length > 0}
          onCheckedChange={handleSelectAll}
        />
        {selectedEmails.length > 0 ? (
          <>
            <Button variant="ghost" size="icon" className="size-8">
              <Archive className="size-4" />
            </Button>
            <Button variant="ghost" size="icon" className="size-8">
              <Trash2 className="size-4" />
            </Button>
            <Button variant="ghost" size="icon" className="size-8">
              <MoreVertical className="size-4" />
            </Button>
            <span className="text-sm text-muted-foreground ml-2">
              {selectedEmails.length} selected
            </span>
          </>
        ) : (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={handleRefresh}
            >
              <RefreshCw className="size-4" />
            </Button>
            <Button variant="ghost" size="icon" className="size-8">
              <MoreVertical className="size-4" />
            </Button>
          </>
        )}
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
            const isSelected = selectedEmails.includes(email.id);
            const isUnread = folder === "inbox" && !email.read;
            return (
              <div
                key={email.id}
                onClick={() => handleEmailClick(email)}
                className={cn(
                  "flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors group",
                  isUnread
                    ? "bg-primary/5 hover:bg-primary/10"
                    : "hover:bg-accent/50",
                  isSelected && "bg-primary/10"
                )}
              >
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="mt-1"
                >
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={(checked) =>
                      handleSelectEmail(email.id, checked)
                    }
                  />
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    // Toggle star
                  }}
                  className="mt-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Star className={cn(
                    "size-5",
                    email.important || email.starred
                      ? "text-yellow-500 fill-yellow-500"
                      : "text-muted-foreground"
                  )} />
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span
                        className={cn(
                          "text-sm truncate",
                          isUnread ? "font-semibold" : "font-normal"
                        )}
                      >
                        {folder === "sent"
                          ? email.to || email.recipient || "No recipient"
                          : email.from || email.sender || "Unknown sender"}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">
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
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default EmailList;
