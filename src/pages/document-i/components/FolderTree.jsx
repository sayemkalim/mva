import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  FolderClosed,
  FolderArchive,
  FileText,
  File,
  Trash2,
  Edit2,
  Check,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, isValid } from "date-fns";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { deleteDocument } from "../helpers/deleteDocument";
import { renameFolder } from "../helpers/renameFolder";
import { deleteFolder } from "../helpers/deleteFolder";

const safeFormat = (dateStr, formatStr) => {
  const dateObj = dateStr ? new Date(dateStr) : null;
  return dateObj && isValid(dateObj) ? format(dateObj, formatStr) : "-";
};

const DocumentItem = ({ document, slug }) => {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (documentId) => deleteDocument(documentId),
    onSuccess: (data) => {
      const resp = data?.response;
      if (resp?.ApiStatus === false) {
        toast.error(resp?.message || "Failed to delete document");
        return;
      }
      toast.success("Document deleted successfully!");
      queryClient.invalidateQueries(["documenti-folders", slug]);
      queryClient.invalidateQueries(["documenti-folders-dropdown", slug]);
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to delete document");
    },
  });

  const handleDelete = () => {
    if (document.id) {
      deleteMutation.mutate(document.id);
    }
  };

  return (
    <div className="group flex items-center gap-3 py-2 px-3 ml-4 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/30 cursor-pointer transition-all duration-200 border border-transparent hover:border-blue-200 dark:hover:border-blue-800">
      <div className="p-1.5 rounded-md bg-blue-100 dark:bg-blue-900/50 group-hover:bg-blue-200 dark:group-hover:bg-blue-800/50 transition-colors">
        <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
      </div>
      <div className="flex flex-col min-w-0 flex-1">
        <span className="text-sm font-medium text-foreground truncate">
          {document.name || "Untitled Document"}
        </span>
        <div className="flex items-center gap-2">
          {document.date && (
            <span className="text-xs text-muted-foreground">
              {safeFormat(document.date, "MMM dd, yyyy")}
            </span>
          )}
          {document.memo && (
            <span className="text-xs text-muted-foreground truncate">
              • {document.memo}
            </span>
          )}
        </div>
      </div>
      
      {/* Delete Button with Confirmation */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
            disabled={deleteMutation.isPending}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Document</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{document.name || "Untitled Document"}"? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="bg-red-500 hover:bg-red-600"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

const FolderItem = ({ folder, level = 0, isSubFolder = false, slug }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(folder.name || "");
  const queryClient = useQueryClient();

  const renameMutation = useMutation({
    mutationFn: ({ folderId, name }) => renameFolder(folderId, name),
    onSuccess: (data) => {
      const resp = data?.response;
      if (resp?.ApiStatus === false) {
        toast.error(resp?.message || "Failed to rename folder");
        return;
      }
      toast.success("Folder renamed successfully!");
      setIsRenaming(false);
      // Invalidate both queries to refresh the data
      queryClient.invalidateQueries(["documenti-folders", slug]);
      queryClient.invalidateQueries(["documenti-folders-dropdown", slug]);
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to rename folder");
    },
  });

  const deleteFolderMutation = useMutation({
    mutationFn: (folderId) => deleteFolder(folderId),
    onSuccess: (data) => {
      const resp = data?.response;
      if (resp?.ApiStatus === false) {
        toast.error(resp?.message || "Failed to delete folder");
        return;
      }
      toast.success("Folder deleted successfully!");
      // Invalidate both queries to refresh the data
      queryClient.invalidateQueries(["documenti-folders", slug]);
      queryClient.invalidateQueries(["documenti-folders-dropdown", slug]);
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to delete folder");
    },
  });

  const handleDeleteFolder = () => {
    if (folder.id) {
      deleteFolderMutation.mutate(folder.id);
    }
  };

  const handleRenameStart = () => {
    setNewName(folder.name || "");
    setIsRenaming(true);
  };

  const handleRenameCancel = () => {
    setNewName(folder.name || "");
    setIsRenaming(false);
  };

  const handleRenameSubmit = () => {
    if (newName.trim() && newName.trim() !== folder.name && folder.id) {
      renameMutation.mutate({ folderId: folder.id, name: newName.trim() });
    } else {
      setIsRenaming(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleRenameSubmit();
    } else if (e.key === "Escape") {
      handleRenameCancel();
    }
  };

  const hasSubFolders = folder.subFolders && folder.subFolders.length > 0;
  const hasDocuments = folder.documents && folder.documents.length > 0;
  const hasChildren = hasSubFolders || hasDocuments;

  const toggleOpen = () => {
    if (hasChildren) {
      setIsOpen(!isOpen);
    }
  };

  const folderColors = isSubFolder
    ? {
        bg: "bg-purple-100 dark:bg-purple-900/50",
        bgHover: "group-hover:bg-purple-200 dark:group-hover:bg-purple-800/50",
        icon: "text-purple-600 dark:text-purple-400",
        border: "",
        hoverBg: "",
      }
    : {
        bg: "bg-amber-100 dark:bg-amber-900/50",
        bgHover: "group-hover:bg-amber-200 dark:group-hover:bg-amber-800/50",
        icon: "text-amber-600 dark:text-amber-400",
        border: "",
        hoverBg: "",
      };

  const FolderIcon = isSubFolder
    ? isOpen
      ? FolderArchive
      : FolderClosed
    : isOpen
      ? FolderOpen
      : Folder;

  return (
    <div className="select-none">
      <div
        className={cn(
          "group flex items-center gap-3 py-2.5 px-3 rounded-lg cursor-pointer transition-all duration-200 border border-transparent",
          folderColors.hoverBg,
          folderColors.border,
          level > 0 && "ml-6"
        )}
        onClick={toggleOpen}
      >
        <div
          className={cn(
            "w-5 h-5 flex items-center justify-center rounded transition-transform duration-200",
            isOpen && "rotate-0"
          )}
        >
          {hasChildren ? (
            isOpen ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )
          ) : (
            <span className="w-4 h-4" />
          )}
        </div>
        <div
          className={cn(
            "p-1.5 rounded-md transition-colors",
            folderColors.bg,
            folderColors.bgHover
          )}
        >
          <FolderIcon className={cn("h-5 w-5", folderColors.icon)} />
        </div>
        
        {/* Folder Name - Inline Editing */}
        {isRenaming ? (
          <div className="flex items-center gap-2 flex-1">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={handleKeyPress}
              className="h-8 text-sm font-semibold"
              autoFocus
              disabled={renameMutation.isPending}
            />
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950/20"
                onClick={handleRenameSubmit}
                disabled={renameMutation.isPending}
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-gray-500 hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-950/20"
                onClick={handleRenameCancel}
                disabled={renameMutation.isPending}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <>
            <span className="text-sm font-semibold text-foreground truncate flex-1">
              {folder.name}
            </span>
            {/* Action Buttons - Only show on hover */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/20"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRenameStart();
                }}
                disabled={renameMutation.isPending || deleteFolderMutation.isPending}
              >
                <Edit2 className="h-4 w-4" />
              </Button>
              
              {/* Delete Folder Button with Confirmation */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                    disabled={deleteFolderMutation.isPending || renameMutation.isPending}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Folder</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete "{folder.name || "Untitled Folder"}" and all its contents?
                      This action cannot be undone and will permanently remove all subfolders and documents.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={deleteFolderMutation.isPending}>
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteFolder}
                      disabled={deleteFolderMutation.isPending}
                      className="bg-red-500 hover:bg-red-600"
                    >
                      {deleteFolderMutation.isPending ? "Deleting..." : "Delete"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </>
        )}
        
        <div className="flex items-center gap-1.5">
          {hasSubFolders && (
            <span className="text-xs font-medium text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-900/50 px-2 py-0.5 rounded-full">
              {folder.subFolders.length} subfolder
              {folder.subFolders.length !== 1 ? "s" : ""}
            </span>
          )}
          {hasDocuments && (
            <span className="text-xs font-medium text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/50 px-2 py-0.5 rounded-full">
              {folder.documents.length} doc
              {folder.documents.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>
      <div
        className={cn(
          "overflow-hidden transition-all duration-300",
          isOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
        )}
      >
        {hasChildren && (
          <div
            className={cn(
              "ml-6 pl-4 border-l-2 border-dashed border-border/60",
              level > 0 && "ml-12"
            )}
          >
            {hasSubFolders &&
              folder.subFolders.map((subFolder) => (
                <FolderItem
                  key={`folder-${subFolder.id}`}
                  folder={subFolder}
                  level={level + 1}
                  isSubFolder={true}
                  slug={slug}
                />
              ))}
            {hasDocuments &&
              folder.documents.map((doc) => (
                <DocumentItem key={`doc-${doc.id}`} document={doc} slug={slug} />
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

const FolderTree = ({ folders = [], isLoading = false, slug }) => {
  if (isLoading) {
    return (
      <div className="space-y-3 p-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3 p-2">
            <div className="h-8 w-8 bg-accent animate-pulse rounded-md" />
            <div className="space-y-2 flex-1">
              <div className="h-4 w-40 bg-accent animate-pulse rounded" />
              <div className="h-3 w-24 bg-accent animate-pulse rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!folders || folders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <div className="p-4 rounded-full bg-accent/50 mb-4">
          <Folder className="h-12 w-12 opacity-50" />
        </div>
        <p className="text-base font-medium">No folders found</p>
        <p className="text-sm text-muted-foreground/70">
          Folders will appear here once created
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1 p-2">
      {folders.map((folder) => (
        <FolderItem
          key={`folder-${folder.id}`}
          folder={folder}
          isSubFolder={false}
          slug={slug}
        />
      ))}
    </div>
  );
};

export default FolderTree;
