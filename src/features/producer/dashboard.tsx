"use client";

import Link from "next/link";
import {
  ArrowRight,
  Boxes,
  Handshake,
  Package,
  Plus,
  TrendingUp,
  Truck,
  Wallet,
} from "lucide-react";
import { ActivityFeed } from "@/components/shared/activity-feed";
import { PageHeader } from "@/components/shared/page-header";
import { ProductThumb } from "@/components/shared/product-thumb";
import { StatCard } from "@/components/shared/stat-card";
import { OfferStatusBadge } from "@/components/shared/status-badge";
import { PaymentSummaryCard } from "@/components/dashboard/payment-summary-card";
import { SalesChart } from "@/components/dashboard/sales-chart";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Progress } from "@/components/ui/progress";
import { useCurrentBusiness } from "@/hooks/use-current-business";
import { useDemoData } from "@/hooks/use-demo-data";
import {
  getBusiness,
  getDeliveryCounts,
  getProducerStats,
  getProduct,
  getSalesSeries,
  getTopProducts,
} from "@/lib/calculations";
import { deliveryStatusMeta } from "@/components/shared/status-badge";
import {
  formatCurrency,
  formatDate,
  formatNumber,
  percentage,
} from "@/lib/utils";
import type { DeliveryStatus } from "@/types";

const deliveryOrder: DeliveryStatus[] = [
  "preparing",
  "shipped",
  "received",
  "disputed",
];

const deliveryTone: Record<DeliveryStatus, string> = {
  preparing: "bg-blue-500",
  shipped: "bg-amber-500",
  received: "bg-emerald-500",
  disputed: "bg-red-500",
};

