-- TitipDekat — 0001 Schema
-- Desain: docs/backend/DATABASE_DESIGN.md
-- Status: belum dijalankan ke project Supabase.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Enum (idempotent)
-- ---------------------------------------------------------------------------
do $$ begin
  create type public.user_role as enum ('producer','shop');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.product_status as enum ('active','inactive');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.consignment_status as enum (
    'draft','pending_offer','accepted','rejected','cancelled',
    'delivery_recorded','active','stock_closed','completed'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.delivery_status as enum ('preparing','shipped','received','disputed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.stock_event_type as enum ('sold','returned','damaged','expired');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.settlement_status as enum ('under_review','agreed','completed','voided');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.payment_status as enum ('unpaid','reported','queried','confirmed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.producer_response as enum ('acknowledged','disputed');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- Sequence kode transaksi (menggantikan array.length + 1 / F-08)
-- ---------------------------------------------------------------------------
create sequence if not exists public.consignment_code_seq start 1;
create sequence if not exists public.delivery_code_seq start 1;
create sequence if not exists public.settlement_code_seq start 1;

-- ---------------------------------------------------------------------------
-- Helper timestamp
-- ---------------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.user_role not null,
  business_name text not null check (char_length(trim(business_name)) >= 3),
  owner_name text not null check (char_length(trim(owner_name)) >= 3),
  business_type text not null,
  phone text not null check (char_length(trim(phone)) >= 8),
  email text not null unique,
  address text not null,
  city text not null,
  location_label text,
  latitude numeric(9,6),
  longitude numeric(9,6),
  joined_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_profiles_touch on public.profiles;
create trigger trg_profiles_touch before update on public.profiles
for each row execute function public.touch_updated_at();

-- Role tidak boleh diubah pengguna (lihat juga RLS 0003).
create or replace function public.lock_profile_role()
returns trigger language plpgsql as $$
begin
  if new.role is distinct from old.role then
    raise exception 'Role profil tidak dapat diubah sendiri';
  end if;
  return new;
end $$;

drop trigger if exists trg_profiles_lock_role on public.profiles;
create trigger trg_profiles_lock_role before update on public.profiles
for each row execute function public.lock_profile_role();

create index if not exists idx_profiles_role on public.profiles(role);

-- Profil dibuat otomatis dari metadata Supabase Auth. Role tidak bisa
-- diubah lewat UPDATE (trigger lock_profile_role di atas).
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public, pg_temp as $$
declare v_role public.user_role;
begin
  v_role := (new.raw_user_meta_data->>'role')::public.user_role;
  if v_role is null then
    raise exception 'Role wajib dikirim saat registrasi';
  end if;
  insert into public.profiles
    (id, role, business_name, owner_name, business_type, phone, email, address, city,
     location_label, latitude, longitude)
  values (
    new.id, v_role,
    coalesce(new.raw_user_meta_data->>'business_name', 'Usaha Baru'),
    coalesce(new.raw_user_meta_data->>'owner_name', 'Pemilik'),
    coalesce(new.raw_user_meta_data->>'business_type', 'Lainnya'),
    coalesce(new.raw_user_meta_data->>'phone', '00000000'),
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'address', 'Alamat belum diisi'),
    coalesce(new.raw_user_meta_data->>'city', 'Lainnya'),
    new.raw_user_meta_data->>'location_label',
    (new.raw_user_meta_data->>'latitude')::numeric,
    (new.raw_user_meta_data->>'longitude')::numeric
  );
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();

drop view if exists public.partner_shops cascade;
create or replace view public.partner_shops with (security_invoker = true) as
select * from public.profiles where role = 'shop';

-- ---------------------------------------------------------------------------
-- products
-- ---------------------------------------------------------------------------
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  producer_id uuid not null references public.profiles(id) on delete restrict,
  name text not null check (char_length(trim(name)) >= 2),
  category text not null,
  description text not null,
  price integer not null check (price >= 500),
  emoji text not null default '📦',
  image_url text,
  status public.product_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_products_touch on public.products;
create trigger trg_products_touch before update on public.products
for each row execute function public.touch_updated_at();

create index if not exists idx_products_producer on public.products(producer_id, status);

-- ---------------------------------------------------------------------------
-- consignments + items
-- ---------------------------------------------------------------------------
create table if not exists public.consignments (
  id uuid primary key default gen_random_uuid(),
  code text not null unique default (
    'PWN-' || lpad(nextval('public.consignment_code_seq')::text, 3, '0')
  ),
  producer_id uuid not null references public.profiles(id) on delete restrict,
  shop_id uuid not null references public.profiles(id) on delete restrict,
  status public.consignment_status not null default 'draft',
  note text,
  created_at timestamptz not null default now(),
  responded_at timestamptz,
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  constraint consignment_distinct_parties check (producer_id <> shop_id)
);

-- Role mitra divalidasi lewat RPC create_consignment (CHECK tidak boleh subquery).
create or replace function public.check_consignment_roles()
returns trigger language plpgsql as $$
declare v_producer public.user_role; v_shop public.user_role;
begin
  select role into v_producer from public.profiles where id = new.producer_id;
  select role into v_shop from public.profiles where id = new.shop_id;
  if v_producer is distinct from 'producer' or v_shop is distinct from 'shop' then
    raise exception 'Penawaran harus dari produsen ke warung terdaftar';
  end if;
  return new;
end $$;

drop trigger if exists trg_consignment_roles on public.consignments;
create trigger trg_consignment_roles before insert or update on public.consignments
for each row execute function public.check_consignment_roles();

drop trigger if exists trg_consignments_touch on public.consignments;
create trigger trg_consignments_touch before update on public.consignments
for each row execute function public.touch_updated_at();

create index if not exists idx_consignments_producer on public.consignments(producer_id, status);
create index if not exists idx_consignments_shop on public.consignments(shop_id, status);

create table if not exists public.consignment_items (
  id uuid primary key default gen_random_uuid(),
  consignment_id uuid not null references public.consignments(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  quantity integer not null check (quantity > 0),
  price integer not null check (price >= 500),
  commission_rate integer not null check (commission_rate between 0 and 100),
  note text,
  created_at timestamptz not null default now(),
  unique (consignment_id, product_id)
);

-- MIG-01/OQ07-01: aturan minimal satu butir memakai constraint trigger
-- yang DEFERRED, karena parent disisipkan lebih dulu daripada child dalam
-- satu transaksi. Trigger dibuat SETELAH kedua tabel tersedia.
create or replace function public.check_consignment_items()
returns trigger language plpgsql as $$
declare v_consignment uuid;
begin
  if tg_table_name = 'consignment_items' then
    v_consignment := old.consignment_id;
  else
    v_consignment := new.id;
  end if;
  if not exists (
    select 1 from public.consignment_items ci where ci.consignment_id = v_consignment
  ) then
    raise exception 'Konsinyasi harus memiliki minimal satu butir produk';
  end if;
  return null;
end $$;

drop trigger if exists trg_consignment_items_required on public.consignments;
create constraint trigger trg_consignment_items_required
after insert or update on public.consignments
deferrable initially deferred
for each row execute function public.check_consignment_items();

drop trigger if exists trg_consignment_items_last on public.consignment_items;
create constraint trigger trg_consignment_items_last
after delete on public.consignment_items
deferrable initially deferred
for each row execute function public.check_consignment_items();

-- ---------------------------------------------------------------------------
-- delivery_records + goods_receipts
-- ---------------------------------------------------------------------------
create table if not exists public.delivery_records (
  id uuid primary key default gen_random_uuid(),
  code text not null unique default (
    'SJ-' || lpad(nextval('public.delivery_code_seq')::text, 3, '0')
  ),
  consignment_id uuid not null references public.consignments(id) on delete restrict,
  producer_id uuid not null references public.profiles(id) on delete restrict,
  shop_id uuid not null references public.profiles(id) on delete restrict,
  status public.delivery_status not null default 'preparing',
  note text,
  created_at timestamptz not null default now(),
  shipped_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (consignment_id)
);

drop trigger if exists trg_deliveries_touch on public.delivery_records;
create trigger trg_deliveries_touch before update on public.delivery_records
for each row execute function public.touch_updated_at();

create index if not exists idx_deliveries_shop on public.delivery_records(shop_id, status);
create index if not exists idx_deliveries_producer on public.delivery_records(producer_id, status);

create table if not exists public.goods_receipts (
  id uuid primary key default gen_random_uuid(),
  delivery_id uuid not null unique references public.delivery_records(id) on delete restrict,
  shop_id uuid not null references public.profiles(id) on delete restrict,
  quantity_received integer not null check (quantity_received > 0),
  discrepancy_quantity integer not null default 0 check (discrepancy_quantity >= 0),
  reason text,
  producer_response public.producer_response not null default 'acknowledged',
  received_at timestamptz not null default now(),
  constraint discrepancy_reason check (
    discrepancy_quantity = 0 or char_length(coalesce(trim(reason), '')) >= 5
  )
);

-- OQ-07 = B: penerimaan dicatat per butir produk, bukan hanya total.
create table if not exists public.goods_receipt_items (
  id uuid primary key default gen_random_uuid(),
  receipt_id uuid not null references public.goods_receipts(id) on delete cascade,
  consignment_item_id uuid not null references public.consignment_items(id) on delete restrict,
  quantity_received integer not null check (quantity_received >= 0),
  discrepancy_quantity integer not null default 0 check (discrepancy_quantity >= 0),
  reason text,
  constraint receipt_item_unique unique (receipt_id, consignment_item_id)
);

-- Jumlah diterima tidak boleh melebihi jumlah dikirim (lintas tabel).
create or replace function public.check_receipt_quantity()
returns trigger language plpgsql as $$
declare v_sent integer;
begin
  select sum(ci.quantity) into v_sent
  from public.delivery_records d
  join public.consignments c on c.id = d.consignment_id
  join public.consignment_items ci on ci.consignment_id = c.id
  where d.id = new.delivery_id;
  if new.quantity_received > coalesce(v_sent, 0) then
    raise exception 'Jumlah diterima melebihi jumlah yang dikirim';
  end if;
  -- RCP-01: selisih dihitung RPC confirm_receipt dari total item,
  -- bukan trigger dengan basis total pengiriman.
  return new;
end $$;

drop trigger if exists trg_receipt_qty on public.goods_receipts;
create trigger trg_receipt_qty before insert or update on public.goods_receipts
for each row execute function public.check_receipt_quantity();

-- ---------------------------------------------------------------------------
-- stock_events (satu sumber pergerakan stok)
-- ---------------------------------------------------------------------------
create table if not exists public.stock_events (
  id uuid primary key default gen_random_uuid(),
  delivery_id uuid not null references public.delivery_records(id) on delete restrict,
  consignment_id uuid not null references public.consignments(id) on delete restrict,
  consignment_item_id uuid references public.consignment_items(id) on delete restrict,
  product_id uuid not null references public.products(id) on delete restrict,
  producer_id uuid not null references public.profiles(id) on delete restrict,
  shop_id uuid not null references public.profiles(id) on delete restrict,
  type public.stock_event_type not null,
  quantity integer not null check (quantity > 0),
  price integer not null check (price > 0),
  commission_rate integer not null check (commission_rate between 0 and 100),
  event_date date not null default current_date,
  note text,
  client_event_id uuid,
  created_at timestamptz not null default now()
);

create unique index if not exists uq_stock_event_client
  on public.stock_events (shop_id, client_event_id)
  where client_event_id is not null;

create index if not exists idx_stock_events_delivery on public.stock_events(delivery_id, type);
create index if not exists idx_stock_events_item on public.stock_events(consignment_item_id, type);
create index if not exists idx_stock_events_shop_date on public.stock_events(shop_id, event_date);
create index if not exists idx_stock_events_producer on public.stock_events(producer_id, type);

-- ---------------------------------------------------------------------------
-- settlements + items + approvals + payments
-- ---------------------------------------------------------------------------
create table if not exists public.settlements (
  id uuid primary key default gen_random_uuid(),
  code text not null unique default (
    'STL-' || lpad(nextval('public.settlement_code_seq')::text, 3, '0')
  ),
  producer_id uuid not null references public.profiles(id) on delete restrict,
  shop_id uuid not null references public.profiles(id) on delete restrict,
  period_start date not null,
  period_end date not null,
  status public.settlement_status not null default 'under_review',
  note text,
  created_at timestamptz not null default now(),
  voided_at timestamptz,
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  constraint settlement_period check (period_start <= period_end),
  constraint settlement_parties check (producer_id <> shop_id)
);

drop trigger if exists trg_settlements_touch on public.settlements;
create trigger trg_settlements_touch before update on public.settlements
for each row execute function public.touch_updated_at();

create index if not exists idx_settlements_producer on public.settlements(producer_id, status);
create index if not exists idx_settlements_shop on public.settlements(shop_id, status);

create table if not exists public.settlement_items (
  id uuid primary key default gen_random_uuid(),
  settlement_id uuid not null references public.settlements(id) on delete cascade,
  stock_event_id uuid not null unique references public.stock_events(id) on delete restrict,
  quantity integer not null check (quantity > 0),
  price integer not null check (price > 0),
  commission_rate integer not null check (commission_rate between 0 and 100),
  gross integer not null check (gross >= 0),
  commission integer not null check (commission >= 0),
  net integer not null check (net >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.settlement_approvals (
  id uuid primary key default gen_random_uuid(),
  settlement_id uuid not null references public.settlements(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete restrict,
  role public.user_role not null,
  note text,
  approved_at timestamptz not null default now(),
  unique (settlement_id, role)
);

create table if not exists public.payment_confirmations (
  id uuid primary key default gen_random_uuid(),
  settlement_id uuid not null unique references public.settlements(id) on delete cascade,
  producer_id uuid not null references public.profiles(id) on delete restrict,
  shop_id uuid not null references public.profiles(id) on delete restrict,
  status public.payment_status not null default 'unpaid',
  amount integer check (amount >= 0),
  paid_at date,
  method_note text,
  dispute_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_payments_touch on public.payment_confirmations;
create trigger trg_payments_touch before update on public.payment_confirmations
for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- activity_events (append-only)
-- ---------------------------------------------------------------------------
create table if not exists public.activity_events (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  title text not null,
  description text not null,
  actor text not null,
  actor_role text not null,
  timestamp timestamptz not null default now(),
  producer_id uuid references public.profiles(id) on delete set null,
  shop_id uuid references public.profiles(id) on delete set null,
  entity_type text,
  entity_id uuid
);

create index if not exists idx_activity_producer on public.activity_events(producer_id, timestamp desc);
create index if not exists idx_activity_shop on public.activity_events(shop_id, timestamp desc);
