create table if not exists public.shipping_journals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  work_date date not null,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  unique (user_id, work_date)
);

alter table public.shipping_journals enable row level security;

revoke all on table public.shipping_journals from anon, authenticated;
grant select, insert, update, delete on table public.shipping_journals to authenticated;

drop policy if exists "Users read their own journals" on public.shipping_journals;
drop policy if exists "Users create their own journals" on public.shipping_journals;
drop policy if exists "Users update their own journals" on public.shipping_journals;
drop policy if exists "Users delete their own journals" on public.shipping_journals;

create policy "Users read their own journals"
on public.shipping_journals for select to authenticated
using ((select auth.uid()) = user_id);

create policy "Users create their own journals"
on public.shipping_journals for insert to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users update their own journals"
on public.shipping_journals for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users delete their own journals"
on public.shipping_journals for delete to authenticated
using ((select auth.uid()) = user_id);
