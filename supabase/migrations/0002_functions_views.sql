-- TitipDekat — 0002 Views & RPC
-- Kalkulasi deterministik, status transaksi, dan riwayat bersama.
-- Belum dijalankan ke project Supabase.

-- MIG-02: drop view sebelum create agar perubahan struktur kolom tidak
-- gagal saat migration dijalankan ulang.
drop view if exists public.settlement_breakdown cascade;
drop view if exists public.producer_stats cascade;
drop view if exists public.shop_stats cascade;
drop view if exists public.stock_movements cascade;
drop view if exists public.stock_adjustments cascade;
drop view if exists public.sales_reports cascade;
drop view if exists public.shop_stock cascade;
drop view if exists public.stock_lots cascade;

-- ---------------------------------------------------------------------------
-- Helper identitas (dipakai RLS dan RPC)
-- ---------------------------------------------------------------------------
create or replace function public.current_profile_id()
returns uuid language sql stable security definer set search_path = public, pg_temp as $$
  select id from public.profiles where id = auth.uid();
$$;

create or replace function public.current_role()
returns public.user_role language sql stable security definer set search_path = public, pg_temp as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_party(p_producer uuid, p_shop uuid)
returns boolean language sql stable security definer set search_path = public, pg_temp as $$
  select auth.uid() in (p_producer, p_shop);
$$;

-- RLS-01: katalog warung untuk produsen hanya mengekspos field non-privat.
create or replace function public.list_partner_shops()
returns table (id uuid, business_name text, business_type text, city text, location_label text)
language sql stable security definer set search_path = public, pg_temp as $$
  select id, business_name, business_type, city, location_label
  from public.profiles
  where role = 'shop'
  order by business_name;
$$;

-- ---------------------------------------------------------------------------
-- Audit trail bersama
-- ---------------------------------------------------------------------------
create or replace function public.log_activity(
  p_type text, p_title text, p_description text, p_actor_role text,
  p_producer uuid, p_shop uuid, p_entity_type text default null, p_entity_id uuid default null
) returns void language plpgsql security definer set search_path = public, pg_temp as $$
declare v_actor text;
begin
  select business_name into v_actor from public.profiles where id = auth.uid();
  insert into public.activity_events
    (type, title, description, actor, actor_role, producer_id, shop_id, entity_type, entity_id)
  values
    (p_type, p_title, p_description, coalesce(v_actor, 'Sistem'), p_actor_role,
     p_producer, p_shop, p_entity_type, p_entity_id);
end $$;

-- ---------------------------------------------------------------------------
-- View stok — satu sumber kebenaran
-- ---------------------------------------------------------------------------
create or replace view public.stock_lots with (security_invoker = true) as
select
  d.id as delivery_id,
  d.consignment_id,
  d.shop_id,
  d.producer_id,
  ci.id as consignment_item_id,
  ci.product_id,
  ci.price,
  ci.commission_rate,
  coalesce(gri.quantity_received, 0) as received,
  coalesce(sum(se.quantity) filter (where se.type = 'sold'), 0) as sold,
  coalesce(sum(se.quantity) filter (where se.type = 'returned'), 0) as returned,
  coalesce(sum(se.quantity) filter (where se.type = 'damaged'), 0) as damaged,
  coalesce(sum(se.quantity) filter (where se.type = 'expired'), 0) as expired,
  coalesce(gri.quantity_received, 0)
    - coalesce(sum(se.quantity), 0) as remaining
from public.delivery_records d
join public.goods_receipts gr on gr.delivery_id = d.id
join public.consignments c on c.id = d.consignment_id
join public.consignment_items ci on ci.consignment_id = c.id
left join public.goods_receipt_items gri
  on gri.receipt_id = gr.id and gri.consignment_item_id = ci.id
left join public.stock_events se
  on se.delivery_id = d.id and se.consignment_item_id = ci.id
group by d.id, d.consignment_id, d.shop_id, d.producer_id,
         ci.id, ci.product_id, ci.price, ci.commission_rate,
         gr.quantity_received, gri.quantity_received;

