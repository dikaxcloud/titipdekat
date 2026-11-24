"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Clock,
  PackageCheck,
  Plus,
  Send,
  Truck,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { DeliveryFormDialog } from "@/components/forms/delivery-form-dialog";
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
import { useDemoStore } from "@/lib/store";
import { formatDate, formatNumber } from "@/lib/utils";

const statusFilters = [
  { value: "all", label: "Semua" },
  { value: "preparing", label: "Disiapkan" },
  { value: "shipped", label: "Dikirim" },
  { value: "received", label: "Diterima" },
  { value: "disputed", label: "Ada Selisih" },
];

export function ProducerDeliveries() {
  const business = useCurrentBusiness();
  const data = useDemoData();
  const shipDelivery = useDemoStore((state) => state.shipDelivery);
  const [formOpen, setFormOpen] = useState(false);
  const [status, setStatus] = useState("all");
  const [query, setQuery] = useState("");

  if (!business) return null;

  const deliveries = [...data.deliveries]
    .filter((delivery) => delivery.producerId === business.id)
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
    const shop = getBusiness(data.businesses, delivery.shopId);
    const matchesStatus =
      status === "all" || delivery.status === status;
    const matchesQuery =
      !needle ||
      delivery.code.toLowerCase().includes(needle) ||
      (product?.name ?? "").toLowerCase().includes(needle) ||
      (shop?.businessName ?? "").toLowerCase().includes(needle);
    return matchesStatus && matchesQuery;
  });

  const stats = {
    total: deliveries.length,
    preparing: deliveries.filter((delivery) => delivery.status === "preparing")
      .length,
    shipped: deliveries.filter((delivery) => delivery.status === "shipped")
      .length,
    received: deliveries.filter(
      (delivery) =>
        delivery.status === "received" || delivery.status === "disputed",
    ).length,
  };

  const handleShip = (id: string, code: string) => {
    shipDelivery(id);
    toast.success(`Pengiriman ${code} ditandai dikirim`, {
      description: "Warung dapat mengonfirmasi penerimaan sekarang.",
    });
  };

  return (
    <div>
      <PageHeader
        eyebrow="Distribusi"
        title="Pengiriman"
        description="Catat batch titipan yang dikirim ke warung, pantau status perjalanan, dan lihat hasil konfirmasi penerimaan."
        actions={
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="size-4" />
            Catat pengiriman
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total pengiriman"
          value={formatNumber(stats.total)}
          hint="Seluruh batch yang pernah dicatat"
          icon={Truck}
          tone="violet"
        />
        <StatCard
          label="Disiapkan"
          value={formatNumber(stats.preparing)}
          hint="Belum ditandai dikirim"
          icon={Clock}
          tone="amber"
        />
        <StatCard
          label="Dalam perjalanan"
          value={formatNumber(stats.shipped)}
          hint="Menunggu konfirmasi warung"
          icon={Send}
          tone="blue"
        />
        <StatCard
          label="Sudah dikonfirmasi"
          value={formatNumber(stats.received)}
          hint="Diterima atau ada selisih"
          icon={PackageCheck}
          tone="emerald"
        />
      </div>

      <div className="mb-4 mt-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <SegmentedFilter options={options} value={status} onChange={setStatus} />
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Cari kode, produk, atau warung…"
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
              ? "Catat pengiriman dari penawaran yang sudah diterima warung."
              : "Coba ubah filter status atau kata kunci pencarian."
          }
          action={
            deliveries.length === 0 ? (
              <Button onClick={() => setFormOpen(true)}>
                <Plus className="size-4" />
                Catat pengiriman
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((delivery) => {
            const product = getProduct(data.products, delivery.productId);
            const shop = getBusiness(data.businesses, delivery.shopId);
            const received = delivery.receivedQuantity;
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
                        Tujuan {shop?.businessName ?? "Warung"} ·{" "}
                        {formatDate(delivery.createdAt)}
                      </p>

                      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
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
                              : "Belum dikonfirmasi"}
                          </p>
                        </div>
                        <div className="col-span-2 rounded-lg bg-mist/60 px-2.5 py-1.5 sm:col-span-1">
                          <p className="text-[9px] font-bold uppercase tracking-wide text-muted">
                            Selisih
                          </p>
                          <p className="text-xs font-bold text-ink">
                            {received !== undefined
                              ? `${formatNumber(delivery.quantity - received)} pcs`
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
                              : "Belum diterima"}
                          </span>
                        </div>
                        {delivery.note && (
                          <p className="rounded-lg bg-canvas/60 px-2.5 py-1.5 text-[11px] leading-relaxed text-muted">
                            Catatan: {delivery.note}
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
                      {delivery.status === "preparing" && (
                        <Button
                          size="sm"
                          onClick={() =>
                            handleShip(delivery.id, delivery.code)
                          }
                        >
                          <Send className="size-3.5" />
                          Tandai dikirim
                        </Button>
                      )}
                      {delivery.status === "shipped" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
                          <Clock className="size-3" />
                          Menunggu warung
                        </span>
                      )}
                      {(delivery.status === "received" ||
                        delivery.status === "disputed") && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                          <PackageCheck className="size-3" />
                          Penerimaan dicatat
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

      <DeliveryFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        producerId={business.id}
      />
    </div>
  );
}
