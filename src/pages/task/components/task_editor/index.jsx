import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useDebounce } from "@uidotdev/usehooks";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { FloatingInput, FloatingTextarea, FloatingWrapper } from "@/components/ui/floating-label";
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
  CommandList,
} from "@/components/ui/command";
import {
  Loader2,
  ChevronRight,
  CalendarIcon,
  Plus,
  Trash2,
  Upload,
  X,
  FileIcon,
  Check,
  Eye,
  Download,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Navbar2 } from "@/components/navbar2";
import Billing from "@/components/billing";
import { uploadAttachment } from "../../helpers/uploadAttachment";
import {
  createTask,
  searchContact,
  updateTask,
} from "../../helpers/createTask";
import { getABMeta } from "../../helpers/fetchABMeta";
import { deleteAttachment, deleteReminder } from "../../helpers/deleteTask";
import { fetchTaskById } from "../../helpers/fetchTaskById";
const ContactSearch = ({ value, onChange, label, initialContactName }) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedContact, setSelectedContact] = useState(null);
  const debouncedSearch = useDebounce(searchQuery, 500);
  const { slug, id } = useParams();

  const {
    data: contactsResponse,
    isLoading: isSearching,
    isError,
    error,
  } = useQuery({
    queryKey: ["searchContacts", debouncedSearch],
    queryFn: () => searchContact({ searchBar: debouncedSearch }),
    enabled: debouncedSearch.length > 0,
    staleTime: 300000,
  });

  const contacts = contactsResponse?.response?.data || [];
  useEffect(() => {
    if (initialContactName && value && !selectedContact) {
      setSelectedContact({
        id: value,
        contact_name: initialContactName,
      });
      setSearchQuery(initialContactName);
    }
  }, [initialContactName, value, selectedContact]);
  useEffect(() => {
    if (slug && value && !selectedContact && !initialContactName) {
      const savedData = localStorage.getItem("workstationData");
      if (savedData) {
        try {
          const workstationData = JSON.parse(savedData);
          const matchedWorkstation = workstationData.find(
            (ws) => ws.slug === slug && ws.id === value
          );

          if (matchedWorkstation && matchedWorkstation.name) {
            setSelectedContact({
              id: matchedWorkstation.id,
              contact_name: matchedWorkstation.name,
            });
            setSearchQuery(matchedWorkstation.name);
          }
        } catch (error) {
          console.error("Error parsing localStorage data:", error);
        }
      }
    }
  }, [slug, value, selectedContact, initialContactName]);

  const handleSelect = (contact) => {
    setSelectedContact(contact);
    onChange(contact.id);
    setSearchQuery(contact.contact_name);
    setOpen(false);
  };

  return (
    <div>
      <FloatingWrapper label={label} hasValue={!!selectedContact} isFocused={open}>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              role="combobox"
              variant="outline"
              className="w-full justify-between h-[52px] bg-transparent border border-input"
              type="button"
            >
              {selectedContact ? selectedContact.contact_name : ""}
              <ChevronRight className="ml-auto h-4 w-4 shrink-0 rotate-90" />
            </Button>
          </PopoverTrigger>

          <PopoverContent
            className="w-[var(--radix-popover-trigger-width)] p-0"
            align="start"
          >
            <Command shouldFilter={false}>
              <CommandInput
                placeholder="Type to search contacts..."
                value={searchQuery}
                onValueChange={setSearchQuery}
              />
              <CommandList>
                {isSearching && (
                  <div className="flex items-center justify-center py-6">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span className="text-sm text-muted-foreground">
                      Searching...
                    </span>
                  </div>
                )}

                {isError && (
                  <div className="py-6 text-center text-sm text-red-500">
                    Error loading contacts. Please try again.
                  </div>
                )}

                {!isSearching &&
                  !isError &&
                  debouncedSearch &&
                  contacts.length === 0 && (
                    <CommandEmpty>No contacts found.</CommandEmpty>
                  )}

                {!isSearching && !isError && !debouncedSearch && (
                  <div className="py-6 text-center text-sm text-muted-foreground">
                    Start typing to search contacts
                  </div>
                )}

                {!isSearching && !isError && contacts.length > 0 && (
                  <CommandGroup>
                    {contacts.map((contact) => (
                      <CommandItem
                        key={contact.id}
                        value={String(contact.id)}
                        onSelect={() => handleSelect(contact)}
                        className="cursor-pointer"
                      >
                        <div className="flex flex-col gap-1 flex-1">
                          <span className="font-medium">
                            {contact.contact_name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {contact.primary_email}
                          </span>
                        </div>
                        {selectedContact?.id === contact.id && (
                          <Check className="h-4 w-4 ml-2" />
                        )}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </FloatingWrapper>

      {selectedContact && (
        <div className="text-xs text-muted-foreground mt-1">
          Selected: {selectedContact.contact_name}
          {/* (
          {selectedContact.primary_email || "N/A"}) */}
        </div>
      )}
    </div>
  );
};

const SearchableSelect = ({ label, options, value, onChange, placeholder, required, error }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selected = options.find((opt) => String(opt.id) === String(value));

  return (
    <div>
      <FloatingWrapper label={label} required={required} hasValue={!!selected} isFocused={isOpen}>
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              role="combobox"
              variant="outline"
              className={cn(
                "w-full justify-between h-[52px] bg-transparent border border-input",
                error && "border-red-500 focus-visible:ring-red-500"
              )}
              type="button"
            >
              {selected ? selected.name : ""}
              <ChevronRight className="ml-auto h-4 w-4 shrink-0 rotate-90" />
            </Button>
          </PopoverTrigger>

          <PopoverContent
            className="w-[var(--radix-popover-trigger-width)] p-0"
            align="start"
          >
            <Command>
              <CommandInput placeholder={`Search ${label.toLowerCase()}...`} />
              <CommandList>
                <CommandEmpty>No options found.</CommandEmpty>
                <CommandGroup>
                  {options && options.length > 0 ? (
                    options.map((opt) => (
                      <CommandItem
                        key={opt.id}
                        onSelect={() => { onChange(opt.id); setIsOpen(false); }}
                        value={opt.name}
                      >
                        {opt.name}
                      </CommandItem>
                    ))
                  ) : (
                    <div className="p-2 text-sm text-gray-500">
                      No data available
                    </div>
                  )}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </FloatingWrapper>
      {error && <p className="text-xs font-medium text-red-500">{error}</p>}
    </div>
  );
};

const MultiSelect = ({ label, options, value, onChange, placeholder, required, error }) => {
  const [open, setOpen] = useState(false);
  const selectedItems = options.filter((opt) =>
    value?.some(val => String(val) === String(opt.id))
  );

  const handleSelect = (selectedId) => {
    const isSelected = value?.some(val => String(val) === String(selectedId));
    const newValue = isSelected
      ? value.filter((id) => String(id) !== String(selectedId))
      : [...value, selectedId];
    onChange(newValue);
  };

  return (
    <div>
      <FloatingWrapper label={label} required={required} hasValue={selectedItems.length > 0} isFocused={open}>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              role="combobox"
              variant="outline"
              className={cn(
                "w-full justify-between h-auto min-h-[52px] bg-transparent border border-input",
                error && "border-red-500 focus-visible:ring-red-500"
              )}
              type="button"
            >
              <div className="flex flex-wrap gap-1">
                {selectedItems.length > 0 ? (
                  selectedItems.map((item) => (
                    <span
                      key={item.id}
                      className="bg-primary/10 text-primary px-2 py-1 rounded text-sm"
                    >
                      {item.name}
                    </span>
                  ))
                ) : (
                  <span></span>
                )}
              </div>
              <ChevronRight className="ml-auto h-4 w-4 shrink-0 rotate-90" />
            </Button>
          </PopoverTrigger>

          <PopoverContent
            className="w-[var(--radix-popover-trigger-width)] p-0"
            align="start"
          >
            <Command>
              <CommandInput placeholder={`Search ${label.toLowerCase()}...`} />
              <CommandList>
                <CommandEmpty>No options found.</CommandEmpty>
                <CommandGroup>
                  {options && options.length > 0 ? (
                    options.map((opt) => (
                      <CommandItem
                        key={opt.id}
                        onSelect={() => handleSelect(opt.id)}
                        value={opt.name}
                      >
                        <Checkbox
                          checked={value?.some(val => String(val) === String(opt.id))}
                          className="mr-2"
                        />
                        {opt.name}
                      </CommandItem>
                    ))
                  ) : (
                    <div className="p-2 text-sm text-gray-500">
                      No data available
                    </div>
                  )}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </FloatingWrapper>
      {error && <p className="text-xs font-medium text-red-500">{error}</p>}
    </div>
  );
};

const DatePicker = ({ label, value, onChange, required, error }) => {
  const [date, setDate] = useState(value ? new Date(value) : undefined);

  useEffect(() => {
    setDate(value ? new Date(value) : undefined);
  }, [value]);

  const handleSelect = (selectedDate) => {
    setDate(selectedDate);
    onChange(selectedDate ? format(selectedDate, "yyyy-MM-dd") : "");
  };

  return (
    <div className="space-y-2">
      <Label className="text-foreground font-medium">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal h-11",
              !date && "text-muted-foreground",
              error && "border-red-500 focus-visible:ring-red-500"
            )}
            type="button"
          >
            {date ? format(date, "PPP") : ""}
            <CalendarIcon className="ml-auto h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleSelect}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      {error && <p className="text-xs font-medium text-red-500">{error}</p>}
    </div>
  );
};

const DateTimePicker = ({ label, value, onChange, required, error }) => {
  const [dateTime, setDateTime] = useState(value || "");

  useEffect(() => {
    setDateTime(value || "");
  }, [value]);

  const handleChange = (e) => {
    const newValue = e.target.value;
    setDateTime(newValue);
    onChange(newValue);
  };

  return (
    <div className="space-y-2">
      <Label className="text-foreground font-medium">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <Input
        type="datetime-local"
        value={dateTime}
        onChange={handleChange}
        className={cn("h-11", error && "border-red-500 focus-visible:ring-red-500")}
      />
      {error && <p className="text-xs font-medium text-red-500">{error}</p>}
    </div>
  );
};

const FileUploadBox = ({ files, onFilesChange, onUpload, onDelete }) => {
  const [previewFile, setPreviewFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrls, setPreviewUrls] = useState({});
  const fileInputRef = useRef(null);

  useEffect(() => {
    const newPreviewUrls = {};

    files.forEach((file) => {
      if (file.fileObject) {
        const fileType = file.fileObject.type;
        if (fileType.startsWith("image/")) {
          const url = URL.createObjectURL(file.fileObject);
          newPreviewUrls[file.tempId] = url;
        }
      }
    });

    setPreviewUrls(newPreviewUrls);
    return () => {
      Object.values(newPreviewUrls).forEach((url) => URL.revokeObjectURL(url));
    };
  }, [files]);

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

    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  };

  const handleBoxClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    handleFiles(selectedFiles);
    e.target.value = "";
  };

  const handleFiles = (fileList) => {
    const newFiles = fileList.map((file) => ({
      tempId: `temp_${Date.now()}_${Math.random()}`,
      name: file.name,
      size: file.size,
      type: file.type,
      fileObject: file,
      uploaded: false,
      uploading: true,
    }));

    onFilesChange([...files, ...newFiles]);

    newFiles.forEach((fileData) => {
      onUpload(fileData);
    });
  };

  const handleRemoveFile = (e, fileToRemove) => {
    e.stopPropagation();
    if (fileToRemove.uploaded && fileToRemove.id) {
      onDelete(fileToRemove.id, fileToRemove.tempId);
    } else {
      onFilesChange(
        files.filter((file) => file.tempId !== fileToRemove.tempId)
      );
    }
    if (previewUrls[fileToRemove.tempId]) {
      URL.revokeObjectURL(previewUrls[fileToRemove.tempId]);
    }
  };

  const isImageFile = (fileType) => {
    return fileType && fileType.startsWith("image/");
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const isAnyFileUploading = files.some(
    (file) => file.uploading && !file.uploaded
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Label className="text-lg font-semibold text-foreground">
          Attachments
        </Label>
        <div className="text-sm text-muted-foreground">
          {files.length} file{files.length !== 1 ? "s" : ""} selected
        </div>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        multiple
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
          "relative border-2 border-dashed rounded-lg p-6 transition-all",
          isDragging && "border-primary bg-primary/10 scale-[1.02]",
          files.length > 0 ? "border-input" : "border-input"
        )}
      >
        {files.length === 0 ? (
          <div
            onClick={handleBoxClick}
            className="flex flex-col items-center justify-center space-y-3 py-8 cursor-pointer hover:bg-primary/5 rounded-lg transition-colors"
          >
            <div className="rounded-full bg-primary/10 p-4">
              <Upload className="h-8 w-8 text-primary" />
            </div>
            <div>
              <p className="text-base font-medium text-foreground">
                Click to upload or drag and drop
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Support for all file types • Multiple files allowed
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {files.map((file) => (
                <div
                  key={file.tempId}
                  className="relative bg-card border rounded-lg overflow-hidden hover:shadow-md transition-shadow group"
                >
                  <button
                    type="button"
                    onClick={(e) => handleRemoveFile(e, file)}
                    className="absolute top-2 right-2 z-10 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <div className="aspect-video bg-gray-100 flex items-center justify-center relative">
                    {isImageFile(file.type) && previewUrls[file.tempId] ? (
                      <img
                        src={previewUrls[file.tempId]}
                        alt={file.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <FileIcon className="h-12 w-12 text-gray-400" />
                    )}

                    {file.uploading && !file.uploaded && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin text-white" />
                      </div>
                    )}

                    {file.uploaded && (
                      <div className="absolute top-2 left-2 bg-green-500 text-white rounded-full p-1 shadow-sm">
                        <Check className="h-3 w-3" />
                      </div>
                    )}

                    {/* Hover Overlay with Preview Icon */}
                    {file.uploaded && !file.deleting && (
                      <div
                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewFile(file);
                        }}
                      >
                        <div className="bg-white/20 backdrop-blur-md rounded-full p-3 border border-white/30 transform scale-90 group-hover:scale-100 transition-transform">
                          <Eye className="h-6 w-6 text-white" />
                        </div>
                      </div>
                    )}

                    {file.deleting && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin text-white" />
                      </div>
                    )}
                  </div>
                  <div className="p-3 space-y-1">
                    <p
                      className="text-sm font-medium truncate"
                      title={file.name}
                    >
                      {file.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)}
                    </p>
                    {file.uploading && !file.uploaded && (
                      <p className="text-xs text-blue-600">⏳ Uploading...</p>
                    )}
                    {file.uploaded && file.id && (
                      <p className="text-xs text-green-600">✓ Uploaded</p>
                    )}
                    {file.deleting && (
                      <p className="text-xs text-red-600">🗑️ Deleting...</p>
                    )}

                    <div className="flex gap-2 mt-2 border-t pt-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewFile(file);
                        }}
                        className="text-xs flex items-center gap-1 text-blue-600 hover:text-blue-800"
                        title="Preview"
                      >
                        <Eye className="h-3 w-3" /> Preview
                      </button>
                      {(file.path || file.id) && (
                        <a
                          href={file.path || `${window.location.origin}/api/v2/attachment/${file.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          download={file.name}
                          onClick={(e) => e.stopPropagation()}
                          className="text-xs flex items-center gap-1 text-green-600 hover:text-green-800"
                          title="Download"
                        >
                          <Download className="h-3 w-3" /> Download
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div
                onClick={handleBoxClick}
                className="relative bg-gradient-to-br from-primary/5 to-primary/10 border-2 border-dashed border-primary/30 rounded-lg overflow-hidden hover:shadow-md hover:border-primary transition-all cursor-pointer group"
              >
                <div className="aspect-video flex flex-col items-center justify-center gap-2 p-4">
                  <div className="rounded-full bg-primary/10 p-3 group-hover:bg-primary/20 transition-colors">
                    <Plus className="h-6 w-6 text-primary" />
                  </div>
                  <p className="text-sm font-medium text-primary">
                    Add More Files
                  </p>
                  <p className="text-xs text-muted-foreground text-center">
                    Click to browse files
                  </p>
                </div>
              </div>
            </div>
            <div
              onClick={handleBoxClick}
              className="pt-2 border-t border-dashed border-input cursor-pointer hover:bg-primary/5 rounded transition-colors"
            >
              <p className="text-sm text-muted-foreground text-center py-2">
                Click anywhere or drag files to add more attachments
              </p>
            </div>
          </div>
        )}
        {isAnyFileUploading && (
          <div className="absolute bottom-2 right-2 bg-blue-500 text-white px-3 py-1 rounded-full flex items-center gap-2 text-xs pointer-events-none">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>Uploading files...</span>
          </div>
        )}
      </div>

      <Dialog open={!!previewFile} onOpenChange={() => setPreviewFile(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>File Preview: {previewFile?.name}</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center p-4">
            {previewFile && (
              <>
                {isImageFile(previewFile.type) ? (
                  <img
                    src={
                      previewFile.fileObject
                        ? URL.createObjectURL(previewFile.fileObject)
                        : previewFile.path || `${window.location.origin}/api/v2/attachment/${previewFile.id}`
                    }
                    alt={previewFile.name}
                    className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-sm"
                  />
                ) : previewFile.type === "application/pdf" ? (
                  <iframe
                    src={
                      previewFile.fileObject
                        ? URL.createObjectURL(previewFile.fileObject)
                        : previewFile.path || `${window.location.origin}/api/v2/attachment/${previewFile.id}`
                    }
                    className="w-full h-[70vh] rounded-lg border shadow-sm"
                    title={previewFile.name}
                  />
                ) : (
                  <div className="text-center py-20 flex flex-col items-center">
                    <FileIcon className="h-20 w-20 text-gray-400" />
                    <p className="mt-4 text-muted-foreground">
                      Preview not available for this file type.
                    </p>
                    <p className="text-sm font-medium">{previewFile.name}</p>
                    {(previewFile.path || previewFile.id) && (
                      <a
                        href={previewFile.path || `${window.location.origin}/api/v2/attachment/${previewFile.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        download={previewFile.name}
                        className="mt-4 inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors shadow-sm"
                      >
                        <Download className="h-4 w-4" /> Download Instead
                      </a>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default function TaskPage() {
  const { slug, id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditMode = window.location.pathname.includes("/edit/");

  const {
    data: metaResponse,
    isLoading: loadingMeta,
    isError: metaError,
    error: metaErrorObj,
  } = useQuery({
    queryKey: ["taskMeta"],
    queryFn: getABMeta,
    staleTime: 300000,
  });

  const {
    data: taskData,
    isLoading: loadingTask,
    isError: taskError,
  } = useQuery({
    queryKey: ["task", slug],
    queryFn: () => fetchTaskById(id),
    enabled: !!id && isEditMode,
  });

  const meta = metaResponse?.response || {};

  const saveMutation = useMutation({
    mutationFn: (data) => {
      return createTask(data);
    },
    onSuccess: (data) => {
      const resp = data?.response;
      if (resp?.Apistatus === false) {
        toast.error(resp?.message || "Validation failed");
        return;
      }
      toast.success(resp?.message || "Task created successfully!");
      queryClient.invalidateQueries(["taskList"]);
      navigate(-1);
    },
    onError: (error) => {
      const errorData = error.response?.data;
      if (errorData?.Apistatus === false) {
        toast.error(errorData?.message || "Validation failed");
      } else {
        toast.error(errorData?.message || "Failed to create Task");
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: (payload) => {
      return updateTask(slug, payload);
    },
    onSuccess: (data) => {
      const resp = data?.response;
      if (resp?.Apistatus === false) {
        toast.error(resp?.message || "Validation failed");
        return;
      }
      toast.success(resp?.message || "Task updated successfully!");
      queryClient.invalidateQueries(["taskList"]);
      queryClient.invalidateQueries(["task", slug]);
      navigate(-1);
    },
    onError: (error) => {
      console.error("❌ Update Error:", error);
      const errorData = error.response?.data;
      if (errorData?.Apistatus === false) {
        toast.error(errorData?.message || " failed");
      } else {
        toast.error(errorData?.message || "Failed to update task");
      }
    },
  });

  const uploadMutation = useMutation({
    mutationFn: uploadAttachment,
    onSuccess: (response, variables) => {
      console.log("✅ Upload Success Response:", response);

      const attachmentId = response?.response?.attachment?.id;
      const path = response?.response?.attachment?.path;
      const fileName =
        response?.response?.attachment?.original_name || "Uploaded File";
      const fileExtension = response?.response?.attachment?.extension;
      const fullFileName = fileExtension
        ? `${fileName}.${fileExtension}`
        : fileName;

      if (attachmentId) {
        setUploadedFiles((prev) =>
          prev.map((file) =>
            file.tempId === variables.tempId
              ? {
                ...file,
                id: attachmentId,
                path: path,
                name: fullFileName,
                uploaded: true,
                uploading: false,
              }
              : file
          )
        );

        setFormData((prev) => ({
          ...prev,
          attachment_ids: [...prev.attachment_ids, attachmentId],
        }));

        toast.success(`File uploaded: ${fullFileName}`);
      } else {
        console.warn("⚠️ No attachment ID found in response:", response);
        setUploadedFiles((prev) =>
          prev.map((file) =>
            file.tempId === variables.tempId
              ? { ...file, uploading: false, uploadFailed: true }
              : file
          )
        );
      }
    },
    onError: (error, variables) => {
      console.error("Upload Error:", error);

      setUploadedFiles((prev) =>
        prev.map((file) =>
          file.tempId === variables.tempId
            ? { ...file, uploading: false, uploadFailed: true }
            : file
        )
      );

      toast.error("Failed to upload file");
    },
  });

  const deleteAttachmentMutation = useMutation({
    mutationFn: deleteAttachment,
    onMutate: async (attachmentId) => {
      setUploadedFiles((prev) =>
        prev.map((file) =>
          file.id === attachmentId ? { ...file, deleting: true } : file
        )
      );
    },
    onSuccess: (response, attachmentId, context) => {
      setUploadedFiles((prev) =>
        prev.filter((file) => file.id !== attachmentId)
      );
      setFormData((prev) => ({
        ...prev,
        attachment_ids: prev.attachment_ids.filter((id) => id !== attachmentId),
      }));

      toast.success("Attachment deleted successfully");
    },
    onError: (error, attachmentId) => {
      console.error("❌ Delete Error:", error);
      setUploadedFiles((prev) =>
        prev.map((file) =>
          file.id === attachmentId ? { ...file, deleting: false } : file
        )
      );

      toast.error("Failed to delete attachment");
    },
  });

  const deleteReminderMutation = useMutation({
    mutationFn: deleteReminder,
    onSuccess: (response, reminderId) => {
      console.log("✅ Reminder Deleted:", reminderId);
      toast.success("Reminder deleted successfully");
    },
    onError: (error) => {
      console.error("❌ Delete Reminder Error:", error);
      toast.error("Failed to delete reminder");
    },
  });

  const [formData, setFormData] = useState({
    initial_id: "",
    type_id: "",
    subject: "",
    description: "",
    due_date: "",
    priority_id: "",
    utbms_code_id: "",
    billable: false,
    notify_text: false,
    add_calendar_event: false,
    trigger_appointment_reminders: false,
    status_id: "",
    assigned_to: [],
    reminders: [],
    attachment_ids: [],
  });

  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [contactName, setContactName] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (slug && !isEditMode) {
      const savedData = localStorage.getItem("workstationData");
      if (savedData) {
        try {
          const workstationData = JSON.parse(savedData);
          const matchedWorkstation = workstationData.find(
            (ws) => ws.slug === slug
          );

          if (matchedWorkstation) {
            setFormData((prev) => ({
              ...prev,
              initial_id: matchedWorkstation.id,
            }));

            if (matchedWorkstation.name) {
              // toast.success(`Loaded workstation: ${matchedWorkstation.name}`);
            }
          }
        } catch (error) {
          console.error("Error loading workstation data:", error);
        }
      }
    }
  }, [slug, isEditMode]);
  useEffect(() => {
    if (taskData && isEditMode) {
      console.log("✅ Task Data Loaded:", taskData);

      setFormData({
        initial_id: taskData.initial_id || "",
        type_id: taskData.type_id || "",
        subject: taskData.subject || "",
        description: taskData.description || "",
        due_date: taskData.due_date || "",
        priority_id: taskData.priority_id || "",
        utbms_code_id: taskData.utbms_code_id || "",
        billable: !!taskData.billable,
        notify_text: !!taskData.notify_text,
        add_calendar_event: !!taskData.add_calendar_event,
        trigger_appointment_reminders: !!taskData.trigger_appointment_reminders,
        status_id: taskData.status_id || "",
        assigned_to: Array.isArray(taskData.assignees)
          ? taskData.assignees.map((user) => user.id)
          : Array.isArray(taskData.assigned_to)
            ? taskData.assigned_to.map((user) => user.id)
            : [],
        reminders: Array.isArray(taskData.reminders)
          ? taskData.reminders.map((reminder) => ({
            id: reminder.id,
            type_id: reminder.type_id,
            scheduled_at: reminder.scheduled_at
              ? reminder.scheduled_at.replace(" ", "T").slice(0, 16)
              : "",
          }))
          : [],
        attachment_ids: Array.isArray(taskData.attachments)
          ? taskData.attachments.map((att) => att.id)
          : [],
      });
      if (taskData.contact_name) {
        setContactName(taskData.contact_name);
      }

      if (Array.isArray(taskData.attachments)) {
        const existingFiles = taskData.attachments.map((att) => ({
          tempId: `existing_${att.id}`,
          id: att.id,
          name: att.original_name || "File",
          size: att.size || 0,
          type: att.mime_type || "",
          path: att.path || null,
          uploaded: true,
          uploading: false,
        }));
        setUploadedFiles(existingFiles);
      }
    }
  }, [taskData, isEditMode]);

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleAddReminder = () => {
    setFormData((prev) => ({
      ...prev,
      reminders: [
        ...prev.reminders,
        {
          type_id: "",
          scheduled_at: "",
        },
      ],
    }));
  };

  const handleRemoveReminder = (index) => {
    const reminder = formData.reminders[index];
    if (reminder.id) {
      deleteReminderMutation.mutate(reminder.id, {
        onSuccess: () => {
          setFormData((prev) => ({
            ...prev,
            reminders: prev.reminders.filter((_, i) => i !== index),
          }));
        },
      });
    } else {
      setFormData((prev) => ({
        ...prev,
        reminders: prev.reminders.filter((_, i) => i !== index),
      }));
    }
  };

  const handleReminderChange = (index, field, value) => {
    const newReminders = [...formData.reminders];
    newReminders[index][field] = value;
    setFormData((prev) => ({
      ...prev,
      reminders: newReminders,
    }));

    // Clear reminder error
    const reminderErrorKey = `reminder_${index}_${field}`;
    if (errors[reminderErrorKey]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[reminderErrorKey];
        return newErrors;
      });
    }
  };

  const handleFilesChange = (newFiles) => {
    setUploadedFiles(newFiles);
  };

  const handleFileUpload = (fileData) => {
    uploadMutation.mutate({
      file: fileData.fileObject,
      tempId: fileData.tempId,
    });
  };

  const handleFileDelete = (attachmentId, tempId) => {
    deleteAttachmentMutation.mutate(attachmentId);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.type_id) newErrors.type_id = "Task Type is required";
    if (!formData.subject?.trim()) newErrors.subject = "Subject is required";
    if (!formData.due_date) newErrors.due_date = "Due Date is required";
    if (!formData.status_id) newErrors.status_id = "Status is required";
    if (!formData.priority_id) newErrors.priority_id = "Priority is required";
    if (!formData.assigned_to || formData.assigned_to.length === 0) {
      newErrors.assigned_to = "At least one assignee is required";
    }

    // Validate Reminders
    if (formData.reminders && formData.reminders.length > 0) {
      formData.reminders.forEach((reminder, index) => {
        if (!reminder.type_id) {
          newErrors[`reminder_${index}_type_id`] = "Reminder type is required";
        }
        if (!reminder.scheduled_at) {
          newErrors[`reminder_${index}_scheduled_at`] =
            "Scheduled date is required";
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors in the form before submitting.");
      return;
    }

    const payload = {
      type_id: formData.type_id,
      subject: formData.subject,
      description: formData.description,
      due_date: formData.due_date,
      priority_id: formData.priority_id,
      status_id: formData.status_id,
      assigned_to: formData.assigned_to,
      billable: formData.billable,
      notify_text: formData.notify_text,
      add_calendar_event: formData.add_calendar_event,
      trigger_appointment_reminders: formData.trigger_appointment_reminders,
    };

    if (formData.initial_id) {
      payload.initial_id = formData.initial_id;
    }

    if (formData.utbms_code_id) {
      payload.utbms_code_id = formData.utbms_code_id;
    }

    if (formData.reminders && formData.reminders.length > 0) {
      const validReminders = formData.reminders.filter(
        (reminder) => reminder.type_id && reminder.scheduled_at
      );

      if (validReminders.length > 0) {
        payload.reminders = validReminders.map((reminder) => ({
          id: reminder.id || undefined,
          type_id: reminder.type_id,
          scheduled_at: reminder.scheduled_at.replace("T", " ") + ":00",
        }));
      }
    }

    if (formData.attachment_ids && formData.attachment_ids.length > 0) {
      payload.attachment_ids = formData.attachment_ids;
    }

    console.log("📤 Submitting Task Data:", payload);

    if (isEditMode) {
      updateMutation.mutate(payload);
    } else {
      saveMutation.mutate(payload);
    }
  };

  if (loadingMeta || (isEditMode && loadingTask)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading...</span>
      </div>
    );
  }

  if (metaError || (isEditMode && taskError)) {
    return (
      <div className="text-red-600 p-4">
        Failed to load {isEditMode ? "task" : "metadata"}:{" "}
        {metaErrorObj?.message || "Unknown error"}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted">
      <Navbar2 />
      <Billing />

      <nav className="bg-card border-b px-6 py-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/dashboard")}
            className="hover:text-foreground transition"
            type="button"
          >
            Dashboard
          </button>
          <ChevronRight className="w-4 h-4" />
          <button
            onClick={() => navigate("/dashboard/task")}
            className="hover:text-foreground transition"
            type="button"
          >
            Tasks
          </button>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground font-medium">
            {isEditMode ? "Edit Task" : "Add Task"}
          </span>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-8 max-w-7xl">
        <h1 className="text-2xl font-bold text-foreground mb-6">
          {isEditMode ? "Edit Task" : "Add New Task"}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-card rounded-lg shadow-sm border p-6 space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <ContactSearch
                label="Contact"
                value={formData.initial_id}
                onChange={(val) => handleFieldChange("initial_id", val)}
                initialContactName={contactName}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <SearchableSelect
                label="Type"
                options={meta.taks_type || []}
                value={formData.type_id}
                onChange={(val) => handleFieldChange("type_id", val)}
                placeholder="Select type"
                required
                error={errors.type_id}
              />

              <div>
                <FloatingInput
                  label="Subject"
                  required
                  type="text"
                  value={formData.subject}
                  onChange={(e) => handleFieldChange("subject", e.target.value)}
                  className={cn(errors.subject && "border-red-500 focus-visible:ring-red-500")}
                />
                {errors.subject && <p className="text-xs font-medium text-red-500">{errors.subject}</p>}
              </div>

              <DatePicker
                label="Due Date"
                value={formData.due_date}
                onChange={(val) => handleFieldChange("due_date", val)}
                required
                error={errors.due_date}
              />
            </div>

            <div className="grid grid-cols-1 gap-6">
              <FloatingTextarea
                label="Description"
                value={formData.description}
                onChange={(e) =>
                  handleFieldChange("description", e.target.value)
                }
                rows={4}
                className="resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <SearchableSelect
                label="Priority"
                options={meta.taks_priority || []}
                value={formData.priority_id}
                onChange={(val) => handleFieldChange("priority_id", val)}
                placeholder="Select priority"
                required
                error={errors.priority_id}
              />

              <SearchableSelect
                label="UTBMS Code"
                options={meta.taks_UTBMSCode || []}
                value={formData.utbms_code_id}
                onChange={(val) => handleFieldChange("utbms_code_id", val)}
                placeholder="Select UTBMS code"
              />

              <SearchableSelect
                label="Status"
                options={meta.taks_status || []}
                value={formData.status_id}
                onChange={(val) => handleFieldChange("status_id", val)}
                placeholder="Select status"
                required
                error={errors.status_id}
              />
            </div>

            <div className="grid grid-cols-1 gap-6">
              <MultiSelect
                label="Assigned To"
                options={meta.assignees || []}
                value={formData.assigned_to}
                onChange={(val) => handleFieldChange("assigned_to", val)}
                placeholder="Select users"
                required
                error={errors.assigned_to}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2">
                <Label className="text-foreground font-medium">Billable</Label>
                <div className="flex items-center space-x-2 h-11">
                  <Checkbox
                    id="billable"
                    checked={formData.billable}
                    onCheckedChange={(checked) =>
                      handleFieldChange("billable", checked)
                    }
                  />
                  <label
                    htmlFor="billable"
                    className="text-sm font-medium leading-none cursor-pointer"
                  >
                    Is Billable
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-foreground font-medium">Notify Text</Label>
                <div className="flex items-center space-x-2 h-11">
                  <Checkbox
                    id="notify_text"
                    checked={formData.notify_text}
                    onCheckedChange={(checked) =>
                      handleFieldChange("notify_text", checked)
                    }
                  />
                  <label
                    htmlFor="notify_text"
                    className="text-sm font-medium leading-none cursor-pointer"
                  >
                    Notify via Text
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-foreground font-medium">
                  Calendar Event
                </Label>
                <div className="flex items-center space-x-2 h-11">
                  <Checkbox
                    id="add_calendar_event"
                    checked={formData.add_calendar_event}
                    onCheckedChange={(checked) =>
                      handleFieldChange("add_calendar_event", checked)
                    }
                  />
                  <label
                    htmlFor="add_calendar_event"
                    className="text-sm font-medium leading-none cursor-pointer"
                  >
                    Add to Calendar
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-foreground font-medium">Reminders</Label>
                <div className="flex items-center space-x-2 h-11">
                  <Checkbox
                    id="trigger_appointment_reminders"
                    checked={formData.trigger_appointment_reminders}
                    onCheckedChange={(checked) =>
                      handleFieldChange(
                        "trigger_appointment_reminders",
                        checked
                      )
                    }
                  />
                  <label
                    htmlFor="trigger_appointment_reminders"
                    className="text-sm font-medium leading-none cursor-pointer"
                  >
                    Trigger Reminders
                  </label>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label className="text-lg font-semibold text-foreground">
                  Reminders
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddReminder}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Reminder
                </Button>
              </div>

              {formData.reminders.map((reminder, index) => (
                <div
                  key={index}
                  className="bg-muted rounded-lg p-4 space-y-4 border"
                >
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium text-foreground">
                      Reminder #{index + 1}
                    </h4>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRemoveReminder(index)}
                      disabled={deleteReminderMutation.isPending}
                    >
                      {deleteReminderMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <SearchableSelect
                      label="Reminder Type"
                      options={meta.taks_reminders_type || []}
                      value={reminder.type_id}
                      onChange={(val) =>
                        handleReminderChange(index, "type_id", val)
                      }
                      placeholder="Select reminder type"
                      required
                      error={errors[`reminder_${index}_type_id`]}
                    />

                    <DateTimePicker
                      label="Scheduled At"
                      value={reminder.scheduled_at}
                      onChange={(val) =>
                        handleReminderChange(index, "scheduled_at", val)
                      }
                      required
                      error={errors[`reminder_${index}_scheduled_at`]}
                    />
                  </div>
                </div>
              ))}

              {formData.reminders.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No reminders added. Click "Add Reminder" to create one.
                </div>
              )}
            </div>

            <FileUploadBox
              files={uploadedFiles}
              onFilesChange={handleFilesChange}
              onUpload={handleFileUpload}
              onDelete={handleFileDelete}
            />
          </div>

          <div className="flex justify-end gap-4 pt-6">
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              type="button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                isEditMode ? updateMutation.isPending : saveMutation.isPending
              }
            >
              {isEditMode ? (
                updateMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Task"
                )
              ) : saveMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Task"
              )}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
