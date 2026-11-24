"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useDemoStore } from "@/lib/store";
import { RotateCcw } from "lucide-react";

interface ResetDemoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ResetDemoDialog({ open, onOpenChange }: ResetDemoDialogProps) {
  const resetDemo = useDemoStore((state) => state.resetDemo);
  const router = useRouter();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="mb-2 flex size-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <RotateCcw className="size-5" />
          </div>
          <DialogTitle>Reset data demo?</DialogTitle>
          <DialogDescription>
            Seluruh perubahan simulasi (penawaran, stok, penjualan, settlement,
            dan profil) akan dikembalikan ke kondisi awal. Anda akan keluar dari
            sesi saat ini.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              resetDemo();
              onOpenChange(false);
              toast.success("Data demo berhasil direset", {
                description: "Silakan masuk kembali dengan akun demo.",
              });
              router.push("/login");
            }}
          >
            <RotateCcw className="size-4" />
            Reset sekarang
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
