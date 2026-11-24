import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { DataService } from "./types";
import { fail } from "./types";

type RpcResult = { ok: boolean; data?: unknown; error?: string };

async function callRpc(
  name: string,
  args: Record<string, unknown>,
): Promise<RpcResult> {
  try {
    const { data, error } = await getSupabaseBrowserClient().rpc(name, args);
    if (error) return { ok: false, error: error.message };
    return { ok: true, data };
  } catch (error) {
    return fail(error);
  }
}

/**
 * Adapter Supabase. Belum dipakai sampai NEXT_PUBLIC_BACKEND_MODE=live
 * dan kredensial tersedia. Nama RPC sesuai 0002_functions_views.sql.
 */
export const supabaseAdapter: DataService = {
  async createConsignment(input) {
    const result = await callRpc("create_consignment", {
      p_shop: input.shopId,
      p_items: input.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        commissionRate: item.commissionRate,
        note: item.note ?? null,
      })),
      p_note: input.note ?? null,
    });
    return result.ok
      ? { ok: true, code: String(result.data ?? "") }
      : { ok: false, error: result.error };
  },

  async respondToOffer(offerId, accept) {
    const result = await callRpc("respond_consignment", {
      p_id: offerId,
      p_accept: accept,
    });
    return { ok: result.ok, error: result.error };
  },

  async createDelivery(input) {
    const result = await callRpc("create_delivery", {
      p_consignment: input.consignmentId,
      p_note: input.note ?? null,
    });
    return result.ok
      ? { ok: true, code: String(result.data ?? "") }
      : { ok: false, error: result.error };
  },

  async shipDelivery(id) {
    const result = await callRpc("mark_shipped", { p_delivery: id });
    return { ok: result.ok, error: result.error };
  },

  async confirmReceipt(input) {
    const result = await callRpc("confirm_receipt", {
      p_delivery: input.deliveryId,
      p_items: input.items.map((item) => ({
        consignmentItemId: item.consignmentItemId,
        quantityReceived: item.quantityReceived,
        reason: item.reason ?? input.reason ?? null,
      })),
      p_reason: input.reason ?? null,
    });
    return { ok: result.ok, error: result.error };
  },

  async recordStockEvent(input) {
    const result = await callRpc("record_stock_event", {
      p_delivery: input.deliveryId,
      p_type: input.type,
      p_quantity: input.quantity,
      p_date: input.date,
      p_note: input.note ?? null,
      p_client_event_id: input.clientEventId ?? null,
      p_consignment_item: input.consignmentItemId ?? null,
    });
    return { ok: result.ok, error: result.error };
  },

  async createSettlement(input) {
    const result = await callRpc("create_settlement", {
      p_producer: input.producerId,
      p_shop: input.shopId,
      p_start: input.periodStart,
      p_end: input.periodEnd,
    });
    return result.ok
      ? { ok: true, id: String(result.data ?? "") }
      : { ok: false, error: result.error };
  },

  async approveSettlement(id) {
    const result = await callRpc("approve_settlement", { p_settlement: id });
    return { ok: result.ok, error: result.error };
  },

  async reportPayment(input) {
    const result = await callRpc("report_payment", {
      p_settlement: input.settlementId,
      p_amount: input.amount,
      p_paid_at: input.paidAt,
      p_method_note: input.methodNote ?? null,
    });
    return { ok: result.ok, error: result.error };
  },

  async confirmPayment(id) {
    const result = await callRpc("confirm_payment", { p_settlement: id });
    return { ok: result.ok, error: result.error };
  },
};
