"use client";

import { toast } from "sonner";
import { CheckCircle2, Send } from "lucide-react";
import { ProductThumb } from "@/components/shared/product-thumb";
import {
  SettlementStatusBadge,
} from "@/components/shared/status-badge";
import { InfoRow, SummaryBox } from "@/components/shared/info-row";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useDemoData } from "@/hooks/use-demo-data";
import { getSettlementBreakdown } from "@/lib/calculations";
import { useDemoStore } from "@/lib/store";
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatNumber,
} from "@/lib/utils";
import type { Role, Settlement } from "@/types";

interface SettlementDetailDialogProps {
  settlement: Settlement | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: Role;
}

export function SettlementDetailDialog({
  settlement,
  open,
  onOpenChange,
  role,
}: SettlementDetailDialogProps) {
  const data = useDemoData();
  const submitSettlement = useDemoStore((state) => state.submitSettlement);
  const completeSettlement = useDemoStore((state) => state.completeSettlement);

  if (!settlement) return null;

  const producer = data.businesses.find(
    (item) => item.id === settlement.producerId,
  );
  const shop = data.businesses.find((item) => item.id === settlement.shopId);
  const counterpart = role === "producer" ? shop : producer;
  const breakdown = getSettlementBreakdown(data, settlement);
  const canSubmit = settlement.status === "pending";
  const canComplete =
    settlement.status === "awaiting_confirmation" &&
    settlement.submittedBy !== role;

  const handleSubmit = () => {
    submitSettlement(settlement.id);
    toast.success(`Settlement ${settlement.code} diajukan`, {
      description: "Menunggu konfirmasi dari pihak mitra.",
    });
    onOpenChange(false);
  };

  const handleComplete = () => {
    completeSettlement(settlement.id);
    toast.success(`Settlement ${settlement.code} selesai`, {
      description: "Pembayaran telah dikonfirmasi kedua pihak.",
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <div className="flex flex-wrap items-center gap-2">
            <DialogTitle>Rincian settlement {settlement.code}</DialogTitle>
            <SettlementStatusBadge status={settlement.status} />
          </div>
          <DialogDescription>
            Periode {formatDate(settlement.periodStart)} –{" "}
            {formatDate(settlement.periodEnd)} · {counterpart?.businessName}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-2 sm:grid-cols-2">
          <SummaryBox
            label="Penjualan bruto"
            value={formatCurrency(breakdown.gross)}
            hint={`${formatNumber(breakdown.units)} pcs terjual`}
          />
          <SummaryBox
            label="Komisi mitra"
            value={formatCurrency(breakdown.commission)}
            tone="amber"
            hint="Dari harga jual dan persentase kesepakatan"
          />
          <SummaryBox
            label="Hak produsen (neto)"
            value={formatCurrency(breakdown.net)}
            tone="emerald"
            hint="Jumlah yang dibayarkan warung"
            className="sm:col-span-2"
          />
        </div>

        <div className="mt-4">
          <p className="text-[11px] font-bold uppercase tracking-wide text-muted">
            Rincian per produk
          </p>
          {breakdown.lines.length === 0 ? (
            <Alert variant="warning" className="mt-2">
              <AlertDescription>
                Tidak ada penjualan tercatat pada periode ini. Settlement tetap
                dapat diajukan sebagai konfirmasi tidak ada transaksi.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="mt-2 divide-y divide-line rounded-xl border border-line">
              {breakdown.lines.map((line) => (
                <div key={line.productId} className="flex items-center gap-3 p-3">
                  <ProductThumb
                    name={line.productName}
                    emoji={line.productEmoji}
                    size="sm"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-ink">
                      {line.productName}
                    </p>
                    <p className="text-[10px] text-muted">
                      {line.quantity} pcs × {formatCurrency(line.price)} · komisi{" "}
                      {line.commissionRate}%
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-xs font-bold text-ink">
                      {formatCurrency(line.net)}
                    </p>
                    <p className="text-[10px] text-muted">
                      bruto {formatCurrency(line.gross)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <Separator className="my-4" />

        <div className="space-y-2">
          <InfoRow
            label="Produsen"
            value={producer?.businessName ?? "Produsen"}
          />
          <InfoRow label="Warung" value={shop?.businessName ?? "Warung"} />
          <InfoRow label="Dibuat" value={formatDateTime(settlement.createdAt)} />
          {settlement.submittedBy && (
            <InfoRow
              label="Diajukan oleh"
              value={
                settlement.submittedBy === "producer" ? "Produsen" : "Warung"
              }
            />
          )}
          {settlement.completedAt && (
            <InfoRow
              label="Selesai"
              value={formatDateTime(settlement.completedAt)}
            />
          )}
        </div>

        {settlement.status === "awaiting_confirmation" &&
          settlement.submittedBy === role && (
            <Alert variant="info" className="mt-4">
              <AlertDescription>
                Anda sudah mengajukan settlement ini. Menunggu konfirmasi dari
                pihak mitra.
              </AlertDescription>
            </Alert>
          )}

        {settlement.status === "completed" && (
          <Alert variant="success" className="mt-4">
            <AlertDescription>
              Settlement telah selesai dan dikonfirmasi kedua pihak.
            </AlertDescription>
          </Alert>
        )}

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Tutup
          </Button>
          {canSubmit && (
            <Button onClick={handleSubmit}>
              <Send className="size-4" />
              Ajukan settlement
            </Button>
          )}
          {canComplete && (
            <Button onClick={handleComplete}>
              <CheckCircle2 className="size-4" />
              Konfirmasi selesai
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
