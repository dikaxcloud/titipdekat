"use client";

import { ProductThumb } from "@/components/shared/product-thumb";
import { OfferStatusBadge } from "@/components/shared/status-badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useDemoData } from "@/hooks/use-demo-data";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import type { Offer } from "@/types";

interface OfferDetailDialogProps {
  offer: Offer | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OfferDetailDialog({
  offer,
  open,
  onOpenChange,
}: OfferDetailDialogProps) {
  const data = useDemoData();

  if (!offer) return null;

  const product = data.products.find((item) => item.id === offer.productId);
  const shop = data.businesses.find((item) => item.id === offer.shopId);
  const producer = data.businesses.find((item) => item.id === offer.producerId);
  const delivery = data.deliveries.find((item) => item.offerId === offer.id);
  const gross = offer.quantity * offer.price;
  const commission = Math.round(gross * (offer.commissionRate / 100));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <div className="flex flex-wrap items-center gap-2">
            <DialogTitle>Detail penawaran {offer.code}</DialogTitle>
            <OfferStatusBadge status={offer.status} />
          </div>
          <DialogDescription>
            Dibuat {formatDateTime(offer.createdAt)} oleh{" "}
            {producer?.businessName ?? "produsen"}.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-3 rounded-xl border border-line bg-canvas/60 p-3">
          <ProductThumb
            name={product?.name ?? "Produk"}
            emoji={product?.emoji ?? "📦"}
            image={product?.image}
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-ink">
              {product?.name ?? "Produk dihapus"}
            </p>
            <p className="text-xs text-muted">
              {product?.category ?? "Kategori"} · {offer.quantity} pcs
            </p>
          </div>
          <p className="text-right text-sm font-bold text-ink">
            {formatCurrency(offer.price)}
            <span className="block text-[10px] font-medium text-muted">
              per pcs
            </span>
          </p>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">
              Warung mitra
            </p>
            <p className="mt-0.5 text-sm font-semibold text-ink">
              {shop?.businessName ?? "Warung"}
            </p>
            <p className="text-xs text-muted">{shop?.city ?? ""}</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">
              Komisi mitra
            </p>
            <p className="mt-0.5 text-sm font-semibold text-ink">
              {offer.commissionRate}% · {formatCurrency(commission)}
            </p>
            <p className="text-xs text-muted">dari bruto {formatCurrency(gross)}</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">
              Nilai penawaran
            </p>
            <p className="mt-0.5 text-sm font-semibold text-ink">
              {formatCurrency(gross)}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">
              Hak produsen (neto)
            </p>
            <p className="mt-0.5 text-sm font-semibold text-brand-700">
              {formatCurrency(gross - commission)}
            </p>
          </div>
        </div>

        {offer.note && (
          <div className="mt-4 rounded-xl border border-line bg-mist/50 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">
              Catatan
            </p>
            <p className="mt-1 text-sm leading-relaxed text-ink">{offer.note}</p>
          </div>
        )}

        {offer.respondedAt && (
          <>
            <Separator className="my-4" />
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted">Respons warung</span>
              <span className="font-semibold text-ink">
                {formatDateTime(offer.respondedAt)}
              </span>
            </div>
          </>
        )}

        {delivery && (
          <div className="mt-4 flex items-center justify-between rounded-xl border border-line bg-mist/50 p-3 text-xs">
            <span className="text-muted">
              Pengiriman terkait: <strong className="text-ink">{delivery.code}</strong>
            </span>
            <span className="font-semibold text-ink">
              {delivery.quantity} pcs
            </span>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Tutup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
