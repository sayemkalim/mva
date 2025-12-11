// src/pages/Draft.jsx  (pure React + JSX)
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
import { FileEdit, Loader2, X } from "lucide-react";
import { Navbar2 } from "@/components/navbar2";
import { fetchEmailById } from "../helpers/fetchEmailById";
import { fetchDraft } from "../helpers/fetchDraft";

const Draft = () => {
  const [selectedEmailId, setSelectedEmailId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["draft", currentPage],
    queryFn: () => fetchDraft(currentPage),
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
    queryKey: ["draft-email", selectedEmailId],
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
            Failed to load drafts
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
        <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <FileEdit className="h-5 w-5 text-gray-700" />
            <h1 className="text-xl font-medium text-gray-900">Drafts</h1>
            {emails.length > 0 && (
              <span className="text-sm text-gray-600">{pagination.total}</span>
            )}
          </div>
        </div>
        {emails.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <FileEdit className="h-24 w-24 text-gray-300" />
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2 text-gray-900">
                No drafts
              </h2>
              <p className="text-gray-600 mb-4">
                You don't have any draft emails saved.
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
                      {/* Row content */}
                      <div className="flex-1 min-w-0 flex items-center gap-4">
                        {/* To / recipient */}
                        <div className="w-48 flex-shrink-0">
                          <p className="text-sm text-gray-900 truncate font-normal">
                            {email.recipient || email.to || "No recipient"}
                          </p>
                        </div>

                        {/* Subject + preview */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900 truncate">
                            <span className="font-medium">
                              {email.subject || "(no subject)"}
                            </span>
                            {email.preview && (
                              <span className="text-gray-600 ml-2">
                                - {email.preview}
                              </span>
                            )}
                          </p>
                        </div>

                        {/* Last updated time */}
                        <div className="w-20 flex-shrink-0 text-right">
                          <span className="text-xs text-gray-600">
                            {formatTime(
                              email.timestamp ||
                                email.updated_at ||
                                email.created_at
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Separator */}
                    {index < emails.length - 1 && (
                      <div className="border-b border-gray-200" />
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Pagination footer */}
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

                    {pagination.last_page > 1 && (
                      <PaginationItem>
                        <span className="px-2 text-sm text-gray-600">
                          of {pagination.last_page}
                        </span>
                      </PaginationItem>
                    )}

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
                  {pagination.total} drafts
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Details dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <div className="flex items-start justify-between">
              <DialogTitle className="text-xl font-semibold">
                {isLoadingDetails
                  ? "Loading..."
                  : emailDetails?.subject || "(no subject)"}
              </DialogTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCloseDialog}
                className="h-6 w-6"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          {isLoadingDetails ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
            </div>
          ) : detailsError ? (
            <div className="text-center py-8">
              <p className="text-red-600 mb-4">
                {detailsError.message || "Failed to load draft details"}
              </p>
              <Button onClick={() => refetchEmailDetails()}>Retry</Button>
            </div>
          ) : (
            <ScrollArea className="max-h-[60vh]">
              <div className="space-y-4">
                {/* Header info */}
                <div className="space-y-2 border-b pb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium text-gray-700">To:</span>
                    <span className="text-gray-900">
                      {emailDetails?.recipient || emailDetails?.to || "Unknown"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium text-gray-700">
                      Last saved:
                    </span>
                    <span className="text-gray-900">
                      {emailDetails?.timestamp ||
                      emailDetails?.updated_at ||
                      emailDetails?.created_at
                        ? new Date(
                            emailDetails.timestamp ||
                              emailDetails.updated_at ||
                              emailDetails.created_at
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
    </>
  );
};

export default Draft;
