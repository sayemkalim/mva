import { cn } from "@/lib/utils";
import { Pencil, Plus, Tag, Trash, Edit2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label as UiLabel } from "@/components/ui/label";


const LabelDialog = ({ open, onOpenChange, onSubmit, initialData }) => {
  const [name, setName] = useState(initialData?.name || "");
  const [color, setColor] = useState(initialData?.color || "#ff0000");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ name, color });
    setName("");
    setColor("#ff0000");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Label" : "Create Label"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <UiLabel>Name</UiLabel>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Label name"
              required
            />
          </div>
          <div className="space-y-2">
            <UiLabel>Color</UiLabel>
            <div className="flex gap-2">
              <Input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-12 h-10 p-1"
              />
              <Input
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="#ff0000"
                pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const EmailSidebar = ({
  folders,
  selectedFolder,
  onFolderSelect,
  onCompose,
  labels = [],
  onLabelSelect,
  onCreateLabel,
  onRenameLabel,
  onDeleteLabel,
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLabel, setEditingLabel] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    isOpen: false,
    labelId: null,
  });

  const handleCreateLabel = (data) => {
    onCreateLabel(data);
  };

  const handleEditLabel = (data) => {
    onRenameLabel(editingLabel.id, data);
    setEditingLabel(null);
  };

  const openEditDialog = (label, e) => {
    e.stopPropagation();
    setEditingLabel(label);
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (labelId, e) => {
    e.stopPropagation();
    setDeleteConfirmation({ isOpen: true, labelId });
  };

  const confirmDelete = () => {
    if (deleteConfirmation.labelId) {
      onDeleteLabel(deleteConfirmation.labelId);
      setDeleteConfirmation({ isOpen: false, labelId: null });
    }
  };

  return (
    <div className="w-64 border-r border-border bg-card flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <Button
          onClick={onCompose}
          className="w-full gap-2 h-12 rounded-full shadow-sm hover:shadow-md transition-shadow"
        >
          <Pencil className="size-5" />
          <span>Compose</span>
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        <div className="mb-6">
          {folders.map((folder) => {
            const Icon = folder.icon;
            const isSelected = selectedFolder === folder.id;
            return (
              <button
                key={folder.id}
                onClick={() => onFolderSelect(folder.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-r-full text-sm font-medium transition-colors mb-1",
                  isSelected
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Icon className="size-5 shrink-0" />
                <span className="flex-1 text-left">{folder.label}</span>
                {folder.count > 0 && (
                  <span
                    className={cn(
                      "text-xs px-2 py-0.5 rounded-full font-medium",
                      isSelected
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {folder.count > 99 ? "99+" : folder.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div>
          <div className="flex items-center justify-between px-4 mb-2 group text-muted-foreground hover:text-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Labels
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => {
                setEditingLabel(null);
                setIsDialogOpen(true);
              }}
            >
              <Plus className="size-4" />
            </Button>
          </div>

          {labels.map((label) => {
            const isSelected = selectedFolder === label.id;
            return (
              <div
                key={label.id}
                className={cn(
                  "group w-full flex items-center gap-3 px-3 py-2 rounded-r-full text-sm font-medium transition-colors mb-1 cursor-pointer",
                  isSelected
                    ? "bg-primary/10 text-primary font-semibold"
                    : `text-foreground hover:bg-accent hover:text-accent-foreground`
                )}
                onClick={() => onLabelSelect && onLabelSelect(label)}
              >
                <Tag
                  className="size-4 shrink-0"
                  style={{ color: label.color || "currentColor" }}
                  fill={label.color ? label.color : "none"}
                />
                <span className="flex-1 truncate">{label.name}</span>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:text-primary"
                    onClick={(e) => openEditDialog(label, e)}
                    title="Rename Label"
                  >
                    <Edit2 className="size-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:text-destructive"
                    onClick={(e) => handleDeleteClick(label.id, e)}
                    title="Delete Label"
                  >
                    <Trash className="size-3" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <LabelDialog
        key={editingLabel ? "edit" : "create"}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        initialData={editingLabel}
        onSubmit={editingLabel ? handleEditLabel : handleCreateLabel}
      />

      <Dialog
        open={deleteConfirmation.isOpen}
        onOpenChange={(open) =>
          setDeleteConfirmation((prev) => ({ ...prev, isOpen: open }))
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="size-5" />
              Delete Label
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this label? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setDeleteConfirmation({ isOpen: false, labelId: null })
              }
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmailSidebar;
