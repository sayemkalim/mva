import { useState, useEffect, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { toast } from "sonner";
import { Trash2, Plus, Upload, X, FileIcon, Check, Loader2, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

import { createEvent, updateEvent } from "../helpers/createEvent";
import { fetchEventMeta } from "../helpers/fetchEventMeta";
import { fetchEventById } from "../helpers/fetchEventById";
import { uploadAttachment } from "@/pages/task/helpers/uploadAttachment";
import { deleteAttachment } from "@/pages/task/helpers/deleteTask";
import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

const fetchContactBySlug = async (slug) => {
  if (!slug) return null;
  
  const apiResponse = await apiService({
    endpoint: endpoints.searchContact,
    method: "POST",
    data: { searchBar: "" },
    headers: {
      "Content-Type": "application/json",
    },
  });
  
  const contacts = apiResponse?.response?.data || [];
  const contact = contacts.find(c => c.slug === slug);
  return contact || null;
};

const AttachmentUploader = ({ files, onFilesChange, onUpload, onDelete }) => {
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
      onFilesChange(files.filter((file) => file.tempId !== fileToRemove.tempId));
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
      <div className="flex items-center justify-between border-b pb-2">
        <h3 className="font-semibold text-sm text-foreground">Attachments</h3>
        <div className="text-sm text-muted-foreground">
          {files.length} file{files.length !== 1 ? "s" : ""}
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
          "relative border-2 border-dashed rounded-lg p-4 transition-all",
          isDragging && "border-primary bg-primary/10 scale-[1.02]",
          "border-input"
        )}
      >
        {files.length === 0 ? (
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
                All file types supported
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {files.map((file) => (
                <div
                  key={file.tempId}
                  className="relative bg-card border rounded-lg overflow-hidden hover:shadow-md transition-shadow group"
                >
                  <button
                    type="button"
                    onClick={(e) => handleRemoveFile(e, file)}
                    className="absolute top-1 right-1 z-10 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                  <div className="aspect-video bg-gray-100 flex items-center justify-center relative">
                    {isImageFile(file.type) && previewUrls[file.tempId] ? (
                      <img
                        src={previewUrls[file.tempId]}
                        alt={file.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <FileIcon className="h-8 w-8 text-gray-400" />
                    )}

                    {file.uploading && !file.uploaded && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Loader2 className="h-5 w-5 animate-spin text-white" />
                      </div>
                    )}

                    {file.uploaded && (
                      <div className="absolute top-1 left-1 bg-green-500 text-white rounded-full p-0.5">
                        <Check className="h-2.5 w-2.5" />
                      </div>
                    )}
                    {file.deleting && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Loader2 className="h-5 w-5 animate-spin text-white" />
                      </div>
                    )}
                  </div>
                  <div className="p-2 space-y-0.5">
                    <p
                      className="text-xs font-medium truncate"
                      title={file.name}
                    >
                      {file.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)}
                    </p>
                    {file.uploading && !file.uploaded && (
                      <p className="text-xs text-blue-600">Uploading...</p>
                    )}
                    {file.uploaded && file.id && (
                      <p className="text-xs text-green-600">✓ Uploaded</p>
                    )}
                    {file.deleting && (
                      <p className="text-xs text-red-600">Deleting...</p>
                    )}
                    {file.uploadFailed && (
                      <p className="text-xs text-red-600">Upload failed</p>
                    )}
                  </div>
                </div>
              ))}
              <div
                onClick={handleBoxClick}
                className="relative bg-gradient-to-br from-primary/5 to-primary/10 border-2 border-dashed border-primary/30 rounded-lg overflow-hidden hover:shadow-md hover:border-primary transition-all cursor-pointer group"
              >
                <div className="aspect-video flex flex-col items-center justify-center gap-1 p-3">
                  <div className="rounded-full bg-primary/10 p-2 group-hover:bg-primary/20 transition-colors">
                    <Plus className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-xs font-medium text-primary">Add More</p>
                </div>
              </div>
            </div>
          </div>
        )}
        {isAnyFileUploading && (
          <div className="absolute bottom-2 right-2 bg-blue-500 text-white px-2 py-1 rounded-full flex items-center gap-1 text-xs pointer-events-none">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>Uploading...</span>
          </div>
        )}
      </div>
    </div>
  );
};

