"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Clock,
  PackageCheck,
  PackageX,
  Truck,
  XCircle,
} from "lucide-react";
import { ReceiveDeliveryDialog } from "@/components/forms/receive-delivery-dialog";
import { PageHeader } from "@/components/shared/page-header";
import { ProductThumb } from "@/components/shared/product-thumb";
import { SearchInput } from "@/components/shared/search-input";
import { SegmentedFilter } from "@/components/shared/segmented-filter";
import { StatCard } from "@/components/shared/stat-card";
import { DeliveryStatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { useCurrentBusiness } from "@/hooks/use-current-business";
import { useDemoData } from "@/hooks/use-demo-data";
import { getBusiness, getProduct } from "@/lib/calculations";
import { formatDate, formatNumber } from "@/lib/utils";
import type { Delivery } from "@/types";

const statusFilters = [
  { value: "all", label: "Semua" },
  { value: "preparing", label: "Disiapkan" },
  { value: "shipped", label: "Perlu Dikonfirmasi" },
  { value: "received", label: "Diterima" },
  { value: "disputed", label: "Ada Selisih" },
];

export function ShopDeliveries() {
  const business = useCurrentBusiness();
  const data = useDemoData();
  const [status, setStatus] = useState("all");
  const [query, setQuery] = useState("");
  const [receiveTarget, setReceiveTarget] = useState<Delivery | null>(null);

  if (!business) return null;

  const deliveries = [...data.deliveries]
    .filter((delivery) => delivery.shopId === business.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const options = statusFilters.map((item) => ({
    ...item,
    count:
      item.value === "all"
        ? deliveries.length
        : deliveries.filter((delivery) => delivery.status === item.value)
            .length,
  }));

  const needle = query.trim().toLowerCase();
  const filtered = deliveries.filter((delivery) => {
    const product = getProduct(data.products, delivery.productId);
    const producer = getBusiness(data.businesses, delivery.producerId);
    const matchesStatus = status === "all" || delivery.status === status;
    const matchesQuery =
      !needle ||
      delivery.code.toLowerCase().includes(needle) ||
      (product?.name ?? "").toLowerCase().includes(needle) ||
      (producer?.businessName ?? "").toLowerCase().includes(needle);
    return matchesStatus && matchesQuery;
  });

  const stats = {
    total: deliveries.length,
    shipped: deliveries.filter((delivery) => delivery.status === "shipped")
      .length,
    received: deliveries.filter((delivery) => delivery.status === "received")
      .length,
    disputed: deliveries.filter((delivery) => delivery.status === "disputed")
      .length,
  };

  return (
    <div>
      <PageHeader
        eyebrow="Penerimaan barang"
        title="Pengiriman"
        description="Konfirmasi jumlah barang yang benar-benar diterima. Stok titipan baru bertambah setelah konfirmasi ini."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total pengiriman"
          value={formatNumber(stats.total)}
          hint="Seluruh kiriman ke warung Anda"
          icon={Truck}
          tone="violet"
        />
        <StatCard
          label="Perlu dikonfirmasi"
          value={formatNumber(stats.shipped)}
          hint="Barang sudah dalam perjalanan"
          icon={Clock}
          tone="amber"
        />
        <StatCard
          label="Diterima sesuai"
          value={formatNumber(stats.received)}
          hint="Jumlah cocok dengan pengiriman"
          icon={PackageCheck}
          tone="emerald"
        />
        <StatCard
          label="Ada selisih"
          value={formatNumber(stats.disputed)}
          hint="Jumlah diterima berbeda"
          icon={PackageX}
          tone="rose"
        />
      </div>

      <div className="mb-4 mt-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <SegmentedFilter options={options} value={status} onChange={setStatus} />
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Cari kode, produk, atau produsen…"
          className="lg:w-72"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Truck}
          title={
            deliveries.length === 0
              ? "Belum ada pengiriman"
              : "Tidak ada hasil"
          }
          description={
            deliveries.length === 0
              ? "Pengiriman dari produsen akan muncul di sini setelah penawaran diterima dan dicatat pengirimannya."
              : "Coba ubah filter status atau kata kunci pencarian."
          }
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((delivery) => {
            const product = getProduct(data.products, delivery.productId);
            const producer = getBusiness(data.businesses, delivery.producerId);
            const received = delivery.receivedQuantity;
            const difference =
              received !== undefined ? delivery.quantity - received : 0;
            return (
              <Card key={delivery.id}>
                <CardContent className="pt-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                    <ProductThumb
                      name={product?.name ?? "Produk"}
                      emoji={product?.emoji ?? "📦"}
                      image={product?.image}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-bold text-ink">
                          {delivery.code} · {product?.name ?? "Produk"}
                        </p>
                        <DeliveryStatusBadge status={delivery.status} />
                      </div>
                      <p className="mt-0.5 text-xs text-muted">
                        Dari {producer?.businessName ?? "Produsen"} ·{" "}
                        {formatDate(delivery.createdAt)}
                      </p>

                      <div className="mt-3 grid grid-cols-3 gap-2">
                        <div className="rounded-lg bg-mist/60 px-2.5 py-1.5">
                          <p className="text-[9px] font-bold uppercase tracking-wide text-muted">
                            Dikirim
                          </p>
                          <p className="text-xs font-bold text-ink">
                            {formatNumber(delivery.quantity)} pcs
                          </p>
                        </div>
                        <div className="rounded-lg bg-mist/60 px-2.5 py-1.5">
                          <p className="text-[9px] font-bold uppercase tracking-wide text-muted">
                            Diterima
                          </p>
                          <p className="text-xs font-bold text-ink">
                            {received !== undefined
                              ? `${formatNumber(received)} pcs`
                              : "-"}
                          </p>
                        </div>
                        <div
                          className={
                            difference > 0
                              ? "rounded-lg bg-red-50 px-2.5 py-1.5"
                              : "rounded-lg bg-emerald-50 px-2.5 py-1.5"
                          }
                        >
                          <p
                            className={
                              difference > 0
                                ? "text-[9px] font-bold uppercase tracking-wide text-red-700"
                                : "text-[9px] font-bold uppercase tracking-wide text-emerald-700"
                            }
                          >
                            Selisih
                          </p>
                          <p
                            className={
                              difference > 0
                                ? "text-xs font-bold text-red-900"
                                : "text-xs font-bold text-emerald-900"
                            }
                          >
                            {received !== undefined
                              ? `${formatNumber(difference)} pcs`
                              : "-"}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 space-y-1.5">
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted">
                          <span className="inline-flex items-center gap-1">
                            <CheckCircle2 className="size-3 text-blue-500" />
                            Dicatat {formatDate(delivery.createdAt, "d MMM")}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Truck className="size-3 text-amber-500" />
                            {delivery.shippedAt
                              ? `Dikirim ${formatDate(delivery.shippedAt, "d MMM")}`
                              : "Belum dikirim"}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <PackageCheck className="size-3 text-emerald-500" />
                            {delivery.receivedAt
                              ? `Diterima ${formatDate(delivery.receivedAt, "d MMM")}`
                              : "Belum dikonfirmasi"}
                          </span>
                        </div>
                        {delivery.note && (
                          <p className="rounded-lg bg-canvas/60 px-2.5 py-1.5 text-[11px] leading-relaxed text-muted">
                            Catatan produsen: {delivery.note}
                          </p>
                        )}
                        {delivery.discrepancyNote && (
                          <p className="flex items-start gap-1.5 rounded-lg bg-red-50 px-2.5 py-1.5 text-[11px] leading-relaxed text-red-700">
                            <XCircle className="mt-0.5 size-3.5 shrink-0" />
                            {delivery.discrepancyNote}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-wrap gap-2 sm:flex-col sm:items-stretch">
                      {delivery.status === "shipped" && (
                        <Button
                          size="sm"
                          onClick={() => setReceiveTarget(delivery)}
                        >
                          <PackageCheck className="size-3.5" />
                          Konfirmasi terima
                        </Button>
                      )}
                      {delivery.status === "preparing" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700">
                          <Clock className="size-3" />
                          Disiapkan produsen
                        </span>
                      )}
                      {(delivery.status === "received" ||
                        delivery.status === "disputed") && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                          <CheckCircle2 className="size-3" />
                          Stok diperbarui
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <ReceiveDeliveryDialog
        delivery={receiveTarget}
        open={Boolean(receiveTarget)}
        onOpenChange={(open) => {
          if (!open) setReceiveTarget(null);
        }}
      />
    </div>
  );
}