create or replace view public.shop_stock with (security_invoker = true) as
select
  l.shop_id, l.producer_id, l.product_id,
  p.name as product_name, p.emoji as product_emoji, p.image_url,
  pr.business_name as producer_name,
  sum(l.received)::integer as received,
  sum(l.sold)::integer as sold,
  sum(l.returned)::integer as returned,
  sum(l.damaged)::integer as damaged,
  sum(l.expired)::integer as expired,
  sum(l.remaining)::integer as remaining,
  case
    when sum(l.remaining) <= 0 then 'out'
    when sum(l.remaining) <= greatest(3, round(sum(l.received) * 0.2)) then 'low'
    else 'safe'
  end as status
from public.stock_lots l
join public.products p on p.id = l.product_id
join public.profiles pr on pr.id = l.producer_id
group by l.shop_id, l.producer_id, l.product_id,
         p.name, p.emoji, p.image_url, pr.business_name;

create or replace view public.sales_reports with (security_invoker = true) as
select
  se.id, se.shop_id, se.producer_id, se.product_id, se.delivery_id,
  se.quantity, se.price, se.commission_rate, se.event_date,
  se.quantity * se.price as gross,
  round(se.quantity * se.price * se.commission_rate / 100.0)::integer as commission,
  se.quantity * se.price
    - round(se.quantity * se.price * se.commission_rate / 100.0)::integer as net
from public.stock_events se
where se.type = 'sold';

create or replace view public.stock_adjustments with (security_invoker = true) as
select se.*
from public.stock_events se
where se.type in ('returned','damaged','expired');

create or replace view public.stock_movements with (security_invoker = true) as
select
  se.id, se.delivery_id, se.product_id, se.shop_id, se.producer_id,
  se.type, se.quantity, se.price, se.commission_rate, se.event_date, se.note,
  case
    when se.type = 'sold' then se.quantity * se.price
    else 0
  end as gross,
  case
    when se.type = 'sold'
      then round(se.quantity * se.price * se.commission_rate / 100.0)::integer
    else 0
  end as commission
from public.stock_events se;

create or replace view public.settlement_breakdown with (security_invoker = true) as
select
  s.id as settlement_id,
  count(si.id)::integer as lines,
  coalesce(sum(si.quantity), 0)::integer as units,
  coalesce(sum(si.gross), 0)::integer as gross,
  coalesce(sum(si.commission), 0)::integer as commission,
  coalesce(sum(si.net), 0)::integer as net
from public.settlements s
left join public.settlement_items si on si.settlement_id = s.id
group by s.id;

create or replace view public.producer_stats with (security_invoker = true) as
select
  pr.id as producer_id,
  count(distinct c.id) as total_consignments,
  count(distinct d.id) as total_deliveries,
  coalesce((select sum(sr.quantity) from public.sales_reports sr where sr.producer_id = pr.id), 0) as units_sold,
  coalesce((select sum(sr.gross) from public.sales_reports sr where sr.producer_id = pr.id), 0) as gross_sales,
  coalesce((select sum(sr.commission) from public.sales_reports sr where sr.producer_id = pr.id), 0) as commission,
  coalesce((select sum(sr.net) from public.sales_reports sr where sr.producer_id = pr.id), 0) as net_receivable
from public.profiles pr
left join public.consignments c on c.producer_id = pr.id
left join public.delivery_records d on d.producer_id = pr.id
where pr.role = 'producer'
group by pr.id;

create or replace view public.shop_stats with (security_invoker = true) as
select
  sh.id as shop_id,
  coalesce((select sum(ss.received) from public.shop_stock ss where ss.shop_id = sh.id), 0) as received_units,
  coalesce((select sum(ss.remaining) from public.shop_stock ss where ss.shop_id = sh.id), 0) as available_units,
  coalesce((select sum(sr.quantity) from public.sales_reports sr where sr.shop_id = sh.id), 0) as units_sold,
  coalesce((select sum(sr.gross) from public.sales_reports sr where sr.shop_id = sh.id), 0) as gross_sales,
  coalesce((select sum(sr.commission) from public.sales_reports sr where sr.shop_id = sh.id), 0) as commission_earned
