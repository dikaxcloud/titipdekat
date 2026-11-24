"use client";

import { useState } from "react";
import {
  ClipboardList,
  Clock,
  PackageX,
  Plus,
  ShoppingCart,
  TrendingUp,
  Undo2,
} from "lucide-react";
import { StockEventDialog } from "@/components/forms/stock-event-dialog";
import { PageHeader } from "@/components/shared/page-header";
import { ProductThumb } from "@/components/shared/product-thumb";
import { SearchInput } from "@/components/shared/search-input";
import { SegmentedFilter } from "@/components/shared/segmented-filter";
import { StatCard } from "@/components/shared/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { useCurrentBusiness } from "@/hooks/use-current-business";
import { useDemoData } from "@/hooks/use-demo-data";
import { buildStockLots } from "@/lib/calculations";
import { STOCK_EVENT_LABELS } from "@/lib/constants";
import {
  cn,
  formatCurrency,
  formatDate,
  formatDateInput,
  formatNumber,
} from "@/lib/utils";
import type { StockEventType } from "@/types";

const eventTone: Record<StockEventType, string> = {
  sold: "bg-brand-50 text-brand-700 ring-brand-100",
  returned: "bg-amber-50 text-amber-700 ring-amber-100",
  damaged: "bg-red-50 text-red-700 ring-red-100",
  expired: "bg-orange-50 text-orange-700 ring-orange-100",
};

const eventIcon: Record<StockEventType, typeof ShoppingCart> = {
  sold: ShoppingCart,
  returned: Undo2,
  damaged: PackageX,
  expired: Clock,
};

const eventFilters = [
  { value: "all", label: "Semua" },
  { value: "sold", label: "Terjual" },
  { value: "returned", label: "Retur" },
  { value: "damaged", label: "Rusak" },
  { value: "expired", label: "Kedaluwarsa" },
];

