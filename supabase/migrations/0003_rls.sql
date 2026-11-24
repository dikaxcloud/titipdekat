-- TitipDekat — 0003 Row Level Security
-- Rancangan: docs/backend/RLS_SECURITY.md
-- Belum dijalankan ke project Supabase.

alter table public.profiles             enable row level security;
alter table public.products             enable row level security;
alter table public.consignments         enable row level security;
alter table public.consignment_items    enable row level security;
alter table public.delivery_records     enable row level security;
alter table public.goods_receipts       enable row level security;
alter table public.goods_receipt_items  enable row level security;
alter table public.stock_events         enable row level security;
alter table public.settlements          enable row level security;
alter table public.settlement_items     enable row level security;
alter table public.settlement_approvals enable row level security;
alter table public.payment_confirmations enable row level security;
alter table public.activity_events      enable row level security;

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles for select to authenticated
using (
  id = auth.uid()
  or exists (
    select 1 from public.consignments c
    where (c.producer_id = auth.uid() and c.shop_id = profiles.id)
       or (c.shop_id = auth.uid() and c.producer_id = profiles.id)
  )
  or exists (
    select 1 from public.settlements s
    where (s.producer_id = auth.uid() and s.shop_id = profiles.id)
       or (s.shop_id = auth.uid() and s.producer_id = profiles.id)
  )
);

drop policy if exists profiles_update on public.profiles;
create policy profiles_update on public.profiles for update to authenticated
using (id = auth.uid())
with check (id = auth.uid());

-- ---------------------------------------------------------------------------
-- products
-- ---------------------------------------------------------------------------
drop policy if exists products_select on public.products;
create policy products_select on public.products for select to authenticated
using (
  producer_id = auth.uid()
  or exists (
    select 1 from public.consignment_items ci
    join public.consignments c on c.id = ci.consignment_id
    where ci.product_id = products.id
      and c.shop_id = auth.uid()
  )
);

drop policy if exists products_insert on public.products;
create policy products_insert on public.products for insert to authenticated
with check (
  producer_id = public.current_profile_id()
  and public.current_role() = 'producer'
);

drop policy if exists products_update on public.products;
create policy products_update on public.products for update to authenticated
using (producer_id = public.current_profile_id())
with check (producer_id = public.current_profile_id());

drop policy if exists products_delete on public.products;
create policy products_delete on public.products for delete to authenticated
using (producer_id = public.current_profile_id());

-- ---------------------------------------------------------------------------
-- consignments
-- ---------------------------------------------------------------------------
drop policy if exists consignments_select on public.consignments;
create policy consignments_select on public.consignments for select to authenticated
using (public.is_party(producer_id, shop_id));

drop policy if exists consignments_insert on public.consignments;
create policy consignments_insert on public.consignments for insert to authenticated
with check (
  producer_id = public.current_profile_id()
  and public.current_role() = 'producer'
);

-- SEC-01: semua perubahan status konsinyasi HANYA lewat RPC. Tidak ada
-- policy UPDATE langsung agar state machine tidak bisa dilewati client.
drop policy if exists consignments_update on public.consignments;

-- ---------------------------------------------------------------------------
-- consignment_items
-- ---------------------------------------------------------------------------
drop policy if exists consignment_items_select on public.consignment_items;
create policy consignment_items_select on public.consignment_items for select to authenticated
using (
  exists (
    select 1 from public.consignments c
    where c.id = consignment_id and public.is_party(c.producer_id, c.shop_id)
  )
);

drop policy if exists consignment_items_write on public.consignment_items;
create policy consignment_items_write on public.consignment_items for all to authenticated
using (
  exists (
    select 1 from public.consignments c
    where c.id = consignment_id and c.producer_id = public.current_profile_id()
      and c.status in ('draft','pending_offer')
  )
)
with check (
  exists (
    select 1 from public.consignments c
    where c.id = consignment_id and c.producer_id = public.current_profile_id()
      and c.status in ('draft','pending_offer')
  )
);

-- ---------------------------------------------------------------------------
-- delivery_records & goods_receipts
-- ---------------------------------------------------------------------------
drop policy if exists deliveries_select on public.delivery_records;
create policy deliveries_select on public.delivery_records for select to authenticated
using (public.is_party(producer_id, shop_id));

drop policy if exists deliveries_insert on public.delivery_records;
create policy deliveries_insert on public.delivery_records for insert to authenticated
with check (producer_id = public.current_profile_id());