from public.profiles sh
where sh.role = 'shop';

-- ---------------------------------------------------------------------------
-- RPC: konsinyasi
-- ---------------------------------------------------------------------------
create or replace function public.create_consignment(
  p_shop uuid, p_items jsonb, p_note text default null
) returns uuid language plpgsql security definer set search_path = public, pg_temp as $$
declare v_id uuid; v_item jsonb;
begin
  if public.current_role() <> 'producer' then
    raise exception 'Hanya produsen yang dapat membuat penawaran';
  end if;
  -- OQ07-01/OQ-07=B: minimal satu butir harus dikirim dalam transaksi yang sama.
  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'Penawaran harus memiliki minimal satu butir produk';
  end if;
  insert into public.consignments (producer_id, shop_id, status, note)
  values (public.current_profile_id(), p_shop, 'pending_offer', p_note)
  returning id into v_id;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    insert into public.consignment_items
      (consignment_id, product_id, quantity, price, commission_rate, note)
    values (
      v_id,
      (v_item->>'productId')::uuid,
      (v_item->>'quantity')::integer,
      (v_item->>'price')::integer,
      (v_item->>'commissionRate')::integer,
      v_item->>'note'
    );
  end loop;

  perform public.log_activity(
    'offer_created', 'Penawaran dibuat',
    'Produsen mengirim penawaran konsinyasi ke warung.', 'producer',
    public.current_profile_id(), p_shop, 'consignment', v_id
  );
  return v_id;
end $$;

create or replace function public.respond_consignment(p_id uuid, p_accept boolean)
returns void language plpgsql security definer set search_path = public, pg_temp as $$
declare v public.consignments%rowtype;
begin
  select * into v from public.consignments where id = p_id for update;
  if v.shop_id <> public.current_profile_id() or public.current_role() <> 'shop' then
    raise exception 'Tidak diizinkan merespons penawaran ini';
  end if;
  if v.status <> 'pending_offer' then
    raise exception 'Penawaran tidak dalam status Pending Offer';
  end if;
  update public.consignments
  set status = case when p_accept then 'accepted' else 'rejected' end,
      responded_at = now()
  where id = p_id;
  perform public.log_activity(
    case when p_accept then 'offer_accepted' else 'offer_rejected' end,
    case when p_accept then 'Penawaran diterima' else 'Penawaran ditolak' end,
    'Warung memberikan respons atas penawaran.', 'shop',
    v.producer_id, v.shop_id, 'consignment', p_id
  );
end $$;

create or replace function public.create_delivery(p_consignment uuid, p_note text default null)
returns uuid language plpgsql security definer set search_path = public, pg_temp as $$
declare v_id uuid; v_producer uuid; v_shop uuid; v_exists boolean;
begin
  select producer_id, shop_id into v_producer, v_shop
  from public.consignments where id = p_consignment;
  if v_producer is null or v_producer <> public.current_profile_id() then
    raise exception 'Hanya produsen pemilik penawaran yang dapat mencatat pengiriman';
  end if;
  if not exists (select 1 from public.consignments where id = p_consignment and status = 'accepted') then
    raise exception 'Penawaran belum diterima';
  end if;
  select exists(select 1 from public.delivery_records where consignment_id = p_consignment) into v_exists;
  if v_exists then
    raise exception 'Penawaran ini sudah memiliki pengiriman';
  end if;
  insert into public.delivery_records (consignment_id, producer_id, shop_id, note)
  values (p_consignment, v_producer, v_shop, p_note)
  returning id into v_id;
  update public.consignments set status = 'delivery_recorded' where id = p_consignment;
  perform public.log_activity(
    'delivery_created', 'Pengiriman dicatat',
    'Produsen mencatat pengiriman barang titipan.', 'producer',
    v_producer, v_shop, 'delivery', v_id
  );
  return v_id;
