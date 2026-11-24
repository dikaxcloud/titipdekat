import {
  endOfMonth,
  format,
  startOfMonth,
  subDays,
} from "date-fns";
import type {
  Account,
  Activity,
  Business,
  Delivery,
  Offer,
  Product,
  SeedData,
  Settlement,
  StockEvent,
} from "@/types";
import { DEMO_PASSWORD_HASH } from "@/lib/auth/password";

const now = new Date();

const dateOnly = (value: Date) => format(value, "yyyy-MM-dd");
const daysAgo = (days: number) => subDays(now, days);
const at = (days: number, hour = 10) => {
  const value = daysAgo(days);
  value.setHours(hour, 0, 0, 0);
  return value.toISOString();
};
const dayWithinMonth = (days: number) => {
  const value = daysAgo(days);
  const start = startOfMonth(now);
  return dateOnly(value < start ? start : value);
};

const monthStart = dateOnly(startOfMonth(now));
const monthMid = dateOnly(new Date(now.getFullYear(), now.getMonth(), 15));
const secondHalfStart = dateOnly(
  new Date(now.getFullYear(), now.getMonth(), 16),
);
const monthEnd = dateOnly(endOfMonth(now));

const businesses: Business[] = [
  {
    id: "biz-p1",
    role: "producer",
    businessName: "Dapur Bu Sari",
    ownerName: "Sari Wulandari",
    email: "producer@titipdekat.demo",
    phone: "0812-3456-7890",
    businessType: "Produsen Camilan Rumahan",
    address: "Jl. Cihampelas No. 118, Sukajadi",
    city: "Bandung",
    joinedAt: at(120, 9),
  },
  {
    id: "biz-p2",
    role: "producer",
    businessName: "Segar Rasa Nusantara",
    ownerName: "Dimas Pratama",
    email: "segar.rasa@titipdekat.demo",
    phone: "0813-2211-4455",
    businessType: "Produsen Minuman",
    address: "Jl. Kaliurang KM 7, Sleman",
    city: "Yogyakarta",
    joinedAt: at(96, 9),
  },
  {
    id: "biz-s1",
    role: "shop",
    businessName: "Warung Berkah Jaya",
    ownerName: "Ahmad Fauzi",
    email: "shop@titipdekat.demo",
    phone: "0821-9988-7766",
    businessType: "Warung Kelontong",
    address: "Jl. Sukamaju No. 24, Sukasari",
    city: "Bandung",
    locationLabel: "Sukamaju, Bandung",
    latitude: -6.8974,
    longitude: 107.5896,
    joinedAt: at(110, 8),
  },
  {
    id: "biz-s2",
    role: "shop",
    businessName: "Toko Sinar Rasa",
    ownerName: "Rina Marlina",
    email: "sinar.rasa@titipdekat.demo",
    phone: "0857-1122-3399",
    businessType: "Toko Makanan",
    address: "Jl. Dipatiukur No. 76, Coblong",
    city: "Bandung",
    locationLabel: "Dipatiukur, Bandung",
    latitude: -6.8915,
    longitude: 107.6158,
    joinedAt: at(88, 8),
  },
];

const accounts: Account[] = [
  {
    id: "acc-1",
    businessId: "biz-p1",
    role: "producer",
    email: "producer@titipdekat.demo",
    phone: "0812-3456-7890",
    passwordHash: DEMO_PASSWORD_HASH,
    isDemo: true,
  },
  {
    id: "acc-2",
    businessId: "biz-s1",
    role: "shop",
    email: "shop@titipdekat.demo",
    phone: "0821-9988-7766",
    passwordHash: DEMO_PASSWORD_HASH,
    isDemo: true,
  },
  {
    id: "acc-3",
    businessId: "biz-p2",
    role: "producer",
    email: "segar.rasa@titipdekat.demo",
    phone: "0813-2211-4455",
    passwordHash: DEMO_PASSWORD_HASH,
    isDemo: false,
  },
  {
    id: "acc-4",
    businessId: "biz-s2",
    role: "shop",
    email: "sinar.rasa@titipdekat.demo",
    phone: "0857-1122-3399",
    passwordHash: DEMO_PASSWORD_HASH,
    isDemo: false,
  },
];

