import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type {
  DeliveryStatus,
  OfferStatus,
  ProductStatus,
  SettlementStatus,
  StockStatus,
} from "@/types";

type BadgeVariant = React.ComponentProps<typeof Badge>["variant"];

interface Meta {
  label: string;
  variant: BadgeVariant;
}

export const offerStatusMeta: Record<OfferStatus, Meta> = {
  draft: { label: "Draft", variant: "neutral" },
  pending: { label: "Menunggu", variant: "warning" },
  accepted: { label: "Diterima", variant: "success" },
  rejected: { label: "Ditolak", variant: "danger" },
  cancelled: { label: "Dibatalkan", variant: "outline" },
};

export const deliveryStatusMeta: Record<DeliveryStatus, Meta> = {
  preparing: { label: "Disiapkan", variant: "info" },
  shipped: { label: "Dikirim", variant: "warning" },
  received: { label: "Diterima", variant: "success" },
  disputed: { label: "Ada Selisih", variant: "danger" },
};

export const settlementStatusMeta: Record<SettlementStatus, Meta> = {
  pending: { label: "Pending", variant: "neutral" },
  awaiting_confirmation: { label: "Menunggu Konfirmasi", variant: "warning" },
  completed: { label: "Selesai", variant: "success" },
};

export const stockStatusMeta: Record<StockStatus, Meta> = {
  safe: { label: "Aman", variant: "success" },
  low: { label: "Menipis", variant: "warning" },
  out: { label: "Habis", variant: "danger" },
};

export const productStatusMeta: Record<ProductStatus, Meta> = {
  active: { label: "Aktif", variant: "success" },
  inactive: { label: "Nonaktif", variant: "neutral" },
};

function StatusPill({ meta, className }: { meta: Meta; className?: string }) {
  return (
    <Badge variant={meta.variant} className={cn("gap-1.5", className)}>
      <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
      {meta.label}
    </Badge>
  );
}

export function OfferStatusBadge({
  status,
  className,
}: {
  status: OfferStatus;
  className?: string;
}) {
  return <StatusPill meta={offerStatusMeta[status]} className={className} />;
}

export function DeliveryStatusBadge({
  status,
  className,
}: {
  status: DeliveryStatus;
  className?: string;
}) {
  return <StatusPill meta={deliveryStatusMeta[status]} className={className} />;
}

export function SettlementStatusBadge({
  status,
  className,
}: {
  status: SettlementStatus;
  className?: string;
}) {
  return <StatusPill meta={settlementStatusMeta[status]} className={className} />;
}

export function StockStatusBadge({
  status,
  className,
}: {
  status: StockStatus;
  className?: string;
}) {
  return <StatusPill meta={stockStatusMeta[status]} className={className} />;
}

export function ProductStatusBadge({
  status,
  className,
}: {
  status: ProductStatus;
  className?: string;
}) {
  return <StatusPill meta={productStatusMeta[status]} className={className} />;
}