end $$;

create or replace function public.mark_shipped(p_delivery uuid)
returns void language plpgsql security definer set search_path = public, pg_temp as $$
declare v public.delivery_records%rowtype;
begin
  select * into v from public.delivery_records where id = p_delivery for update;
  if v.producer_id <> public.current_profile_id() or v.status <> 'preparing' then
    raise exception 'Pengiriman tidak dapat ditandai dikirim';
  end if;
  update public.delivery_records set status = 'shipped', shipped_at = now() where id = p_delivery;
  perform public.log_activity(
    'delivery_shipped', 'Pengiriman dikirim', 'Barang sedang menuju warung.',
    'producer', v.producer_id, v.shop_id, 'delivery', p_delivery
  );
end $$;

create or replace function public.confirm_receipt(
  p_delivery uuid, p_items jsonb, p_reason text default null
) returns void language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v public.delivery_records%rowtype;
  v_item jsonb;
  v_receipt_id uuid;
  v_total integer := 0;
  v_agreed_total integer := 0;
  v_expected integer := 0;
  v_agreed integer;
  v_exact boolean := true;
  v_received integer;
  v_diff integer;
  v_item_id uuid;
  v_receipt_reason text;
begin
  select * into v from public.delivery_records where id = p_delivery for update;
  if v.shop_id <> public.current_profile_id() or v.status <> 'shipped' then
    raise exception 'Warung tidak dapat mengonfirmasi pengiriman ini';
  end if;
  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'Minimal satu butir produk harus dikonfirmasi';
  end if;

  select count(*), coalesce(sum(quantity), 0) into v_expected, v_agreed_total
  from public.consignment_items where consignment_id = v.consignment_id;
  if jsonb_array_length(p_items) <> v_expected then
    raise exception 'Seluruh butir konsinyasi wajib dicantumkan dalam penerimaan';
  end if;
  if (
    select count(distinct (value->>'consignmentItemId')::uuid)
    from jsonb_array_elements(p_items)
  ) <> v_expected then
    raise exception 'Butir konsinyasi duplikat dalam penerimaan';
  end if;

  -- Validasi dulu, baru INSERT — menghindari quantity_received = 0 (STK-01).
  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_item_id := (v_item->>'consignmentItemId')::uuid;
    select ci.quantity into v_agreed
    from public.consignment_items ci
    where ci.id = v_item_id and ci.consignment_id = v.consignment_id;
    if v_agreed is null then
      raise exception 'Butir tidak ditemukan atau bukan milik konsinyasi ini';
    end if;
    v_received := (v_item->>'quantityReceived')::integer;
    if v_received is null or v_received < 0 then
      raise exception 'Jumlah diterima harus bilangan bulat minimal 0';
    end if;
    if v_received > v_agreed then
      raise exception 'Jumlah diterima melebihi jumlah yang dikirim untuk butir ini';
    end if;
    v_diff := v_agreed - v_received;
    if v_diff > 0 then
      v_exact := false;
      if coalesce(trim(coalesce(v_item->>'reason', p_reason)), '') = '' then
        raise exception 'Selisih penerimaan wajib disertai alasan';
      end if;
    end if;
    v_total := v_total + v_received;
  end loop;

  if v_total = 0 then
    raise exception 'Minimal satu butir harus benar-benar diterima';
  end if;
  if v_total > v_agreed_total then
    raise exception 'Total diterima melebihi total yang dikirim';
  end if;

  v_receipt_reason := coalesce(trim(p_reason), '');
  if v_receipt_reason = '' and not v_exact then
    v_receipt_reason := 'Selisih penerimaan per butir';
  end if;

  insert into public.goods_receipts
    (delivery_id, shop_id, quantity_received, discrepancy_quantity, reason)
  values (p_delivery, v.shop_id, v_total, v_agreed_total - v_total, v_receipt_reason)
  returning id into v_receipt_id;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_item_id := (v_item->>'consignmentItemId')::uuid;
    select ci.quantity into v_agreed from public.consignment_items ci where ci.id = v_item_id;
    v_received := (v_item->>'quantityReceived')::integer;
    insert into public.goods_receipt_items
      (receipt_id, consignment_item_id, quantity_received, discrepancy_quantity, reason)
    values (v_receipt_id, v_item_id, v_received, v_agreed - v_received,
            coalesce(v_item->>'reason', v_receipt_reason, null));
  end loop;

  update public.delivery_records
  set status = case when v_exact then 'received' else 'disputed' end
  where id = p_delivery;
  update public.consignments set status = 'active' where id = v.consignment_id;
  perform public.log_activity(
    case when v_exact then 'delivery_received' else 'delivery_disputed' end,
    case when v_exact then 'Penerimaan dikonfirmasi' else 'Penerimaan dengan selisih' end,
    'Warung mengonfirmasi jumlah barang diterima per butir.', 'shop',
    v.producer_id, v.shop_id, 'delivery', p_delivery
  );