const products: Product[] = [
  {
    id: "prd-1",
    producerId: "biz-p1",
    name: "Keripik Pisang Pedas",
    category: "Camilan",
    description:
      "Keripik pisang kepok iris tipis dengan bumbu pedas manis, dikemas dalam standing pouch 100 gram.",
    price: 12000,
    emoji: "🍌",
    status: "active",
    createdAt: at(100, 9),
  },
  {
    id: "prd-2",
    producerId: "biz-p1",
    name: "Keripik Singkong Balado",
    category: "Camilan",
    description:
      "Keripik singkong renyah dengan balado khas rumahan. Cocok untuk camilan harian pelanggan warung.",
    price: 10000,
    emoji: "🥔",
    status: "active",
    createdAt: at(94, 9),
  },
  {
    id: "prd-3",
    producerId: "biz-p1",
    name: "Kue Kering Nastar",
    category: "Kue & Roti",
    description:
      "Nastar butter lembut dengan selai nanas buatan sendiri, dikemas per toples 250 gram.",
    price: 35000,
    emoji: "🍪",
    status: "active",
    createdAt: at(80, 9),
  },
  {
    id: "prd-4",
    producerId: "biz-p1",
    name: "Brownies Kukus Cokelat",
    category: "Kue & Roti",
    description:
      "Brownies kukus cokelat pekat tanpa pengawet, disarankan habis dalam 3 hari setelah diterima.",
    price: 25000,
    emoji: "🍫",
    status: "active",
    createdAt: at(60, 9),
  },
  {
    id: "prd-5",
    producerId: "biz-p2",
    name: "Teh Melati Botol 350ml",
    category: "Minuman",
    description:
      "Teh melati seduh dingin tanpa pemanis buatan, dikemas dalam botol PET 350 ml.",
    price: 5000,
    emoji: "🍵",
    status: "active",
    createdAt: at(70, 9),
  },
  {
    id: "prd-6",
    producerId: "biz-p2",
    name: "Kopi Susu Gula Aren",
    category: "Minuman",
    description:
      "Kopi susu ready-to-drink dengan gula aren asli, dikemas botol 250 ml dan disajikan dingin.",
    price: 15000,
    emoji: "☕",
    status: "active",
    createdAt: at(55, 9),
  },
  {
    id: "prd-7",
    producerId: "biz-p2",
    name: "Air Mineral 600ml",
    category: "Minuman",
    description:
      "Air mineral kemasan 600 ml untuk melengkapi kebutuhan harian pelanggan warung.",
    price: 4000,
    emoji: "💧",
    status: "inactive",
    createdAt: at(48, 9),
  },
];

