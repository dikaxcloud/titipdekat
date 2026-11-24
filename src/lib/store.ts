import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type {
  Account,
  Activity,
  Business,
  Delivery,
  DeliveryInput,
  Offer,
  OfferInput,
  Product,
  ProductInput,
  ProfileInput,
  ProducerRegistration,
  Role,
  SeedData,
  Session,
  ShopRegistration,
  StockEvent,
  StockEventInput,
  StockEventType,
} from "@/types";
import { createSeedData } from "./mock-data";
import { hashPassword, verifyPassword } from "./auth/password";
import { createId, formatDateInput, isoNow } from "./utils";

export interface ActionResult {
  ok: boolean;
  error?: string;
  role?: Role;
}

export interface DeliveryResult extends ActionResult {
  code?: string;
}

const VALID_STOCK_EVENT_TYPES: readonly StockEventType[] = [
  "sold",
  "returned",
  "damaged",
  "expired",
];

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function isValidTransactionDate(value: string): boolean {
  if (!DATE_PATTERN.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return false;
  if (parsed.toISOString().slice(0, 10) !== value) return false;
  return value <= formatDateInput();
}

interface DemoState extends SeedData {
  session: Session | null;
  login: (identifier: string, password: string) => Promise<ActionResult>;
  loginAs: (role: Role) => ActionResult;
  logout: () => void;
  resetDemo: () => void;
  registerProducer: (input: ProducerRegistration) => Promise<ActionResult>;
  registerShop: (input: ShopRegistration) => Promise<ActionResult>;
  createOffer: (input: OfferInput, asDraft: boolean) => string | null;
  sendOffer: (id: string) => void;
  cancelOffer: (id: string) => void;
  respondToOffer: (id: string, response: "accepted" | "rejected") => void;
  createDelivery: (input: DeliveryInput) => DeliveryResult;
  shipDelivery: (id: string) => void;
  receiveDelivery: (
    id: string,
    receivedQuantity: number,
    discrepancyNote?: string,
  ) => ActionResult;
  recordStockEvent: (input: StockEventInput) => ActionResult;
  createProduct: (input: ProductInput) => void;
  updateProduct: (id: string, input: ProductInput) => void;
  deleteProduct: (id: string) => { removed: boolean; deactivated: boolean };
  updateProfile: (input: ProfileInput) => void;
  submitSettlement: (id: string) => void;
  completeSettlement: (id: string) => void;
}

function makeActivity(input: Omit<Activity, "id">): Activity {
  return { id: createId("act"), ...input };
}

function findBusiness(businesses: Business[], id: string) {
  return businesses.find((business) => business.id === id);
}

function sessionBusiness(state: DemoState) {
  if (!state.session) return null;
  return findBusiness(state.businesses, state.session.businessId) ?? null;
}

const initialData = createSeedData();

export const useDemoStore = create<DemoState>()(
  persist(
    (set, get) => ({
      ...initialData,
      session: null,

      login: async (identifier, password) => {
        const clean = identifier.trim().toLowerCase();
        const cleanPhone = clean.replace(/\D/g, "");
        const account = get().accounts.find(
          (item) =>
            item.email.toLowerCase() === clean ||
            (cleanPhone.length >= 8 &&
              item.phone.replace(/\D/g, "") === cleanPhone),
        );

        const valid = account
          ? await verifyPassword(password, account.passwordHash)
          : false;
        if (!valid || !account) {
          return {
            ok: false,
            error:
              "Email/nomor telepon atau password tidak sesuai. Gunakan akun demo yang tersedia di bawah.",
          };
        }

        set({ session: { businessId: account.businessId, role: account.role } });
        return { ok: true, role: account.role };
      },

      loginAs: (role) => {
        const account = get().accounts.find(
          (item) => item.role === role && item.isDemo,
        );
        if (!account) {
          return { ok: false, error: "Akun demo tidak ditemukan." };
        }
        set({ session: { businessId: account.businessId, role: account.role } });
        return { ok: true, role: account.role };
      },

      logout: () => set({ session: null }),

      resetDemo: () => {
        set({ ...createSeedData(), session: null });
      },

      registerProducer: async (input) => {
        const exists = get().accounts.some(
          (account) => account.email.toLowerCase() === input.email.toLowerCase(),
        );
        if (exists) {
          return { ok: false, error: "Email sudah terdaftar. Gunakan email lain." };
        }

        const businessId = createId("biz-p");
        const business: Business = {
          id: businessId,
          role: "producer",
          businessName: input.businessName,
          ownerName: input.ownerName,
          email: input.email,
          phone: input.phone,
          businessType: input.businessType,
          address: input.address,
          city: input.city,
          joinedAt: isoNow(),
        };
        const account: Account = {
          id: createId("acc"),
          businessId,
          role: "producer",
          email: input.email,
          phone: input.phone,
          passwordHash: await hashPassword(input.password),
          isDemo: false,
        };
        const activity = makeActivity({
          type: "account_created",
          title: "Akun produsen dibuat",
          description: `${input.businessName} bergabung dengan TitipDekat sebagai produsen.`,
          actor: input.businessName,
          actorRole: "producer",
          timestamp: isoNow(),
          producerId: businessId,
        });

        set((state) => ({
          businesses: [...state.businesses, business],
          accounts: [...state.accounts, account],
          activities: [activity, ...state.activities],
          session: { businessId, role: "producer" },
        }));
        return { ok: true, role: "producer" };
      },

      registerShop: async (input) => {
        const exists = get().accounts.some(
          (account) => account.email.toLowerCase() === input.email.toLowerCase(),
        );
        if (exists) {
          return { ok: false, error: "Email sudah terdaftar. Gunakan email lain." };
        }

        const businessId = createId("biz-s");
        const business: Business = {
          id: businessId,
          role: "shop",
          businessName: input.businessName,
          ownerName: input.ownerName,
          email: input.email,
          phone: input.phone,
          businessType: input.businessType,
          address: input.address,
          city: input.city,
          locationLabel: input.locationLabel,
          latitude: input.latitude,
          longitude: input.longitude,
          joinedAt: isoNow(),
        };
        const account: Account = {
          id: createId("acc"),
          businessId,
          role: "shop",
          email: input.email,
          phone: input.phone,
          passwordHash: await hashPassword(input.password),
          isDemo: false,
        };
        const activity = makeActivity({
          type: "account_created",
          title: "Akun warung dibuat",
          description: `${input.businessName} bergabung dengan TitipDekat sebagai mitra warung.`,
          actor: input.businessName,
          actorRole: "shop",
          timestamp: isoNow(),
          shopId: businessId,
        });

        set((state) => ({
          businesses: [...state.businesses, business],
          accounts: [...state.accounts, account],
          activities: [activity, ...state.activities],
          session: { businessId, role: "shop" },
        }));
        return { ok: true, role: "shop" };
      },

      createOffer: (input, asDraft) => {
        const state = get();
        const session = state.session;
        const business = sessionBusiness(state);
        if (!session || session.role !== "producer" || !business) return null;

        const product = state.products.find(
          (item) => item.id === input.productId && item.producerId === business.id,
        );
        const shop = findBusiness(state.businesses, input.shopId);
        if (!product || !shop || shop.role !== "shop") return null;
        if (input.quantity <= 0 || input.price <= 0) return null;

        const offer: Offer = {
          id: createId("off"),
          code: `PWN-${String(state.offers.length + 1).padStart(3, "0")}`,
          producerId: business.id,
          shopId: shop.id,
          productId: product.id,
          quantity: input.quantity,
          price: input.price,
          commissionRate: input.commissionRate,
          note: input.note,
          status: asDraft ? "draft" : "pending",
          createdAt: isoNow(),
        };
        const activity = makeActivity({
          type: "offer_created",
          title: `Penawaran ${offer.code} ${asDraft ? "disimpan sebagai draft" : "dibuat"}`,
          description: `${business.businessName} menawarkan ${offer.quantity} pcs ${product.name} kepada ${shop.businessName}.`,
          actor: business.businessName,
          actorRole: "producer",
          timestamp: offer.createdAt,
          producerId: business.id,
          shopId: shop.id,
        });

        set((current) => ({
          offers: [offer, ...current.offers],
          activities: [activity, ...current.activities],
        }));
        return offer.code;
      },

      sendOffer: (id) => {
        const state = get();
        const business = sessionBusiness(state);
        const offer = state.offers.find((item) => item.id === id);
        if (
          !business ||
          state.session?.role !== "producer" ||
          !offer ||
          offer.producerId !== business.id ||
          offer.status !== "draft"
        ) {
          return;
        }

        set((current) => ({
          offers: current.offers.map((item) =>
            item.id === id ? { ...item, status: "pending" } : item,
          ),
        }));
      },

      cancelOffer: (id) => {
        const state = get();
        const business = sessionBusiness(state);
        const offer = state.offers.find((item) => item.id === id);
        if (
          !business ||
          state.session?.role !== "producer" ||
          !offer ||
          offer.producerId !== business.id ||
          !["draft", "pending"].includes(offer.status)
        ) {
          return;
        }

        const activity = makeActivity({
          type: "offer_cancelled",
          title: `Penawaran ${offer.code} dibatalkan`,
          description: `${business.businessName} membatalkan penawaran untuk ${offer.quantity} pcs produk.`,
          actor: business.businessName,
          actorRole: "producer",
          timestamp: isoNow(),
          producerId: offer.producerId,
          shopId: offer.shopId,
        });

        set((current) => ({
          offers: current.offers.map((item) =>
            item.id === id
              ? { ...item, status: "cancelled", respondedAt: isoNow() }
              : item,
          ),
          activities: [activity, ...current.activities],
        }));
      },

      respondToOffer: (id, response) => {
        const state = get();
        const business = sessionBusiness(state);
        const offer = state.offers.find((item) => item.id === id);
        if (
          !business ||
          state.session?.role !== "shop" ||
          !offer ||
          offer.shopId !== business.id ||
          offer.status !== "pending"
        ) {
          return;
        }

        const product = state.products.find((item) => item.id === offer.productId);
        const producer = findBusiness(state.businesses, offer.producerId);
        const activity = makeActivity({
          type: response === "accepted" ? "offer_accepted" : "offer_rejected",
          title: `Penawaran ${offer.code} ${
            response === "accepted" ? "diterima" : "ditolak"
          }`,
          description:
            response === "accepted"
              ? `${business.businessName} menerima ${offer.quantity} pcs ${
                  product?.name ?? "produk"
                } dari ${producer?.businessName ?? "produsen"} dengan komisi ${
                  offer.commissionRate
                }%.`
              : `${business.businessName} menolak penawaran ${
                  product?.name ?? "produk"
                } dari ${producer?.businessName ?? "produsen"}.`,
          actor: business.businessName,
          actorRole: "shop",
          timestamp: isoNow(),
          producerId: offer.producerId,
          shopId: offer.shopId,
        });

        set((current) => ({
          offers: current.offers.map((item) =>
            item.id === id
              ? { ...item, status: response, respondedAt: isoNow() }
              : item,
          ),
          activities: [activity, ...current.activities],
        }));
      },

      createDelivery: (input) => {
        const state = get();
        const business = sessionBusiness(state);
        if (!business || state.session?.role !== "producer") {
          return { ok: false, error: "Hanya produsen yang dapat mencatat pengiriman." };
        }

        const offer = state.offers.find((item) => item.id === input.offerId);
        if (
          !offer ||
          offer.producerId !== business.id ||
          offer.status !== "accepted"
        ) {
          return {
            ok: false,
            error: "Penawaran tidak ditemukan atau belum diterima warung.",
          };
        }
        if (state.deliveries.some((item) => item.offerId === offer.id)) {
          return {
            ok: false,
            error: "Penawaran ini sudah memiliki catatan pengiriman.",
          };
        }
        if (!Number.isInteger(input.quantity) || input.quantity <= 0) {
          return {
            ok: false,
            error: "Jumlah pengiriman harus bilangan bulat lebih dari 0.",
          };
        }
        if (input.quantity > offer.quantity) {
          return {
            ok: false,
            error: `Jumlah pengiriman tidak boleh melebihi jumlah yang disepakati (${offer.quantity} pcs).`,
          };
        }

        const product = state.products.find((item) => item.id === offer.productId);
        const shop = findBusiness(state.businesses, offer.shopId);
        const delivery: Delivery = {
          id: createId("dlv"),
          code: `SJ-${String(state.deliveries.length + 1).padStart(3, "0")}`,
          offerId: offer.id,
          producerId: business.id,
          shopId: offer.shopId,
          productId: offer.productId,
          quantity: input.quantity,
          status: "preparing",
          note: input.note,
          createdAt: isoNow(),
        };
        const activity = makeActivity({
          type: "delivery_created",
          title: `Pengiriman ${delivery.code} dicatat`,
          description: `${business.businessName} mencatat pengiriman ${delivery.quantity} pcs ${
            product?.name ?? "produk"
          } ke ${shop?.businessName ?? "warung"}.`,
          actor: business.businessName,
          actorRole: "producer",
          timestamp: delivery.createdAt,
          producerId: delivery.producerId,
          shopId: delivery.shopId,
        });

        set((current) => ({
          deliveries: [delivery, ...current.deliveries],
          activities: [activity, ...current.activities],
        }));
        return { ok: true, code: delivery.code };
      },

      shipDelivery: (id) => {
        const state = get();
        const business = sessionBusiness(state);
        const delivery = state.deliveries.find((item) => item.id === id);
        if (
          !business ||
          state.session?.role !== "producer" ||
          !delivery ||
          delivery.producerId !== business.id ||
          delivery.status !== "preparing"
        ) {
          return;
        }

        const product = state.products.find(
          (item) => item.id === delivery.productId,
        );
        const activity = makeActivity({
          type: "delivery_shipped",
          title: `Pengiriman ${delivery.code} dikirim`,
          description: `${delivery.quantity} pcs ${
            product?.name ?? "produk"
          } sedang menuju warung tujuan.`,
          actor: business.businessName,
          actorRole: "producer",
          timestamp: isoNow(),
          producerId: delivery.producerId,
          shopId: delivery.shopId,
        });

        set((current) => ({
          deliveries: current.deliveries.map((item) =>
            item.id === id
              ? { ...item, status: "shipped", shippedAt: isoNow() }
              : item,
          ),
          activities: [activity, ...current.activities],
        }));
      },

      receiveDelivery: (id, receivedQuantity, discrepancyNote) => {
        const state = get();
        const business = sessionBusiness(state);
        const delivery = state.deliveries.find((item) => item.id === id);
        if (
          !business ||
          state.session?.role !== "shop" ||
          !delivery ||
          delivery.shopId !== business.id ||
          delivery.status !== "shipped"
        ) {
          return {
            ok: false,
            error: "Pengiriman tidak ditemukan atau sudah dikonfirmasi.",
          };
        }

        if (!Number.isInteger(receivedQuantity) || receivedQuantity <= 0) {
          return {
            ok: false,
            error: "Jumlah diterima harus bilangan bulat lebih dari 0.",
          };
        }
        if (receivedQuantity > delivery.quantity) {
          return {
            ok: false,
            error: `Jumlah diterima tidak boleh melebihi jumlah yang dikirim (${delivery.quantity} pcs).`,
          };
        }

        const isExact = receivedQuantity === delivery.quantity;
        const product = state.products.find(
          (item) => item.id === delivery.productId,
        );
        const note = isExact
          ? undefined
          : discrepancyNote?.trim() || "Selisih jumlah diterima saat konfirmasi.";
        const activity = makeActivity({
          type: isExact ? "delivery_received" : "delivery_disputed",
          title: isExact
            ? `Penerimaan ${delivery.code} dikonfirmasi`
            : `Penerimaan ${delivery.code} dengan selisih`,
          description: isExact
            ? `${business.businessName} mengonfirmasi penerimaan ${receivedQuantity} pcs ${
                product?.name ?? "produk"
              }.`
            : `${business.businessName} menerima ${receivedQuantity} dari ${delivery.quantity} pcs ${
                product?.name ?? "produk"
              }. ${note ?? ""}`,
          actor: business.businessName,
          actorRole: "shop",
          timestamp: isoNow(),
          producerId: delivery.producerId,
          shopId: delivery.shopId,
        });

        set((current) => ({
          deliveries: current.deliveries.map((item) =>
            item.id === id
              ? {
                  ...item,
                  status: isExact ? "received" : "disputed",
                  receivedQuantity,
                  discrepancyNote: note,
                  receivedAt: isoNow(),
                }
              : item,
          ),
          activities: [activity, ...current.activities],
        }));
        return { ok: true };
      },

      recordStockEvent: (input) => {
        const state = get();
        const business = sessionBusiness(state);
        if (!business || state.session?.role !== "shop") {
          return { ok: false, error: "Sesi warung tidak ditemukan." };
        }

        const delivery = state.deliveries.find(
          (item) => item.id === input.deliveryId,
        );
        if (
          !delivery ||
          delivery.shopId !== business.id ||
          delivery.receivedQuantity === undefined ||
          delivery.receivedQuantity <= 0
        ) {
          return { ok: false, error: "Batch titipan tidak ditemukan." };
        }

        if (!VALID_STOCK_EVENT_TYPES.includes(input.type)) {
          return {
            ok: false,
            error: "Jenis transaksi tidak dikenal. Pilih penjualan, retur, kerusakan, atau kedaluwarsa.",
          };
        }
        if (!Number.isInteger(input.quantity) || input.quantity <= 0) {
          return { ok: false, error: "Jumlah harus berupa angka bulat lebih dari 0." };
        }
        if (!isValidTransactionDate(input.date)) {
          return {
            ok: false,
            error: "Tanggal transaksi tidak valid. Gunakan format YYYY-MM-DD dan tanggal yang tidak melebihi hari ini.",
          };
        }

        const used = state.stockEvents
          .filter((event) => event.deliveryId === delivery.id)
          .reduce((total, event) => total + event.quantity, 0);
        const remaining = delivery.receivedQuantity - used;

        if (input.quantity > remaining) {
          return {
            ok: false,
            error: `Stok tersedia untuk batch ini hanya ${remaining} pcs.`,
          };
        }

        const offer = state.offers.find((item) => item.id === delivery.offerId);
        const product = state.products.find(
          (item) => item.id === delivery.productId,
        );
        const event: StockEvent = {
          id: createId("stk"),
          deliveryId: delivery.id,
          offerId: delivery.offerId,
          producerId: delivery.producerId,
          shopId: delivery.shopId,
          productId: delivery.productId,
          type: input.type,
          quantity: input.quantity,
          price: offer?.price ?? 0,
          commissionRate: offer?.commissionRate ?? 0,
          date: input.date,
          note: input.note,
          createdAt: isoNow(),
        };

        const labels: Record<StockEvent["type"], { type: Activity["type"]; title: string; verb: string }> = {
          sold: { type: "sale_recorded", title: "Penjualan dicatat", verb: "terjual" },
          returned: { type: "return_recorded", title: "Retur dicatat", verb: "dikembalikan" },
          damaged: { type: "damage_recorded", title: "Produk rusak dicatat", verb: "rusak" },
          expired: { type: "expiry_recorded", title: "Produk kedaluwarsa dicatat", verb: "kedaluwarsa" },
        };
        const label = labels[input.type];
        const activity = makeActivity({
          type: label.type,
          title: `${label.title} · ${product?.name ?? "Produk"}`,
          description: `${input.quantity} pcs ${product?.name ?? "produk"} ${label.verb} di ${business.businessName}.${
            input.note ? ` Catatan: ${input.note}` : ""
          }`,
          actor: business.businessName,
          actorRole: "shop",
          timestamp: event.createdAt,
          producerId: delivery.producerId,
          shopId: delivery.shopId,
        });

        set((current) => ({
          stockEvents: [event, ...current.stockEvents],
          activities: [activity, ...current.activities],
        }));
        return { ok: true };
      },

      createProduct: (input) => {
        const state = get();
        const business = sessionBusiness(state);
        if (!business || state.session?.role !== "producer") return;

        const product: Product = {
          id: createId("prd"),
          producerId: business.id,
          ...input,
          createdAt: isoNow(),
        };
        const activity = makeActivity({
          type: "product_created",
          title: `Produk baru: ${product.name}`,
          description: `${business.businessName} menambahkan ${product.name} ke katalog dengan harga jual ${product.price}.`,
          actor: business.businessName,
          actorRole: "producer",
          timestamp: product.createdAt,
          producerId: business.id,
        });

        set((current) => ({
          products: [product, ...current.products],
          activities: [activity, ...current.activities],
        }));
      },

      updateProduct: (id, input) => {
        const state = get();
        const business = sessionBusiness(state);
        const product = state.products.find((item) => item.id === id);
        if (
          !business ||
          state.session?.role !== "producer" ||
          !product ||
          product.producerId !== business.id
        ) {
          return;
        }

        const activity = makeActivity({
          type: "product_updated",
          title: `Produk diperbarui: ${input.name}`,
          description: `${business.businessName} memperbarui informasi produk ${input.name}.`,
          actor: business.businessName,
          actorRole: "producer",
          timestamp: isoNow(),
          producerId: business.id,
        });

        set((current) => ({
          products: current.products.map((item) =>
            item.id === id ? { ...item, ...input } : item,
          ),
          activities: [activity, ...current.activities],
        }));
      },

      deleteProduct: (id) => {
        const state = get();
        const business = sessionBusiness(state);
        const product = state.products.find((item) => item.id === id);
        if (
          !business ||
          state.session?.role !== "producer" ||
          !product ||
          product.producerId !== business.id
        ) {
          return { removed: false, deactivated: false };
        }

        const isReferenced = state.offers.some((offer) => offer.productId === id);
        const activity = makeActivity({
          type: "product_deleted",
          title: isReferenced
            ? `Produk dinonaktifkan: ${product.name}`
            : `Produk dihapus: ${product.name}`,
          description: isReferenced
            ? `${product.name} sudah memiliki riwayat penawaran sehingga dinonaktifkan agar data tetap konsisten.`
            : `${product.name} dihapus dari katalog ${business.businessName}.`,
          actor: business.businessName,
          actorRole: "producer",
          timestamp: isoNow(),
          producerId: business.id,
        });

        set((current) => ({
          products: isReferenced
            ? current.products.map((item) =>
                item.id === id ? { ...item, status: "inactive" } : item,
              )
            : current.products.filter((item) => item.id !== id),
          activities: [activity, ...current.activities],
        }));

        return { removed: !isReferenced, deactivated: isReferenced };
      },

      updateProfile: (input) => {
        const state = get();
        const business = sessionBusiness(state);
        if (!business) return;

        const activity = makeActivity({
          type: "profile_updated",
          title: "Profil usaha diperbarui",
          description: `${business.businessName} memperbarui informasi profil usaha.`,
          actor: input.businessName,
          actorRole: business.role,
          timestamp: isoNow(),
          producerId: business.role === "producer" ? business.id : undefined,
          shopId: business.role === "shop" ? business.id : undefined,
        });

        set((current) => ({
          businesses: current.businesses.map((item) =>
            item.id === business.id ? { ...item, ...input } : item,
          ),
          accounts: current.accounts.map((item) =>
            item.businessId === business.id
              ? { ...item, email: input.email, phone: input.phone }
              : item,
          ),
          activities: [activity, ...current.activities],
        }));
      },

      submitSettlement: (id) => {
        const state = get();
        const session = state.session;
        const business = sessionBusiness(state);
        const settlement = state.settlements.find((item) => item.id === id);
        if (
          !session ||
          !business ||
          !settlement ||
          settlement.status !== "pending" ||
          (session.role === "producer"
            ? settlement.producerId !== business.id
            : settlement.shopId !== business.id)
        ) {
          return;
        }

        const producer = findBusiness(state.businesses, settlement.producerId);
        const shop = findBusiness(state.businesses, settlement.shopId);
        const activity = makeActivity({
          type: "settlement_submitted",
          title: `Settlement ${settlement.code} diajukan`,
          description: `${business.businessName} mengajukan penyelesaian periode ${settlement.periodStart} s.d. ${settlement.periodEnd} untuk ${producer?.businessName ?? "produsen"} dan ${shop?.businessName ?? "warung"}.`,
          actor: business.businessName,
          actorRole: session.role,
          timestamp: isoNow(),
          producerId: settlement.producerId,
          shopId: settlement.shopId,
        });

        set((current) => ({
          settlements: current.settlements.map((item) =>
            item.id === id
              ? {
                  ...item,
                  status: "awaiting_confirmation",
                  submittedBy: session.role,
                  updatedAt: isoNow(),
                }
              : item,
          ),
          activities: [activity, ...current.activities],
        }));
      },

      completeSettlement: (id) => {
        const state = get();
        const session = state.session;
        const business = sessionBusiness(state);
        const settlement = state.settlements.find((item) => item.id === id);
        if (
          !session ||
          !business ||
          !settlement ||
          settlement.status !== "awaiting_confirmation" ||
          settlement.submittedBy === session.role ||
          (session.role === "producer"
            ? settlement.producerId !== business.id
            : settlement.shopId !== business.id)
        ) {
          return;
        }

        const producer = findBusiness(state.businesses, settlement.producerId);
        const shop = findBusiness(state.businesses, settlement.shopId);
        const activity = makeActivity({
          type: "settlement_completed",
          title: `Settlement ${settlement.code} selesai`,
          description: `Pembayaran konsinyasi ${producer?.businessName ?? "produsen"} dan ${shop?.businessName ?? "warung"} telah dikonfirmasi kedua pihak.`,
          actor: business.businessName,
          actorRole: session.role,
          timestamp: isoNow(),
          producerId: settlement.producerId,
          shopId: settlement.shopId,
        });

        set((current) => ({
          settlements: current.settlements.map((item) =>
            item.id === id
              ? {
                  ...item,
                  status: "completed",
                  completedAt: isoNow(),
                  updatedAt: isoNow(),
                }
              : item,
          ),
          activities: [activity, ...current.activities],
        }));
      },
    }),
    {
      name: "titipdekat-demo-v1",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (state) => ({
        businesses: state.businesses,
        accounts: state.accounts,
        products: state.products,
        offers: state.offers,
        deliveries: state.deliveries,
        stockEvents: state.stockEvents,
        settlements: state.settlements,
        activities: state.activities,
        session: state.session,
      }),
    },
  ),
);