end $$;

-- ---------------------------------------------------------------------------
-- RPC: stok
-- ---------------------------------------------------------------------------
create or replace function public.record_stock_event(
  p_delivery uuid, p_type public.stock_event_type, p_quantity integer,
  p_date date, p_note text default null, p_client_event_id uuid default null,
  p_consignment_item uuid default null
) returns uuid language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_lot public.stock_lots%rowtype;
  v_item_id uuid;
  v_price integer; v_rate integer; v_product uuid; v_id uuid; v_event_type text;
begin
  if public.current_role() <> 'shop' then
    raise exception 'Hanya warung yang dapat mencatat pergerakan stok';
  end if;
  -- CONC-01: kunci baris stok sebelum menghitung sisa, lalu hitung ulang
  -- setelah lock diperoleh. Request bersamaan akan menunggu, bukan oversell.
  perform 1 from public.delivery_records where id = p_delivery for update;
  perform 1 from public.goods_receipts where delivery_id = p_delivery for update;
  if p_consignment_item is null then
    select * into v_lot from public.stock_lots where delivery_id = p_delivery limit 1;
  else
    select * into v_lot from public.stock_lots
    where delivery_id = p_delivery and consignment_item_id = p_consignment_item;
  end if;
  if v_lot.delivery_id is null or v_lot.shop_id <> public.current_profile_id() then
    raise exception 'Batch titipan tidak ditemukan';
  end if;
  if p_quantity is null or p_quantity <= 0 or p_quantity <> floor(p_quantity) then
    raise exception 'Jumlah harus bilangan bulat lebih dari 0';
  end if;
  if p_date is null or p_date > current_date then
    raise exception 'Tanggal transaksi tidak valid';
  end if;
  if p_quantity > v_lot.remaining then
    raise exception 'Stok butir ini hanya tersisa % pcs', v_lot.remaining;
  end if;

  v_item_id := coalesce(p_consignment_item, v_lot.consignment_item_id);
  select ci.price, ci.commission_rate, ci.product_id into v_price, v_rate, v_product
  from public.consignment_items ci
  where ci.id = v_item_id and ci.consignment_id = v_lot.consignment_id;
  if v_price is null then
    raise exception 'Butir konsinyasi tidak ditemukan';
  end if;

  insert into public.stock_events
    (delivery_id, consignment_id, consignment_item_id, product_id, producer_id, shop_id,
     type, quantity, price, commission_rate, event_date, note, client_event_id)
  values
    (p_delivery, v_lot.consignment_id, v_item_id, v_product, v_lot.producer_id,
     v_lot.shop_id, p_type, p_quantity, v_price, v_rate, p_date, p_note, p_client_event_id)
  returning id into v_id;

  v_event_type := case p_type
    when 'sold' then 'sale_recorded'
    when 'returned' then 'return_recorded'
    when 'damaged' then 'damage_recorded'
    else 'expiry_recorded' end;

  perform public.log_activity(
    v_event_type, 'Pergerakan stok dicatat',
    format('%s pcs produk dicatat (%s)', p_quantity, p_type), 'shop',
    v_lot.producer_id, v_lot.shop_id, 'stock_event', v_id
  );

  -- OQ-22 = A: tutup otomatis hanya bila SELURUH butir konsinyasi habis.
  if not exists (
    select 1 from public.stock_lots
    where consignment_id = v_lot.consignment_id and remaining > 0
  ) then
    update public.consignments set status = 'stock_closed'
    where id = v_lot.consignment_id and status = 'active';
  end if;
  return v_id;