const offers: Offer[] = [
  {
    id: "off-1",
    code: "PWN-001",
    producerId: "biz-p1",
    shopId: "biz-s1",
    productId: "prd-1",
    quantity: 40,
    price: 12000,
    commissionRate: 15,
    note: "Titipan awal, kemasan sudah berlabel harga.",
    status: "accepted",
    createdAt: at(21, 9),
    respondedAt: at(20, 10),
  },
  {
    id: "off-2",
    code: "PWN-002",
    producerId: "biz-p1",
    shopId: "biz-s2",
    productId: "prd-2",
    quantity: 30,
    price: 10000,
    commissionRate: 12,
    note: "Mohon tempatkan di rak depan dekat kasir.",
    status: "accepted",
    createdAt: at(20, 11),
    respondedAt: at(19, 9),
  },
  {
    id: "off-3",
    code: "PWN-003",
    producerId: "biz-p1",
    shopId: "biz-s1",
    productId: "prd-3",
    quantity: 20,
    price: 35000,
    commissionRate: 10,
    note: "Nastar batch baru, cocok untuk pembeli akhir pekan.",
    status: "accepted",
    createdAt: at(3, 8),
    respondedAt: at(2, 9),
  },
  {
    id: "off-4",
    code: "PWN-004",
    producerId: "biz-p1",
    shopId: "biz-s1",
    productId: "prd-4",
    quantity: 15,
    price: 25000,
    commissionRate: 10,
    note: "Bisa dikirim dua kali jika stok warung terbatas.",
    status: "pending",
    createdAt: at(1, 8),
  },
  {
    id: "off-5",
    code: "PWN-005",
    producerId: "biz-p1",
    shopId: "biz-s2",
    productId: "prd-1",
    quantity: 25,
    price: 12000,
    commissionRate: 15,
    note: "Restock varian pedas.",
    status: "pending",
    createdAt: at(1, 13),
  },
  {
    id: "off-6",
    code: "PWN-006",
    producerId: "biz-p1",
    shopId: "biz-s1",
    productId: "prd-2",
    quantity: 20,
    price: 10000,
    commissionRate: 12,
    note: "Draft untuk pengiriman minggu depan.",
    status: "draft",
    createdAt: at(0, 9),
  },
  {
    id: "off-7",
    code: "PWN-007",
    producerId: "biz-p1",
    shopId: "biz-s2",
    productId: "prd-3",
    quantity: 12,
    price: 35000,
    commissionRate: 10,
    note: "Penawaran nastar untuk akhir bulan.",
    status: "rejected",
    createdAt: at(12, 10),
    respondedAt: at(11, 15),
  },
  {
    id: "off-8",
    code: "PWN-008",
    producerId: "biz-p1",
    shopId: "biz-s1",
    productId: "prd-1",
    quantity: 10,
    price: 12000,
    commissionRate: 15,
    status: "cancelled",
    createdAt: at(9, 11),
    respondedAt: at(9, 16),
  },
  {
    id: "off-9",
    code: "PWN-009",
    producerId: "biz-p2",
    shopId: "biz-s1",
    productId: "prd-5",
    quantity: 48,
    price: 5000,
    commissionRate: 20,
    note: "Simpan di kulkas display.",
    status: "accepted",
    createdAt: at(12, 9),
    respondedAt: at(11, 9),
  },
  {
    id: "off-10",
    code: "PWN-010",
    producerId: "biz-p2",
    shopId: "biz-s1",
    productId: "prd-6",
    quantity: 24,
    price: 15000,
    commissionRate: 18,
    note: "Batch perdana kopi susu gula aren.",
    status: "accepted",
    createdAt: at(9, 10),
    respondedAt: at(8, 9),
  },
  {
    id: "off-11",
    code: "PWN-011",
    producerId: "biz-p1",
    shopId: "biz-s2",
    productId: "prd-1",
    quantity: 20,
    price: 12000,
    commissionRate: 15,
    note: "Sudah disetujui, menunggu pencatatan pengiriman.",
    status: "accepted",
    createdAt: at(4, 9),
    respondedAt: at(3, 10),
  },
  {
    id: "off-12",
    code: "PWN-012",
    producerId: "biz-p2",
    shopId: "biz-s1",
    productId: "prd-7",
    quantity: 24,
    price: 4000,
    commissionRate: 15,
    note: "Melengkapi etalase minuman.",
    status: "pending",
    createdAt: at(0, 8),
  },
];

const deliveries: Delivery[] = [
  {
    id: "dlv-1",
    code: "SJ-001",
    offerId: "off-1",
    producerId: "biz-p1",
    shopId: "biz-s1",
    productId: "prd-1",
    quantity: 40,
    receivedQuantity: 40,
    status: "received",
    note: "Diantar langsung oleh produsen.",
    createdAt: at(20, 14),
    shippedAt: at(19, 9),
    receivedAt: at(18, 10),
  },
  {
    id: "dlv-2",
    code: "SJ-002",
    offerId: "off-2",
    producerId: "biz-p1",
    shopId: "biz-s2",
    productId: "prd-2",
    quantity: 30,
    receivedQuantity: 28,
    status: "disputed",
    note: "Dikirim melalui kurir lokal.",
    discrepancyNote: "2 pcs kemasan penyok saat diterima.",
    createdAt: at(19, 14),
    shippedAt: at(18, 9),
    receivedAt: at(15, 11),
  },
  {
    id: "dlv-3",
    code: "SJ-003",
    offerId: "off-3",
    producerId: "biz-p1",
    shopId: "biz-s1",
    productId: "prd-3",
    quantity: 20,
    status: "shipped",
    note: "Dikirim pagi agar sampai sebelum jam buka.",
    createdAt: at(2, 9),
    shippedAt: at(1, 8),
  },
  {
    id: "dlv-4",
    code: "SJ-004",
    offerId: "off-9",
    producerId: "biz-p2",
    shopId: "biz-s1",
    productId: "prd-5",
    quantity: 48,
    receivedQuantity: 48,
    status: "received",
    note: "Diantar dengan cooler box.",
    createdAt: at(11, 14),
    shippedAt: at(10, 9),
    receivedAt: at(9, 10),
  },
  {
    id: "dlv-5",
    code: "SJ-005",
    offerId: "off-10",
    producerId: "biz-p2",
    shopId: "biz-s1",
    productId: "prd-6",
    quantity: 24,
    receivedQuantity: 24,
    status: "received",
    note: "Batch perdana, disimpan di kulkas.",
    createdAt: at(9, 14),
    shippedAt: at(9, 9),
    receivedAt: at(8, 9),
  },
];

