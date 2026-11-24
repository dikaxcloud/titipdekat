import type { StockEventType } from "@/types";

export interface CommandResult {
  ok: boolean;
  error?: string;
}

export interface ConsignmentItemInput {
  productId: string;
  quantity: number;
  price: number;
  commissionRate: number;
  note?: string;
}

export interface CreateConsignmentInput {
  shopId: string;
  items: ConsignmentItemInput[];
  note?: string;
}

export interface CreateDeliveryInput {
  consignmentId: string;
  note?: string;
}

export interface ReceiptItemInput {
  consignmentItemId: string;
  quantityReceived: number;
  reason?: string;
}

export interface ConfirmReceiptInput {
  deliveryId: string;
  items: ReceiptItemInput[];
  reason?: string;
}

export interface RecordStockEventInput {
  deliveryId: string;
  type: StockEventType;
  quantity: number;
  date: string;
  note?: string;
  clientEventId?: string;
  consignmentItemId?: string;
}

export interface CreateSettlementInput {
  producerId: string;
  shopId: string;
  periodStart: string;
  periodEnd: string;
}

export interface ReportPaymentInput {
  settlementId: string;
  amount: number;
  paidAt: string;
  methodNote?: string;
}

/**
 * Kontrak service layer. Komponen tidak boleh memanggil Supabase client
 * secara langsung; semua akses data lewat interface ini.
 */
export interface DataService {
  createConsignment(input: CreateConsignmentInput): Promise<CommandResult & { code?: string }>;
  respondToOffer(offerId: string, accept: boolean): Promise<CommandResult>;
  createDelivery(input: CreateDeliveryInput): Promise<CommandResult & { code?: string }>;
  shipDelivery(id: string): Promise<CommandResult>;
  confirmReceipt(input: ConfirmReceiptInput): Promise<CommandResult>;
  recordStockEvent(input: RecordStockEventInput): Promise<CommandResult>;
  createSettlement(input: CreateSettlementInput): Promise<CommandResult & { id?: string }>;
  approveSettlement(id: string): Promise<CommandResult>;
  reportPayment(input: ReportPaymentInput): Promise<CommandResult>;
  confirmPayment(id: string): Promise<CommandResult>;
}

export function fail(error: unknown): CommandResult {
  return {
    ok: false,
    error: error instanceof Error ? error.message : "Operasi gagal.",
  };
}
