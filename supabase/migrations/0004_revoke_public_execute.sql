-- TitipDekat — 0004 Revoke PUBLIC EXECUTE
-- NEW-01: PostgreSQL memberi EXECUTE ke PUBLIC secara default saat fungsi
-- dibuat. Migration 0003 hanya mencabut dari `anon`, sehingga `PUBLIC`
-- (yang mencakup anon) tetap bisa memanggil RPC.
-- Migration ini idempotent dan tidak menghapus objek/data.

do $$
declare v_fn regprocedure;
begin
  for v_fn in
    select p.oid::regprocedure
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
  loop
    execute format('revoke all on function %s from public', v_fn);
  end loop;
end $$;

-- Pastikan peran yang berhak tetap memiliki akses eksplisit setelah
-- pencabutan PUBLIC.
grant execute on all functions in schema public to authenticated, service_role;
