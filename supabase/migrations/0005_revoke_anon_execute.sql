-- TitipDekat — 0005 Revoke anon EXECUTE
-- Tindak lanjut NEW-01: selain PUBLIC, peran `anon` juga memiliki grant
-- EXECUTE eksplisit pada fungsi helper (current_profile_id, current_role,
-- is_party, handle_new_user, lock_profile_role, touch_updated_at,
-- log_activity). log_activity adalah SECURITY DEFINER yang menulis
-- activity_events, sehingga tidak boleh dapat dipanggil anonim.

do $$
declare v_fn regprocedure;
begin
  for v_fn in
    select p.oid::regprocedure
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
  loop
    execute format('revoke all on function %s from anon', v_fn);
  end loop;
end $$;

grant execute on all functions in schema public to authenticated, service_role;
