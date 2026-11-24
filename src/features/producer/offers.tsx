"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Eye,
  Handshake,
  Package,
  Plus,
  Send,
  Truck,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { DeliveryFormDialog } from "@/components/forms/delivery-form-dialog";
import { OfferDetailDialog } from "@/components/forms/offer-detail-dialog";
import { OfferFormDialog } from "@/components/forms/offer-form-dialog";
import { PageHeader } from "@/components/shared/page-header";
import { ProductThumb } from "@/components/shared/product-thumb";
import { SearchInput } from "@/components/shared/search-input";
import { SegmentedFilter } from "@/components/shared/segmented-filter";
import { StatCard } from "@/components/shared/stat-card";
import { OfferStatusBadge } from "@/components/shared/status-badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  { value: "draft", label: "Draft" },
  { value: "pending", label: "Menunggu" },
  { value: "accepted", label: "Diterima" },
  { value: "rejected", label: "Ditolak" },
  { value: "cancelled", label: "Dibatalkan" },
];

export function ProducerOffers() {
  const business = useCurrentBusiness();
  const data = useDemoData();
  const sendOffer = useDemoStore((state) => state.sendOffer);
  const cancelOffer = useDemoStore((state) => state.cancelOffer);
  const [createOpen, setCreateOpen] = useState(false);
  const [detailOffer, setDetailOffer] = useState<Offer | null>(null);
  const [cancelTarget, setCancelTarget] = useState<Offer | null>(null);
  const [deliveryOfferId, setDeliveryOfferId] = useState<string | undefined>();
  const [deliveryOpen, setDeliveryOpen] = useState(false);
  const [status, setStatus] = useState("all");
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (window.location.hash === "#baru") {
      // Syncing from the URL (an external system) is the intended use of this effect.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCreateOpen(true);
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, []);

  if (!business) return null;

  const offers = [...data.offers]
    .filter((offer) => offer.producerId === business.id)
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
    const shop = getBusiness(data.businesses, offer.shopId);
    const matchesStatus = status === "all" || offer.status === status;
    const matchesQuery =
      !needle ||
      offer.code.toLowerCase().includes(needle) ||
      (product?.name ?? "").toLowerCase().includes(needle) ||
      (shop?.businessName ?? "").toLowerCase().includes(needle);
    return matchesStatus && matchesQuery;
  });

  const stats = {
    total: offers.length,
    pending: offers.filter((offer) => offer.status === "pending").length,
    accepted: offers.filter((offer) => offer.status === "accepted").length,
    draft: offers.filter((offer) => offer.status === "draft").length,
  };

  const activeProducts = data.products.filter(
    (product) => product.producerId === business.id && product.status === "active",
  );

  const handleSend = (offer: Offer) => {
    sendOffer(offer.id);
    toast.success(`Penawaran ${offer.code} terkirim`, {
      description: "Warung mitra akan menerima penawaran ini.",
    });
  };

  const handleCancel = () => {
    if (!cancelTarget) return;
    cancelOffer(cancelTarget.id);
    toast.success(`Penawaran ${cancelTarget.code} dibatalkan`, {
      description: "Penawaran tidak lagi dapat diproses mitra.",
    });
    setCancelTarget(null);
  };

  return (
    <div>
      <PageHeader
        eyebrow="Kolaborasi"
        title="Penawaran"
        description="Kirim produk ke warung mitra, pantau respons, dan lanjutkan ke pengiriman setelah penawaran diterima."
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href="/producer/products">
                <Package className="size-4" />
                Kelola produk
              </Link>
            </Button>
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="size-4" />
              Buat penawaran
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total penawaran"
          value={formatNumber(stats.total)}
          hint="Seluruh penawaran yang pernah dibuat"
          icon={Handshake}
          tone="blue"
        />
        <StatCard
          label="Menunggu respons"
          value={formatNumber(stats.pending)}
          hint="Belum diputuskan warung"
          icon={Send}
          tone="amber"
        />
        <StatCard
          label="Diterima"
          value={formatNumber(stats.accepted)}
          hint="Siap dicatat pengirimannya"
          icon={Truck}
          tone="emerald"
        />
        <StatCard
          label="Draft"
          value={formatNumber(stats.draft)}
          hint="Belum dikirim ke warung"
          icon={Package}
          tone="violet"
        />
      </div>

      {activeProducts.length === 0 && (
        <Alert variant="warning" className="mt-4">
          <AlertDescription>
            Belum ada produk aktif. Tambahkan produk terlebih dahulu agar dapat
            membuat penawaran.{" "}
            <Link
              href="/producer/products"
              className="font-bold underline underline-offset-2"
            >
              Buka halaman produk
            </Link>
            .
          </AlertDescription>
        </Alert>
      )}

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
          icon={Handshake}
          title={
            offers.length === 0 ? "Belum ada penawaran" : "Tidak ada hasil"
          }
          description={
            offers.length === 0
              ? "Buat penawaran pertama Anda ke warung mitra untuk memulai alur konsinyasi."
              : "Coba ubah filter status atau kata kunci pencarian."
          }
          action={
            offers.length === 0 ? (
              <Button onClick={() => setCreateOpen(true)}>
                <Plus className="size-4" />
                Buat penawaran
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((offer) => {
            const product = getProduct(data.products, offer.productId);
            const shop = getBusiness(data.businesses, offer.shopId);
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
                        {offer.code} · untuk {shop?.businessName ?? "Warung"} ·{" "}
                        {formatDate(offer.createdAt)}
                      </p>
                      <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted">
                        {offer.note || "Tanpa catatan tambahan."}
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
                            Harga
                          </p>
                          <p className="text-xs font-bold text-ink">
                            {formatCurrency(offer.price)}
                          </p>
                        </div>
                        <div className="rounded-lg bg-mist/60 px-2.5 py-1.5">
                          <p className="text-[9px] font-bold uppercase tracking-wide text-muted">
                            Komisi
                          </p>
                          <p className="text-xs font-bold text-ink">
                            {offer.commissionRate}% · {formatCurrency(commission)}
                          </p>
                        </div>
                        <div className="rounded-lg bg-brand-50 px-2.5 py-1.5">
                          <p className="text-[9px] font-bold uppercase tracking-wide text-brand-700">
                            Hak produsen
                          </p>
                          <p className="text-xs font-bold text-brand-900">
                            {formatCurrency(gross - commission)}
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
                                ? "sudah diterima warung"
                                : delivery.status === "shipped"
                                  ? "sedang dikirim"
                                  : "siap dikirim"}
                            </span>
                          ) : (
                            <span>
                              Penawaran diterima. Catat pengiriman agar stok
                              warung bertambah.
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

                      {offer.status === "draft" && (
                        <Button size="sm" onClick={() => handleSend(offer)}>
                          <Send className="size-3.5" />
                          Kirim
                        </Button>
                      )}

                      {offer.status === "accepted" && !delivery && (
                        <Button
                          size="sm"
                          onClick={() => {
                            setDeliveryOfferId(offer.id);
                            setDeliveryOpen(true);
                          }}
                        >
                          <Truck className="size-3.5" />
                          Catat kirim
                        </Button>
                      )}

                      {["draft", "pending"].includes(offer.status) && (
                        <Button
                          size="sm"
                          variant="destructive-soft"
                          onClick={() => setCancelTarget(offer)}
                        >
                          <XCircle className="size-3.5" />
                          Batalkan
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

      <div className="mt-5 flex items-start gap-2 rounded-xl border border-line bg-white p-3 text-[11px] leading-relaxed text-muted">
        <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-500" />
        <p>
          Satu penawaran yang diterima hanya dapat memiliki satu catatan
          pengiriman pada prototype ini. Untuk pengiriman bertahap, buat
          penawaran baru.
        </p>
      </div>

      <OfferFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        producerId={business.id}
      />
      <OfferDetailDialog
        offer={detailOffer}
        open={Boolean(detailOffer)}
        onOpenChange={(open) => {
          if (!open) setDetailOffer(null);
        }}
      />
      <DeliveryFormDialog
        open={deliveryOpen}
        onOpenChange={setDeliveryOpen}
        producerId={business.id}
        offerId={deliveryOfferId}
      />
      <ConfirmDialog
        open={Boolean(cancelTarget)}
        onOpenChange={(open) => {
          if (!open) setCancelTarget(null);
        }}
        title="Batalkan penawaran?"
        description={`Penawaran ${cancelTarget?.code ?? ""} akan dibatalkan dan tidak dapat diproses oleh warung mitra.`}
        confirmLabel="Batalkan penawaran"
        variant="destructive"
        onConfirm={handleCancel}
      />
    </div>
  );
}