type SeedStockEvent = Omit<StockEvent, "price" | "commissionRate"> & {
  price?: number;
  commissionRate?: number;
};

const rawStockEvents: SeedStockEvent[] = [
  {
    id: "stk-1",
    deliveryId: "dlv-1",
    offerId: "off-1",
    producerId: "biz-p1",
    shopId: "biz-s1",
    productId: "prd-1",
    type: "sold",
    quantity: 10,
    date: dayWithinMonth(16),
    createdAt: at(16, 12),
  },
  {
    id: "stk-2",
    deliveryId: "dlv-1",
    offerId: "off-1",
    producerId: "biz-p1",
    shopId: "biz-s1",
    productId: "prd-1",
    type: "sold",
    quantity: 8,
    date: dayWithinMonth(14),
    createdAt: at(14, 15),
  },
  {
    id: "stk-3",
    deliveryId: "dlv-1",
    offerId: "off-1",
    producerId: "biz-p1",
    shopId: "biz-s1",
    productId: "prd-1",
    type: "sold",
    quantity: 7,
    date: dayWithinMonth(11),
    createdAt: at(11, 11),
  },
  {
    id: "stk-4",
    deliveryId: "dlv-1",
    offerId: "off-1",
    producerId: "biz-p1",
    shopId: "biz-s1",
    productId: "prd-1",
    type: "returned",
    quantity: 2,
    date: dayWithinMonth(9),
    note: "Kemasan sobek saat disusun di rak.",
    createdAt: at(9, 16),
  },
  {
    id: "stk-5",
    deliveryId: "dlv-1",
    offerId: "off-1",
    producerId: "biz-p1",
    shopId: "biz-s1",
    productId: "prd-1",
    type: "sold",
    quantity: 6,
    date: dayWithinMonth(7),
    createdAt: at(7, 13),
  },
  {
    id: "stk-6",
    deliveryId: "dlv-1",
    offerId: "off-1",
    producerId: "biz-p1",
    shopId: "biz-s1",
    productId: "prd-1",
    type: "damaged",
    quantity: 1,
    date: dayWithinMonth(5),
    note: "Satu kemasan bocor.",
    createdAt: at(5, 10),
  },
  {
    id: "stk-7",
    deliveryId: "dlv-1",
    offerId: "off-1",
    producerId: "biz-p1",
    shopId: "biz-s1",
    productId: "prd-1",
    type: "sold",
    quantity: 3,
    date: dayWithinMonth(2),
    createdAt: at(2, 14),
  },
  {
    id: "stk-8",
    deliveryId: "dlv-2",
    offerId: "off-2",
    producerId: "biz-p1",
    shopId: "biz-s2",
    productId: "prd-2",
    type: "sold",
    quantity: 7,
    date: dayWithinMonth(13),
    createdAt: at(13, 12),
  },
  {
    id: "stk-9",
    deliveryId: "dlv-2",
    offerId: "off-2",
    producerId: "biz-p1",
    shopId: "biz-s2",
    productId: "prd-2",
    type: "sold",
    quantity: 5,
    date: dayWithinMonth(10),
    createdAt: at(10, 14),
  },
  {
    id: "stk-10",
    deliveryId: "dlv-2",
    offerId: "off-2",
    producerId: "biz-p1",
    shopId: "biz-s2",
    productId: "prd-2",
    type: "expired",
    quantity: 2,
    date: dayWithinMonth(8),
    note: "Melewati tanggal kedaluwarsa.",
    createdAt: at(8, 9),
  },
  {
    id: "stk-11",
    deliveryId: "dlv-2",
    offerId: "off-2",
    producerId: "biz-p1",
    shopId: "biz-s2",
    productId: "prd-2",
    type: "sold",
    quantity: 4,
    date: dayWithinMonth(4),
    createdAt: at(4, 11),
  },
  {
    id: "stk-12",
    deliveryId: "dlv-4",
    offerId: "off-9",
    producerId: "biz-p2",
    shopId: "biz-s1",
    productId: "prd-5",
    type: "sold",
    quantity: 12,
    date: dayWithinMonth(9),
    createdAt: at(9, 14),
  },
  {
    id: "stk-13",
    deliveryId: "dlv-4",
    offerId: "off-9",
    producerId: "biz-p2",
    shopId: "biz-s1",
    productId: "prd-5",
    type: "sold",
    quantity: 9,
    date: dayWithinMonth(6),
    createdAt: at(6, 12),
  },
  {
    id: "stk-14",
    deliveryId: "dlv-4",
    offerId: "off-9",
    producerId: "biz-p2",
    shopId: "biz-s1",
    productId: "prd-5",
    type: "sold",
    quantity: 8,
    date: dayWithinMonth(3),
    createdAt: at(3, 16),
  },
  {
    id: "stk-15",
    deliveryId: "dlv-4",
    offerId: "off-9",
    producerId: "biz-p2",
    shopId: "biz-s1",
    productId: "prd-5",
    type: "returned",
    quantity: 3,
    date: dayWithinMonth(2),
    note: "Retur botol tidak laku.",
    createdAt: at(2, 10),
  },
  {
    id: "stk-16",
    deliveryId: "dlv-5",
    offerId: "off-10",
    producerId: "biz-p2",
    shopId: "biz-s1",
    productId: "prd-6",
    type: "sold",
    quantity: 10,
    date: dayWithinMonth(6),
    createdAt: at(6, 15),
  },
  {
    id: "stk-17",
    deliveryId: "dlv-5",
    offerId: "off-10",
    producerId: "biz-p2",
    shopId: "biz-s1",
    productId: "prd-6",
    type: "sold",
    quantity: 10,
    date: dayWithinMonth(3),
    createdAt: at(3, 11),
  },
  {
    id: "stk-18",
    deliveryId: "dlv-5",
    offerId: "off-10",
    producerId: "biz-p2",
    shopId: "biz-s1",
    productId: "prd-6",
    type: "returned",
    quantity: 2,
    date: dayWithinMonth(2),
    note: "Dua botol dikembalikan karena segel rusak.",
    createdAt: at(2, 9),
  },
  {
    id: "stk-19",
    deliveryId: "dlv-5",
    offerId: "off-10",
    producerId: "biz-p2",
    shopId: "biz-s1",
    productId: "prd-6",
    type: "damaged",
    quantity: 1,
    date: dayWithinMonth(1),
    note: "Botol pecah di kulkas.",
    createdAt: at(1, 12),
  },
  {
    id: "stk-20",
    deliveryId: "dlv-5",
    offerId: "off-10",
    producerId: "biz-p2",
    shopId: "biz-s1",
    productId: "prd-6",
    type: "expired",
    quantity: 1,
    date: dayWithinMonth(1),
    note: "Melewati masa simpan 5 hari.",
    createdAt: at(1, 13),
  },
];

