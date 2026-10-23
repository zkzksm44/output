-- 출고 도메인을 public 스키마와 분리합니다.
create schema if not exists shipping;

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
drop policy if exists shipping_journals_select_own on shipping.journals;
drop policy if exists shipping_journals_insert_own on shipping.journals;
drop policy if exists shipping_journals_update_own on shipping.journals;
drop policy if exists shipping_journals_delete_own on shipping.journals;
drop policy if exists shipping_journals_own on shipping.journals;

create policy shipping_journals_own on shipping.journals for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
