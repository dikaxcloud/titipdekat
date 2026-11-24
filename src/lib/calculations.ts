import { eachDayOfInterval, format, subDays } from "date-fns";
import { id as localeId } from "date-fns/locale";
import type {
  Business,
  Delivery,
  Offer,
  Product,
  SeedData,
  Settlement,
  SettlementBreakdown,
  SettlementLine,
  ShopStockRow,
  StockEvent,
  StockLot,
  StockStatus,
} from "@/types";

export type DemoData = Pick<
  SeedData,
  | "businesses"
  | "products"
  | "offers"
  | "deliveries"
  | "stockEvents"
  | "settlements"
>;

export interface SalesPoint {
  date: string;
  label: string;
  value: number;
  units: number;
}

export interface ProducerStats {
  totalOffers: number;
  pendingOffers: number;
  acceptedOffers: number;
  totalDeliveries: number;
  activeDeliveries: number;
  unitsSold: number;
  grossSales: number;
  commission: number;
  netReceivable: number;
  completedNet: number;
  outstandingNet: number;
  completedSettlements: number;
}

export interface ShopStats {
  availableUnits: number;
  lowStockCount: number;
  outOfStockCount: number;
  pendingOffers: number;
  unitsSold: number;
  grossSales: number;
  commissionEarned: number;
  completedPaid: number;
  outstandingPayment: number;
  completedSettlements: number;
  receivedUnits: number;
}

export interface SettlementView {
  settlement: Settlement;
  producerName: string;
  shopName: string;
  counterpartName: string;
  breakdown: SettlementBreakdown;
}

export function getBusiness(
  businesses: Business[],
  id: string | undefined,
): Business | undefined {
  return businesses.find((business) => business.id === id);
}

export function getProduct(
  products: Product[],
  id: string | undefined,
): Product | undefined {
  return products.find((product) => product.id === id);
}

export function getOffer(
  offers: Offer[],
  id: string | undefined,
): Offer | undefined {
  return offers.find((offer) => offer.id === id);
}

export function getStockStatus(remaining: number, received: number): StockStatus {
  if (remaining <= 0) return "out";
  const threshold = Math.max(3, Math.round(received * 0.2));
  return remaining <= threshold ? "low" : "safe";
}

export function buildStockLots(
  deliveries: Delivery[],
  stockEvents: StockEvent[],
  offers: Offer[],
): StockLot[] {
  return deliveries
    .filter(
      (delivery) =>
        delivery.receivedQuantity !== undefined && delivery.receivedQuantity > 0,
    )
    .map((delivery) => {
      const offer = getOffer(offers, delivery.offerId);
      const events = stockEvents.filter(
        (event) => event.deliveryId === delivery.id,
      );
      const sum = (type: StockEvent["type"]) =>
        events
          .filter((event) => event.type === type)
          .reduce((total, event) => total + event.quantity, 0);

      const received = delivery.receivedQuantity ?? 0;
      const sold = sum("sold");
      const returned = sum("returned");
      const damaged = sum("damaged");
      const expired = sum("expired");

      return {
        deliveryId: delivery.id,
        offerId: delivery.offerId,
        productId: delivery.productId,
        producerId: delivery.producerId,
        shopId: delivery.shopId,
        price: offer?.price ?? 0,
        commissionRate: offer?.commissionRate ?? 0,
        received,
        sold,
        returned,
        damaged,
        expired,
        remaining: received - sold - returned - damaged - expired,
      };
    });
}

export function getShopStock(data: DemoData, shopId: string): ShopStockRow[] {
  const lots = buildStockLots(data.deliveries, data.stockEvents, data.offers).filter(
    (lot) => lot.shopId === shopId,
  );

  const grouped = new Map<string, ShopStockRow>();

  lots.forEach((lot) => {
    const key = `${lot.productId}-${lot.producerId}`;
    const product = getProduct(data.products, lot.productId);
    const producer = getBusiness(data.businesses, lot.producerId);
    const existing = grouped.get(key);

    if (existing) {
      existing.received += lot.received;
      existing.sold += lot.sold;
      existing.returned += lot.returned;
      existing.damaged += lot.damaged;
      existing.expired += lot.expired;
      existing.remaining += lot.remaining;
    } else {
      grouped.set(key, {
        productId: lot.productId,
        producerId: lot.producerId,
        productName: product?.name ?? "Produk dihapus",
        productEmoji: product?.emoji ?? "📦",
        productImage: product?.image,
        producerName: producer?.businessName ?? "Produsen",
        received: lot.received,
        sold: lot.sold,
        returned: lot.returned,
        damaged: lot.damaged,
        expired: lot.expired,
        remaining: lot.remaining,
        status: "safe",
      });
    }
  });

  return Array.from(grouped.values())
    .map((row) => ({
      ...row,
      status: getStockStatus(row.remaining, row.received),
    }))
    .sort((a, b) => {
      const priority: Record<StockStatus, number> = { out: 0, low: 1, safe: 2 };
      return priority[a.status] - priority[b.status] || b.received - a.received;
    });
}

