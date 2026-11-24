"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Boxes,
  PackageCheck,
  PackageX,
  Plus,
  ShoppingCart,
} from "lucide-react";
import { StockEventDialog } from "@/components/forms/stock-event-dialog";
import { PageHeader } from "@/components/shared/page-header";
import { ProductThumb } from "@/components/shared/product-thumb";
import { SearchInput } from "@/components/shared/search-input";
import { SegmentedFilter } from "@/components/shared/segmented-filter";
import { StatCard } from "@/components/shared/stat-card";
import { StockStatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Progress } from "@/components/ui/progress";
import { useCurrentBusiness } from "@/hooks/use-current-business";
import { useDemoData } from "@/hooks/use-demo-data";
import { getShopStats, getShopStock } from "@/lib/calculations";
import { formatNumber, percentage } from "@/lib/utils";

const statusFilters = [
  { value: "all", label: "Semua" },
  { value: "safe", label: "Aman" },
  { value: "low", label: "Menipis" },
  { value: "out", label: "Habis" },
];

export function ShopProducts() {
  const business = useCurrentBusiness();
  const data = useDemoData();
  const [status, setStatus] = useState("all");
  const [query, setQuery] = useState("");
  const [eventOpen, setEventOpen] = useState(false);
  const [preset, setPreset] = useState<
    { productId: string; producerId: string } | undefined
  >();

  if (!business) return null;

  const stock = getShopStock(data, business.id);
  const stats = getShopStats(data, business.id);

  const options = statusFilters.map((item) => ({
    ...item,
    count:
      item.value === "all"
        ? stock.length
        : stock.filter((row) => row.status === item.value).length,
  }));

  const needle = query.trim().toLowerCase();
  const filtered = stock.filter((row) => {
    const matchesStatus = status === "all" || row.status === status;
    const matchesQuery =
      !needle ||
      row.productName.toLowerCase().includes(needle) ||
      row.producerName.toLowerCase().includes(needle);
    return matchesStatus && matchesQuery;
  });

  const openEvent = (productId: string, producerId: string) => {
    setPreset({ productId, producerId });
    setEventOpen(true);
  };

  return (
    <div>
      <PageHeader
        eyebrow="Barang titipan"
        title="Stok titipan"
        description="Stok dihitung dari batch yang diterima dikurangi penjualan, retur, kerusakan, dan kedaluwarsa."
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href="/shop/sales">
                <ShoppingCart className="size-4" />
                Riwayat transaksi
              </Link>
            </Button>
            <Button
              onClick={() => {
                setPreset(undefined);
                setEventOpen(true);
              }}
            >
              <Plus className="size-4" />
              Catat transaksi
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Stok tersedia"
          value={`${formatNumber(stats.availableUnits)} pcs`}
          hint="Sisa seluruh batch titipan"
          icon={Boxes}
          tone="brand"
        />
        <StatCard
          label="Stok menipis"
          value={formatNumber(stats.lowStockCount)}
          hint="Perlu segera diisi ulang"
          icon={AlertTriangle}
          tone="amber"
        />
        <StatCard
          label="Stok habis"
          value={formatNumber(stats.outOfStockCount)}
          hint="Tidak dapat dijual"
          icon={PackageX}
          tone="rose"
        />
        <StatCard
          label="Total diterima"
          value={`${formatNumber(stats.receivedUnits)} pcs`}
          hint="Akumulasi batch masuk"
          icon={PackageCheck}
          tone="emerald"
        />
      </div>

      <div className="mb-4 mt-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <SegmentedFilter options={options} value={status} onChange={setStatus} />
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Cari produk atau produsen…"
          className="lg:w-72"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Boxes}
          title={stock.length === 0 ? "Belum ada stok titipan" : "Tidak ada hasil"}
          description={
            stock.length === 0
              ? "Stok akan muncul setelah Anda menerima penawaran dan mengonfirmasi pengiriman dari produsen."
              : "Coba ubah filter status atau kata kunci pencarian."
          }
          action={
            stock.length === 0 ? (
              <Button asChild>
                <Link href="/shop/offers">Tinjau penawaran masuk</Link>
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((row) => {
            const soldPercent = percentage(row.sold, row.received);
            return (
              <Card key={`${row.productId}-${row.producerId}`}>
                <CardContent className="pt-5">
                  <div className="flex items-start gap-3">
                    <ProductThumb
                      name={row.productName}
                      emoji={row.productEmoji}
                      image={row.productImage}
                      size="lg"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <p className="text-sm font-bold text-ink">
                          {row.productName}
                        </p>
                        <StockStatusBadge status={row.status} />
                      </div>
                      <p className="mt-0.5 text-xs text-muted">
                        Dari {row.producerName}
                      </p>
                      <p className="mt-1 font-display text-xl font-extrabold text-ink">
                        {formatNumber(row.remaining)}{" "}
                        <span className="text-xs font-semibold text-muted">
                          pcs tersisa
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="mt-3">
                    <div className="flex items-center justify-between text-[10px] text-muted">
                      <span>Terjual {formatNumber(row.sold)} pcs</span>
                      <span>{soldPercent}% dari diterima</span>
                    </div>
                    <Progress
                      value={soldPercent}
                      className="mt-1 h-1.5"
                      indicatorClassName={
                        row.status === "out"
                          ? "bg-red-500"
                          : row.status === "low"
                            ? "bg-amber-500"
                            : undefined
                      }
                    />
                  </div>

                  <div className="mt-3 grid grid-cols-5 gap-1.5 rounded-xl border border-line bg-canvas/50 p-2 text-center">
                    {[
                      { label: "Masuk", value: row.received, tone: "text-ink" },
                      { label: "Jual", value: row.sold, tone: "text-brand-700" },
                      {
                        label: "Retur",
                        value: row.returned,
                        tone: "text-amber-700",
                      },
                      {
                        label: "Rusak",
                        value: row.damaged,
                        tone: "text-red-700",
                      },
                      {
                        label: "Exp",
                        value: row.expired,
                        tone: "text-orange-700",
                      },
                    ].map((cell) => (
                      <div key={cell.label}>
                        <p className="text-[9px] font-semibold uppercase tracking-wide text-muted">
                          {cell.label}
                        </p>
                        <p className={`text-xs font-bold ${cell.tone}`}>
                          {formatNumber(cell.value)}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-2 border-t border-line pt-3">
                    <p className="text-[10px] leading-relaxed text-muted">
                      Diterima − terjual − retur − rusak − kedaluwarsa
                    </p>
                    <Button
                      size="sm"
                      onClick={() => openEvent(row.productId, row.producerId)}
                      disabled={row.remaining <= 0}
                    >
                      <ShoppingCart className="size-3.5" />
                      Catat
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <StockEventDialog
        open={eventOpen}
        onOpenChange={setEventOpen}
        shopId={business.id}
        preset={preset}
      />
    </div>
  );
}
