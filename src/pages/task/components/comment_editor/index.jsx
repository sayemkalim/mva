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
  User,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import Typography from "@/components/typography";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { fetchCommentById } from "../../helpers/fetchTaskById";
import { uploadAttachment } from "../../helpers/uploadAttachment";
import { deleteAttachment } from "../../helpers/deleteTask";
import { postComment } from "../../helpers/createTask";

const CommentPage = () => {
  const { id } = useParams(); // task ID from URL
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  const scrollRef = useRef(null);

  const [comment, setComment] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploadingFiles, setUploadingFiles] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);

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

  const comments = Array.isArray(commentsData?.data)
    ? commentsData.data
    : commentsData
    ? [commentsData]
    : [];

  // Auto-scroll to bottom when new comments arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [comments]);

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
      console.log("✅ Upload Success Response:", response);

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
        toast.success(`${fileName} uploaded`);
      }

      setUploadingFiles((prev) => prev.filter((f) => f.name !== file.name));
    },
    onError: (error, { file }) => {
      console.error("❌ Upload error:", error);
      toast.error(`Failed to upload ${file.name}`);
      setUploadingFiles((prev) => prev.filter((f) => f.name !== file.name));
    },
  });

  // Delete attachment mutation
  const { mutate: deleteAttachmentMutation } = useMutation({
    mutationFn: (attachmentId) => deleteAttachment(attachmentId),
    onSuccess: () => {
      toast.success("Attachment removed");
    },
    onError: (error) => {
      console.error("❌ Delete error:", error);
      toast.error("Failed to remove attachment");
    },
  });

  // Post comment mutation
  const { mutate: postCommentMutation, isLoading: isPosting } = useMutation({
    mutationFn: (data) => postComment(id, data),
    onSuccess: (response) => {
      console.log("✅ Comment posted:", response);
      toast.success("Comment posted successfully");

      setComment("");
      setUploadedFiles([]);

      queryClient.invalidateQueries(["taskComments", id]);
      queryClient.invalidateQueries(["taskList"]);
    },
    onError: (error) => {
      console.error("❌ Comment error:", error);
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

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!comment.trim() && uploadedFiles.length === 0) {
      toast.error("Please add a comment or attachment");
      return;
    }

    if (uploadingFiles.length > 0) {
      toast.error("Please wait for all files to finish uploading");
      return;
    }

    const payload = {
      comment: comment.trim() || null,
      attachment_ids: uploadedFiles.map((file) => file.id),
      parent_id: null,
    };

    console.log("📤 Submitting Comment Payload:", payload);
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

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="rounded-full hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <Typography variant="h3" className="text-lg font-semibold">
              Comments
            </Typography>
            <Typography variant="muted" className="text-xs">
              Task #{id}
            </Typography>
          </div>
        </div>
      </header>

      {/* Comments Area */}
      <ScrollArea ref={scrollRef} className="flex-1 px-4 py-6">
        <div className="max-w-5xl mx-auto space-y-4">
          {isLoadingComments ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : commentsError ? (
            <div className="text-center py-12">
              <Typography variant="muted">Failed to load comments</Typography>
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-12">
              <Typography variant="muted">
                No comments yet. Be the first to comment!
              </Typography>
            </div>
          ) : (
            comments.map((commentItem) => (
              <Card
                key={commentItem.id}
                className="p-4 bg-white shadow-sm hover:shadow-md transition-shadow"
              >
                {/* User Info */}
                <div className="flex items-start gap-3 mb-3">
                  <Avatar className="h-10 w-10 border-2 border-gray-200">
                    <AvatarImage src={commentItem.user?.profile_picture} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                      {getInitials(
                        commentItem.user?.first_name,
                        commentItem.user?.last_name
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Typography variant="p" className="font-semibold text-sm">
                        {commentItem.user?.first_name}{" "}
                        {commentItem.user?.last_name}
                      </Typography>
                      <Typography variant="muted" className="text-xs">
                        {commentItem.created_at
                          ? format(
                              new Date(commentItem.created_at),
                              "MMM dd, yyyy 'at' hh:mm a"
                            )
                          : ""}
                      </Typography>
                    </div>
                    <Typography variant="muted" className="text-xs">
                      {commentItem.user?.role}
                    </Typography>
                  </div>
                </div>

                {/* Comment Text */}
                {commentItem.comment && (
                  <div className="mb-3 pl-[52px]">
                    <Typography
                      variant="p"
                      className="text-sm text-gray-700 whitespace-pre-wrap"
                    >
                      {commentItem.comment}
                    </Typography>
                  </div>
                )}

                {/* Attachments */}
                {commentItem.attachments &&
                  commentItem.attachments.length > 0 && (
                    <div className="pl-[52px] space-y-2">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {commentItem.attachments.map((attachment) => (
                          <div key={attachment.id}>
                            {isImage(attachment.mime_type) ? (
                              <div
                                className="relative group cursor-pointer rounded-lg overflow-hidden border border-gray-200 hover:border-blue-400 transition-colors"
                                onClick={() => setPreviewImage(attachment)}
                              >
                                <img
                                  src={attachment.path}
                                  alt={attachment.original_name}
                                  className="w-full h-32 object-cover"
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity flex items-center justify-center">
                                  <ImageIcon className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                              </div>
                            ) : (
                              <a
                                href={attachment.path}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-colors"
                              >
                                <Paperclip className="h-4 w-4 text-gray-500" />
                                <div className="flex-1 min-w-0">
                                  <Typography
                                    variant="muted"
                                    className="text-xs truncate"
                                  >
                                    {attachment.original_name}.
                                    {attachment.extension}
                                  </Typography>
                                  <Typography
                                    variant="muted"
                                    className="text-xs text-gray-400"
                                  >
                                    {(attachment.size / 1024).toFixed(1)} KB
                                  </Typography>
                                </div>
                                <Download className="h-4 w-4 text-gray-400" />
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </Card>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="bg-white border-t shadow-lg">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Uploading Files Indicator */}
            {uploadingFiles.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {uploadingFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 bg-blue-50 rounded-full px-3 py-1 text-sm border border-blue-200"
                  >
                    <Loader2 className="h-3 w-3 animate-spin text-blue-600" />
                    <span className="text-blue-700">{file.name}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Preview Uploaded Files */}
            {uploadedFiles.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {uploadedFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1 text-sm"
                  >
                    <Paperclip className="h-3 w-3 text-gray-500" />
                    <span className="text-gray-700 max-w-[150px] truncate">
                      {file.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(file)}
                      disabled={isPosting}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
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
                className="rounded-full flex-shrink-0"
              >
                <Upload className="h-4 w-4" />
              </Button>

              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Type your comment..."
                rows={1}
                className="resize-none flex-1 min-h-[44px] max-h-[120px]"
                disabled={isPosting}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey && canSubmit) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
              />

              <Button
                type="submit"
                disabled={!canSubmit}
                className="rounded-full flex-shrink-0 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                size="icon"
              >
                {isPosting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Image Preview Dialog */}
      <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {previewImage?.original_name}.{previewImage?.extension}
            </DialogTitle>
          </DialogHeader>
          <div className="relative">
            <img
              src={previewImage?.path}
              alt={previewImage?.original_name}
              className="w-full h-auto max-h-[70vh] object-contain rounded-lg"
            />
            <a
              href={previewImage?.path}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute top-2 right-2"
            >
              <Button variant="secondary" size="sm" className="gap-2">
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
