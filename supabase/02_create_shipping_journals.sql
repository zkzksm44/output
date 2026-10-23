create table if not exists shipping.journals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  work_date date not null,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  unique (user_id, work_date)
);

alter table shipping.journals enable row level security;

revoke all on schema shipping from public, anon;
revoke all on table shipping.journals from anon, authenticated;
grant usage on schema shipping to authenticated, service_role;
grant select, insert, update, delete on table shipping.journals to authenticated;
grant all on table shipping.journals to service_role;

drop policy if exists shipping_journals_own on shipping.journals;
create policy shipping_journals_own
on shipping.journals
for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);
