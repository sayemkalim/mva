import { useState, useRef, useMemo, useEffect } from "react";
import JoditEditor from "jodit-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X, Paperclip, Send, Minimize2, Maximize2 } from "lucide-react";
import { createEmail } from "../helpers";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ComposeEmail = ({ open, onClose, accounts = [], defaultAccount, onSuccess }) => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [formData, setFormData] = useState({
    to: [],
    cc: [],
    bcc: [],
    subject: "",
    body: "",
    attachments: [],
    from: defaultAccount?.email || "",
  });

  useEffect(() => {
    if (!formData.from && defaultAccount?.email) {
      setFormData(prev => ({ ...prev, from: defaultAccount.email }));
    }
  }, [defaultAccount, formData.from]);

  const [toInput, setToInput] = useState("");
  const [ccInput, setCcInput] = useState("");
  const [bccInput, setBccInput] = useState("");
  const [isDraft, setIsDraft] = useState(false);
  const [showCcBcc, setShowCcBcc] = useState(false);

  const editor = useRef(null);

  const config = useMemo(
    () => ({
      readonly: false,
      placeholder: "Compose email...",
      toolbarAdaptive: false,
      buttons: [
        "bold", "italic", "underline", "strikethrough", "|",
        "ul", "ol", "indent", "outdent", "|",
        "font", "fontsize", "brush", "paragraph", "|",
      ],
      spellcheck: true,
      language: "en",
      askBeforePasteHTML: false,
      askBeforePasteFromWord: false,
      defaultActionOnPaste: "insert_clear_html",
      height: isMaximized ? "calc(90vh - 350px)" : 300,
      width: "100%",
      padding: "10px",
    }),
    [isMaximized]
  );

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
      to: [],
      cc: [],
      bcc: [],
      subject: "",
      body: "",
      attachments: [],
      from: defaultAccount?.email || "",
    });
    setToInput("");
    setCcInput("");
    setBccInput("");
    setIsDraft(false);
    setShowCcBcc(false);
    setIsMinimized(false);
    setIsMaximized(false);
    onClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Add pending inputs
    const updatedTo = [...formData.to];
    if (toInput.trim() && /^\S+@\S+\.\S+$/.test(toInput.trim())) {
      if (!updatedTo.includes(toInput.trim())) updatedTo.push(toInput.trim());
      setToInput("");
    }

    const updatedCc = [...formData.cc];
    if (ccInput.trim() && /^\S+@\S+\.\S+$/.test(ccInput.trim())) {
      if (!updatedCc.includes(ccInput.trim())) updatedCc.push(ccInput.trim());
      setCcInput("");
    }

    const updatedBcc = [...formData.bcc];
    if (bccInput.trim() && /^\S+@\S+\.\S+$/.test(bccInput.trim())) {
      if (!updatedBcc.includes(bccInput.trim())) updatedBcc.push(bccInput.trim());
      setBccInput("");
    }

    if (updatedTo.length === 0 && !isDraft) {
      toast.error("Please enter a recipient");
      return;
    }

    sendMutation.mutate({
      ...formData,
      to: updatedTo,
      cc: updatedCc,
      bcc: updatedBcc,
      draft: isDraft
    });
  };

  const handleInputKeyDown = (e, field, inputValue, setInputValue) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const email = inputValue.trim().replace(/,/g, "");
      if (email && /^\S+@\S+\.\S+$/.test(email)) {
        if (!formData[field].includes(email)) {
          setFormData((prev) => ({
            ...prev,
            [field]: [...prev[field], email],
          }));
        }
        setInputValue("");
      } else if (email) {
        toast.error("Invalid email address");
      }
    } else if (e.key === "Backspace" && !inputValue && formData[field].length > 0) {
      setFormData((prev) => ({
        ...prev,
        [field]: prev[field].slice(0, -1),
      }));
    }
  };

  const removeEmail = (field, emailToRemove) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((email) => email !== emailToRemove),
    }));
  };

  const handlePaste = (e, field) => {
    e.preventDefault();
    const paste = e.clipboardData.getData("text");
    const emails = paste.split(/[,\s]+/).map(email => email.trim()).filter(email => email && /^\S+@\S+\.\S+$/.test(email));

    if (emails.length > 0) {
      setFormData((prev) => ({
        ...prev,
        [field]: [...new Set([...prev[field], ...emails])],
      }));
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setFormData((prev) => ({
        ...prev,
        attachments: [...prev.attachments, ...files],
      }));
    }
    if (e.target) {
      e.target.value = "";
    }
  };

  const removeAttachment = (index) => {
    setFormData((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index),
    }));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
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
            <div className="flex items-center gap-2 border-b border-border py-1">
              <span className="text-muted-foreground min-w-[60px] text-sm">From</span>
              <Select
                value={formData.from}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, from: value }))
                }
              >
                <SelectTrigger className="border-0 focus:ring-0 h-8 p-0 text-sm w-full shadow-none bg-transparent">
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.email}>
                      {account.name ? `${account.name} <${account.email}>` : account.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* To */}
            <div className="flex flex-wrap items-center gap-2 border-b border-border min-h-[40px] py-1">
              <Label htmlFor="to" className="text-muted-foreground min-w-[60px] text-sm">
                To
              </Label>
              <div className="flex flex-wrap gap-1 flex-1">
                {formData.to.map((email) => (
                  <Badge key={email} variant="secondary" className="gap-1 pr-1 py-0.5">
                    {email}
                    <button
                      type="button"
                      onClick={() => removeEmail("to", email)}
                      className="hover:bg-muted rounded-full p-0.5"
                    >
                      <X className="size-3" />
                    </button>
                  </Badge>
                ))}
                <input
                  id="to"
                  value={toInput}
                  onChange={(e) => setToInput(e.target.value)}
                  onKeyDown={(e) => handleInputKeyDown(e, "to", toInput, setToInput)}
                  onPaste={(e) => handlePaste(e, "to")}
                  placeholder={formData.to.length === 0 ? "Recipients" : ""}
                  className="flex-1 bg-transparent border-none focus:outline-none text-sm min-w-[120px]"
                  required={!isDraft && formData.to.length === 0}
                />
              </div>
            </div>

            {/* CC/BCC Toggle */}
            {showCcBcc ? (
              <>
                <div className="flex flex-wrap items-center gap-2 border-b border-border min-h-[40px] py-1">
                  <Label htmlFor="cc" className="text-muted-foreground min-w-[60px] text-sm">
                    Cc
                  </Label>
                  <div className="flex flex-wrap gap-1 flex-1">
                    {formData.cc.map((email) => (
                      <Badge key={email} variant="secondary" className="gap-1 pr-1 py-0.5">
                        {email}
                        <button
                          type="button"
                          onClick={() => removeEmail("cc", email)}
                          className="hover:bg-muted rounded-full p-0.5"
                        >
                          <X className="size-3" />
                        </button>
                      </Badge>
                    ))}
                    <input
                      id="cc"
                      value={ccInput}
                      onChange={(e) => setCcInput(e.target.value)}
                      onKeyDown={(e) => handleInputKeyDown(e, "cc", ccInput, setCcInput)}
                      onPaste={(e) => handlePaste(e, "cc")}
                      placeholder={formData.cc.length === 0 ? "Cc" : ""}
                      className="flex-1 bg-transparent border-none focus:outline-none text-sm min-w-[120px]"
                    />
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 border-b border-border min-h-[40px] py-1">
                  <Label htmlFor="bcc" className="text-muted-foreground min-w-[60px] text-sm">
                    Bcc
                  </Label>
                  <div className="flex flex-wrap gap-1 flex-1">
                    {formData.bcc.map((email) => (
                      <Badge key={email} variant="secondary" className="gap-1 pr-1 py-0.5">
                        {email}
                        <button
                          type="button"
                          onClick={() => removeEmail("bcc", email)}
                          className="hover:bg-muted rounded-full p-0.5"
                        >
                          <X className="size-3" />
                        </button>
                      </Badge>
                    ))}
                    <input
                      id="bcc"
                      value={bccInput}
                      onChange={(e) => setBccInput(e.target.value)}
                      onKeyDown={(e) => handleInputKeyDown(e, "bcc", bccInput, setBccInput)}
                      onPaste={(e) => handlePaste(e, "bcc")}
                      placeholder={formData.bcc.length === 0 ? "Bcc" : ""}
                      className="flex-1 bg-transparent border-none focus:outline-none text-sm min-w-[120px]"
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

            {/* Body */}
            <div className="flex-1 min-h-[300px] jodit-editor-container">
              <JoditEditor
                ref={editor}
                value={formData.body}
                config={config}
                tabIndex={1}
                onChange={(newContent) =>
                  setFormData((prev) => ({ ...prev, body: newContent }))
                }
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
                  <div className="flex flex-col">
                    <span className="truncate max-w-[150px] font-medium">{file.name}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {formatFileSize(file.size)}
                    </span>
                  </div>
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
              <input
                type="file"
                multiple
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
              >
                <Paperclip className="size-4" />
              </Button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

export default ComposeEmail;
