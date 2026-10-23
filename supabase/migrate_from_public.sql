-- 기존 public.shipping_journals 테이블이 있고 실제 데이터가 있을 때만
-- 01_create_shipping_schema.sql 실행 후,
-- 02_create_shipping_journals.sql 실행 전에 한 번 실행하세요.
create schema if not exists shipping;

do $migration$
begin
  if to_regclass('public.shipping_journals') is not null
     and to_regclass('shipping.journals') is null then
    alter table public.shipping_journals set schema shipping;
    alter table shipping.shipping_journals rename to journals;
  end if;
end;
$migration$ language plpgsql;
