import type { ReactNode } from "react";

import {
  Dialog as DialogPrimitive,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface DialogProps {
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
}

export function Dialog({ title, description, onClose, children, footer, wide }: DialogProps) {
  return (
    <DialogPrimitive open onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        aria-describedby={description ? undefined : undefined}
        className={cn(wide && "sm:w-[min(760px,calc(100vw-32px))]")}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : null}
        </DialogHeader>
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5 max-[560px]:px-4 max-[560px]:pb-[calc(20px+env(safe-area-inset-bottom))]">
          {children}
        </div>
        {footer ? <DialogFooter>{footer}</DialogFooter> : null}
      </DialogContent>
    </DialogPrimitive>
  );
}
