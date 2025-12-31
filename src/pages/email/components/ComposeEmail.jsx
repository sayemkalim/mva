import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { X, Paperclip, Send, Minimize2, Maximize2 } from "lucide-react";
import { createEmail } from "../helpers";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const ComposeEmail = ({ open, onClose, defaultAccount, onSuccess }) => {
  const queryClient = useQueryClient();
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [formData, setFormData] = useState({
    to: "",
    cc: "",
    bcc: "",
    subject: "",
    body: "",
    attachments: [],
  });
  const [isDraft, setIsDraft] = useState(false);
  const [showCcBcc, setShowCcBcc] = useState(false);

  const sendMutation = useMutation({
    mutationFn: (data) => createEmail(data),
    onSuccess: () => {
      toast.success(isDraft ? "Draft saved" : "Email sent successfully");
      queryClient.invalidateQueries(["emails"]);
      onSuccess?.();
      handleClose();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to send email");
    },
  });

  const handleClose = () => {
    setFormData({
      to: "",
      cc: "",
      bcc: "",
      subject: "",
      body: "",
      attachments: [],
    });
    setIsDraft(false);
    setShowCcBcc(false);
    setIsMinimized(false);
    setIsMaximized(false);
    onClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.to && !isDraft) {
      toast.error("Please enter a recipient");
      return;
    }
    // Include from field from defaultAccount
    sendMutation.mutate({ 
      ...formData, 
      from: defaultAccount?.email,
      draft: isDraft 
    });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData((prev) => ({
      ...prev,
      attachments: [...prev.attachments, ...files],
    }));
  };

  const removeAttachment = (index) => {
    setFormData((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index),
    }));
  };

  if (!open) return null;

  return (
    <div
      className={cn(
        "fixed bottom-0 right-4 z-50 bg-card border border-border rounded-t-lg shadow-2xl flex flex-col transition-all duration-200",
        isMinimized ? "h-14" : isMaximized ? "h-[90vh] w-[90vw] max-w-4xl" : "h-[600px] w-[600px]"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/50">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">New Message</span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={() => setIsMinimized(!isMinimized)}
          >
            <Minimize2 className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={() => setIsMaximized(!isMaximized)}
          >
            <Maximize2 className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={handleClose}
          >
            <X className="size-4" />
          </Button>
        </div>
      </div>

      {!isMinimized && (
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {/* From */}
            <div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground min-w-[60px]">From</span>
                <span className="text-foreground">{defaultAccount?.email || ""}</span>
              </div>
            </div>

            {/* To */}
            <div>
              <div className="flex items-center gap-2">
                <Label htmlFor="to" className="text-muted-foreground min-w-[60px] text-sm">
                  To
                </Label>
                <Input
                  id="to"
                  value={formData.to}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, to: e.target.value }))
                  }
                  placeholder="Recipients"
                  className="border-0 border-b border-border rounded-none focus-visible:ring-0 focus-visible:border-primary"
                  required={!isDraft}
                />
              </div>
            </div>

            {/* CC/BCC Toggle */}
            {showCcBcc ? (
              <>
                <div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="cc" className="text-muted-foreground min-w-[60px] text-sm">
                      Cc
                    </Label>
                    <Input
                      id="cc"
                      value={formData.cc}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, cc: e.target.value }))
                      }
                      placeholder="Cc"
                      className="border-0 border-b border-border rounded-none focus-visible:ring-0 focus-visible:border-primary"
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="bcc" className="text-muted-foreground min-w-[60px] text-sm">
                      Bcc
                    </Label>
                    <Input
                      id="bcc"
                      value={formData.bcc}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, bcc: e.target.value }))
                      }
                      placeholder="Bcc"
                      className="border-0 border-b border-border rounded-none focus-visible:ring-0 focus-visible:border-primary"
                    />
                  </div>
                </div>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setShowCcBcc(true)}
                className="text-sm text-primary hover:underline ml-[68px]"
              >
                Cc Bcc
              </button>
            )}

            {/* Subject */}
            <div>
              <div className="flex items-center gap-2">
                <Label htmlFor="subject" className="text-muted-foreground min-w-[60px] text-sm">
                  Subject
                </Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, subject: e.target.value }))
                  }
                  placeholder="Subject"
                  className="border-0 border-b border-border rounded-none focus-visible:ring-0 focus-visible:border-primary"
                />
              </div>
            </div>

            {/* Attachments */}
            {formData.attachments.length > 0 && (
              <div className="flex flex-wrap gap-2 ml-[68px]">
                {formData.attachments.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-1 px-2 py-1 bg-muted rounded text-sm"
                  >
                    <span className="truncate max-w-[150px]">{file.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-4"
                      onClick={() => removeAttachment(index)}
                    >
                      <X className="size-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Body */}
            <div className="flex-1 min-h-[200px]">
              <Textarea
                id="body"
                value={formData.body}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, body: e.target.value }))
                }
                placeholder="Compose email"
                className="min-h-[200px] resize-none border-0 focus-visible:ring-0"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-border px-4 py-2 bg-muted/30">
            <div className="flex items-center gap-2">
              <Button
                type="submit"
                disabled={sendMutation.isPending}
                className="gap-2"
              >
                <Send className="size-4" />
                {isDraft ? "Save Draft" : "Send"}
              </Button>
              <label className="cursor-pointer">
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Button type="button" variant="ghost" size="icon">
                  <Paperclip className="size-4" />
                </Button>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                <input
                  type="checkbox"
                  checked={isDraft}
                  onChange={(e) => setIsDraft(e.target.checked)}
                  className="size-4"
                />
                <span>Save as draft</span>
              </label>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

export default ComposeEmail;
