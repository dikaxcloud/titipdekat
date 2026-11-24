"use client";

import { useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Clock,
  Eye,
  Send,
  Store,
  UtensilsCrossed,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { SearchInput } from "@/components/shared/search-input";
import { SegmentedFilter } from "@/components/shared/segmented-filter";
import { StatCard } from "@/components/shared/stat-card";
import { SettlementStatusBadge } from "@/components/shared/status-badge";
import { SettlementDetailDialog } from "@/components/forms/settlement-detail-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCurrentBusiness } from "@/hooks/use-current-business";
import { useDemoData } from "@/hooks/use-demo-data";
import {
  getProducerStats,
  getSettlementViews,
  getShopStats,
} from "@/lib/calculations";
import { useDemoStore } from "@/lib/store";
import {
  formatCurrency,
  formatDate,
  formatNumber,
} from "@/lib/utils";
import type { Role, Settlement } from "@/types";

const statusFilters = [
  { value: "all", label: "Semua" },
  { value: "pending", label: "Pending" },
  { value: "awaiting_confirmation", label: "Menunggu Konfirmasi" },
  { value: "completed", label: "Selesai" },
];

export function SettlementsView({ role }: { role: Role }) {
  const business = useCurrentBusiness();
  const data = useDemoData();
  const submitSettlement = useDemoStore((state) => state.submitSettlement);
  const completeSettlement = useDemoStore((state) => state.completeSettlement);
  const [status, setStatus] = useState("all");
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"card" | "table">("card");
  const [selected, setSelected] = useState<Settlement | null>(null);

  if (!business) return null;

  const views = getSettlementViews(
    data,
    role === "producer" ? { producerId: business.id } : { shopId: business.id },
  );
  const producerStats =
    role === "producer" ? getProducerStats(data, business.id) : null;
  const shopStats = role === "shop" ? getShopStats(data, business.id) : null;

  const options = statusFilters.map((item) => ({
    ...item,
    count:
      item.value === "all"
        ? views.length
        : views.filter((view) => view.settlement.status === item.value).length,
  }));

  const needle = query.trim().toLowerCase();
  const filtered = views.filter((view) => {
    const matchesStatus =
      status === "all" || view.settlement.status === status;
    const matchesQuery =
      !needle ||
      view.settlement.code.toLowerCase().includes(needle) ||
      view.counterpartName.toLowerCase().includes(needle) ||
      view.settlement.periodStart.includes(needle) ||
      view.settlement.periodEnd.includes(needle);
    return matchesStatus && matchesQuery;
  });

  const pendingCount = views.filter(
    (view) => view.settlement.status === "pending",
  ).length;
  const awaitingCount = views.filter(
    (view) =>
      view.settlement.status === "awaiting_confirmation" &&
      view.settlement.submittedBy !== role,
  ).length;

  const handleSubmit = (settlement: Settlement) => {
    submitSettlement(settlement.id);
    toast.success(`Settlement ${settlement.code} diajukan`, {
      description: "Menunggu konfirmasi dari pihak mitra.",
    });
  };

  const handleComplete = (settlement: Settlement) => {
    completeSettlement(settlement.id);
    toast.success(`Settlement ${settlement.code} selesai`, {
      description: "Pembayaran dikonfirmasi kedua pihak.",
    });
  };

  return (
    <div>
      <PageHeader
        eyebrow="Penyelesaian pembayaran"
        title="Settlement"
        description={
          role === "producer"
            ? "Ajukan dan konfirmasi pembayaran konsinyasi per periode berdasarkan penjualan yang tercatat."
            : "Periksa kewajiban pembayaran ke produsen, komisi yang diperoleh, dan selesaikan settlement bersama."
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {role === "producer" && producerStats ? (
          <>
            <StatCard
              label="Hak produsen (neto)"
              value={formatCurrency(producerStats.netReceivable)}
              hint={`${formatNumber(producerStats.unitsSold)} pcs terjual`}
              icon={Wallet}
              tone="brand"
            />
            <StatCard
              label="Sudah diselesaikan"
              value={formatCurrency(producerStats.completedNet)}
              hint={`${producerStats.completedSettlements} settlement selesai`}
              icon={BadgeCheck}
              tone="emerald"
            />
            <StatCard
              label="Belum diselesaikan"
              value={formatCurrency(producerStats.outstandingNet)}
              hint="Sisa hak yang belum dibayar"
              icon={Clock}
              tone="amber"
            />
            <StatCard
              label="Perlu tindakan"
              value={formatNumber(pendingCount + awaitingCount)}
              hint={`${pendingCount} pending · ${awaitingCount} menunggu konfirmasi Anda`}
              icon={Send}
              tone="blue"
            />
          </>
        ) : shopStats ? (
          <>
            <StatCard
              label="Total penjualan"
              value={formatCurrency(shopStats.grossSales)}
              hint={`${formatNumber(shopStats.unitsSold)} pcs terjual`}
              icon={Wallet}
              tone="brand"
            />
            <StatCard
              label="Komisi diperoleh"
              value={formatCurrency(shopStats.commissionEarned)}
              hint="Dari penjualan titipan"
              icon={BadgeCheck}
              tone="emerald"
            />
            <StatCard
              label="Sudah dibayarkan"
              value={formatCurrency(shopStats.completedPaid)}
              hint={`${shopStats.completedSettlements} settlement selesai`}
              icon={Store}
              tone="blue"
            />
            <StatCard
              label="Sisa kewajiban"
              value={formatCurrency(shopStats.outstandingPayment)}
              hint="Belum diselesaikan ke produsen"
              icon={Clock}
              tone="amber"
            />
          </>
        ) : null}
      </div>

      <Alert variant="info" className="mt-4">
        <AlertDescription>
          Settlement dihitung otomatis dari penjualan pada periode terkait.
          Pihak yang mengajukan tidak dapat mengonfirmasi sendiri — konfirmasi
          dilakukan oleh mitra.
        </AlertDescription>
      </Alert>

      <div className="mb-4 mt-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <SegmentedFilter
          options={options}
          value={status}
          onChange={setStatus}
          ariaLabel="Filter status settlement"
        />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Cari kode, mitra, atau periode…"
            className="lg:w-64"
          />
          <SegmentedFilter
            options={[
              { value: "card", label: "Kartu" },
              { value: "table", label: "Tabel" },
            ]}
            value={view}
            onChange={(value) => setView(value as "card" | "table")}
            ariaLabel="Tampilan daftar settlement"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Wallet}
          title="Tidak ada settlement"
          description={
            query || status !== "all"
              ? "Coba ubah filter status atau kata kunci pencarian."
              : "Settlement akan muncul setelah ada penjualan pada periode berjalan."
          }
        />
      ) : view === "table" ? (
        <Card className="overflow-hidden">
          <Table className="min-w-[960px]">
            <TableCaption className="sr-only">
              Daftar settlement konsinyasi beserta penjualan, komisi, dan
              pembayaran.
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Kode</TableHead>
                <TableHead>Mitra</TableHead>
                <TableHead>Periode</TableHead>
                <TableHead className="text-right">Penjualan</TableHead>
                <TableHead className="text-right">Komisi</TableHead>
                <TableHead className="text-right">Pembayaran</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(({ settlement, counterpartName, breakdown }) => {
                const canSubmit = settlement.status === "pending";
                const canComplete =
                  settlement.status === "awaiting_confirmation" &&
                  settlement.submittedBy !== role;
                const waitingOther =
                  settlement.status === "awaiting_confirmation" &&
                  settlement.submittedBy === role;

                return (
                  <TableRow key={settlement.id}>
                    <TableCell className="whitespace-nowrap font-bold">
                      {settlement.code}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {counterpartName}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-xs text-muted">
                      {formatDate(settlement.periodStart, "d MMM")} –{" "}
                      {formatDate(settlement.periodEnd, "d MMM yyyy")}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-right font-semibold">
                      {formatCurrency(breakdown.gross)}
                      <span className="mt-0.5 block text-[10px] font-normal text-muted">
                        {formatNumber(breakdown.units)} pcs
                      </span>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-right font-semibold text-amber-700">
                      {formatCurrency(breakdown.commission)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-right font-bold text-emerald-700">
                      {formatCurrency(breakdown.net)}
                    </TableCell>
                    <TableCell>
                      <SettlementStatusBadge status={settlement.status} />
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-xs text-muted">
                      {formatDate(settlement.createdAt, "d MMM yyyy")}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setSelected(settlement)}
                          aria-label={`Rincian ${settlement.code}`}
                        >
                          <Eye className="size-3.5" />
                        </Button>
                        {canSubmit && (
                          <Button
                            size="sm"
                            onClick={() => handleSubmit(settlement)}
                          >
                            <Send className="size-3.5" />
                            Ajukan
                          </Button>
                        )}
                        {canComplete && (
                          <Button
                            size="sm"
                            onClick={() => handleComplete(settlement)}
                          >
                            <BadgeCheck className="size-3.5" />
                            Konfirmasi
                          </Button>
                        )}
                        {waitingOther && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-[10px] font-semibold text-amber-700">
                            <Clock className="size-3" />
                            Menunggu mitra
                          </span>
                        )}
                        {settlement.status === "completed" && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700">
                            <BadgeCheck className="size-3" />
                            Selesai
                          </span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map(({ settlement, counterpartName, breakdown }) => {
            const canSubmit = settlement.status === "pending";
            const canComplete =
              settlement.status === "awaiting_confirmation" &&
              settlement.submittedBy !== role;
            const waitingOther =
              settlement.status === "awaiting_confirmation" &&
              settlement.submittedBy === role;

            return (
              <Card key={settlement.id}>
                <CardHeader className="flex-row flex-wrap items-start justify-between gap-3 pb-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <CardTitle className="text-base">
                        {settlement.code}
                      </CardTitle>
                      <SettlementStatusBadge status={settlement.status} />
                    </div>
                    <CardDescription className="mt-1">
                      {formatDate(settlement.periodStart)} –{" "}
                      {formatDate(settlement.periodEnd)} · {counterpartName} ·
                      dibuat {formatDate(settlement.createdAt, "d MMM yyyy")}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-full bg-mist px-2.5 py-1 text-[11px] font-semibold text-muted">
                    {role === "producer" ? (
                      <Store className="size-3.5" />
                    ) : (
                      <UtensilsCrossed className="size-3.5" />
                    )}
                    {role === "producer" ? "Warung mitra" : "Produsen"}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2 sm:grid-cols-3">
                    <div className="rounded-xl border border-line bg-canvas/50 p-3">
                      <p className="text-[10px] font-bold uppercase tracking-wide text-muted">
                        Penjualan bruto
                      </p>
                      <p className="mt-0.5 text-sm font-bold text-ink">
                        {formatCurrency(breakdown.gross)}
                      </p>
                      <p className="text-[10px] text-muted">
                        {formatNumber(breakdown.units)} pcs
                      </p>
                    </div>
                    <div className="rounded-xl border border-amber-100 bg-amber-50/60 p-3">
                      <p className="text-[10px] font-bold uppercase tracking-wide text-amber-700">
                        Komisi mitra
                      </p>
                      <p className="mt-0.5 text-sm font-bold text-amber-900">
                        {formatCurrency(breakdown.commission)}
                      </p>
                      <p className="text-[10px] text-amber-700/80">
                        Bagian warung
                      </p>
                    </div>
                    <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-3">
                      <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-700">
                        Hak produsen
                      </p>
                      <p className="mt-0.5 text-sm font-bold text-emerald-900">
                        {formatCurrency(breakdown.net)}
                      </p>
                      <p className="text-[10px] text-emerald-700/80">
                        Jumlah dibayarkan
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-col gap-2 border-t border-line pt-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-[11px] text-muted">
                      {settlement.status === "completed" && settlement.completedAt
                        ? `Selesai ${formatDate(settlement.completedAt)}`
                        : waitingOther
                          ? "Menunggu konfirmasi mitra."
                          : canComplete
                            ? "Settlement diajukan mitra dan siap dikonfirmasi."
                            : "Settlement belum diajukan."}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelected(settlement)}
                      >
                        <Eye className="size-3.5" />
                        Rincian
                      </Button>
                      {canSubmit && (
                        <Button size="sm" onClick={() => handleSubmit(settlement)}>
                          <Send className="size-3.5" />
                          Ajukan
                        </Button>
                      )}
                      {canComplete && (
                        <Button size="sm" onClick={() => handleComplete(settlement)}>
                          <BadgeCheck className="size-3.5" />
                          Konfirmasi selesai
                        </Button>
                      )}
                      {waitingOther && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
                          <Clock className="size-3" />
                          Menunggu mitra
                        </span>
                      )}
                      {settlement.status === "completed" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                          <BadgeCheck className="size-3" />
                          Selesai
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

      <div className="mt-5 flex items-center justify-center gap-1 text-xs font-semibold text-brand-700">
        <ArrowRight className="size-3.5" />
        Semua angka dihitung dari transaksi penjualan yang sama
      </div>

      <SettlementDetailDialog
        settlement={selected}
        open={Boolean(selected)}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
        role={role}
      />
    </div>
  );
}