end $$;

-- ---------------------------------------------------------------------------
-- RPC: settlement & pembayaran
-- ---------------------------------------------------------------------------
create or replace function public.create_settlement(
  p_producer uuid, p_shop uuid, p_start date, p_end date
) returns uuid language plpgsql security definer set search_path = public, pg_temp as $$
declare v_id uuid; v_sr record;
begin
  if not public.is_party(p_producer, p_shop) then
    raise exception 'Anda bukan pihak dalam settlement ini';
  end if;
  if p_start > p_end then
    raise exception 'Periode tidak valid';
  end if;
  -- Validasi kepemilikan data: pasangan produsen-warung harus memiliki
  -- konsinyasi nyata. Client tidak boleh mengirim IDs sembarangan (F-09).
  if not exists (
    select 1 from public.consignments c
    where c.producer_id = p_producer and c.shop_id = p_shop
      and c.status in ('active','stock_closed','completed')
  ) then
    raise exception 'Tidak ada kemitraan aktif antara kedua pihak';
  end if;
  -- Idempotency: kembalikan settlement yang sedang ditinjau untuk periode sama.
  declare v_existing uuid;
  begin
    select id into v_existing from public.settlements
    where producer_id = p_producer and shop_id = p_shop
      and period_start = p_start and period_end = p_end
      and status = 'under_review'
    limit 1;
    if v_existing is not null then
      return v_existing;
    end if;
  end;
  if not exists (
    select 1 from public.sales_reports sr
    where sr.producer_id = p_producer and sr.shop_id = p_shop
      and sr.event_date between p_start and p_end
      and not exists (select 1 from public.settlement_items si where si.stock_event_id = sr.id)
  ) then
    raise exception 'Tidak ada penjualan yang belum ter-settle pada periode ini';
  end if;

  insert into public.settlements (producer_id, shop_id, period_start, period_end)
  values (p_producer, p_shop, p_start, p_end)
  returning id into v_id;

  for v_sr in
    select sr.* from public.sales_reports sr
    where sr.producer_id = p_producer and sr.shop_id = p_shop
      and sr.event_date between p_start and p_end
      and not exists (select 1 from public.settlement_items si where si.stock_event_id = sr.id)
  loop
    -- SET-01: kunci baris penjualan agar dua settlement bersamaan tidak
    -- memakai event yang sama.
    perform 1 from public.stock_events se where se.id = v_sr.id for update;
    insert into public.settlement_items
      (settlement_id, stock_event_id, quantity, price, commission_rate, gross, commission, net)
    values
      (v_id, v_sr.id, v_sr.quantity, v_sr.price, v_sr.commission_rate,
       v_sr.gross, v_sr.commission, v_sr.net);
  end loop;

  perform public.log_activity(
    'settlement_submitted', 'Settlement dibuat',
    'Ringkasan settlement menunggu pemeriksaan kedua pihak.',
    case when public.current_role() = 'producer' then 'producer' else 'shop' end,
    p_producer, p_shop, 'settlement', v_id
  );
  return v_id;
end $$;

