# TitipDekat — Team Xcloud

Prototype frontend untuk **STACK 2026 Semifinal**. TitipDekat membantu produsen makanan rumahan dan pemilik warung mengelola proses **konsinyasi (titip-jual)** dalam satu sistem pencatatan bersama.

> **Catatan penting:** proyek ini adalah **frontend-only prototype**. Seluruh data berupa mock data yang tersimpan di `localStorage`. Tidak ada Supabase, backend, payment gateway, Google Maps, Gemini, atau Google Sheets yang terhubung.

---

## Menjalankan proyek

Butuh Node.js 20+ dan npm.

```bash
npm install
npm run dev
```

Buka **http://localhost:3000**.

Perintah lain:

```bash
npm run lint   # ESLint + React Compiler check
npm run build  # TypeScript check + production build
npm start      # menjalankan hasil build production
```

Jika `npm` terblokir oleh PowerShell, gunakan `npm.cmd` (Windows).

---

## Demo online

Prototype (mock mode) sudah di-deploy di Vercel:

- **https://titip-dekat.vercel.app**

Deployment ini memakai data simulasi di browser; belum terhubung ke Supabase
live. Akun demo di UI tetap seperti di bawah ini.

## Akun demo

| Role | Email | Password |
| --- | --- | --- |
| Producer | `producer@titipdekat.demo` | `demo123` |
| Shop Owner | `shop@titipdekat.demo` | `demo123` |

Di halaman `/login` juga tersedia tombol **Masuk sebagai Produsen (demo)** dan **Masuk sebagai Pemilik Warung (demo)** untuk login sekali klik. Tombol **Masuk dengan Google** sengaja hanya berupa simulasi UI.

Untuk mengembalikan seluruh data (termasuk perubahan dari kedua role) ke kondisi awal, buka sidebar dan pilih **Reset data demo**.

---

## Alur demo yang bisa dicoba

### Producer
1. Masuk sebagai Producer, lihat dashboard.
2. Buka **Produk** → tambah/edit/nonaktifkan produk.
3. Buka **Penawaran** → buat penawaran ke warung, lalu kirim draft.
4. Lihat status penawaran berubah setelah warung merespons.
5. Setelah penawaran diterima, buka **Pengiriman** → catat pengiriman, lalu tandai *dikirim*.
6. Pantau stok, penjualan, komisi, dan settlement di dashboard.

### Shop Owner
1. Masuk sebagai Shop Owner, lihat dashboard.
2. Buka **Penawaran** → terima atau tolak penawaran masuk (dengan dialog konfirmasi).
3. Buka **Pengiriman** → konfirmasi jumlah barang diterima (boleh ada selisih, wajib ada catatan). Stok titipan langsung bertambah.
4. Buka **Penjualan & stok** atau **Produk** → catat penjualan, retur, kerusakan, atau kedaluwarsa.
5. Lihat stok menipis/habis dan grafik penjualan ikut berubah.
6. Buka **Settlement** → ajukan settlement, lalu lakukan switch role untuk mengonfirmasi dari pihak produsen (atau sebaliknya).

Perubahan yang dibuat satu role langsung terlihat pada role lain karena keduanya memakai **satu store dan satu dataset mock yang sama**.

---

## Fitur yang sudah selesai

### Umum
- Landing page lengkap: navbar, hero headline *"Bangun Kemitraan. Kembangkan Bisnis."*, preview dashboard, fitur, cara kerja, manfaat, CTA, footer.
- Autentikasi simulasi: login (validasi, show/hide password, demo login), pilih role, registrasi Producer, registrasi Shop Owner dengan pemilih lokasi simulasi.
- Dashboard shell responsif: sidebar desktop, drawer + bottom navigation mobile, topbar dengan role switcher dan notifikasi, skeleton loading, guard berdasarkan role.
- Design system: token warna emerald/mint, komponen shadcn-style (Button, Card, Dialog, Select, Input, Badge, Progress, Table, Tabs, Switch, Alert, Empty State, dll), Lucide icons, Sonner toast, skeleton, dan dialog konfirmasi.
- Riwayat aktivitas dengan filter kategori, rentang tanggal, dan pencarian.
- Profil usaha dengan validasi dan penyimpanan lokal.
- Reset data demo.