export function getProductStockSummary(data: DemoData, productId: string) {
  const lots = buildStockLots(data.deliveries, data.stockEvents, data.offers).filter(
    (lot) => lot.productId === productId,
  );

  return lots.reduce(
    (summary, lot) => ({
      received: summary.received + lot.received,
      sold: summary.sold + lot.sold,
      returned: summary.returned + lot.returned,
      damaged: summary.damaged + lot.damaged,
      expired: summary.expired + lot.expired,
      remaining: summary.remaining + lot.remaining,
      batches: summary.batches + 1,
    }),
    {
      received: 0,
      sold: 0,
      returned: 0,
      damaged: 0,
      expired: 0,
      remaining: 0,
      batches: 0,
    },
  );
}

export function getSalesSeries(
  stockEvents: StockEvent[],
  filter: { producerId?: string; shopId?: string },
  days = 14,
): SalesPoint[] {
  const today = new Date();
  const start = subDays(today, days - 1);

  return eachDayOfInterval({ start, end: today }).map((date) => {
    const key = format(date, "yyyy-MM-dd");
    const events = stockEvents.filter(
      (event) =>
        event.type === "sold" &&
        event.date === key &&
        (!filter.producerId || event.producerId === filter.producerId) &&
        (!filter.shopId || event.shopId === filter.shopId),
    );

    return {
      date: key,
      label: format(date, "d MMM", { locale: localeId }),
      value: events.reduce(
        (total, event) => total + event.quantity * event.price,
        0,
      ),
      units: events.reduce((total, event) => total + event.quantity, 0),
    };
  });
}

export function getProducerStats(
  data: DemoData,
  producerId: string,
): ProducerStats {
  const offers = data.offers.filter((offer) => offer.producerId === producerId);
  const deliveries = data.deliveries.filter(
    (delivery) => delivery.producerId === producerId,
  );
  const sales = data.stockEvents.filter(
    (event) => event.producerId === producerId && event.type === "sold",
  );

  const grossSales = sales.reduce(
    (total, event) => total + event.quantity * event.price,
    0,
  );
  const commission = sales.reduce(
    (total, event) =>
      total + Math.round(event.quantity * event.price * (event.commissionRate / 100)),
    0,
  );
  const netReceivable = grossSales - commission;

  const completedSettlements = data.settlements.filter(
    (settlement) =>
      settlement.producerId === producerId && settlement.status === "completed",
  );
  const completedNet = completedSettlements.reduce(
    (total, settlement) =>
      total + getSettlementBreakdown(data, settlement).net,
    0,
  );

  return {
    totalOffers: offers.length,
    pendingOffers: offers.filter((offer) => offer.status === "pending").length,
    acceptedOffers: offers.filter((offer) => offer.status === "accepted").length,
    totalDeliveries: deliveries.length,
    activeDeliveries: deliveries.filter(
      (delivery) =>
        delivery.status === "preparing" || delivery.status === "shipped",
    ).length,
    unitsSold: sales.reduce((total, event) => total + event.quantity, 0),
    grossSales,
    commission,
    netReceivable,
    completedNet,
    outstandingNet: Math.max(netReceivable - completedNet, 0),
    completedSettlements: completedSettlements.length,
  };
}

export function getShopStats(data: DemoData, shopId: string): ShopStats {
  const offers = data.offers.filter((offer) => offer.shopId === shopId);
  const sales = data.stockEvents.filter(
    (event) => event.shopId === shopId && event.type === "sold",
  );
  const stock = getShopStock(data, shopId);
  const receivedUnits = stock.reduce((total, row) => total + row.received, 0);

  const grossSales = sales.reduce(
    (total, event) => total + event.quantity * event.price,
    0,
  );
  const commissionEarned = sales.reduce(
    (total, event) =>
      total + Math.round(event.quantity * event.price * (event.commissionRate / 100)),
    0,
  );

  const settlements = data.settlements.filter(
    (settlement) => settlement.shopId === shopId,
  );
  const completedSettlements = settlements.filter(
    (settlement) => settlement.status === "completed",
  );
  const completedPaid = completedSettlements.reduce(
    (total, settlement) =>
      total + getSettlementBreakdown(data, settlement).net,
    0,
  );
  const totalNet = grossSales - commissionEarned;

  return {
    availableUnits: stock.reduce((total, row) => total + row.remaining, 0),
    lowStockCount: stock.filter((row) => row.status === "low").length,
    outOfStockCount: stock.filter((row) => row.status === "out").length,
    pendingOffers: offers.filter((offer) => offer.status === "pending").length,
    unitsSold: sales.reduce((total, event) => total + event.quantity, 0),
    grossSales,
    commissionEarned,
    completedPaid,
    outstandingPayment: Math.max(totalNet - completedPaid, 0),
    completedSettlements: completedSettlements.length,
    receivedUnits,
  };
}

