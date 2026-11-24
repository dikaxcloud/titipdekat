export type Role = "producer" | "shop";

export type OfferStatus =
  | "draft"
  | "pending"
  | "accepted"
  | "rejected"
  | "cancelled";

export type DeliveryStatus =
  | "preparing"
  | "shipped"
  | "received"
  | "disputed";

export type StockEventType = "sold" | "returned" | "damaged" | "expired";

export type SettlementStatus =
  | "pending"
  | "awaiting_confirmation"
  | "completed";

export type ProductStatus = "active" | "inactive";

export type StockStatus = "safe" | "low" | "out";

export type ActivityType =
  | "offer_created"
  | "offer_accepted"
  | "offer_rejected"
  | "offer_cancelled"
  | "delivery_created"
  | "delivery_shipped"
  | "delivery_received"
  | "delivery_disputed"
  | "sale_recorded"
  | "return_recorded"
  | "damage_recorded"
  | "expiry_recorded"
  | "settlement_submitted"
  | "settlement_completed"
  | "product_created"
  | "product_updated"
  | "product_deleted"
  | "profile_updated"
  | "account_created";

export interface Business {
  id: string;
  role: Role;
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  businessType: string;
  address: string;
  city: string;
  locationLabel?: string;
  latitude?: number;
  longitude?: number;
  joinedAt: string;
}

export interface Account {
  id: string;
  businessId: string;
  role: Role;
  email: string;
  phone: string;
  /** Digest SHA-256 untuk mock mode. Production memakai Supabase Auth. */
  passwordHash?: string;
  isDemo: boolean;
}

export interface Product {
  id: string;
  producerId: string;
  name: string;
  category: string;
  description: string;
  price: number;
  emoji: string;
  image?: string;
  status: ProductStatus;
  createdAt: string;
}

export interface Offer {
  id: string;
  code: string;
  producerId: string;
  shopId: string;
  productId: string;
  quantity: number;
  price: number;
  commissionRate: number;
  note?: string;
  status: OfferStatus;
  createdAt: string;
  respondedAt?: string;
}

export interface Delivery {
  id: string;
  code: string;
  offerId: string;
  producerId: string;
  shopId: string;
  productId: string;
  quantity: number;
  receivedQuantity?: number;
  status: DeliveryStatus;
  note?: string;
  discrepancyNote?: string;
  createdAt: string;
  shippedAt?: string;
  receivedAt?: string;
}

export interface StockEvent {
  id: string;
  deliveryId: string;
  offerId: string;
  producerId: string;
  shopId: string;
  productId: string;
  type: StockEventType;
  quantity: number;
  price: number;
  commissionRate: number;
  date: string;
  note?: string;
  createdAt: string;
}

export interface Settlement {
  id: string;
  code: string;
  producerId: string;
  shopId: string;
  periodStart: string;
  periodEnd: string;
  status: SettlementStatus;
  submittedBy?: Role;
  createdAt: string;
  updatedAt?: string;
  completedAt?: string;
  note?: string;
}

export interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  actor: string;
  actorRole: Role | "system";
  timestamp: string;
  producerId?: string;
  shopId?: string;
}

export interface Session {
  businessId: string;
  role: Role;
}

export interface SeedData {
  businesses: Business[];
  accounts: Account[];
  products: Product[];
  offers: Offer[];
  deliveries: Delivery[];
  stockEvents: StockEvent[];
  settlements: Settlement[];
  activities: Activity[];
}

export interface OfferInput {
  shopId: string;
  productId: string;
  quantity: number;
  price: number;
  commissionRate: number;
  note?: string;
}

export interface ProductInput {
  name: string;
  category: string;
  description: string;
  price: number;
  emoji: string;
  image?: string;
  status: ProductStatus;
}

export interface DeliveryInput {
  offerId: string;
  quantity: number;
  note?: string;
}

export interface StockEventInput {
  deliveryId: string;
  type: StockEventType;
  quantity: number;
  date: string;
  note?: string;
}

export interface ProducerRegistration {
  businessName: string;
  businessType: string;
  ownerName: string;
  phone: string;
  email: string;
  password: string;
  address: string;
  city: string;
}

export interface ShopRegistration {
  businessName: string;
  ownerName: string;
  businessType: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  locationLabel?: string;
  latitude?: number;
  longitude?: number;
  password: string;
}

export interface ProfileInput {
  businessName: string;
  ownerName: string;
  businessType: string;
  phone: string;
  email: string;
  address: string;
  city: string;
}

export interface StockLot {
  deliveryId: string;
  offerId: string;
  productId: string;
  producerId: string;
  shopId: string;
  price: number;
  commissionRate: number;
  received: number;
  sold: number;
  returned: number;
  damaged: number;
  expired: number;
  remaining: number;
}

export interface ShopStockRow {
  productId: string;
  producerId: string;
  productName: string;
  productEmoji: string;
  productImage?: string;
  producerName: string;
  received: number;
  sold: number;
  returned: number;
  damaged: number;
  expired: number;
  remaining: number;
  status: StockStatus;
}

export interface SettlementLine {
  productId: string;
  productName: string;
  productEmoji: string;
  quantity: number;
  price: number;
  gross: number;
  commissionRate: number;
  commission: number;
  net: number;
}

export interface SettlementBreakdown {
  lines: SettlementLine[];
  units: number;
  gross: number;
  commission: number;
  net: number;
}
