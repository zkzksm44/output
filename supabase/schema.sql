-- 출고 도메인을 public 스키마와 분리합니다.
create schema if not exists shipping;

-- 이전 버전의 테이블이 있으면 데이터와 제약조건을 보존한 채 이동합니다.
do $$
begin
  if to_regclass('shipping.journals') is null
     and to_regclass('public.shipping_journals') is not null then
    alter table public.shipping_journals set schema shipping;
    alter table shipping.shipping_journals rename to journals;
  end if;
end
$$;

create table if not exists shipping.journals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  work_date date not null,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  unique (user_id, work_date)
);

comment on schema shipping is '출고관리 전용 데이터 스키마';
comment on table shipping.journals is '사용자별 날짜 단위 출고일지';

alter table shipping.journals enable row level security;

-- 브라우저의 비로그인 사용자는 스키마와 테이블에 접근할 수 없습니다.
revoke all on schema shipping from public, anon;
revoke all on table shipping.journals from anon, authenticated;
grant usage on schema shipping to authenticated, service_role;
grant select, insert, update, delete on table shipping.journals to authenticated;
grant all on table shipping.journals to service_role;

drop policy if exists "Users read their own journals" on shipping.journals;
drop policy if exists "Users create their own journals" on shipping.journals;
drop policy if exists "Users update their own journals" on shipping.journals;
drop policy if exists "Users delete their own journals" on shipping.journals;

create policy "Users read their own journals"
on shipping.journals for select to authenticated
using ((select auth.uid()) = user_id);

create policy "Users create their own journals"
on shipping.journals for insert to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users update their own journals"
on shipping.journals for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users delete their own journals"
on shipping.journals for delete to authenticated
using ((select auth.uid()) = user_id);