export function ShopSales() {
  const business = useCurrentBusiness();
  const data = useDemoData();
  const [eventOpen, setEventOpen] = useState(false);
  const [preset, setPreset] = useState<{ deliveryId: string } | undefined>();
  const [type, setType] = useState("all");
  const [query, setQuery] = useState("");

  if (!business) return null;

  const today = formatDateInput();
  const monthKey = today.slice(0, 7);

  const events = [...data.stockEvents]
    .filter((event) => event.shopId === business.id)
    .sort(
      (a, b) =>
        b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt),
    );

  const soldToday = events.filter(
    (event) => event.type === "sold" && event.date === today,
  );
  const soldThisMonth = events.filter(
    (event) => event.type === "sold" && event.date.startsWith(monthKey),
  );

  const todayValue = soldToday.reduce(
    (total, event) => total + event.quantity * event.price,
    0,
  );
  const monthValue = soldThisMonth.reduce(
    (total, event) => total + event.quantity * event.price,
    0,
  );

  const lots = buildStockLots(data.deliveries, data.stockEvents, data.offers)
    .filter((lot) => lot.shopId === business.id && lot.remaining > 0)
    .map((lot) => {
      const delivery = data.deliveries.find(
        (item) => item.id === lot.deliveryId,
      );
      const product = data.products.find((item) => item.id === lot.productId);
      const producer = data.businesses.find(
        (item) => item.id === lot.producerId,
      );
      return {
        ...lot,
        code: delivery?.code ?? "-",
        productName: product?.name ?? "Produk",
        productEmoji: product?.emoji ?? "📦",
        productImage: product?.image,
        producerName: producer?.businessName ?? "Produsen",
      };
    })
    .sort((a, b) => b.remaining - a.remaining);

  const options = eventFilters.map((item) => ({
    ...item,
    count:
      item.value === "all"
        ? events.length
        : events.filter((event) => event.type === item.value).length,
  }));

  const needle = query.trim().toLowerCase();
  const filteredEvents = events.filter((event) => {
    const product = data.products.find(
      (item) => item.id === event.productId,
    );
    const delivery = data.deliveries.find(
      (item) => item.id === event.deliveryId,
    );
    const matchesType = type === "all" || event.type === type;
    const matchesQuery =
      !needle ||
      (product?.name ?? "").toLowerCase().includes(needle) ||
      (delivery?.code ?? "").toLowerCase().includes(needle) ||
      (event.note ?? "").toLowerCase().includes(needle);
    return matchesType && matchesQuery;
  });

  const openEvent = (deliveryId?: string) => {
    setPreset(deliveryId ? { deliveryId } : undefined);
    setEventOpen(true);
  };

  return (
    <div>
      <PageHeader
        eyebrow="Penjualan harian"
        title="Penjualan & stok"
        description="Catat setiap penjualan, retur, kerusakan, dan kedaluwarsa pada batch titipan yang tepat."
        actions={
          <Button onClick={() => openEvent()}>
            <Plus className="size-4" />
            Catat transaksi
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Penjualan hari ini"
          value={formatCurrency(todayValue)}
          hint={`${formatNumber(
            soldToday.reduce((total, event) => total + event.quantity, 0),
          )} pcs terjual`}
          icon={ShoppingCart}
          tone="brand"
        />
        <StatCard
          label="Penjualan bulan ini"
          value={formatCurrency(monthValue)}
          hint={`${formatNumber(
            soldThisMonth.reduce((total, event) => total + event.quantity, 0),
          )} pcs terjual`}
          icon={TrendingUp}
          tone="emerald"
        />
        <StatCard
          label="Batch aktif"
          value={formatNumber(lots.length)}
          hint="Batch dengan sisa stok"
          icon={ClipboardList}
          tone="blue"
        />
        <StatCard
          label="Total transaksi"
          value={formatNumber(events.length)}
          hint="Seluruh pergerakan stok tercatat"
          icon={Clock}
          tone="violet"
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_1.2fr]">
        <Card>
          <CardHeader className="flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
            <div className="min-w-0">
              <CardTitle>Batch siap dijual</CardTitle>
              <CardDescription>
                Pilih batch untuk mencatat penjualan atau stok keluar.
              </CardDescription>
            </div>
            <Badge variant="brand">{lots.length} batch</Badge>
          </CardHeader>
          <CardContent>
            {lots.length === 0 ? (
              <EmptyState
                icon={ClipboardList}
                title="Tidak ada batch aktif"
                description="Konfirmasi penerimaan pengiriman terlebih dahulu agar stok dapat dijual."
              />
            ) : (
              <div className="space-y-2">
                {lots.map((lot) => (
                  <div
                    key={lot.deliveryId}
                    className="flex flex-wrap items-center gap-3 rounded-xl border border-line bg-canvas/40 p-2.5"
                  >
                    <ProductThumb
                      name={lot.productName}
                      emoji={lot.productEmoji}
                      image={lot.productImage}
                      size="sm"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold text-ink">
                        {lot.productName}
                      </p>
                      <p className="truncate text-[10px] text-muted">
                        {lot.code} · {lot.producerName} · sisa {lot.remaining} pcs
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-[10px] font-bold text-ink">
                        {formatCurrency(lot.price)}
                      </p>
                      <p className="text-[9px] text-muted">
                        komisi {lot.commissionRate}%
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEvent(lot.deliveryId)}
                    >
                      Catat
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-start justify-between gap-3">
            <div>
              <CardTitle>Riwayat pergerakan stok</CardTitle>
              <CardDescription>
                Semua transaksi yang memengaruhi stok titipan.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-3 flex flex-col gap-2">
              <SegmentedFilter
                options={options}
                value={type}
                onChange={setType}
              />
              <SearchInput
                value={query}
                onChange={setQuery}
                placeholder="Cari produk, batch, atau catatan…"
              />
            </div>

            {filteredEvents.length === 0 ? (
              <EmptyState
                icon={ShoppingCart}
                title="Belum ada transaksi"
                description={
                  query || type !== "all"
                    ? "Coba ubah filter atau kata kunci pencarian."
                    : "Catat penjualan pertama Anda untuk melihat riwayat di sini."
                }
              />
            ) : (
              <div className="max-h-[560px] space-y-1.5 overflow-y-auto pr-1 scrollbar-thin">
                {filteredEvents.map((event) => {
                  const product = data.products.find(
                    (item) => item.id === event.productId,
                  );
                  const delivery = data.deliveries.find(
                    (item) => item.id === event.deliveryId,
                  );
                  const Icon = eventIcon[event.type];
                  const gross = event.quantity * event.price;
                  return (
                    <div
                      key={event.id}
                      className="flex items-start gap-2.5 rounded-xl px-1 py-2 transition-colors hover:bg-mist/50"
                    >
                      <span
                        className={cn(
                          "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg ring-1",
                          eventTone[event.type],
                        )}
                      >
                        <Icon className="size-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="truncate text-xs font-semibold text-ink">
                            {product?.name ?? "Produk"} ·{" "}
                            {STOCK_EVENT_LABELS[event.type]}
                          </p>
                          <span className="shrink-0 text-[10px] font-medium text-muted">
                            {formatDate(event.date, "d MMM")}
                          </span>
                        </div>
                        <p className="truncate text-[10px] text-muted">
                          {event.quantity} pcs · {delivery?.code ?? "-"} ·{" "}
                          {formatCurrency(gross)}
                        </p>
                        {event.note && (
                          <p className="mt-0.5 line-clamp-1 text-[10px] text-muted/80">
                            {event.note}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <StockEventDialog
        open={eventOpen}
        onOpenChange={setEventOpen}
        shopId={business.id}
        preset={preset}
      />
    </div>
  );
}
