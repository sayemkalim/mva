import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  FolderClosed,
  FolderArchive,
  FileText,
  Trash2,
  Edit2,
  Check,
  X,
  GripVertical,
  FileArchive,
  FileVideo,
  FileAudio,
  FileSignature,
  File,
  FileCode,
  FileJson,
  FileSpreadsheet,
  FileImage,
} from "lucide-react";
import { cn } from "@/lib/utils";
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
import { sortFolders } from "../helpers/sortFolders";
import { sortDocuments } from "../helpers/sortDocuments";

const DocumentItem = ({ document, slug, dragAttributes, dragListeners, isDragging }) => {
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

const handleGetDocIcon = (type = "") => {
  const ext = type.toLowerCase();

  switch (ext) {
    case "pdf":
      return <FileText className="h-4 w-4 text-red-600 dark:text-red-400" />;

    case "doc":
    case "docx":
    case "rtf":
      return <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />;

    case "xls":
    case "xlsx":
    case "csv":
      return <FileSpreadsheet className="h-4 w-4 text-green-600 dark:text-green-400" />;

    case "txt":
      return <FileText className="h-4 w-4 text-gray-600 dark:text-gray-400" />;

    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
    case "webp":
    case "svg":
      return <FileImage className="h-4 w-4 text-pink-600 dark:text-pink-400" />;

    default:
      return <File className="h-4 w-4 text-gray-500 dark:text-gray-400" />;
  }
};

  const handleDelete = () => {
    if (document.id) {
      deleteMutation.mutate(document.id);
    }
  };

  return (
    <div className="group flex items-center gap-3 py-2 px-3 ml-4 bg-gray-100 dark:hover:bg-blue-950/30 cursor-pointer transition-all duration-200 border border-transparent hover:border-gray-100 dark:hover:border-blue-800">
      {dragAttributes && dragListeners && (
        <div 
          {...dragAttributes} 
          {...dragListeners}
          className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
        >
          <GripVertical className="h-3 w-3 text-gray-400" />
        </div>
      )}
      <div className="p-1.5 bg-blue-100 dark:bg-blue-900/50 group-hover:bg-blue-200 dark:group-hover:bg-blue-800/50 transition-colors">
        {handleGetDocIcon(document.type || 'pdf')}
      </div>
      <div className="flex flex-col min-w-0 flex-1">
        <span className="text-sm font-medium text-foreground truncate">
          {document.title || "Untitled Document"}
        </span>
      </div>
      
      {!isDragging && (
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
              Are you sure you want to delete "{document.title || "Untitled Document"}"? 
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
      )}
    </div>
  );
};

const SortableDocumentItem = ({ document, slug, folderId }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: `doc-${document.id}`,
    data: {
      type: 'document',
      folderId: folderId,
      document: document
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <DocumentItem
        document={document}
        slug={slug}
        dragAttributes={attributes}
        dragListeners={listeners}
        isDragging={isDragging}
      />
    </div>
  );
};

const SortableFolderItem = ({ folder, level = 0, isSubFolder = false, slug, parentId = null, count = 0 }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: folder.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <FolderItem
        folder={folder}
        level={level}
        isSubFolder={isSubFolder}
        slug={slug}
        parentId={parentId}
        dragAttributes={attributes}
        dragListeners={listeners}
        isDragging={isDragging}
        count={count}
      />
    </div>
  );
};

