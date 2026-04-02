"use client";

import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface MentionFiltersResetIconButtonProps {
  onClick: () => void;
  disabled: boolean;
  ariaLabel: string;
  className?: string;
}

export function MentionFiltersResetIconButton({
  onClick,
  disabled,
  ariaLabel,
  className,
}: MentionFiltersResetIconButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      size="icon-lg"
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "shrink-0 border-border/50 bg-muted/20 hover:bg-muted/40 transition-colors",
        className
      )}
    >
      <RotateCcw className="size-3.5" />
    </Button>
  );
}
