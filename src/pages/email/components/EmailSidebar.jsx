import { cn } from "@/lib/utils";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";

const EmailSidebar = ({
  folders,
  selectedFolder,
  onFolderSelect,
  onCompose,
}) => {
  return (
    <div className="w-64 border-r border-border bg-card flex flex-col">
      {/* Compose Button */}
      <div className="p-4 border-b border-border">
        <Button
          onClick={onCompose}
          className="w-full gap-2 h-12 rounded-full shadow-sm hover:shadow-md transition-shadow"
        >
          <Pencil className="size-5" />
          <span>Compose</span>
        </Button>
      </div>

      {/* Folders */}
      <div className="flex-1 overflow-y-auto p-2">
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

      {/* Labels Section (Optional - can be added later) */}
      <div className="p-2 border-t border-border">
        <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Labels
        </div>
        {/* Labels can be added here later */}
      </div>
    </div>
  );
};

export default EmailSidebar;
