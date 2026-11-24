"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  Handshake,
  PackageCheck,
  ShoppingCart,
  Truck,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { OfferDetailDialog } from "@/components/forms/offer-detail-dialog";
import { PageHeader } from "@/components/shared/page-header";
import { ProductThumb } from "@/components/shared/product-thumb";
import { SearchInput } from "@/components/shared/search-input";
import { SegmentedFilter } from "@/components/shared/segmented-filter";
import { StatCard } from "@/components/shared/stat-card";
import { OfferStatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { useCurrentBusiness } from "@/hooks/use-current-business";
import { useDemoData } from "@/hooks/use-demo-data";
import { getBusiness, getProduct } from "@/lib/calculations";
import { useDemoStore } from "@/lib/store";
import {
  formatCurrency,
  formatDate,
  formatNumber,
} from "@/lib/utils";
import type { Offer } from "@/types";

const statusFilters = [
  { value: "all", label: "Semua" },
  { value: "pending", label: "Perlu Ditinjau" },
  { value: "accepted", label: "Diterima" },
  { value: "rejected", label: "Ditolak" },
  { value: "cancelled", label: "Dibatalkan" },
];

export function ShopOffers() {
  const business = useCurrentBusiness();
  const data = useDemoData();
  const respondToOffer = useDemoStore((state) => state.respondToOffer);
  const [detailOffer, setDetailOffer] = useState<Offer | null>(null);
  const [acceptTarget, setAcceptTarget] = useState<Offer | null>(null);
  const [rejectTarget, setRejectTarget] = useState<Offer | null>(null);
  const [status, setStatus] = useState("all");
  const [query, setQuery] = useState("");

  if (!business) return null;

  const offers = [...data.offers]
    .filter((offer) => offer.shopId === business.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const options = statusFilters.map((item) => ({
    ...item,
    count:
      item.value === "all"
        ? offers.length
        : offers.filter((offer) => offer.status === item.value).length,
  }));

  const needle = query.trim().toLowerCase();
  const filtered = offers.filter((offer) => {
    const product = getProduct(data.products, offer.productId);
    const producer = getBusiness(data.businesses, offer.producerId);
    const matchesStatus = status === "all" || offer.status === status;
    const matchesQuery =
      !needle ||
      offer.code.toLowerCase().includes(needle) ||
      (product?.name ?? "").toLowerCase().includes(needle) ||
      (producer?.businessName ?? "").toLowerCase().includes(needle);
    return matchesStatus && matchesQuery;
  });

  const stats = {
    total: offers.length,
    pending: offers.filter((offer) => offer.status === "pending").length,
    accepted: offers.filter((offer) => offer.status === "accepted").length,
    rejected: offers.filter((offer) => offer.status === "rejected").length,
  };

  const handleAccept = () => {
    if (!acceptTarget) return;
    respondToOffer(acceptTarget.id, "accepted");
    toast.success(`Penawaran ${acceptTarget.code} diterima`, {
      description:
        "Produsen dapat mencatat pengiriman. Stok bertambah setelah Anda mengonfirmasi penerimaan.",
    });
    setAcceptTarget(null);
  };

  const handleReject = () => {
    if (!rejectTarget) return;
    respondToOffer(rejectTarget.id, "rejected");
    toast.success(`Penawaran ${rejectTarget.code} ditolak`, {
      description: "Produsen dapat mengajukan penawaran baru.",
    });
    setRejectTarget(null);
  };

  return (
    <div>
      <PageHeader
        eyebrow="Peluang produk"
        title="Penawaran masuk"
        description="Tinjau produk titipan yang ditawarkan produsen, lalu terima atau tolak berdasarkan kesepakatan harga dan komisi."
        actions={
          <Button variant="outline" asChild>
            <Link href="/shop/products">
              <PackageCheck className="size-4" />
              Lihat stok titipan
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total penawaran"
          value={formatNumber(stats.total)}
          hint="Seluruh penawaran yang masuk"
          icon={Handshake}
          tone="blue"
        />
        <StatCard
          label="Perlu ditinjau"
          value={formatNumber(stats.pending)}
          hint="Menunggu keputusan Anda"
          icon={ShoppingCart}
          tone="amber"
        />
        <StatCard
          label="Diterima"
          value={formatNumber(stats.accepted)}
          hint="Menunggu pengiriman produsen"
          icon={CheckCircle2}
          tone="emerald"
        />
        <StatCard
          label="Ditolak"
          value={formatNumber(stats.rejected)}
          hint="Tidak diproses lebih lanjut"
          icon={XCircle}
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
          icon={Handshake}
          title={offers.length === 0 ? "Belum ada penawaran" : "Tidak ada hasil"}
          description={
            offers.length === 0
              ? "Penawaran dari produsen akan muncul di sini untuk Anda tinjau."
              : "Coba ubah filter status atau kata kunci pencarian."
          }
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((offer) => {
            const product = getProduct(data.products, offer.productId);
            const producer = getBusiness(data.businesses, offer.producerId);
            const delivery = data.deliveries.find(
              (item) => item.offerId === offer.id,
            );
            const gross = offer.quantity * offer.price;
            const commission = Math.round(
              gross * (offer.commissionRate / 100),
            );

            return (
              <Card key={offer.id}>
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
                          {product?.name ?? "Produk dihapus"}
                        </p>
                        <OfferStatusBadge status={offer.status} />
                      </div>
                      <p className="mt-0.5 text-xs text-muted">
                        {offer.code} · dari {producer?.businessName ?? "Produsen"}{" "}
                        · {formatDate(offer.createdAt)}
                      </p>
                      <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted">
                        {offer.note || "Tanpa catatan tambahan dari produsen."}
                      </p>

                      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                        <div className="rounded-lg bg-mist/60 px-2.5 py-1.5">
                          <p className="text-[9px] font-bold uppercase tracking-wide text-muted">
                            Jumlah
                          </p>
                          <p className="text-xs font-bold text-ink">
                            {formatNumber(offer.quantity)} pcs
                          </p>
                        </div>
                        <div className="rounded-lg bg-mist/60 px-2.5 py-1.5">
                          <p className="text-[9px] font-bold uppercase tracking-wide text-muted">
                            Harga jual
                          </p>
                          <p className="text-xs font-bold text-ink">
                            {formatCurrency(offer.price)}
                          </p>
                        </div>
                        <div className="rounded-lg bg-amber-50 px-2.5 py-1.5">
                          <p className="text-[9px] font-bold uppercase tracking-wide text-amber-700">
                            Komisi Anda
                          </p>
                          <p className="text-xs font-bold text-amber-900">
                            {offer.commissionRate}% · {formatCurrency(commission)}
                          </p>
                        </div>
                        <div className="rounded-lg bg-mist/60 px-2.5 py-1.5">
                          <p className="text-[9px] font-bold uppercase tracking-wide text-muted">
                            Potensi omzet
                          </p>
                          <p className="text-xs font-bold text-ink">
                            {formatCurrency(gross)}
                          </p>
                        </div>
                      </div>

                      {offer.status === "accepted" && (
                        <div className="mt-3 flex items-center gap-2 rounded-lg border border-emerald-100 bg-emerald-50/70 px-3 py-2 text-[11px] text-emerald-800">
                          <Truck className="size-3.5 shrink-0" />
                          {delivery ? (
                            <span>
                              Pengiriman <strong>{delivery.code}</strong> ·{" "}
                              {delivery.status === "received" ||
                              delivery.status === "disputed"
                                ? "sudah diterima dan masuk stok"
                                : delivery.status === "shipped"
                                  ? "dalam perjalanan, konfirmasi saat tiba"
                                  : "sedang disiapkan produsen"}
                            </span>
                          ) : (
                            <span>
                              Diterima. Menunggu produsen mencatat pengiriman.
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex shrink-0 flex-wrap gap-2 sm:flex-col sm:items-stretch">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setDetailOffer(offer)}
                      >
                        <Eye className="size-3.5" />
                        Detail
                      </Button>
                      {offer.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => setAcceptTarget(offer)}
                          >
                            <CheckCircle2 className="size-3.5" />
                            Terima
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive-soft"
                            onClick={() => setRejectTarget(offer)}
                          >
                            <XCircle className="size-3.5" />
                            Tolak
                          </Button>
                        </>
                      )}
                      {offer.status === "accepted" && delivery && (
                        <Button size="sm" variant="secondary" asChild>
                          <Link href="/shop/deliveries">
                            <ArrowRight className="size-3.5" />
                            Pengiriman
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <OfferDetailDialog
        offer={detailOffer}
        open={Boolean(detailOffer)}
        onOpenChange={(open) => {
          if (!open) setDetailOffer(null);
        }}
      />
      <ConfirmDialog
        open={Boolean(acceptTarget)}
        onOpenChange={(open) => {
          if (!open) setAcceptTarget(null);
        }}
        title="Terima penawaran?"
        description={`Penawaran ${acceptTarget?.code ?? ""} akan diterima. Produsen kemudian dapat mencatat pengiriman, dan stok bertambah setelah Anda mengonfirmasi penerimaan barang.`}
        confirmLabel="Terima penawaran"
        onConfirm={handleAccept}
      />
      <ConfirmDialog
        open={Boolean(rejectTarget)}
        onOpenChange={(open) => {
          if (!open) setRejectTarget(null);
        }}
        title="Tolak penawaran?"
        description={`Penawaran ${rejectTarget?.code ?? ""} akan ditolak. Produsen dapat mengajukan penawaran baru dengan harga atau komisi berbeda.`}
        confirmLabel="Tolak penawaran"
        variant="destructive"
        onConfirm={handleReject}
      />
    </div>
  );
}