const ReadOnlyContactDisplay = ({ contactName, contactEmail, isLoading }) => {
  if (isLoading) {
    return (
      <div className="space-y-2">
        <Label className="text-foreground font-medium flex items-center gap-2">
          Contact
          <Lock className="h-3 w-3 text-muted-foreground" />
        </Label>
        <div className="flex items-center gap-2 p-3 rounded-md bg-gray-100 border border-gray-200 shadow-sm">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">Loading contact...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label className="text-foreground font-medium flex items-center gap-2">
        Contact
        <Lock className="h-3 w-3 text-muted-foreground" />
      </Label>
      <div className="flex items-center gap-2 p-3 rounded-md bg-gray-100 border border-gray-200 shadow-sm">
        <div className="flex items-center justify-center bg-primary/10 text-primary rounded-full h-8 w-8">
          <Check className="h-4 w-4" />
        </div>
        <div className="flex-1">
          <div className="font-semibold text-sm text-foreground">
            {contactName || "No Contact Selected"}
          </div>
          {contactEmail && (
            <div className="text-xs text-gray-500">
              {contactEmail}
            </div>
          )}
        </div>
        <span className="px-2 py-0.5 bg-primary/10 rounded-full text-xs text-primary font-medium tracking-wide flex items-center gap-1">
          <Lock className="h-3 w-3" />
          Fixed
        </span>
      </div>
    </div>
  );
};

const EventFormDialog = ({ open, onClose, event, slotInfo, onDelete, contactSlugFromUrl }) => {
  const queryClient = useQueryClient();
  const isEditing = !!event;

  const { data: contactData, isLoading: isContactLoading } = useQuery({
    queryKey: ["contactBySlug", contactSlugFromUrl],
    queryFn: () => fetchContactBySlug(contactSlugFromUrl),
    enabled: !!contactSlugFromUrl && open,
  });

  const contactId = contactData?.id || "";
  const contactName = contactData?.contact_name || "";
  const contactEmail = contactData?.primary_email || "";
  const contactSlug = contactData?.slug || contactSlugFromUrl || "";

  const { data: metaData } = useQuery({
    queryKey: ["eventMeta"],
    queryFn: fetchEventMeta,
  });

  const { data: eventDetailsData, isLoading: isLoadingDetails } = useQuery({
    queryKey: ["eventDetails", event?.id],
    queryFn: () => fetchEventById(event?.id),
    enabled: !!event?.id && open,
  });

  const eventDetails = eventDetailsData?.response?.event;

  const meta = metaData?.response || {};
  const categories = meta.event_categories || [];
  const statuses = meta.event_status || [];
  const priorities = meta.event_priority || [];
  const repeats = meta.event_repeat || [];
  const reminderTypes = meta.event_reminders_type || [];
  const reminderTimings = meta.event_reminders_timing || [];
  const reminderRelatives = meta.event_reminders_relative || [];
  const participantStatuses = meta.event_participants_status || [];
  const participantEmails = meta.participants_email || [];
  const participantRoles = meta.participants_roles || [];

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    start_date: "",
    start_time: "",
    end_date: "",
    end_time: "",
    all_day: false,
    category_id: "",
    status_id: "",
    priority_id: "",
    repeat_id: "",
    initial_id: "",
    slug: "",
  });

  const [reminders, setReminders] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [attachmentIds, setAttachmentIds] = useState([]);
  
  const [reminderDialogOpen, setReminderDialogOpen] = useState(false);
  const [newReminder, setNewReminder] = useState({
    type_id: "",
    timing_id: "",
    value: 15,
    relative_id: "",
  });

  const [participantDialogOpen, setParticipantDialogOpen] = useState(false);
  const [newParticipant, setNewParticipant] = useState({
    user_id: "",
    role_id: "",
    status_id: "",
    comment: "",
  });

  useEffect(() => {
    if (isEditing && eventDetails) {
      const startDate = new Date(eventDetails.start_time);
      const endDate = new Date(eventDetails.end_time);

      setFormData({
        title: eventDetails.title || "",
        description: eventDetails.description || "",
        start_date: format(startDate, "yyyy-MM-dd"),
        start_time: format(startDate, "HH:mm"),
        end_date: format(endDate, "yyyy-MM-dd"),
        end_time: format(endDate, "HH:mm"),
        all_day: eventDetails.all_day === 1 || eventDetails.all_day === true,
        category_id: eventDetails.category_id ? String(eventDetails.category_id) : "",
        status_id: eventDetails.status_id ? String(eventDetails.status_id) : "",
        priority_id: eventDetails.priority_id ? String(eventDetails.priority_id) : "",
        repeat_id: eventDetails.repeat_id ? String(eventDetails.repeat_id) : "",
        initial_id: contactId ? String(contactId) : "",
        slug: contactSlug || "",
      });
      setReminders(
        (eventDetails.reminders || []).map((r) => ({
          type_id: String(r.type_id),
          timing_id: String(r.timing_id),
          value: r.value,
          relative_id: String(r.relative_id),
        }))
      );
      setParticipants(
        (eventDetails.participants || []).map((p) => ({
          user_id: String(p.user_id),
          role_id: String(p.role_id),
          status_id: String(p.status_id),
          comment: p.comment || "",
        }))
      );
      if (Array.isArray(eventDetails.attachments)) {
        const existingFiles = eventDetails.attachments.map((att) => ({
          tempId: `existing_${att.id}`,
          id: att.id,
          name: att.original_name || "File",
          size: att.size || 0,
          type: att.mime_type || "",
          uploaded: true,
          uploading: false,
        }));
        setUploadedFiles(existingFiles);
        setAttachmentIds(eventDetails.attachments.map((att) => att.id));
      } else {
        setUploadedFiles([]);
        setAttachmentIds([]);
      }
    } else if (!isEditing && slotInfo) {
      const startDate = slotInfo.start;
      const endDate = slotInfo.end || slotInfo.start;

      setFormData({
        title: "",
        description: "",
        start_date: format(startDate, "yyyy-MM-dd"),
        start_time: format(startDate, "HH:mm"),
        end_date: format(endDate, "yyyy-MM-dd"),
        end_time: format(endDate, "HH:mm"),
        all_day: false,
        category_id: categories.length > 0 ? String(categories[0].id) : "",
        status_id: statuses.length > 0 ? String(statuses[0].id) : "",
        priority_id: priorities.length > 0 ? String(priorities[0].id) : "",
        repeat_id: repeats.length > 0 ? String(repeats[0].id) : "",
        initial_id: contactId ? String(contactId) : "",
        slug: contactSlug || "",
      });
      setReminders([]);
      setParticipants([]);
      setUploadedFiles([]);
      setAttachmentIds([]);
    }
  }, [eventDetails, slotInfo, isEditing, categories, statuses, priorities, repeats, contactId, contactSlug]);

  const { mutate: createEventMutation, isPending: isCreating } = useMutation({
    mutationFn: createEvent,
    onSuccess: () => {
      toast.success("Event created successfully.");
      queryClient.invalidateQueries({ queryKey: ["eventList"] });
      onClose();
    },
    onError: () => {
      toast.error("Failed to create event.");
    },
  });

  const { mutate: updateEventMutation, isPending: isUpdating } = useMutation({
    mutationFn: ({ id, data }) => updateEvent(id, data),
    onSuccess: () => {
      toast.success("Event updated successfully.");
      queryClient.invalidateQueries({ queryKey: ["eventList"] });
      queryClient.invalidateQueries({ queryKey: ["eventDetails"] });
      onClose();
    },
    onError: () => {
      toast.error("Failed to update event.");
    },
  });

  const uploadMutation = useMutation({
    mutationFn: uploadAttachment,
    onSuccess: (response, variables) => {
      const attachmentId = response?.response?.attachment?.id;
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
                  name: fullFileName,
                  uploaded: true,
                  uploading: false,
                }
              : file
          )
        );

        setAttachmentIds((prev) => [...prev, attachmentId]);
        toast.success(`File uploaded: ${fullFileName}`);
      } else {
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
    onSuccess: (response, attachmentId) => {
      setUploadedFiles((prev) =>
        prev.filter((file) => file.id !== attachmentId)
      );
      setAttachmentIds((prev) => prev.filter((id) => id !== attachmentId));
      toast.success("Attachment deleted successfully");
    },
    onError: (error, attachmentId) => {
      setUploadedFiles((prev) =>
        prev.map((file) =>
          file.id === attachmentId ? { ...file, deleting: false } : file
        )
      );
      toast.error("Failed to delete attachment");
    },
  });

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
    if (attachmentId) {
      deleteAttachmentMutation.mutate(attachmentId);
    } else {
      setUploadedFiles((prev) =>
        prev.filter((file) => file.tempId !== tempId)
      );
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const openReminderDialog = () => {
    setNewReminder({
      type_id: reminderTypes.length > 0 ? String(reminderTypes[0].id) : "",
      timing_id: reminderTimings.length > 0 ? String(reminderTimings[0].id) : "",
      value: 15,
      relative_id: reminderRelatives.length > 0 ? String(reminderRelatives[0].id) : "",
    });
    setReminderDialogOpen(true);
  };

  const handleNewReminderChange = (field, value) => {
    setNewReminder((prev) => ({ ...prev, [field]: value }));
  };

  const confirmAddReminder = () => {
    if (!newReminder.type_id || !newReminder.timing_id || !newReminder.relative_id) {
      toast.error("Please fill in all reminder fields.");
      return;
    }
    setReminders((prev) => [...prev, { ...newReminder }]);
    setReminderDialogOpen(false);
  };

  const updateReminder = (index, field, value) => {
    setReminders((prev) =>
      prev.map((reminder, i) =>
        i === index ? { ...reminder, [field]: value } : reminder
      )
    );
  };

  const removeReminder = (index) => {
    setReminders((prev) => prev.filter((_, i) => i !== index));
  };

  const openParticipantDialog = () => {
    setNewParticipant({
      user_id: participantEmails.length > 0 ? String(participantEmails[0].id) : "",
      role_id: participantRoles.length > 0 ? String(participantRoles[0].id) : "",
      status_id: participantStatuses.length > 0 ? String(participantStatuses[0].id) : "",
      comment: "",
    });
    setParticipantDialogOpen(true);
  };

  const handleNewParticipantChange = (field, value) => {
    setNewParticipant((prev) => ({ ...prev, [field]: value }));
  };

  const confirmAddParticipant = () => {
    if (!newParticipant.user_id) {
      toast.error("Please select a user.");
      return;
    }
    setParticipants((prev) => [...prev, { ...newParticipant }]);
    setParticipantDialogOpen(false);
  };

  const updateParticipant = (index, field, value) => {
    setParticipants((prev) =>
      prev.map((participant, i) =>
        i === index ? { ...participant, [field]: value } : participant
      )
    );
  };

  const removeParticipant = (index) => {
    setParticipants((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error("Please enter an event title.");
      return;
    }

    const startDateTime = formData.all_day
      ? `${formData.start_date} 00:00:00`
      : `${formData.start_date} ${formData.start_time}:00`;

    const endDateTime = formData.all_day
      ? `${formData.end_date} 23:59:59`
      : `${formData.end_date} ${formData.end_time}:00`;

    const payload = {
      title: formData.title,
      description: formData.description,
      start_time: startDateTime,
      end_time: endDateTime,
      all_day: formData.all_day ? 1 : 0,
      category_id: formData.category_id ? parseInt(formData.category_id) : null,
      status_id: formData.status_id ? parseInt(formData.status_id) : null,
      priority_id: formData.priority_id ? parseInt(formData.priority_id) : null,
      repeat_id: formData.repeat_id ? parseInt(formData.repeat_id) : null,
      initial_id: contactId ? parseInt(contactId) : null,
      slug: contactSlug || null,
      reminders: reminders.map((r) => ({
        type_id: parseInt(r.type_id),
        timing_id: parseInt(r.timing_id),
        value: parseInt(r.value),
        relative_id: parseInt(r.relative_id),
      })),
      participants: participants
        .filter((p) => p.user_id)
        .map((p) => ({
          user_id: parseInt(p.user_id),
          role_id: parseInt(p.role_id),
          status_id: parseInt(p.status_id),
          comment: p.comment || "",
        })),
      attachment_ids: attachmentIds,
    };

    if (isEditing) {
      updateEventMutation({ id: event.id, data: payload });
    } else {
      createEventMutation(payload);
    }
  };

  const isLoading = isCreating || isUpdating;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle>{isEditing ? "Edit Event" : "New Event"}</DialogTitle>
        </DialogHeader>

        {isEditing && isLoadingDetails ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-gray-500">Loading event details...</p>
          </div>
        ) : (
          <div className="h-[calc(90vh-140px)] overflow-x-hidden">
            <form onSubmit={handleSubmit} className="space-y-6 px-6 pb-6 overflow-y-auto">
              <div className="space-y-4">
                <h3 className="font-semibold text-sm text-foreground border-b pb-2">
                  Basic Information
                </h3>

                <div className="space-y-2">
                  <Label htmlFor="title">Event Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                    placeholder="Enter event title"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                    placeholder="Enter event description"
                    rows={3}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="all_day"
                    checked={formData.all_day}
                    onCheckedChange={(checked) => handleChange("all_day", checked)}
                  />
                  <Label htmlFor="all_day" className="cursor-pointer">
                    All day event
                  </Label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start_date">Start Date *</Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => handleChange("start_date", e.target.value)}
                    />
                  </div>
                  {!formData.all_day && (
                    <div className="space-y-2">
                      <Label htmlFor="start_time">Start Time</Label>
                      <Input
                        id="start_time"
                        type="time"
                        value={formData.start_time}
                        onChange={(e) => handleChange("start_time", e.target.value)}
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="end_date">End Date *</Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => handleChange("end_date", e.target.value)}
                    />
                  </div>
                  {!formData.all_day && (
                    <div className="space-y-2">
                      <Label htmlFor="end_time">End Time</Label>
                      <Input
                        id="end_time"
                        type="time"
                        value={formData.end_time}
                        onChange={(e) => handleChange("end_time", e.target.value)}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-sm text-foreground border-b pb-2">
                  Event Details
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select
                      value={formData.category_id}
                      onValueChange={(value) => handleChange("category_id", value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={String(cat.id)}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                      value={formData.status_id}
                      onValueChange={(value) => handleChange("status_id", value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {statuses.map((status) => (
                          <SelectItem key={status.id} value={String(status.id)}>
                            {status.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select
                      value={formData.priority_id}
                      onValueChange={(value) => handleChange("priority_id", value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        {priorities.map((priority) => (
                          <SelectItem key={priority.id} value={String(priority.id)}>
                            {priority.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Repeat</Label>
                    <Select
                      value={formData.repeat_id}
                      onValueChange={(value) => handleChange("repeat_id", value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select repeat" />
                      </SelectTrigger>
                      <SelectContent>
                        {repeats.map((repeat) => (
                          <SelectItem key={repeat.id} value={String(repeat.id)}>
                            {repeat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <ReadOnlyContactDisplay 
                  contactName={contactName}
                  contactEmail={contactEmail}
                  isLoading={isContactLoading}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-2">
                  <h3 className="font-semibold text-sm text-foreground">Reminders</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={openReminderDialog}
                    className="flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    Add Reminder
                  </Button>
                </div>

                {reminders.map((reminder, index) => (
                  <div
                    key={index}
                    className="p-3 bg-muted rounded-lg space-y-3"
                  >
                    <div className="grid grid-cols-4 gap-2">
                      <div className="space-y-1">
                        <Label className="text-xs">Type</Label>
                        <Select
                          value={reminder.type_id}
                          onValueChange={(value) =>
                            updateReminder(index, "type_id", value)
                          }
                        >
                          <SelectTrigger className="h-9 w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {reminderTypes.map((type) => (
                              <SelectItem key={type.id} value={String(type.id)}>
                                {type.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs">Value</Label>
                        <Input
                          type="number"
                          className="h-9 w-full"
                          value={reminder.value}
                          onChange={(e) =>
                            updateReminder(index, "value", e.target.value)
                          }
                        />
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs">Timing</Label>
                        <Select
                          value={reminder.timing_id}
                          onValueChange={(value) =>
                            updateReminder(index, "timing_id", value)
                          }
                        >
                          <SelectTrigger className="h-9 w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {reminderTimings.map((timing) => (
                              <SelectItem key={timing.id} value={String(timing.id)}>
                                {timing.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-end gap-2">
                        <div className="flex-1 space-y-1">
                          <Label className="text-xs">Relative To</Label>
                          <Select
                            value={reminder.relative_id}
                            onValueChange={(value) =>
                              updateReminder(index, "relative_id", value)
                            }
                          >
                            <SelectTrigger className="h-9 w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {reminderRelatives.map((rel) => (
                                <SelectItem key={rel.id} value={String(rel.id)}>
                                  {rel.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 shrink-0 text-red-500 hover:text-red-700 hover:bg-red-50 cursor-pointer"
                          onClick={() => removeReminder(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}

                {reminders.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-2">
                    No reminders added
                  </p>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-2">
                  <h3 className="font-semibold text-sm text-foreground">
                    Participants
                  </h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={openParticipantDialog}
                    className="flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    Add Participant
                  </Button>
                </div>

                {participants.map((participant, index) => (
                  <div
                    key={index}
                    className="p-3 bg-muted rounded-lg space-y-3"
                  >
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label className="text-xs">User</Label>
                        <Select
                          value={participant.user_id}
                          onValueChange={(value) =>
                            updateParticipant(index, "user_id", value)
                          }
                        >
                          <SelectTrigger className="h-9 w-full">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            {participantEmails.map((user) => (
                              <SelectItem key={user.id} value={String(user.id)}>
                                {user.email}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs">Role</Label>
                        <Select
                          value={participant.role_id}
                          onValueChange={(value) =>
                            updateParticipant(index, "role_id", value)
                          }
                        >
                          <SelectTrigger className="h-9 w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {participantRoles.map((role) => (
                              <SelectItem key={role.id} value={String(role.id)}>
                                {role.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label className="text-xs">Status</Label>
                        <Select
                          value={participant.status_id}
                          onValueChange={(value) =>
                            updateParticipant(index, "status_id", value)
                          }
                        >
                          <SelectTrigger className="h-9 w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {participantStatuses.map((status) => (
                              <SelectItem key={status.id} value={String(status.id)}>
                                {status.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-end gap-2">
                        <div className="flex-1 space-y-1">
                          <Label className="text-xs">Comment</Label>
                          <Input
                            className="h-9 w-full"
                            value={participant.comment}
                            onChange={(e) =>
                              updateParticipant(index, "comment", e.target.value)
                            }
                            placeholder="Comment"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 shrink-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => removeParticipant(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}

                {participants.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-2">
                    No participants added
                  </p>
                )}
              </div>

              {/* Attachments Section */}
              <AttachmentUploader
                files={uploadedFiles}
                onFilesChange={handleFilesChange}
                onUpload={handleFileUpload}
                onDelete={handleFileDelete}
              />

              <DialogFooter className="flex justify-between pt-4 border-t gap-2">
                <div>
                  {isEditing && onDelete && (
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => {
                        onClose();
                        onDelete(event);
                      }}
                      className="flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </Button>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading
                      ? "Saving..."
                      : isEditing
                      ? "Update Event"
                      : "Create Event"}
                  </Button>
                </div>
              </DialogFooter>
            </form>
          </div>
        )}
      </DialogContent>

      {/* Add Reminder Dialog */}
      <Dialog open={reminderDialogOpen} onOpenChange={setReminderDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Reminder</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type *</Label>
                <Select
                  value={newReminder.type_id}
                  onValueChange={(value) => handleNewReminderChange("type_id", value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {reminderTypes.map((type) => (
                      <SelectItem key={type.id} value={String(type.id)}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Value *</Label>
                <Input
                  type="number"
                  value={newReminder.value}
                  onChange={(e) => handleNewReminderChange("value", e.target.value)}
                  placeholder="Enter value (e.g., 15)"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Timing *</Label>
                <Select
                  value={newReminder.timing_id}
                  onValueChange={(value) => handleNewReminderChange("timing_id", value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select timing" />
                  </SelectTrigger>
                  <SelectContent>
                    {reminderTimings.map((timing) => (
                      <SelectItem key={timing.id} value={String(timing.id)}>
                        {timing.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Relative To *</Label>
                <Select
                  value={newReminder.relative_id}
                  onValueChange={(value) => handleNewReminderChange("relative_id", value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select relative" />
                  </SelectTrigger>
                  <SelectContent>
                    {reminderRelatives.map((rel) => (
                      <SelectItem key={rel.id} value={String(rel.id)}>
                        {rel.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setReminderDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button type="button" onClick={confirmAddReminder}>
              Add Reminder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Participant Dialog */}
      <Dialog open={participantDialogOpen} onOpenChange={setParticipantDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Participant</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email *</Label>
                <Select
                  value={newParticipant.user_id}
                  onValueChange={(value) => handleNewParticipantChange("user_id", value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select user email" />
                  </SelectTrigger>
                  <SelectContent>
                    {participantEmails.map((user) => (
                      <SelectItem key={user.id} value={String(user.id)}>
                        {user.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Role *</Label>
                <Select
                  value={newParticipant.role_id}
                  onValueChange={(value) => handleNewParticipantChange("role_id", value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {participantRoles.map((role) => (
                      <SelectItem key={role.id} value={String(role.id)}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Status *</Label>
                <Select
                  value={newParticipant.status_id}
                  onValueChange={(value) => handleNewParticipantChange("status_id", value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {participantStatuses.map((status) => (
                      <SelectItem key={status.id} value={String(status.id)}>
                        {status.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Comment</Label>
                <Input
                  value={newParticipant.comment}
                  onChange={(e) => handleNewParticipantChange("comment", e.target.value)}
                  placeholder="Add a comment (optional)"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setParticipantDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button type="button" onClick={confirmAddParticipant}>
              Add Participant
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
};

export default EventFormDialog;