export function ProducerDashboard() {
  const business = useCurrentBusiness();
  const data = useDemoData();

  if (!business) return null;

  const stats = getProducerStats(data, business.id);
  const series = getSalesSeries(data.stockEvents, { producerId: business.id }, 14);
  const latestOffers = [...data.offers]
    .filter((offer) => offer.producerId === business.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 5);
  const producerDeliveries = data.deliveries.filter(
    (delivery) => delivery.producerId === business.id,
  );
  const deliveryCounts = getDeliveryCounts(producerDeliveries);
  const topProducts = getTopProducts(
    data.stockEvents,
    { producerId: business.id },
    4,
  );
  const maxTopUnits = topProducts[0]?.units ?? 1;
  const activities = data.activities
    .filter((activity) => activity.producerId === business.id)
    .slice(0, 5);
  const completedPercent = percentage(stats.completedNet, stats.netReceivable);

  return (
    <div>
      <PageHeader
        eyebrow={formatDate(new Date(), "EEEE, d MMMM yyyy")}
        title={`Ringkasan konsinyasi ${business.businessName}`}
        description="Pantau penawaran, pengiriman, penjualan, dan pembayaran yang menjadi hak usaha Anda."
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href="/producer/settlements">
                <Wallet className="size-4" />
                Lihat settlement
              </Link>
            </Button>
            <Button asChild>
              <Link href="/producer/offers#baru">
                <Plus className="size-4" />
                Buat penawaran
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total penawaran"
          value={formatNumber(stats.totalOffers)}
          hint={`${stats.pendingOffers} menunggu respons warung`}
          icon={Handshake}
          tone="blue"
        />
        <StatCard
          label="Total pengiriman"
          value={formatNumber(stats.totalDeliveries)}
          hint={`${stats.activeDeliveries} pengiriman dalam proses`}
          icon={Truck}
          tone="violet"
        />
        <StatCard
          label="Total penjualan"
          value={formatCurrency(stats.grossSales)}
          hint={`${formatNumber(stats.unitsSold)} pcs terjual`}
          icon={TrendingUp}
          tone="emerald"
        />
        <StatCard
          label="Komisi mitra"
          value={formatCurrency(stats.commission)}
          hint="Dari penjualan yang tercatat"
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
                Nilai penjualan produk titipan selama 14 hari terakhir.
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
          title="Hak produsen (neto)"
          amount={stats.netReceivable}
          amountLabel="Penjualan bruto dikurangi komisi mitra"
          rows={[
            {
              label: "Sudah diselesaikan",
              value: formatCurrency(stats.completedNet),
            },
            {
              label: "Belum diselesaikan",
              value: formatCurrency(stats.outstandingNet),
            },
            {
              label: "Settlement selesai",
              value: `${stats.completedSettlements} periode`,
            },
          ]}
          progress={completedPercent}
          progressLabel="Pembayaran selesai"
          href="/producer/settlements"
          cta="Kelola settlement"
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
            <div className="min-w-0">
              <CardTitle>Penawaran terbaru</CardTitle>
              <CardDescription>
                Status penawaran yang Anda kirim ke warung mitra.
              </CardDescription>
            </div>
            <Link
              href="/producer/offers"
              className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-brand-700 hover:text-brand-800"
            >
              Lihat semua
              <ArrowRight className="size-3.5" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-1">
            {latestOffers.length === 0 ? (
              <EmptyState
                icon={Handshake}
                title="Belum ada penawaran"
                description="Buat penawaran pertama Anda ke warung mitra untuk memulai alur konsinyasi."
                action={
                  <Button asChild size="sm">
                    <Link href="/producer/offers#baru">Buat penawaran</Link>
                  </Button>
                }
              />
            ) : (
              latestOffers.map((offer) => {
                const product = getProduct(data.products, offer.productId);
                const shop = getBusiness(data.businesses, offer.shopId);
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
                        {shop?.businessName ?? "Warung"} · {offer.quantity} pcs ·{" "}
                        {formatCurrency(offer.price)}/pcs
                      </p>
                    </div>
                    <div className="hidden text-right sm:block">
                      <p className="text-xs font-semibold text-ink">
                        {formatCurrency(offer.quantity * offer.price)}
                      </p>
                      <p className="text-[10px] text-muted">
                        {formatDate(offer.createdAt, "d MMM")}
                      </p>
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
              <CardTitle>Aktivitas terbaru</CardTitle>
              <CardDescription>Perubahan terakhir pada data Anda.</CardDescription>
            </div>
            <Link
              href="/producer/history"
              className="text-xs font-semibold text-brand-700 hover:text-brand-800"
            >
              Riwayat
            </Link>
          </CardHeader>
          <CardContent>
            <ActivityFeed
              activities={activities}
              limit={5}
              emptyDescription="Aktivitas penawaran dan pengiriman akan tampil di sini."
            />
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-start justify-between gap-3">
            <div>
              <CardTitle>Status pengiriman</CardTitle>
              <CardDescription>
                Ringkasan seluruh batch yang dikirim ke warung.
              </CardDescription>
            </div>
            <Link
              href="/producer/deliveries"
              className="text-xs font-semibold text-brand-700 hover:text-brand-800"
            >
              Kelola
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {deliveryOrder.map((status) => {
              const count = deliveryCounts[status];
              return (
                <div key={status} className="flex items-center gap-3">
                  <span
                    className={`size-2 rounded-full ${deliveryTone[status]}`}
                  />
                  <span className="w-28 shrink-0 text-xs font-medium text-muted">
                    {deliveryStatusMeta[status].label}
                  </span>
                  <Progress
                    value={percentage(count, Math.max(deliveryCounts.total, 1))}
                    className="h-1.5 flex-1"
                    indicatorClassName={deliveryTone[status]}
                  />
                  <span className="w-6 text-right text-xs font-bold text-ink">
                    {count}
                  </span>
                </div>
              );
            })}
            <div className="mt-2 flex items-center justify-between rounded-xl bg-mist/60 px-3 py-2.5">
              <span className="text-xs font-semibold text-muted">
                Total pengiriman
              </span>
              <span className="text-sm font-bold text-ink">
                {deliveryCounts.total}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-start justify-between gap-3">
            <div>
              <CardTitle>Performa produk</CardTitle>
              <CardDescription>
                Produk dengan penjualan tertinggi sepanjang periode.
              </CardDescription>
            </div>
            <Link
              href="/producer/products"
              className="text-xs font-semibold text-brand-700 hover:text-brand-800"
            >
              Produk
            </Link>
          </CardHeader>
          <CardContent>
            {topProducts.length === 0 ? (
              <EmptyState
                icon={Boxes}
                title="Belum ada penjualan"
                description="Performa produk akan muncul setelah warung mencatat penjualan."
              />
            ) : (
              <div className="space-y-4">
                {topProducts.map((item) => {
                  const product = getProduct(data.products, item.productId);
                  return (
                    <div key={item.productId}>
                      <div className="mb-1.5 flex items-center gap-2.5">
                        <ProductThumb
                          name={product?.name ?? "Produk"}
                          emoji={product?.emoji ?? "📦"}
                          image={product?.image}
                          size="sm"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-semibold text-ink">
                            {product?.name ?? "Produk dihapus"}
                          </p>
                          <p className="text-[10px] text-muted">
                            {item.units} pcs · {formatCurrency(item.gross)}
                          </p>
                        </div>
                      </div>
                      <Progress
                        value={percentage(item.units, maxTopUnits)}
                        className="h-1.5"
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 flex flex-col items-start justify-between gap-3 rounded-2xl border border-line bg-white p-5 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
            <Package className="size-5" />
          </span>
          <div>
            <p className="text-sm font-bold text-ink">
              Sudah ada penawaran yang diterima?
            </p>
            <p className="text-xs text-muted">
              Catat pengiriman agar warung dapat mengonfirmasi penerimaan dan
              stok bertambah.
            </p>
          </div>
        </div>
        <Button variant="outline" asChild>
          <Link href="/producer/deliveries">
            <Truck className="size-4" />
            Catat pengiriman
          </Link>
        </Button>
      </div>
    </div>
  );
}
