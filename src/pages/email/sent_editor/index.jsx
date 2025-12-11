import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Send, Plus, Loader2, X, Paperclip } from "lucide-react";
import { Navbar2 } from "@/components/navbar2";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { fetchSent } from "../helpers/fetchSent";
import { fetchEmailById } from "../helpers/fetchEmailById";
import { createEmail } from "../helpers/createEmail";

const Sent = () => {
  const [selectedEmailId, setSelectedEmailId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [showCcBcc, setShowCcBcc] = useState(false);

  const queryClient = useQueryClient();
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["sent", currentPage],
    queryFn: () => fetchSent(currentPage),
    keepPreviousData: true,
  });

  const emails = data?.emails || [];
  const pagination = data?.pagination || {
    current_page: 1,
    per_page: 30,
    total: 0,
    last_page: 1,
  };
  const {
    data: emailDetails,
    isLoading: isLoadingDetails,
    error: detailsError,
    refetch: refetchEmailDetails,
  } = useQuery({
    queryKey: ["sent-email", selectedEmailId],
    queryFn: () => fetchEmailById(selectedEmailId),
    enabled: !!selectedEmailId && isViewDialogOpen,
  });

  const handleEmailClick = (email) => {
    setSelectedEmailId(email.id);
    setIsViewDialogOpen(true);
  };

  const handleCloseViewDialog = () => {
    setIsViewDialogOpen(false);
    setSelectedEmailId(null);
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= pagination.last_page) {
      setCurrentPage(page);
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    }

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

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

  const removeAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
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
            Failed to load sent emails
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
            <Send className="h-5 w-5 text-gray-700" />
            <h1 className="text-xl font-medium text-gray-900">Sent</h1>
            {emails.length > 0 && (
              <span className="text-sm text-gray-600">{pagination.total}</span>
            )}
          </div>
          <Button
            className="gap-2 bg-blue-600 hover:bg-blue-700"
            onClick={openCompose}
          >
            <Plus className="h-4 w-4" />
            Compose
          </Button>
        </div>

        {/* List */}
        {emails.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <Send className="h-24 w-24 text-gray-300" />
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2 text-gray-900">
                No sent emails
              </h2>
              <p className="text-gray-600 mb-4">
                You haven't sent any emails yet.
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
                      <div className="flex-1 min-w-0 flex items-center gap-4">
                        <div className="w-48 flex-shrink-0">
                          <p className="text-sm text-gray-900 truncate font-normal">
                            To:{" "}
                            {email.name ||
                              email.recipient ||
                              email.to ||
                              "Unknown"}
                          </p>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900 truncate">
                            <span
                              className={email.hasError ? "text-red-600" : ""}
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
                              email.timestamp || email.date || email.sent_at
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

            {/* Pagination */}
            {pagination.last_page > 1 && (
              <div className="border-t border-gray-200 p-4 bg-white">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => handlePageChange(currentPage - 1)}
                        className={
                          currentPage === 1
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer"
                        }
                      />
                    </PaginationItem>

                    <PaginationItem>
                      <PaginationLink isActive>{currentPage}</PaginationLink>
                    </PaginationItem>

                    <PaginationItem>
                      <span className="px-2 text-sm text-gray-600">
                        of {pagination.last_page}
                      </span>
                    </PaginationItem>

                    <PaginationItem>
                      <PaginationNext
                        onClick={() => handlePageChange(currentPage + 1)}
                        className={
                          currentPage === pagination.last_page
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer"
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>

                <div className="text-center text-xs text-gray-600 mt-2">
                  {pagination.total} emails
                </div>
              </div>
            )}
          </>
        )}
      </div>
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
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
                onClick={handleCloseViewDialog}
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
              <Button onClick={() => refetchEmailDetails()}>Retry</Button>
            </div>
          ) : (
            <ScrollArea className="max-h-[60vh]">
              <div className="space-y-4">
                <div className="space-y-2 border-b pb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium text-gray-700">To:</span>
                    <span className="text-gray-900">
                      {emailDetails?.recipient || emailDetails?.to || "Unknown"}
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
      <Dialog open={isComposeOpen} onOpenChange={setIsComposeOpen}>
        <DialogContent className="!max-w-4xl w-full max-h-[90vh] p- overflow-hidden">
          <div className="flex flex-col h-full">
            <DialogHeader className="px-6 pt-4 pb-2 border-b">
              <div className="flex items-start justify-between">
                <DialogTitle className="text-xl font-semibold">
                  Compose Email
                </DialogTitle>
                {/* <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsComposeOpen(false)}
                  className="h-6 w-6"
                >
                  <X className="h-4 w-4" />
                </Button> */}
              </div>
            </DialogHeader>
            <ScrollArea className="flex-1 px-6 py-4">
              <form
                id="compose-form"
                onSubmit={handleSubmit(onComposeSubmit)}
                className="space-y-4"
              >
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
                        document.getElementById("attachments").click()
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
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            onClick={() => removeAttachment(index)}
                            className="h-5 w-5"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </form>
            </ScrollArea>

            {/* Sticky footer actions */}
            <div className="border-t px-6 py-3 flex items-center gap-2 justify-end">
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

export default Sent;
