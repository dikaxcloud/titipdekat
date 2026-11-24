"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { SidebarContent } from "@/components/layout/sidebar-content";
import type { Role } from "@/types";

interface MobileSidebarProps {
  role: Role;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onResetDemo: () => void;
}

export function MobileSidebar({
  role,
  open,
  onOpenChange,
  onResetDemo,
}: MobileSidebarProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        hideClose
        className="left-0 top-0 h-dvh max-h-dvh w-[86%] max-w-[320px] translate-x-0 translate-y-0 rounded-none border-y-0 border-l-0 border-r p-0 data-[state=open]:animate-[slideInLeft_200ms_ease-out]"
      >
        <DialogTitle className="sr-only">Menu navigasi TitipDekat</DialogTitle>
        <DialogDescription className="sr-only">
          Navigasi utama dashboard TitipDekat.
        </DialogDescription>
        <SidebarContent
          role={role}
          onNavigate={() => onOpenChange(false)}
          onResetDemo={() => {
            onOpenChange(false);
            onResetDemo();
          }}
          onClose={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