export function getSettlementBreakdown(
  data: DemoData,
  settlement: Settlement,
): SettlementBreakdown {
  const sales = data.stockEvents.filter(
    (event) =>
      event.type === "sold" &&
      event.producerId === settlement.producerId &&
      event.shopId === settlement.shopId &&
      event.date >= settlement.periodStart &&
      event.date <= settlement.periodEnd,
  );

  const grouped = new Map<string, SettlementLine>();

  sales.forEach((event) => {
    const product = getProduct(data.products, event.productId);
    const gross = event.quantity * event.price;
    const commission = Math.round(gross * (event.commissionRate / 100));
    const existing = grouped.get(event.productId);

    if (existing) {
      existing.quantity += event.quantity;
      existing.gross += gross;
      existing.commission += commission;
      existing.net += gross - commission;
    } else {
      grouped.set(event.productId, {
        productId: event.productId,
        productName: product?.name ?? "Produk dihapus",
        productEmoji: product?.emoji ?? "📦",
        quantity: event.quantity,
        price: event.price,
        gross,
        commissionRate: event.commissionRate,
        commission,
        net: gross - commission,
      });
    }
  });

  const lines = Array.from(grouped.values()).sort((a, b) => b.gross - a.gross);

  return {
    lines,
    units: lines.reduce((total, line) => total + line.quantity, 0),
    gross: lines.reduce((total, line) => total + line.gross, 0),
    commission: lines.reduce((total, line) => total + line.commission, 0),
    net: lines.reduce((total, line) => total + line.net, 0),
  };
}

export function getSettlementViews(
  data: DemoData,
  filter: { producerId?: string; shopId?: string },
): SettlementView[] {
  return data.settlements
    .filter(
      (settlement) =>
        (!filter.producerId || settlement.producerId === filter.producerId) &&
        (!filter.shopId || settlement.shopId === filter.shopId),
    )
    .map((settlement) => {
      const producer = getBusiness(data.businesses, settlement.producerId);
      const shop = getBusiness(data.businesses, settlement.shopId);
      const isProducer = Boolean(filter.producerId);

      return {
        settlement,
        producerName: producer?.businessName ?? "Produsen",
        shopName: shop?.businessName ?? "Warung",
        counterpartName: isProducer
          ? (shop?.businessName ?? "Warung")
          : (producer?.businessName ?? "Produsen"),
        breakdown: getSettlementBreakdown(data, settlement),
      };
    })
    .sort((a, b) => b.settlement.periodStart.localeCompare(a.settlement.periodStart));
}

export function getTopProducts(
  stockEvents: StockEvent[],
  filter: { producerId?: string; shopId?: string },
  limit = 4,
) {
  const grouped = new Map<
    string,
    { productId: string; units: number; gross: number }
  >();

  stockEvents
    .filter(
      (event) =>
        event.type === "sold" &&
        (!filter.producerId || event.producerId === filter.producerId) &&
        (!filter.shopId || event.shopId === filter.shopId),
    )
    .forEach((event) => {
      const existing = grouped.get(event.productId);
      if (existing) {
        existing.units += event.quantity;
        existing.gross += event.quantity * event.price;
      } else {
        grouped.set(event.productId, {
          productId: event.productId,
          units: event.quantity,
          gross: event.quantity * event.price,
        });
      }
    });

  return Array.from(grouped.values())
    .sort((a, b) => b.units - a.units)
    .slice(0, limit);
}

export function getDeliveryCounts(deliveries: Delivery[]) {
  return {
    preparing: deliveries.filter((item) => item.status === "preparing").length,
    shipped: deliveries.filter((item) => item.status === "shipped").length,
    received: deliveries.filter((item) => item.status === "received").length,
    disputed: deliveries.filter((item) => item.status === "disputed").length,
    total: deliveries.length,
  };
}
