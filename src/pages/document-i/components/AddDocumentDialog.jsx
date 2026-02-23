import { useState, useEffect, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { Loader2, Upload, X, FileIcon, Check, ChevronDown, Plus } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { saveDocument } from "../helpers/saveDocument";
import { uploadAttachment } from "../helpers/uploadAttachment";
import { fetchFolders } from "../helpers/fetchFolders";

// Searchable and creatable dropdown component
const SearchableCreatableSelect = ({ 
  label, 
  options = [], 
  value, 
  onChange, 
  placeholder, 
  required = false,
  onCreateNew,
  isLoading = false
}) => {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  
  const selected = options.find((opt) => opt.name === value);
  const filteredOptions = options.filter((option) =>
    option.name.toLowerCase().includes(inputValue.toLowerCase())
  );
  
  const showCreateOption = inputValue && !options.some(opt => 
    opt.name.toLowerCase() === inputValue.toLowerCase()
  );

  const handleSelect = (optionName) => {
    onChange(optionName);
    setOpen(false);
    setInputValue("");
  };

  const handleCreateNew = () => {
    if (inputValue.trim() && onCreateNew) {
      onCreateNew(inputValue.trim());
      onChange(inputValue.trim());
      setOpen(false);
      setInputValue("");
    }
  };

  return (
    <div className="space-y-2">
      <Label className="text-foreground font-medium">
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            role="combobox"
            variant="outline"
            className="w-full justify-between h-11"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Loading...
              </>
            ) : (
              <>
                {selected ? selected.name : (value || placeholder)}
                <ChevronDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
              </>
            )}
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-full min-w-80 p-0" align="start">
          <Command>
            <CommandInput 
              placeholder={`Search or create ${label.toLowerCase()}...`} 
              value={inputValue}
              onValueChange={setInputValue}
            />
            <CommandEmpty>
              {inputValue ? (
                <div className="p-2">
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={handleCreateNew}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create "{inputValue}"
                  </Button>
                </div>
              ) : (
                "No options found."
              )}
            </CommandEmpty>
            <CommandGroup>
              {filteredOptions.map((option) => (
                <CommandItem
                  key={option.id || option.name}
                  onSelect={() => handleSelect(option.name)}
                  value={option.name}
                >
                  {option.name}
                </CommandItem>
              ))}
              {showCreateOption && filteredOptions.length > 0 && (
                <CommandItem
                  onSelect={handleCreateNew}
                  value={`create-${inputValue}`}
                  className="text-primary"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create "{inputValue}"
                </CommandItem>
              )}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

const AddDocumentDialog = ({ open, onClose, slug }) => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    folder: "",
    subfolder: "",
    title: "",
    attachment_id: null,
    doc_received_date: "",
    doc_deadline_date: "",
    memo: "",
  });

  const [fileData, setFileData] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const {
    data: foldersResponse,
    isLoading: foldersLoading,
  } = useQuery({
    queryKey: ["documenti-folders-dropdown", slug],
    queryFn: () => fetchFolders(slug),
    enabled: !!slug && open,
  });

  const folders = Array.isArray(foldersResponse?.response?.data)
    ? foldersResponse.response.data
    : [];

  const subfolders = formData.folder 
    ? (() => {
        const selectedFolder = folders.find(folder => folder.name === formData.folder);
        return Array.isArray(selectedFolder?.sub_folders) ? selectedFolder.sub_folders : [];
      })()
    : [];

  useEffect(() => {
    if (!open) {
      setFormData({
        folder: "",
        subfolder: "",
        title: "",
        attachment_id: null,
        doc_received_date: "",
        doc_deadline_date: "",
        memo: "",
      });
      setFileData(null);
      setPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
    }
  }, [open]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const uploadMutation = useMutation({
    mutationFn: uploadAttachment,
    onSuccess: (data) => {
      const attachmentId =
        data?.response?.attachment?.id ||
        data?.attachment?.id ||
        data?.response?.id ||
        data?.id;

      if (attachmentId) {
        setFormData((prev) => ({
          ...prev,
          attachment_id: attachmentId,
        }));
        setFileData((prev) => prev ? { ...prev, uploaded: true, uploading: false } : null);
        toast.success("File uploaded successfully!");
      } else {
        toast.error("Upload successful but couldn't get attachment ID");
        setFileData((prev) => prev ? { ...prev, uploading: false } : null);
      }
    },
    onError: () => {
      toast.error("Failed to upload file. Please try again.");
      setFileData(null);
      setPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
    },
  });

  const saveMutation = useMutation({
    mutationFn: (data) => saveDocument(slug, data),
    onSuccess: (data) => {
      const resp = data?.response;
      if (resp?.ApiStatus === false) {
        toast.error(resp?.message || "Failed to save document");
        return;
      }
      toast.success("Document saved successfully!");
      queryClient.invalidateQueries(["documenti-folders", slug]);
      onClose();
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to save document");
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFolderChange = (folderName) => {
    setFormData((prev) => ({ 
      ...prev, 
      folder: folderName,
      subfolder: ""
    }));
  };

  const handleSubfolderChange = (subfolderName) => {
    setFormData((prev) => ({ ...prev, subfolder: subfolderName }));
  };

  const handleCreateFolder = (folderName) => {
    toast.success(`New folder "${folderName}" will be created when document is saved`);
  };

  const handleCreateSubfolder = (subfolderName) => {
    toast.success(`New subfolder "${subfolderName}" will be created when document is saved`);
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      handleFile(droppedFile);
    }
  };

  const handleBoxClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFile(selectedFile);
    }
    e.target.value = "";
  };

  const handleFile = async (file) => {
    if (file.size > 10485760) {
      toast.error("File size must be less than 10MB");
      return;
    }

    // Create preview URL for images
    const isImage = file.type.startsWith("image/");
    if (isImage) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }

    setFileData({
      name: file.name,
      size: file.size,
      type: file.type,
      uploaded: false,
      uploading: true,
    });

    try {
      await uploadMutation.mutateAsync({ file });
    } catch (error) {
      console.error("Upload failed:", error);
    }
  };

  const removeFile = () => {
    setFileData(null);
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setFormData((prev) => ({
      ...prev,
      attachment_id: null,
    }));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const isImageFile = (fileType) => {
    return fileType && fileType.startsWith("image/");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.folder) {
      toast.error("Please select a folder");
      return;
    }
    if (!formData.title) {
      toast.error("Please enter a title");
      return;
    }
    if (!formData.attachment_id) {
      toast.error("Please upload an attachment");
      return;
    }

    const payload = {
      folder: formData.folder,
      subfolder: formData.subfolder || undefined,
      title: formData.title,
      attachment_id: formData.attachment_id,
      doc_received_date: formData.doc_received_date || undefined,
      doc_deadline_date: formData.doc_deadline_date || undefined,
      memo: formData.memo || undefined,
    };

    saveMutation.mutate(payload);
  };

  const isSubmitting = saveMutation.isPending || uploadMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle>Add New Document</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Folder and Subfolder - Side by side */}
          <div className="grid grid-cols-2 gap-4">
            <SearchableCreatableSelect
              label="Folder"
              options={folders}
              value={formData.folder}
              onChange={handleFolderChange}
              onCreateNew={handleCreateFolder}
              placeholder="Select or create folder"
              required={true}
              isLoading={foldersLoading}
            />
            <SearchableCreatableSelect
              label="Subfolder"
              options={subfolders}
              value={formData.subfolder}
              onChange={handleSubfolderChange}
              onCreateNew={handleCreateSubfolder}
              placeholder="Select or create subfolder"
              isLoading={foldersLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="title">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter document title"
            />
          </div>
          <div className="space-y-2">
            <Label>
              Attachment <span className="text-destructive">*</span>
            </Label>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileInputChange}
              className="hidden"
              accept="*/*"
            />
            <div
              onDragEnter={handleDragEnter}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={cn(
                "relative border-2 border-dashed rounded-lg transition-all",
                isDragging && "border-primary bg-primary/10 scale-[1.02]",
                "border-input"
              )}
            >
              {!fileData ? (
                <div
                  onClick={handleBoxClick}
                  className="flex flex-col items-center justify-center space-y-2 py-6 cursor-pointer hover:bg-primary/5 rounded-lg transition-colors"
                >
                  <div className="rounded-full bg-primary/10 p-3">
                    <Upload className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-foreground">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      All file types supported (max 10MB)
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-3">
                  <div className="relative bg-card border rounded-lg overflow-hidden group">
                    <button
                      type="button"
                      onClick={removeFile}
                      disabled={fileData.uploading}
                      className="absolute top-2 right-2 z-10 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 disabled:opacity-50"
                    >
                      <X className="h-3 w-3" />
                    </button>
                    <div className="flex items-center gap-3 p-3">
                      <div className="h-16 w-16 bg-muted rounded-lg flex items-center justify-center overflow-hidden shrink-0">
                        {isImageFile(fileData.type) && previewUrl ? (
                          <img
                            src={previewUrl}
                            alt={fileData.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <FileIcon className="h-8 w-8 text-muted-foreground" />
                        )}
                        {fileData.uploading && !fileData.uploaded && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <Loader2 className="h-5 w-5 animate-spin text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate" title={fileData.name}>
                          {fileData.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(fileData.size)}
                        </p>
                        {fileData.uploaded && (
                          <div className="flex items-center gap-1 text-green-600 mt-1">
                            <Check className="h-3 w-3" />
                            <span className="text-xs">Uploaded</span>
                          </div>
                        )}
                        {fileData.uploading && !fileData.uploaded && (
                          <div className="flex items-center gap-1 text-primary mt-1">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            <span className="text-xs">Uploading...</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="doc_received_date">Date Received</Label>
              <Input
                id="doc_received_date"
                name="doc_received_date"
                type="date"
                value={formData.doc_received_date}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="doc_deadline_date">Deadline Date</Label>
              <Input
                id="doc_deadline_date"
                name="doc_deadline_date"
                type="date"
                value={formData.doc_deadline_date}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="memo">Memo</Label>
            <Textarea
              id="memo"
              name="memo"
              value={formData.memo}
              onChange={handleChange}
              placeholder="Add a memo (optional)"
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Document"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddDocumentDialog;
