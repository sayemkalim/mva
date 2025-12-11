import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Inbox as InboxIcon,
  Plus,
  Loader2,
  Mail,
  MailOpen,
  X,
  Send,
  Paperclip,
} from "lucide-react";
import { Navbar2 } from "@/components/navbar2";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { fetchInbox } from "../helpers/fetchInbox";
import { fetchEmailById } from "../helpers/fetchEmailById";
import { createEmail } from "../helpers/createEmail";

const Inbox = () => {
  const [selectedEmailId, setSelectedEmailId] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Compose dialog states
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [showCcBcc, setShowCcBcc] = useState(false);

  const queryClient = useQueryClient();

  // Inbox list
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["inbox"],
    queryFn: () => fetchInbox(1),
  });

  const emails = data?.emails || [];
  const pagination = data?.pagination || {
    total: 0,
    current_page: 1,
    last_page: 1,
  };

  // Single email details
  const {
    data: emailDetails,
    isLoading: isLoadingDetails,
    error: detailsError,
  } = useQuery({
    queryKey: ["inbox-email", selectedEmailId],
    queryFn: () => fetchEmailById(selectedEmailId),
    enabled: !!selectedEmailId && isDialogOpen,
  });

  const handleEmailClick = (email) => {
    setSelectedEmailId(email.id);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedEmailId(null);
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    if (diffInHours < 24) {
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    }
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  // Compose form
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      to: "",
      cc: "",
      bcc: "",
      subject: "",
      body: "",
    },
  });

  const createEmailMutation = useMutation({
    mutationFn: createEmail,
    onSuccess: () => {
      // Inbox + sent invalidate (agar sent bhi same query key se aa raha ho)
      queryClient.invalidateQueries({ queryKey: ["inbox"] });
      queryClient.invalidateQueries({ queryKey: ["sent"] });
      reset();
      setAttachments([]);
      setShowCcBcc(false);
      setIsComposeOpen(false);
    },
  });

  const onComposeSubmit = (formData) => {
    const emailData = {
      ...formData,
      attachments,
    };
    createEmailMutation.mutate(emailData);
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    setAttachments((prev) => [...prev, ...files]);
  };

  const openCompose = () => {
    reset();
    setAttachments([]);
    setShowCcBcc(false);
    setIsComposeOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4 bg-white">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2 text-red-600">
            Failed to load inbox
          </h2>
          <p className="text-gray-600 mb-4">
            {error.message || "Something went wrong"}
          </p>
          <Button onClick={() => refetch()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col h-screen bg-white">
        <Navbar2 />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <InboxIcon className="h-5 w-5 text-gray-700" />
            <h1 className="text-xl font-medium text-gray-900">Inbox</h1>
            {emails.length > 0 && (
              <Badge variant="secondary">
                {emails.filter((e) => !e.isRead).length}
              </Badge>
            )}
          </div>
          <Button
            onClick={openCompose}
            className="gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Compose
          </Button>
        </div>

        {/* List */}
        {emails.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <InboxIcon className="h-24 w-24 text-gray-300" />
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2 text-gray-900">
                Your inbox is empty
              </h2>
              <p className="text-gray-600 mb-4">
                No messages here. Start by creating a new email.
              </p>
            </div>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1">
              <div>
                {emails.map((email, index) => (
                  <div key={email.id}>
                    <div
                      onClick={() => handleEmailClick(email)}
                      className="flex items-center gap-4 px-6 py-3 hover:shadow-sm cursor-pointer transition-all bg-white hover:bg-gray-50"
                    >
                      <div className="w-6 flex-shrink-0">
                        {email.isRead ? (
                          <Mail className="h-5 w-5 text-gray-400" />
                        ) : (
                          <MailOpen className="h-5 w-5 text-blue-600" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0 flex items-center gap-4">
                        <div className="w-48 flex-shrink-0">
                          <p
                            className={`text-sm truncate ${
                              !email.isRead ? "font-semibold" : "text-gray-900"
                            }`}
                          >
                            {email.sender || email.from || "Unknown Sender"}
                          </p>
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900 truncate">
                            <span
                              className={!email.isRead ? "font-semibold" : ""}
                            >
                              {email.subject || "(no subject)"}
                            </span>
                            {email.preview && (
                              <span className="text-gray-600 ml-2">
                                - {email.preview}
                              </span>
                            )}
                          </p>
                        </div>

                        <div className="w-20 flex-shrink-0 text-right">
                          <span className="text-xs text-gray-600">
                            {formatTime(
                              email.timestamp ||
                                email.date ||
                                email.sent_at ||
                                new Date()
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                    {index < emails.length - 1 && (
                      <div className="border-b border-gray-200" />
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="border-t border-gray-200 px-6 py-2 text-xs text-gray-600 flex items-center justify-between">
              <span>{pagination.total} messages</span>
              <span>
                Page {pagination.current_page} of {pagination.last_page}
              </span>
            </div>
          </>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <div className="flex items-start justify-between">
              <DialogTitle className="text-xl font-semibold">
                {isLoadingDetails
                  ? "Loading..."
                  : emailDetails?.subject || "(no subject)"}
              </DialogTitle>
              {/* <Button
                variant="ghost"
                size="icon"
                onClick={handleCloseDialog}
                className="h-6 w-6"
              >
                <X className="h-4 w-4" />
              </Button> */}
            </div>
          </DialogHeader>

          {isLoadingDetails ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
            </div>
          ) : detailsError ? (
            <div className="text-center py-8">
              <p className="text-red-600 mb-4">
                {detailsError.message || "Failed to load email details"}
              </p>
            </div>
          ) : (
            <ScrollArea className="max-h-[60vh]">
              <div className="space-y-4">
                <div className="space-y-2 border-b pb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium text-gray-700">From:</span>
                    <span className="text-gray-900">
                      {emailDetails?.sender || emailDetails?.from || "Unknown"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium text-gray-700">To:</span>
                    <span className="text-gray-900">
                      {emailDetails?.to || emailDetails?.recipient || "Unknown"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium text-gray-700">Date:</span>
                    <span className="text-gray-900">
                      {emailDetails?.timestamp || emailDetails?.date
                        ? new Date(
                            emailDetails.timestamp || emailDetails.date
                          ).toLocaleString()
                        : "Unknown"}
                    </span>
                  </div>
                </div>

                <div className="text-gray-900 whitespace-pre-wrap text-sm">
                  {emailDetails?.body ||
                    emailDetails?.content ||
                    emailDetails?.message ||
                    "No content available"}
                </div>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>

      {/* Compose dialog */}
      <Dialog open={isComposeOpen} onOpenChange={setIsComposeOpen}>
        <DialogContent className="!max-w-4xl w-full max-h-[90vh] p-0 overflow-hidden">
          <div className="flex flex-col h-full">
            {/* Header */}
            <DialogHeader className="px-6 pt-4 pb-2 border-b bg-muted/40">
              <div className="flex items-center justify-between">
                <DialogTitle className="text-lg font-semibold">
                  Compose Email
                </DialogTitle>
                {/* <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsComposeOpen(false)}
                  className="h-7 w-7"
                >
                  <X className="h-4 w-4" />
                </Button> */}
              </div>
            </DialogHeader>

            {/* Body */}
            <ScrollArea className="flex-1 px-6 py-4">
              <form
                id="compose-form"
                onSubmit={handleSubmit(onComposeSubmit)}
                className="space-y-4"
              >
                {/* To + Cc/Bcc toggle */}
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <Label htmlFor="to">To *</Label>
                      <Input
                        id="to"
                        type="email"
                        placeholder="recipient@example.com"
                        {...register("to", {
                          required: "To email is required",
                        })}
                        className={errors.to ? "border-red-500" : ""}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      className="mt-5 text-xs px-2 py-1 h-auto"
                      onClick={() => setShowCcBcc((prev) => !prev)}
                    >
                      {showCcBcc ? "Hide Cc/Bcc" : "Add Cc/Bcc"}
                    </Button>
                  </div>
                  {errors.to && (
                    <p className="text-xs text-red-600">{errors.to.message}</p>
                  )}
                </div>

                {showCcBcc && (
                  <>
                    <div className="space-y-1">
                      <Label htmlFor="cc">CC</Label>
                      <Input
                        id="cc"
                        type="email"
                        placeholder="cc@example.com"
                        {...register("cc")}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="bcc">BCC</Label>
                      <Input
                        id="bcc"
                        type="email"
                        placeholder="bcc@example.com"
                        {...register("bcc")}
                      />
                    </div>
                  </>
                )}

                {/* Subject */}
                <div className="space-y-1">
                  <Label htmlFor="subject">Subject *</Label>
                  <Input
                    id="subject"
                    type="text"
                    placeholder="Test"
                    {...register("subject", {
                      required: "Subject is required",
                    })}
                    className={errors.subject ? "border-red-500" : ""}
                  />
                  {errors.subject && (
                    <p className="text-xs text-red-600">
                      {errors.subject.message}
                    </p>
                  )}
                </div>

                {/* Body */}
                <div className="space-y-1">
                  <Label htmlFor="body">Body *</Label>
                  <Textarea
                    id="body"
                    rows={18}
                    placeholder="Hello message"
                    {...register("body", {
                      required: "Body is required",
                    })}
                    className={errors.body ? "border-red-500" : ""}
                  />
                  {errors.body && (
                    <p className="text-xs text-red-600">
                      {errors.body.message}
                    </p>
                  )}
                </div>

                {/* Attachments */}
                <div className="space-y-2">
                  <Label htmlFor="attachments">Attachments</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="attachments"
                      type="file"
                      multiple
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        document.getElementById("attachments")?.click()
                      }
                    >
                      <Paperclip className="h-4 w-4 mr-2" />
                      Select files
                    </Button>
                  </div>

                  {attachments.length > 0 && (
                    <div className="space-y-1 mt-2">
                      {attachments.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between rounded border bg-gray-50 px-2 py-1"
                        >
                          <span className="text-xs text-gray-800 truncate">
                            {file.name}
                          </span>
                          {/* Agar remove chahiye toh Sent jaisa button uncomment kar sakte ho */}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </form>
            </ScrollArea>

            {/* Footer actions */}
            <div className="border-t px-6 py-3 flex items-center gap-2 justify-end bg-white">
              <Button
                type="submit"
                form="compose-form"
                disabled={createEmailMutation.isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {createEmailMutation.isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsComposeOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Inbox;