const stockEvents: StockEvent[] = rawStockEvents.map((event) => {
  const offer = offers.find((item) => item.id === event.offerId);
  return {
    ...event,
    price: event.price ?? offer?.price ?? 0,
    commissionRate: event.commissionRate ?? offer?.commissionRate ?? 0,
  };
});

const settlements: Settlement[] = [
  {
    id: "stl-1",
    code: "STL-01",
    producerId: "biz-p1",
    shopId: "biz-s1",
    periodStart: monthStart,
    periodEnd: monthMid,
    status: "completed",
    submittedBy: "producer",
    createdAt: at(8, 9),
    completedAt: at(6, 14),
  },
  {
    id: "stl-2",
    code: "STL-02",
    producerId: "biz-p1",
    shopId: "biz-s1",
    periodStart: secondHalfStart,
    periodEnd: monthEnd,
    status: "awaiting_confirmation",
    submittedBy: "producer",
    createdAt: at(1, 9),
    updatedAt: at(1, 9),
  },
  {
    id: "stl-3",
    code: "STL-03",
    producerId: "biz-p1",
    shopId: "biz-s2",
    periodStart: monthStart,
    periodEnd: monthMid,
    status: "completed",
    submittedBy: "shop",
    createdAt: at(7, 10),
    completedAt: at(5, 11),
  },
  {
    id: "stl-4",
    code: "STL-04",
    producerId: "biz-p1",
    shopId: "biz-s2",
    periodStart: secondHalfStart,
    periodEnd: monthEnd,
    status: "awaiting_confirmation",
    submittedBy: "shop",
    createdAt: at(1, 11),
    updatedAt: at(1, 11),
  },
  {
    id: "stl-5",
    code: "STL-05",
    producerId: "biz-p2",
    shopId: "biz-s1",
    periodStart: monthStart,
    periodEnd: monthMid,
    status: "completed",
    submittedBy: "producer",
    createdAt: at(6, 9),
    completedAt: at(4, 10),
  },
  {
    id: "stl-6",
    code: "STL-06",
    producerId: "biz-p2",
    shopId: "biz-s1",
    periodStart: secondHalfStart,
    periodEnd: monthEnd,
    status: "pending",
    createdAt: at(2, 10),
  },
];

