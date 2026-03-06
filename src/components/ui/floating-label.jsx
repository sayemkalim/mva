import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

/**
 * Helper: wraps `content` in a Radix tooltip when a tooltip string is provided.
 *  – tooltip === undefined  → uses `fallback` (the label text)
 *  – tooltip === false | "" → no tooltip rendered
 *  – tooltip === "custom"   → uses that custom string
 */
function WithTooltip({ tooltip, fallback, children }) {
  const text = tooltip === undefined ? fallback : tooltip;
  if (!text) return children;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side="top">{text}</TooltipContent>
    </Tooltip>
  );
}

const FloatingInput = React.forwardRef(
  ({ className, label, required, type = "text", tooltip, ...props }, ref) => {
    const alwaysFloat = [
      "date",
      "datetime-local",
      "time",
      "month",
      "week",
    ].includes(type);

    return (
      <WithTooltip
        tooltip={tooltip}
        fallback={typeof label === "string" ? label : undefined}
      >
        <div className="fl-group">
          <input
            ref={ref}
            type={type}
            placeholder=" "
            aria-label={typeof label === "string" ? label : undefined}
            className={cn(
              "fl-input h-[52px] w-full rounded-md border border-input bg-transparent px-3.5 text-sm shadow-xs outline-none transition-[color,box-shadow]",
              "dark:bg-input/30 dark:border-gray-600 placeholder:text-transparent",
              "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
              "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
              "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
              className,
            )}
            {...props}
          />
          <span className={cn("fl-label", alwaysFloat && "active")}>
            {label}
            {required && <span className="text-destructive ml-0.5">*</span>}
          </span>
        </div>
      </WithTooltip>
    );
  },
);
FloatingInput.displayName = "FloatingInput";

const FloatingTextarea = React.forwardRef(
  ({ className, label, required, tooltip, ...props }, ref) => {
    return (
      <WithTooltip
        tooltip={tooltip}
        fallback={typeof label === "string" ? label : undefined}
      >
        <div className="fl-group">
          <textarea
            ref={ref}
            placeholder=" "
            aria-label={typeof label === "string" ? label : undefined}
            className={cn(
              "fl-input w-full min-h-[80px] rounded-md border border-input bg-transparent px-3.5 pt-5 pb-2 text-sm shadow-xs outline-none transition-[color,box-shadow] field-sizing-content",
              "dark:bg-input/30 dark:border-gray-600 placeholder:text-transparent",
              "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
              "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
              "disabled:cursor-not-allowed disabled:opacity-50",
              className,
            )}
            {...props}
          />
          <span className="fl-label fl-label-ta">
            {label}
            {required && <span className="text-destructive ml-0.5">*</span>}
          </span>
        </div>
      </WithTooltip>
    );
  },
);
FloatingTextarea.displayName = "FloatingTextarea";

function FloatingWrapper({
  label,
  required,
  hasValue,
  isFocused,
  children,
  className,
  tooltip,
}) {
  return (
    <WithTooltip
      tooltip={tooltip}
      fallback={typeof label === "string" ? label : undefined}
    >
      <div className={cn("fl-group", className)}>
        {children}
        <span
          className={cn(
            "fl-label",
            (hasValue || isFocused) && "active",
            isFocused && "focus",
          )}
        >
          {label}
          {required && <span className="text-destructive ml-0.5">*</span>}
        </span>
      </div>
    </WithTooltip>
  );
}

export { FloatingInput, FloatingTextarea, FloatingWrapper };