create or replace function public.approve_settlement(p_settlement uuid)
returns void language plpgsql security definer set search_path = public, pg_temp as $$
declare v public.settlements%rowtype; v_count integer;
begin
  select * into v from public.settlements where id = p_settlement for update;
  if not public.is_party(v.producer_id, v.shop_id) then
    raise exception 'Anda bukan pihak dalam settlement ini';
  end if;
  if v.status <> 'under_review' then
    raise exception 'Settlement tidak dalam status Under Review';
  end if;
  insert into public.settlement_approvals (settlement_id, user_id, role)
  values (p_settlement, public.current_profile_id(), public.current_role());
  select count(*) into v_count from public.settlement_approvals where settlement_id = p_settlement;
  if v_count = 2 then
    update public.settlements set status = 'agreed' where id = p_settlement;
    insert into public.payment_confirmations (settlement_id, producer_id, shop_id, status)
    values (p_settlement, v.producer_id, v.shop_id, 'unpaid');
  end if;
  perform public.log_activity(
    'settlement_approved', 'Settlement disetujui',
    'Salah satu pihak menyetujui ringkasan settlement.',
    case when public.current_role() = 'producer' then 'producer' else 'shop' end,
    v.producer_id, v.shop_id, 'settlement', p_settlement
  );
end $$;

create or replace function public.void_settlement(p_settlement uuid, p_reason text)
returns void language plpgsql security definer set search_path = public, pg_temp as $$
declare v public.settlements%rowtype;
begin
  select * into v from public.settlements where id = p_settlement for update;
  if not public.is_party(v.producer_id, v.shop_id) or v.status <> 'under_review' then
    raise exception 'Settlement tidak dapat dibatalkan';
  end if;
  if coalesce(trim(p_reason), '') = '' then
    raise exception 'Alasan pembatalan wajib diisi';
  end if;
  delete from public.settlement_items where settlement_id = p_settlement;
  update public.settlements set status = 'voided', voided_at = now(), note = p_reason
  where id = p_settlement;
  perform public.log_activity(
    'settlement_voided', 'Settlement dibatalkan', p_reason,
    case when public.current_role() = 'producer' then 'producer' else 'shop' end,
    v.producer_id, v.shop_id, 'settlement', p_settlement
  );
end $$;

create or replace function public.report_payment(
  p_settlement uuid, p_amount integer, p_paid_at date, p_method_note text default null
) returns void language plpgsql security definer set search_path = public, pg_temp as $$
declare v public.payment_confirmations%rowtype;
begin
  select * into v from public.payment_confirmations where settlement_id = p_settlement for update;
  if v.shop_id <> public.current_profile_id() or v.status not in ('unpaid','queried','reported') then
    raise exception 'Warung tidak dapat melaporkan pembayaran ini';
  end if;
  update public.payment_confirmations
  set status = 'reported', amount = p_amount, paid_at = p_paid_at,
      method_note = p_method_note, dispute_note = null
  where settlement_id = p_settlement;
end $$;

create or replace function public.confirm_payment(p_settlement uuid)
returns void language plpgsql security definer set search_path = public, pg_temp as $$
declare v public.payment_confirmations%rowtype; v_net integer; v_open integer;
begin
  select * into v from public.payment_confirmations where settlement_id = p_settlement for update;
  if v.producer_id <> public.current_profile_id() or v.status <> 'reported' then
    raise exception 'Produsen tidak dapat mengonfirmasi pembayaran ini';
  end if;
  select net into v_net from public.settlement_breakdown where settlement_id = p_settlement;
  if v.amount is distinct from v_net then
    raise exception 'Nominal tidak sesuai dengan settlement';
  end if;
  update public.payment_confirmations set status = 'confirmed' where settlement_id = p_settlement;
  update public.settlements set status = 'completed', completed_at = now() where id = p_settlement;

  select count(*) into v_open from public.settlements
  where producer_id = v.producer_id and shop_id = v.shop_id and status <> 'completed';
  update public.consignments
  set status = 'completed', completed_at = now()
  where producer_id = v.producer_id and shop_id = v.shop_id and status = 'stock_closed'
    and v_open = 0;

  perform public.log_activity(
    'settlement_completed', 'Settlement selesai',
    'Pembayaran dikonfirmasi produsen.', 'producer',
    v.producer_id, v.shop_id, 'settlement', p_settlement
  );
end $$;
