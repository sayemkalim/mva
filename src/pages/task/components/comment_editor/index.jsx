import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Send,
  Upload,
  X,
  ArrowLeft,
  Loader2,
  Paperclip,
  Image as ImageIcon,
  Download,
  FileText,
  Smile,
  MoreVertical,
  Reply,
} from "lucide-react";
import { toast } from "sonner";
import { format, isToday, isYesterday, formatDistanceToNow } from "date-fns";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import Typography from "@/components/typography";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { fetchCommentById } from "../../helpers/fetchTaskById";
import { uploadAttachment } from "../../helpers/uploadAttachment";
import { deleteAttachment } from "../../helpers/deleteTask";
import { postComment } from "../../helpers/createTask";

const CommentPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  const scrollRef = useRef(null);
  const textareaRef = useRef(null);

  const [comment, setComment] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploadingFiles, setUploadingFiles] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);

  // Fetch comments
  const {
    data: commentsData,
    isLoading: isLoadingComments,
    error: commentsError,
  } = useQuery({
    queryKey: ["taskComments", id],
    queryFn: () => fetchCommentById(id),
    enabled: !!id,
  });

  const comments = commentsData || [];

  // Auto-scroll to bottom when new comments arrive
  useEffect(() => {
    if (scrollRef.current) {
      const scrollElement = scrollRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      );
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [comments]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [comment]);

  // Upload mutation
  const { mutate: uploadMutation } = useMutation({
    mutationFn: ({ file }) => uploadAttachment({ file }),
    onMutate: ({ file }) => {
      setUploadingFiles((prev) => [
        ...prev,
        { name: file.name, progress: true },
      ]);
    },
    onSuccess: (response, { file }) => {
      const attachmentId = response?.response?.attachment?.id;
      const fileName = response?.response?.attachment?.file_name || file.name;
      const filePath = response?.response?.attachment?.file_path;

      if (attachmentId) {
        setUploadedFiles((prev) => [
          ...prev,
          {
            id: attachmentId,
            name: fileName,
            url: filePath,
            type: file.type,
          },
        ]);
        toast.success(`${fileName} Successfully uploaded ✓`);
      }

      setUploadingFiles((prev) => prev.filter((f) => f.name !== file.name));
    },
    onError: (error, { file }) => {
      console.error("Upload error:", error);
      toast.error(`${file.name} Upload failed ❌`);
      setUploadingFiles((prev) => prev.filter((f) => f.name !== file.name));
    },
  });

  const { mutate: deleteAttachmentMutation } = useMutation({
    mutationFn: (attachmentId) => deleteAttachment(attachmentId),
    onSuccess: () => {
      toast.success("Attachment removed");
    },
    onError: (error) => {
      console.error("Delete error:", error);
      toast.error("Failed to remove attachment");
    },
  });

  const { mutate: postCommentMutation, isPending: isPosting } = useMutation({
    mutationFn: (data) => postComment(id, data),
    onSuccess: (response) => {
      toast.success("Comment posted ✓");
      setComment("");
      setUploadedFiles([]);
      setReplyingTo(null);
      queryClient.invalidateQueries(["taskComments", id]);
      queryClient.invalidateQueries(["taskList"]);
    },
    onError: (error) => {
      console.error("Comment error:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to post comment";
      toast.error(errorMessage);
    },
  });

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    files.forEach((file) => {
      uploadMutation({ file });
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveFile = (fileToRemove) => {
    deleteAttachmentMutation(fileToRemove.id);
    setUploadedFiles((prev) =>
      prev.filter((file) => file.id !== fileToRemove.id)
    );
  };

  const handleReplyClick = (commentItem) => {
    setReplyingTo({
      id: commentItem.id,
      userName: `${commentItem.user?.first_name || ""} ${
        commentItem.user?.last_name || ""
      }`.trim(),
      comment: commentItem.comment?.substring(0, 50) || "Attachment",
    });
    textareaRef.current?.focus();
  };

  const findCommentById = (commentId) => {
    return comments.find((c) => c.id === commentId);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!comment.trim() && uploadedFiles.length === 0) {
      toast.error("Please enter a comment or attach a file");
      return;
    }

    if (uploadingFiles.length > 0) {
      toast.error("Please wait for all files to finish uploading");
      return;
    }

    const payload = {
      comment: comment.trim() || null,
      attachment_ids: uploadedFiles.map((file) => file.id),
      parent_id: replyingTo?.id || null,
    };

    console.log("Sending payload:", payload); // Debug log
    postCommentMutation(payload);
  };

  const isUploading = uploadingFiles.length > 0;
  const canSubmit =
    (comment.trim() || uploadedFiles.length > 0) && !isUploading && !isPosting;

  const isImage = (mimeType) => {
    return mimeType?.startsWith("image/");
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase() || "U";
  };

  const formatTime = (date) => {
    const commentDate = new Date(date);
    if (isToday(commentDate)) {
      return format(commentDate, "hh:mm a");
    } else if (isYesterday(commentDate)) {
      return `Yesterday ${format(commentDate, "hh:mm a")}`;
    } else {
      return format(commentDate, "MMM dd, hh:mm a");
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      {/* Modern Header with Glass Effect */}
      <header className="flex-shrink-0 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800/60 sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <Typography
              variant="h3"
              className="text-lg font-bold text-slate-900 dark:text-slate-100"
            >
              Comments
            </Typography>
            <Typography variant="muted" className="text-xs text-slate-500">
              Task {id} • {comments.length}{" "}
              {comments.length === 1 ? "comment" : "comments"}
            </Typography>
          </div>
        </div>
      </header>

      {/* Comments Area with Better Spacing */}
      <ScrollArea ref={scrollRef} className="flex-1 overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-4 pb-6">
          {isLoadingComments ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="relative">
                <div className="h-16 w-16 rounded-full border-4 border-slate-200 dark:border-slate-800"></div>
                <div className="absolute top-0 h-16 w-16 rounded-full border-4 border-t-blue-500 dark:border-t-blue-400 animate-spin"></div>
              </div>
              <Typography variant="muted" className="mt-4 text-sm">
                Loading comments...
              </Typography>
            </div>
          ) : commentsError ? (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-50 dark:bg-red-950/20 mb-4">
                <X className="h-10 w-10 text-red-500" />
              </div>
              <Typography variant="h4" className="text-lg font-semibold mb-2">
                Failed to load comments
              </Typography>
              <Button
                variant="outline"
                onClick={() =>
                  queryClient.invalidateQueries(["taskComments", id])
                }
                className="mt-4"
              >
                Retry
              </Button>
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 mb-4">
                <Send className="h-10 w-10 text-blue-600 dark:text-blue-400" />
              </div>
              <Typography variant="h4" className="text-lg font-semibold mb-2">
                No comments yet
              </Typography>
              <Typography variant="muted" className="text-sm">
                Be the first to start the conversation!
              </Typography>
            </div>
          ) : (
            comments.map((commentItem, index) => {
              const parentComment = commentItem.parent_id
                ? findCommentById(commentItem.parent_id)
                : null;

              return (
                <div
                  key={commentItem.id}
                  className="group animate-in fade-in slide-in-from-bottom-2"
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  <div className="flex gap-3">
                    {/* Avatar Column */}
                    <Avatar className="h-10 w-10 ring-2 ring-white dark:ring-slate-900 shadow-md flex-shrink-0">
                      <AvatarImage
                        src={commentItem.user?.profile_picture}
                        alt={`${commentItem.user?.first_name} ${commentItem.user?.last_name}`}
                      />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm font-semibold">
                        {getInitials(
                          commentItem.user?.first_name,
                          commentItem.user?.last_name
                        )}
                      </AvatarFallback>
                    </Avatar>

                    {/* Content Column */}
                    <div className="flex-1 min-w-0">
                      {/* Header */}
                      <div className="flex items-center gap-2 mb-1">
                        <Typography className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                          {commentItem.user?.first_name}{" "}
                          {commentItem.user?.last_name}
                        </Typography>
                        {commentItem.user?.role && (
                          <Badge
                            variant="secondary"
                            className="text-xs px-2 py-0 h-5 rounded-md"
                          >
                            {commentItem.user.role}
                          </Badge>
                        )}
                        <Typography variant="muted" className="text-xs">
                          • {formatTime(commentItem.created_at)}
                        </Typography>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 ml-auto opacity-100"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleReplyClick(commentItem)}
                            >
                              <Reply className="h-4 w-4 mr-2" />
                              Reply
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {/* Reply Indicator */}
                      {parentComment && (
                        <div
                          className="flex items-start gap-2 mb-2 pb-2 border-l-4 border-blue-500 pl-3 bg-blue-50/50 dark:bg-blue-950/10 rounded-r-lg py-1.5 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-colors"
                          onClick={() => {
                            document
                              .getElementById(`comment-${parentComment.id}`)
                              ?.scrollIntoView({ behavior: "smooth" });
                          }}
                        >
                          <Reply className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <Typography className="text-xs font-semibold text-blue-700 dark:text-blue-300">
                              {parentComment.user?.first_name}{" "}
                              {parentComment.user?.last_name}
                            </Typography>
                            <Typography className="text-xs text-slate-600 dark:text-slate-400 line-clamp-1">
                              {parentComment.comment || "Attachment"}
                            </Typography>
                          </div>
                        </div>
                      )}

                      {/* Comment Bubble */}
                      {commentItem.comment && (
                        <div
                          id={`comment-${commentItem.id}`}
                          className="bg-slate-100 dark:bg-slate-800/50 rounded-2xl rounded-tl-sm px-4 py-2.5 mb-2 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                        >
                          <Typography className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                            {commentItem.comment}
                          </Typography>
                        </div>
                      )}

                      {/* Attachments */}
                      {commentItem.attachments &&
                        commentItem.attachments.length > 0 && (
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                            {commentItem.attachments.map((attachment) => (
                              <div key={attachment.id}>
                                {isImage(attachment.mime_type) ? (
                                  <div
                                    className="relative group/img cursor-pointer rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 hover:border-blue-400 hover:scale-[1.02] transition-all duration-200 shadow-sm hover:shadow-lg"
                                    onClick={() => setPreviewImage(attachment)}
                                  >
                                    <img
                                      src={attachment.path}
                                      alt={attachment.original_name}
                                      className="w-full h-32 object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                                      <ImageIcon className="h-8 w-8 text-white drop-shadow-lg" />
                                    </div>
                                  </div>
                                ) : (
                                  <a
                                    href={attachment.path}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2.5 p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-400 hover:shadow-md transition-all group/file"
                                  >
                                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/20 flex items-center justify-center">
                                      <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <Typography className="text-xs font-medium truncate text-slate-700 dark:text-slate-300">
                                        {attachment.original_name}.
                                        {attachment.extension}
                                      </Typography>
                                      <Typography
                                        variant="muted"
                                        className="text-xs"
                                      >
                                        {(attachment.size / 1024).toFixed(1)} KB
                                      </Typography>
                                    </div>
                                    <Download className="h-4 w-4 text-slate-400 group-hover/file:text-blue-600 transition-colors" />
                                  </a>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>

      {/* Modern Input Area */}
      <div className="flex-shrink-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200/60 dark:border-slate-800/60 shadow-2xl sticky bottom-0 z-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Upload Progress */}
            {uploadingFiles.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {uploadingFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 bg-blue-50 dark:bg-blue-950/20 rounded-lg px-3 py-2 text-sm border border-blue-200 dark:border-blue-800"
                  >
                    <Loader2 className="h-4 w-4 animate-spin text-blue-600 dark:text-blue-400" />
                    <span className="text-blue-700 dark:text-blue-300 font-medium truncate max-w-[150px]">
                      {file.name}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Uploaded Files */}
            {uploadedFiles.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {uploadedFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-lg px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 group"
                  >
                    <Paperclip className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                    <span className="text-slate-700 dark:text-slate-300 font-medium truncate max-w-[150px]">
                      {file.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(file)}
                      disabled={isPosting}
                      className="text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-full p-1 transition-all"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Reply Preview */}
            {replyingTo && (
              <div className="flex items-center justify-between gap-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-l-4 border-blue-500 px-4 py-3 rounded-r-lg animate-in slide-in-from-top-2 shadow-sm">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Reply className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <Typography className="text-xs font-bold text-blue-700 dark:text-blue-300">
                      Replying to {replyingTo.userName}
                    </Typography>
                  </div>
                  <Typography className="text-xs text-slate-600 dark:text-slate-400 truncate">
                    {replyingTo.comment}
                  </Typography>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setReplyingTo(null)}
                  className="h-8 w-8 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/30 flex-shrink-0"
                >
                  <X className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </Button>
              </div>
            )}

            {/* Input Box */}
            <div className="flex items-end gap-2">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                accept="image/*,.pdf,.doc,.docx"
              />

              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading || isPosting}
                className="rounded-xl h-11 w-11 border-2 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-all flex-shrink-0"
              >
                <Upload className="h-5 w-5" />
              </Button>

              <div className="flex-1 relative bg-slate-100 dark:bg-slate-800/50 rounded-2xl border-2 border-transparent focus-within:border-blue-400 focus-within:bg-white dark:focus-within:bg-slate-800 transition-all">
                <Textarea
                  ref={textareaRef}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Type your comment... (Shift + Enter for new line)"
                  rows={1}
                  className="resize-none border-0 bg-transparent min-h-[44px] max-h-[120px] px-4 py-3 text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
                  disabled={isPosting}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey && canSubmit) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                />
              </div>

              <Button
                type="submit"
                disabled={!canSubmit}
                className="rounded-xl h-11 w-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 flex-shrink-0"
                size="icon"
              >
                {isPosting ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Image Preview Dialog */}
      <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="text-lg truncate pr-8">
              {previewImage?.original_name}.{previewImage?.extension}
            </DialogTitle>
          </DialogHeader>
          <div className="relative p-6 pt-4">
            <img
              src={previewImage?.path}
              alt={previewImage?.original_name}
              className="w-full h-auto max-h-[70vh] object-contain rounded-lg"
            />
            <a
              href={previewImage?.path}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute top-6 right-6"
            >
              <Button size="sm" className="gap-2 shadow-lg">
                <Download className="h-4 w-4" />
                Download
              </Button>
            </a>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CommentPage;