### Producer
- Dashboard: total penawaran, pengiriman, penjualan, komisi mitra, hak pembayaran, grafik penjualan 14 hari, penawaran terbaru, aktivitas, status pengiriman, performa produk.
- Penawaran: buat (pilih warung & produk, jumlah, harga, komisi, catatan), kirim draft, batalkan, lihat detail.
- Produk: tambah, edit, hapus (soft-deactivate jika sudah dipakai penawaran), stok yang dititipkan, filter & pencarian.
- Pengiriman: catat pengiriman dari penawaran diterima, tandai dikirim, pantau konfirmasi warung dan selisih penerimaan.
- Settlement: lihat rincian, ajukan, dan konfirmasi settlement yang diajukan warung.

### Shop Owner
- Dashboard: stok tersedia, penawaran masuk, produk terjual, total settlement, grafik penjualan, stok menipis, pengiriman menunggu konfirmasi, ringkasan pembayaran.
- Penawaran masuk: detail, terima, tolak dengan konfirmasi dan toast.
- Stok titipan: dihitung dari transaksi, badge Aman/Menipis/Habis, filter & pencarian.
- Pengiriman: konfirmasi penerimaan dengan input jumlah dan catatan selisih.
- Penjualan & stok: catat sold / returned / damaged / expired pada batch tertentu dengan validasi stok.
- Settlement: lihat kewajiban pembayaran, komisi, ajukan, dan konfirmasi; daftar bisa ditampilkan sebagai kartu atau tabel.

---

## Model data & perhitungan

Satu sumber data bersama di `src/lib/store.ts` (Zustand + `persist` ke `localStorage`, key `titipdekat-demo-v1`). Mock data awal ada di `src/lib/mock-data.ts`, logika hitung di `src/lib/calculations.ts`.

- **Pengiriman** adalah batch stok yang diterima warung (`received` dihitung dari `receivedQuantity`).
- **Stock event** adalah satu-satunya catatan pergerakan stok: `sold`, `returned`, `damaged`, `expired`.
- **Rumus stok:** `Remaining = Received − Sold − Returned − Damaged − Expired`.
- **Penjualan bruto:** `Sold Quantity × Agreed Price`.
- **Komisi warung:** `Gross Sales × Commission Rate`.
- **Hak produsen:** `Gross Sales − Commission`.
- Angka dashboard, grafik, stok, dan settlement semuanya dihitung ulang dari dataset yang sama, bukan angka statis.

Tanggal seed dibuat relatif terhadap hari ini dan dibatasi dalam bulan berjalan agar periode settlement terisi saat demo.

---

## Yang masih disimulasikan

- Login & registrasi (termasuk Google OAuth) — hanya UI + state lokal, tanpa autentikasi sungguhan.
- Lokasi warung — placeholder koordinat, bukan Google Maps API.
- Pengiriman — pencatatan dan konfirmasi manual, tanpa kurir/live tracking.
- Settlement & pembayaran — perubahan status saja, tanpa payment gateway atau transfer sungguhan.
- Upload foto produk — hanya input URL/pratinjau emoji, tanpa penyimpanan file.
- Notifikasi — daftar statis di topbar.

---

## Catatan integrasi Supabase (tahap berikutnya)

1. Ganti `src/lib/store.ts` dengan Supabase client + Auth. Pertahankan interface action agar komponen tidak banyak berubah.
2. Pindahkan `mock-data.ts` ke migration SQL / seed Supabase. Buat tabel: `profiles`, `businesses`, `products`, `offers`, `deliveries`, `stock_events`, `settlements`, `activities`.
3. Terapkan Row Level Security: producer hanya melihat data miliknya, shop hanya melihat penawaran/pengiriman yang ditujukan kepadanya.
4. Hilangkan perhitungan sisi klien untuk angka kritis; gunakan **database views** atau RPC Postgres untuk stok dan settlement agar semua role membaca angka yang identik.
5. Ganti `submitSettlement` / `completeSettlement` dengan transaksi database + validasi server (pihak yang mengajukan tidak boleh mengonfirmasi sendiri).
6. Simpan foto produk di Supabase Storage, lokasi warung di tabel koordinat (atau Google Maps Place API bila diizinkan).
7. Gunakan Supabase Realtime untuk memperbarui daftar penawaran/pengiriman antar role tanpa refresh.
8. Audit trail sudah memiliki konsep `activities`; pindahkan ke tabel append-only dengan policy yang membatasi penulisan.

---

## Struktur singkat

```
src/
  app/                  # App Router: landing, auth, producer/*, shop/*
  components/
    auth/ landing/ layout/ dashboard/ forms/ shared/ ui/
  features/
    producer/ shop/ shared/
  hooks/                # use-demo-data, use-current-business, use-hydrated
  lib/                  # store, mock-data, calculations, demo-auth, navigation, utils
  types/                # domain types
```

**Branding:** TitipDekat — Team Xcloud.
