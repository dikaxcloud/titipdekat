import { useDemoStore } from "@/lib/store";
import type { DataService } from "./types";

/**
 * Adapter default. Memanggil store Zustand yang sudah teruji (55/55).
 * Dipakai sampai mode live diaktifkan dengan kredensial Supabase.
 */
export const mockAdapter: DataService = {
  async createConsignment(input) {
    const item = input.items[0];
    if (!item) return { ok: false, error: "Penawaran harus memiliki satu produk." };
    const code = useDemoStore.getState().createOffer(
      {
        shopId: input.shopId,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        commissionRate: item.commissionRate,
        note: input.note ?? item.note,
      },
      false,
    );
    return code ? { ok: true, code } : { ok: false, error: "Gagal membuat penawaran." };
  },

  async respondToOffer(offerId, accept) {
    const offer = useDemoStore.getState().offers.find((o) => o.id === offerId);
    if (!offer) return { ok: false, error: "Penawaran tidak ditemukan." };
    useDemoStore.getState().respondToOffer(offerId, accept ? "accepted" : "rejected");
    return { ok: true };
  },

  async createDelivery(input) {
    // Mock mode tidak menyimpan quantity terpisah dari penawaran;
    // untuk demo, jumlah pengiriman disamakan dengan jumlah penawaran.
    const offer = useDemoStore
      .getState()
      .offers.find((o) => o.id === input.consignmentId);
    if (!offer) return { ok: false, error: "Penawaran tidak ditemukan." };
    const result = useDemoStore.getState().createDelivery({
      offerId: offer.id,
      quantity: offer.quantity,
      note: input.note,
    });
    return result.ok && result.code
      ? { ok: true, code: result.code }
      : { ok: false, error: result.error };
  },

  async shipDelivery(id) {
    useDemoStore.getState().shipDelivery(id);
    return { ok: true };
  },

  async confirmReceipt(input) {
    if (!input.items.length) {
      return { ok: false, error: "Minimal satu butir harus dikonfirmasi." };
    }
    // Mock store menyimpan satu jumlah per delivery; jumlahkan seluruh butir.
    const total = input.items.reduce((sum, item) => sum + item.quantityReceived, 0);
    const reason = input.items.find((item) => item.reason)?.reason ?? input.reason;
    const result = useDemoStore.getState().receiveDelivery(
      input.deliveryId,
      total,
      reason,
    );
    return result.ok ? { ok: true } : { ok: false, error: result.error };
  },

  async recordStockEvent(input) {
    return useDemoStore.getState().recordStockEvent({
      deliveryId: input.deliveryId,
      type: input.type,
      quantity: input.quantity,
      date: input.date,
      note: input.note,
    });
  },

  async createSettlement(input) {
    const state = useDemoStore.getState();
    const settlement = state.settlements.find(
      (s) =>
        s.producerId === input.producerId &&
        s.shopId === input.shopId &&
        s.status === "pending",
    );
    if (!settlement) {
      return { ok: false, error: "Mock mode hanya memiliki settlement demo yang sudah dibuat." };
    }
    state.submitSettlement(settlement.id);
    return { ok: true, id: settlement.id };
  },

  async approveSettlement(id) {
    useDemoStore.getState().completeSettlement(id);
    return { ok: true };
  },

  async reportPayment() {
    return { ok: false, error: "Status pembayaran belum tersedia di mock mode." };
  },

  async confirmPayment() {
    return { ok: false, error: "Status pembayaran belum tersedia di mock mode." };
  },
};