function buildActivities(): Activity[] {
  const list: Activity[] = [];
  let counter = 0;

  const businessName = (id: string) =>
    businesses.find((business) => business.id === id)?.businessName ?? "Pengguna";
  const productName = (id: string) =>
    products.find((product) => product.id === id)?.name ?? "Produk";

  const push = (activity: Omit<Activity, "id">) => {
    counter += 1;
    list.push({ id: `act-${counter}`, ...activity });
  };

  offers.forEach((offer) => {
    const producer = businessName(offer.producerId);
    const shop = businessName(offer.shopId);
    const product = productName(offer.productId);

    push({
      type: "offer_created",
      title: `Penawaran ${offer.code} dibuat`,
      description: `${producer} menawarkan ${offer.quantity} pcs ${product} kepada ${shop}.`,
      actor: producer,
      actorRole: "producer",
      timestamp: offer.createdAt,
      producerId: offer.producerId,
      shopId: offer.shopId,
    });

    if (offer.status === "accepted" && offer.respondedAt) {
      push({
        type: "offer_accepted",
        title: `Penawaran ${offer.code} diterima`,
        description: `${shop} menerima penawaran ${offer.quantity} pcs ${product} dengan komisi ${offer.commissionRate}%.`,
        actor: shop,
        actorRole: "shop",
        timestamp: offer.respondedAt,
        producerId: offer.producerId,
        shopId: offer.shopId,
      });
    }

    if (offer.status === "rejected" && offer.respondedAt) {
      push({
        type: "offer_rejected",
        title: `Penawaran ${offer.code} ditolak`,
        description: `${shop} menolak penawaran ${product}. Produsen dapat mengajukan penawaran baru.`,
        actor: shop,
        actorRole: "shop",
        timestamp: offer.respondedAt,
        producerId: offer.producerId,
        shopId: offer.shopId,
      });
    }

    if (offer.status === "cancelled" && offer.respondedAt) {
      push({
        type: "offer_cancelled",
        title: `Penawaran ${offer.code} dibatalkan`,
        description: `${producer} membatalkan penawaran ${product} sebelum diproses.`,
        actor: producer,
        actorRole: "producer",
        timestamp: offer.respondedAt,
        producerId: offer.producerId,
        shopId: offer.shopId,
      });
    }
  });

  deliveries.forEach((delivery) => {
    const producer = businessName(delivery.producerId);
    const shop = businessName(delivery.shopId);
    const product = productName(delivery.productId);

    push({
      type: "delivery_created",
      title: `Pengiriman ${delivery.code} dicatat`,
      description: `${producer} mencatat pengiriman ${delivery.quantity} pcs ${product} ke ${shop}.`,
      actor: producer,
      actorRole: "producer",
      timestamp: delivery.createdAt,
      producerId: delivery.producerId,
      shopId: delivery.shopId,
    });

    if (delivery.shippedAt) {
      push({
        type: "delivery_shipped",
        title: `Pengiriman ${delivery.code} dikirim`,
        description: `Barang dalam perjalanan menuju ${shop}.`,
        actor: producer,
        actorRole: "producer",
        timestamp: delivery.shippedAt,
        producerId: delivery.producerId,
        shopId: delivery.shopId,
      });
    }

    if (delivery.receivedAt && delivery.receivedQuantity !== undefined) {
      const isDisputed = delivery.status === "disputed";
      push({
        type: isDisputed ? "delivery_disputed" : "delivery_received",
        title: isDisputed
          ? `Penerimaan ${delivery.code} dengan selisih`
          : `Penerimaan ${delivery.code} dikonfirmasi`,
        description: isDisputed
          ? `${shop} menerima ${delivery.receivedQuantity} dari ${delivery.quantity} pcs ${product}. ${
              delivery.discrepancyNote ?? "Selisih jumlah dicatat."
            }`
          : `${shop} mengonfirmasi penerimaan ${delivery.receivedQuantity} pcs ${product}.`,
        actor: shop,
        actorRole: "shop",
        timestamp: delivery.receivedAt,
        producerId: delivery.producerId,
        shopId: delivery.shopId,
      });
    }
  });

  const eventCopy: Record<StockEvent["type"], { type: Activity["type"]; title: string }> =
    {
      sold: { type: "sale_recorded", title: "Penjualan dicatat" },
      returned: { type: "return_recorded", title: "Retur dicatat" },
      damaged: { type: "damage_recorded", title: "Produk rusak dicatat" },
      expired: { type: "expiry_recorded", title: "Produk kedaluwarsa dicatat" },
    };

  stockEvents.forEach((event) => {
    const shop = businessName(event.shopId);
    const product = productName(event.productId);
    const copy = eventCopy[event.type];
    const verb =
      event.type === "sold"
        ? "terjual"
        : event.type === "returned"
          ? "dikembalikan"
          : event.type === "damaged"
            ? "rusak"
            : "kedaluwarsa";

    push({
      type: copy.type,
      title: `${copy.title} · ${product}`,
      description: `${event.quantity} pcs ${product} ${verb} di ${shop}.${
        event.note ? ` Catatan: ${event.note}` : ""
      }`,
      actor: shop,
      actorRole: "shop",
      timestamp: event.createdAt,
      producerId: event.producerId,
      shopId: event.shopId,
    });
  });

  settlements.forEach((settlement) => {
    const producer = businessName(settlement.producerId);
    const shop = businessName(settlement.shopId);
    const submitter =
      settlement.submittedBy === "producer"
        ? producer
        : settlement.submittedBy === "shop"
          ? shop
          : "";

    if (settlement.submittedBy && settlement.status !== "pending") {
      push({
        type: "settlement_submitted",
        title: `Settlement ${settlement.code} diajukan`,
        description: `${submitter} mengajukan penyelesaian periode ${settlement.periodStart} s.d. ${settlement.periodEnd} untuk ${producer} dan ${shop}.`,
        actor: submitter,
        actorRole: settlement.submittedBy,
        timestamp: settlement.createdAt,
        producerId: settlement.producerId,
        shopId: settlement.shopId,
      });
    }

    if (settlement.status === "completed" && settlement.completedAt) {
      push({
        type: "settlement_completed",
        title: `Settlement ${settlement.code} selesai`,
        description: `Pembayaran konsinyasi antara ${producer} dan ${shop} telah dikonfirmasi kedua pihak.`,
        actor: settlement.submittedBy === "producer" ? shop : producer,
        actorRole: settlement.submittedBy === "producer" ? "shop" : "producer",
        timestamp: settlement.completedAt,
        producerId: settlement.producerId,
        shopId: settlement.shopId,
      });
    }
  });

  return list.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );
}

export function createSeedData(): SeedData {
  return {
    businesses: structuredClone(businesses),
    accounts: structuredClone(accounts),
    products: structuredClone(products),
    offers: structuredClone(offers),
    deliveries: structuredClone(deliveries),
    stockEvents: structuredClone(stockEvents),
    settlements: structuredClone(settlements),
    activities: buildActivities(),
  };
}