const FolderItem = ({ 
  folder, 
  level = 0, 
  isSubFolder = false, 
  slug, 
  parentId = null, 
  count = 0,
  dragAttributes, 
  dragListeners, 
  isDragging 
}) => {
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
          level > 0 ? "ml-6 bg-gray-100 rounded-none": "border border-gray-200",
        )}
        onClick={toggleOpen}
      >
        <div 
          {...dragAttributes} 
          {...dragListeners}
          className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
        >
          <GripVertical className="h-4 w-4 text-gray-400" />
        </div>
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
              {count > 0 && `${count}. `}
              {folder.name}
            </span>
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
            {hasSubFolders && (
              <SortableContext
                items={folder.subFolders.map(sf => sf.id)}
                strategy={verticalListSortingStrategy}
              >
                {folder.subFolders.map((subFolder) => (
                  <SortableFolderItem
                    key={`folder-${subFolder.id}`}
                    folder={subFolder}
                    level={level + 1}
                    isSubFolder={true}
                    slug={slug}
                    parentId={folder.id}
                  />
                ))}
              </SortableContext>
            )}
            {hasDocuments && (
              <SortableContext
                items={folder.documents.map(doc => `doc-${doc.id}`)}
                strategy={verticalListSortingStrategy}
              >
                {folder.documents.map((doc) => (
                  <SortableDocumentItem 
                    key={`doc-${doc.id}`} 
                    document={doc} 
                    slug={slug}
                    folderId={folder.id}
                  />
                ))}
              </SortableContext>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const FolderTree = ({ folders = [], isLoading = false, slug }) => {
  const [items, setItems] = useState(folders);
  const queryClient = useQueryClient();
  
  useEffect(() => {
    setItems(folders);
  }, [folders]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  const sortFolderMutation = useMutation({
    mutationFn: (sortData) => sortFolders(sortData),
    onSuccess: (data) => {
      const resp = data?.response;
      if (resp?.ApiStatus === false) {
        toast.error(resp?.message || "Failed to sort folders");
        return;
      }
      toast.success("Folders reordered successfully!");
      queryClient.invalidateQueries(["documenti-folders", slug]);
      queryClient.invalidateQueries(["documenti-folders-dropdown", slug]);
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to sort folders");
    },
  });

  const sortDocumentMutation = useMutation({
    mutationFn: (sortData) => sortDocuments(sortData),
    onSuccess: (data) => {
      const resp = data?.response;
      if (resp?.ApiStatus === false) {
        toast.error(resp?.message || "Failed to sort documents");
        return;
      }
      toast.success("Documents reordered successfully!");
      queryClient.invalidateQueries(["documenti-folders", slug]);
      queryClient.invalidateQueries(["documenti-folders-dropdown", slug]);
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to sort documents");
    },
  });
  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const activeId = active.id;
    const overId = over.id;
    const activeType = active.data.current?.type;
    
    if (activeType === 'document' || activeId.toString().startsWith('doc-')) {
      const activeDocId = activeType === 'document' ? 
        active.data.current.document.id : 
        parseInt(activeId.toString().replace('doc-', ''));
      
      const overDocId = overId.toString().startsWith('doc-') ? 
        parseInt(overId.toString().replace('doc-', '')) :
        over.data.current?.document?.id;

      if (!overDocId) return;
      let targetFolder = null;
      
      const findFolderWithDocuments = (folders, docId1, docId2) => {
        for (let folder of folders) {
          if (folder.documents && folder.documents.some(doc => doc.id === docId1 || doc.id === docId2)) {
            return folder;
          }
          if (folder.subFolders && folder.subFolders.length > 0) {
            for (let subFolder of folder.subFolders) {
              if (subFolder.documents && subFolder.documents.some(doc => doc.id === docId1 || doc.id === docId2)) {
                return subFolder;
              }
            }
          }
        }
        return null;
      };
      
      targetFolder = findFolderWithDocuments(items, activeDocId, overDocId);

      if (!targetFolder || !targetFolder.documents) return;

      const oldIndex = targetFolder.documents.findIndex(doc => doc.id === activeDocId);
      const newIndex = targetFolder.documents.findIndex(doc => doc.id === overDocId);

      if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return;

      const reorderedDocuments = arrayMove(targetFolder.documents, oldIndex, newIndex);
      
      setItems(prevItems => 
        prevItems.map(folder => 
          folder.id === targetFolder.id 
            ? { ...folder, documents: reorderedDocuments }
            : folder
        )
      );

      const sortData = reorderedDocuments.map((doc, index) => ({
        id: doc.id,
        sort: index + 1,
      }));
      sortDocumentMutation.mutate(sortData);
      return;
    }

    const findContainer = (id) => {
      const rootIndex = items.findIndex(folder => folder.id === id);
      if (rootIndex !== -1) {
        return { container: null, items: items, index: rootIndex };
      }
      for (let folder of items) {
        if (folder.subFolders) {
          const subIndex = folder.subFolders.findIndex(sf => sf.id === id);
          if (subIndex !== -1) {
            return { container: folder.id, items: folder.subFolders, index: subIndex };
          }
        }
      }
      return null;
    };

    const activeContainer = findContainer(active.id);
    const overContainer = findContainer(over.id);

    if (!activeContainer || !overContainer) {
      return;
    }
    if (activeContainer.container !== overContainer.container) {
      return;
    }

    const oldIndex = activeContainer.index;
    const newIndex = overContainer.index;

    if (oldIndex === newIndex) {
      return;
    }
    const newItems = arrayMove(activeContainer.items, oldIndex, newIndex);
    if (activeContainer.container === null) {
      setItems(newItems);
    } else {
      setItems(prevItems => 
        prevItems.map(folder => 
          folder.id === activeContainer.container 
            ? { ...folder, subFolders: newItems }
            : folder
        )
      );
    }
    const sortData = newItems.map((item, index) => ({
      id: item.id,
      sort: index + 1,
      parent_id: activeContainer.container,
    }));
    sortFolderMutation.mutate(sortData);
  };

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
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-1 p-2">
        <SortableContext
          items={items.map(folder => folder.id)}
          strategy={verticalListSortingStrategy}
        >
          {items.map((folder, index) => (
            <SortableFolderItem
              key={`folder-${folder.id}`}
              folder={folder}
              isSubFolder={false}
              slug={slug}
              parentId={null}
              count={index + 1}
            />
          ))}
        </SortableContext>
      </div>
    </DndContext>
  );
};

export default FolderTree;
