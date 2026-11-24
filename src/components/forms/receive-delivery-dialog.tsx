"use client";

import { useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, PackageCheck } from "lucide-react";
import { ProductThumb } from "@/components/shared/product-thumb";
import { InfoRow } from "@/components/shared/info-row";
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
import { FormField } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useDemoData } from "@/hooks/use-demo-data";
import { useDemoStore } from "@/lib/store";
import { formatDate } from "@/lib/utils";
import type { Delivery } from "@/types";

interface ReceiveDeliveryDialogProps {
  delivery: Delivery | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReceiveDeliveryDialog({
  delivery,
  open,
  onOpenChange,
}: ReceiveDeliveryDialogProps) {
  if (!delivery) return null;

  return (
    <ReceiveDeliveryForm
      key={`${delivery.id}-${open}`}
      delivery={delivery}
      open={open}
      onOpenChange={onOpenChange}
    />
  );
}

function ReceiveDeliveryForm({
  delivery,
  open,
  onOpenChange,
}: {
  delivery: Delivery;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const data = useDemoData();
  const receiveDelivery = useDemoStore((state) => state.receiveDelivery);
  const [received, setReceived] = useState(String(delivery.quantity));
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  const product = data.products.find((item) => item.id === delivery.productId);
  const producer = data.businesses.find(
    (item) => item.id === delivery.producerId,
  );
  const quantity = Number(received);
  const hasDifference =
    Number.isInteger(quantity) && quantity !== delivery.quantity;

  const confirm = () => {
    if (!Number.isInteger(quantity) || quantity < 1) {
      setError("Jumlah diterima harus bilangan bulat minimal 1 pcs.");
      return;
    }
    if (quantity > delivery.quantity) {
      setError(
        `Jumlah diterima tidak boleh melebihi jumlah dikirim (${delivery.quantity} pcs).`,
      );
      return;
    }
    if (hasDifference && note.trim().length < 5) {
      setError("Jelaskan penyebab selisih minimal 5 karakter.");
      return;
    }

    const result = receiveDelivery(
      delivery.id,
      quantity,
      hasDifference ? note.trim() : undefined,
    );
    if (!result.ok) {
      setError(result.error ?? "Penerimaan gagal dicatat.");
      return;
    }
    toast.success(
      hasDifference
        ? "Penerimaan dicatat dengan selisih"
        : "Penerimaan dikonfirmasi",
      {
        description: `${quantity} pcs ${product?.name ?? "produk"} masuk ke stok titipan.`,
      },
    );
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Konfirmasi penerimaan</DialogTitle>
          <DialogDescription>
            Periksa jumlah barang yang benar-benar diterima. Stok titipan
            dihitung dari jumlah ini.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-3 rounded-xl border border-line bg-canvas/60 p-3">
          <ProductThumb
            name={product?.name ?? "Produk"}
            emoji={product?.emoji ?? "📦"}
            image={product?.image}
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-ink">
              {product?.name ?? "Produk"}
            </p>
            <p className="truncate text-xs text-muted">
              {producer?.businessName ?? "Produsen"} · {delivery.code}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-sm font-bold text-ink">{delivery.quantity} pcs</p>
            <p className="text-[10px] text-muted">dikirim</p>
          </div>
        </div>

        <div className="mt-4 space-y-2 rounded-xl border border-line bg-mist/40 p-3">
          <InfoRow label="Penawaran" value={delivery.offerId.toUpperCase()} />
          <InfoRow
            label="Tanggal dikirim"
            value={
              delivery.shippedAt ? formatDate(delivery.shippedAt) : "Belum dikirim"
            }
          />
          <InfoRow
            label="Catatan produsen"
            value={delivery.note || "Tidak ada catatan"}
            valueClassName="font-medium text-muted"
          />
        </div>

        {error && (
          <Alert variant="danger" className="mt-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="mt-4 grid gap-4">
          <FormField
            label="Jumlah diterima (pcs)"
            htmlFor="received"
            required
            hint={`Jumlah dikirim ${delivery.quantity} pcs.`}
          >
            <Input
              id="received"
              type="number"
              min={1}
              max={delivery.quantity}
              step={1}
              inputMode="numeric"
              value={received}
              onChange={(event) => {
                setReceived(event.target.value);
                setError(null);
              }}
            />
          </FormField>

          {hasDifference && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
              <p className="flex items-center gap-2 text-xs font-bold text-amber-800">
                <AlertTriangle className="size-4" />
                Selisih {Math.abs(quantity - delivery.quantity)} pcs
              </p>
              <p className="mt-1 text-[11px] leading-relaxed text-amber-700">
                Selisih akan tercatat pada pengiriman ini dan terlihat oleh
                produsen.
              </p>
            </div>
          )}

          <FormField
            label={hasDifference ? "Catatan selisih" : "Catatan (opsional)"}
            htmlFor="receive-note"
            required={hasDifference}
            hint={
              hasDifference
                ? "Wajib diisi agar produsen memahami penyebab selisih."
                : "Misalnya kondisi kemasan atau waktu penerimaan."
            }
          >
            <Textarea
              id="receive-note"
              rows={3}
              value={note}
              onChange={(event) => {
                setNote(event.target.value);
                setError(null);
              }}
              placeholder="Contoh: 2 pcs kemasan penyok saat diterima."
            />
          </FormField>
        </div>

        <DialogFooter className="mt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button onClick={confirm}>
            <PackageCheck className="size-4" />
            Konfirmasi penerimaan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
