"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Boxes,
  Handshake,
  PackageCheck,
  ShoppingCart,
  TrendingUp,
  Truck,
  Wallet,
} from "lucide-react";
import { PaymentSummaryCard } from "@/components/dashboard/payment-summary-card";
import { SalesChart } from "@/components/dashboard/sales-chart";
import { ActivityFeed } from "@/components/shared/activity-feed";
import { PageHeader } from "@/components/shared/page-header";
import { ProductThumb } from "@/components/shared/product-thumb";
import { StatCard } from "@/components/shared/stat-card";
import {
  DeliveryStatusBadge,
  OfferStatusBadge,
  StockStatusBadge,
} from "@/components/shared/status-badge";
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
import {
  getBusiness,
  getProduct,
  getSalesSeries,
  getShopStats,
  getShopStock,
} from "@/lib/calculations";
import {
  formatCurrency,
  formatDate,
  formatNumber,
  percentage,
} from "@/lib/utils";

export function ShopDashboard() {
  const business = useCurrentBusiness();
  const data = useDemoData();

  if (!business) return null;

  const stats = getShopStats(data, business.id);
  const series = getSalesSeries(data.stockEvents, { shopId: business.id }, 14);
  const stock = getShopStock(data, business.id);
  const lowStock = stock.filter((row) => row.status !== "safe").slice(0, 4);
  const incomingOffers = [...data.offers]
    .filter(
      (offer) => offer.shopId === business.id && offer.status === "pending",
    )
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 4);
  const waitingDeliveries = data.deliveries
    .filter(
      (delivery) =>
        delivery.shopId === business.id && delivery.status === "shipped",
    )
    .slice(0, 3);
  const activities = data.activities
    .filter((activity) => activity.shopId === business.id)
    .slice(0, 5);
  const completedPercent = percentage(stats.completedPaid, stats.grossSales);

  return (
    <div>
      <PageHeader
        eyebrow={formatDate(new Date(), "EEEE, d MMMM yyyy")}
        title={`Ringkasan warung ${business.businessName}`}
        description="Pantau stok titipan, penawaran masuk, penjualan, dan kewajiban pembayaran ke produsen."
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href="/shop/settlements">
                <Wallet className="size-4" />
                Lihat settlement
              </Link>
            </Button>
            <Button asChild>
              <Link href="/shop/sales">
                <ShoppingCart className="size-4" />
                Catat penjualan
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Stok tersedia"
          value={`${formatNumber(stats.availableUnits)} pcs`}
          hint={`${stats.lowStockCount} menipis · ${stats.outOfStockCount} habis`}
          icon={Boxes}
          tone="brand"
        />
        <StatCard
          label="Penawaran masuk"
          value={formatNumber(stats.pendingOffers)}
          hint="Menunggu keputusan Anda"
          icon={Handshake}
          tone="blue"
        />
        <StatCard
          label="Produk terjual"
          value={`${formatNumber(stats.unitsSold)} pcs`}
          hint={formatCurrency(stats.grossSales)}
          icon={TrendingUp}
          tone="emerald"
        />
        <StatCard
          label="Total settlement"
          value={formatCurrency(stats.completedPaid)}
          hint={`${stats.completedSettlements} settlement selesai`}
          icon={Wallet}
          tone="amber"
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-start justify-between gap-3">
            <div>
              <CardTitle>Tren penjualan</CardTitle>
              <CardDescription>
                Nilai penjualan titipan warung selama 14 hari terakhir.
              </CardDescription>
            </div>
            <span className="shrink-0 rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-bold text-brand-700">
              {formatNumber(
                series.reduce((total, point) => total + point.units, 0),
              )}{" "}
              pcs
            </span>
          </CardHeader>
          <CardContent>
            <SalesChart data={series} />
          </CardContent>
        </Card>

        <PaymentSummaryCard
          eyebrow="Ringkasan pembayaran"
          title="Kewajiban ke produsen"
          amount={stats.outstandingPayment}
          amountLabel="Sisa pembayaran yang belum diselesaikan"
          rows={[
            {
              label: "Sudah dibayarkan",
              value: formatCurrency(stats.completedPaid),
            },
            {
              label: "Komisi diperoleh",
              value: formatCurrency(stats.commissionEarned),
            },
            {
              label: "Total penjualan",
              value: formatCurrency(stats.grossSales),
            },
          ]}
          progress={completedPercent}
          progressLabel="Proporsi pembayaran"
          href="/shop/settlements"
          cta="Periksa settlement"
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
            <div className="min-w-0">
              <CardTitle>Penawaran masuk</CardTitle>
              <CardDescription>
                Penawaran baru dari produsen yang perlu ditinjau.
              </CardDescription>
            </div>
            <Link
              href="/shop/offers"
              className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-brand-700 hover:text-brand-800"
            >
              Lihat semua
              <ArrowRight className="size-3.5" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-1">
            {incomingOffers.length === 0 ? (
              <EmptyState
                icon={Handshake}
                title="Tidak ada penawaran baru"
                description="Penawaran dari produsen akan muncul di sini untuk Anda tinjau."
              />
            ) : (
              incomingOffers.map((offer) => {
                const product = getProduct(data.products, offer.productId);
                const producer = getBusiness(data.businesses, offer.producerId);
                return (
                  <div
                    key={offer.id}
                    className="flex items-center gap-3 rounded-xl px-1 py-2.5 transition-colors hover:bg-mist/60"
                  >
                    <ProductThumb
                      name={product?.name ?? "Produk"}
                      emoji={product?.emoji ?? "📦"}
                      image={product?.image}
                      size="sm"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-ink">
                        {product?.name ?? "Produk dihapus"}
                      </p>
                      <p className="truncate text-[11px] text-muted">
                        {producer?.businessName ?? "Produsen"} · {offer.quantity}{" "}
                        pcs · komisi {offer.commissionRate}%
                      </p>
                    </div>
                    <div className="hidden text-right sm:block">
                      <p className="text-xs font-semibold text-ink">
                        {formatCurrency(offer.price)}
                      </p>
                      <p className="text-[10px] text-muted">per pcs</p>
                    </div>
                    <OfferStatusBadge status={offer.status} />
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-start justify-between gap-3">
            <div>
              <CardTitle>Stok perlu perhatian</CardTitle>
              <CardDescription>Produk menipis atau habis.</CardDescription>
            </div>
            <AlertTriangle className="size-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            {lowStock.length === 0 ? (
              <EmptyState
                icon={PackageCheck}
                title="Semua stok aman"
                description="Tidak ada produk titipan yang menipis saat ini."
              />
            ) : (
              <div className="space-y-3">
                {lowStock.map((row) => (
                  <div
                    key={`${row.productId}-${row.producerId}`}
                    className="flex items-center gap-2.5 rounded-xl border border-line bg-canvas/50 p-2.5"
                  >
                    <ProductThumb
                      name={row.productName}
                      emoji={row.productEmoji}
                      image={row.productImage}
                      size="sm"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold text-ink">
                        {row.productName}
                      </p>
                      <p className="truncate text-[10px] text-muted">
                        Sisa {row.remaining} dari {row.received} pcs
                      </p>
                    </div>
                    <StockStatusBadge status={row.status} />
                  </div>
                ))}
                <Link
                  href="/shop/products"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-brand-700 hover:text-brand-800"
                >
                  Lihat stok titipan
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-start justify-between gap-3">
            <div>
              <CardTitle>Pengiriman menunggu konfirmasi</CardTitle>
              <CardDescription>
                Periksa jumlah barang yang diterima sebelum stok diperbarui.
              </CardDescription>
            </div>
            <Link
              href="/shop/deliveries"
              className="text-xs font-semibold text-brand-700 hover:text-brand-800"
            >
              Kelola
            </Link>
          </CardHeader>
          <CardContent>
            {waitingDeliveries.length === 0 ? (
              <EmptyState
                icon={Truck}
                title="Tidak ada pengiriman menunggu"
                description="Pengiriman baru dari produsen akan muncul di sini."
              />
            ) : (
              <div className="space-y-2">
                {waitingDeliveries.map((delivery) => {
                  const product = getProduct(data.products, delivery.productId);
                  const producer = getBusiness(
                    data.businesses,
                    delivery.producerId,
                  );
                  return (
                    <div
                      key={delivery.id}
                      className="flex items-center gap-3 rounded-xl border border-line bg-canvas/50 p-3"
                    >
                      <span className="flex size-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                        <Truck className="size-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-semibold text-ink">
                          {delivery.code} · {product?.name ?? "Produk"}
                        </p>
                        <p className="truncate text-[10px] text-muted">
                          {producer?.businessName ?? "Produsen"} ·{" "}
                          {delivery.quantity} pcs
                        </p>
                      </div>
                      <DeliveryStatusBadge status={delivery.status} />
                    </div>
                  );
                })}
                <Link
                  href="/shop/deliveries"
                  className="inline-flex items-center gap-1 pt-1 text-xs font-semibold text-brand-700 hover:text-brand-800"
                >
                  Konfirmasi penerimaan
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-start justify-between gap-3">
            <div>
              <CardTitle>Aktivitas terbaru</CardTitle>
              <CardDescription>Penerimaan dan penjualan terakhir.</CardDescription>
            </div>
            <Link
              href="/shop/history"
              className="text-xs font-semibold text-brand-700 hover:text-brand-800"
            >
              Riwayat
            </Link>
          </CardHeader>
          <CardContent>
            <ActivityFeed
              activities={activities}
              limit={5}
              emptyDescription="Aktivitas warung akan tampil di sini setelah ada transaksi."
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
