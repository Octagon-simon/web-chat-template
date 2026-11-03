import type * as React from "react";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface IconButtonProps extends React.ComponentProps<typeof Button> {
  /** Also used as the accessible name and the tooltip text. */
  label: string;
  active?: boolean;
  tooltip?: boolean;
}

/** 32px icon button on desktop, 40px on touch widths. */
export function IconButton({
  label,
  active,
  tooltip = true,
  className,
  children,
  ...props
}: IconButtonProps) {
  const button = (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      aria-label={label}
      className={cn(
        "size-8 rounded-lg text-muted-foreground hover:text-foreground max-[860px]:size-10 [&_svg]:size-[18px]",
        active && "bg-active text-foreground",
        className,
      )}
      {...props}
    >
      {children}
    </Button>
  );

  if (!tooltip) return button;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}