-- SEC-02: tidak ada UPDATE langsung pada delivery_records. Relasi
-- (consignment_id, producer_id, shop_id) hanya diubah lewat RPC, sehingga
-- produsen tidak bisa memindahkan kiriman ke kemitraan lain.
drop policy if exists deliveries_update on public.delivery_records;

drop policy if exists receipts_select on public.goods_receipts;
create policy receipts_select on public.goods_receipts for select to authenticated
using (
  exists (
    select 1 from public.delivery_records d
    where d.id = delivery_id and public.is_party(d.producer_id, d.shop_id)
  )
);
-- INSERT/UPDATE hanya lewat RPC confirm_receipt (security definer).

drop policy if exists receipt_items_select on public.goods_receipt_items;
create policy receipt_items_select on public.goods_receipt_items for select to authenticated
using (
  exists (
    select 1 from public.goods_receipts gr
    join public.delivery_records d on d.id = gr.delivery_id
    where gr.id = receipt_id and public.is_party(d.producer_id, d.shop_id)
  )
);

-- ---------------------------------------------------------------------------
-- stock_events — append-only, hanya RPC
-- ---------------------------------------------------------------------------
drop policy if exists stock_events_select on public.stock_events;
create policy stock_events_select on public.stock_events for select to authenticated
using (public.is_party(producer_id, shop_id));

-- ---------------------------------------------------------------------------
-- settlements, items, approvals, payments
-- ---------------------------------------------------------------------------
drop policy if exists settlements_select on public.settlements;
create policy settlements_select on public.settlements for select to authenticated
using (public.is_party(producer_id, shop_id));

drop policy if exists settlement_items_select on public.settlement_items;
create policy settlement_items_select on public.settlement_items for select to authenticated
using (
  exists (
    select 1 from public.settlements s
    where s.id = settlement_id and public.is_party(s.producer_id, s.shop_id)
  )
);

drop policy if exists approvals_select on public.settlement_approvals;
create policy approvals_select on public.settlement_approvals for select to authenticated
using (
  exists (
    select 1 from public.settlements s
    where s.id = settlement_id and public.is_party(s.producer_id, s.shop_id)
  )
);

drop policy if exists payments_select on public.payment_confirmations;
create policy payments_select on public.payment_confirmations for select to authenticated
using (public.is_party(producer_id, shop_id));

-- ---------------------------------------------------------------------------
-- activity_events — append-only
-- ---------------------------------------------------------------------------
drop policy if exists activity_select on public.activity_events;
create policy activity_select on public.activity_events for select to authenticated
using (
  (producer_id is not null and producer_id = auth.uid())
  or (shop_id is not null and shop_id = auth.uid())
  or public.is_party(producer_id, shop_id)
);

-- ---------------------------------------------------------------------------
-- Hak eksekusi RPC
-- ---------------------------------------------------------------------------
grant execute on function
  public.list_partner_shops(),
  public.create_consignment(uuid, jsonb, text),
  public.respond_consignment(uuid, boolean),
  public.create_delivery(uuid, text),
  public.mark_shipped(uuid),
  public.confirm_receipt(uuid, jsonb, text),
  public.record_stock_event(uuid, public.stock_event_type, integer, date, text, uuid, uuid),
  public.create_settlement(uuid, uuid, date, date),
  public.approve_settlement(uuid),
  public.void_settlement(uuid, text),
  public.report_payment(uuid, integer, date, text),
  public.confirm_payment(uuid)
to authenticated;

revoke all on function
  public.list_partner_shops(),
  public.create_consignment(uuid, jsonb, text),
  public.respond_consignment(uuid, boolean),
  public.create_delivery(uuid, text),
  public.mark_shipped(uuid),
  public.confirm_receipt(uuid, jsonb, text),
  public.record_stock_event(uuid, public.stock_event_type, integer, date, text, uuid, uuid),
  public.create_settlement(uuid, uuid, date, date),
  public.approve_settlement(uuid),
  public.void_settlement(uuid, text),
  public.report_payment(uuid, integer, date, text),
  public.confirm_payment(uuid)
from anon;

grant select on
  public.stock_lots, public.shop_stock, public.sales_reports,
  public.stock_adjustments, public.stock_movements,
  public.settlement_breakdown, public.producer_stats, public.shop_stats,
  public.partner_shops
to authenticated;
