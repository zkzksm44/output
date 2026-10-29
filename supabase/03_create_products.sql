create table if not exists shipping.products (
  id bigint generated always as identity primary key,
  name text not null unique,
  report_number text not null unique,
  product_type text not null,
  shelf_life text not null,
  display_order integer not null unique,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table shipping.products enable row level security;

revoke all on table shipping.products from anon, authenticated;
grant select on table shipping.products to authenticated;
grant all on table shipping.products to service_role;
grant usage, select on sequence shipping.products_id_seq to service_role;

drop policy if exists products_authenticated_read on shipping.products;
create policy products_authenticated_read
on shipping.products
for select
to authenticated
using (is_active = true);

insert into shipping.products
  (name, report_number, product_type, shelf_life, display_order)
values
  ('생등심돈까스', '2017021300820', '쇼핑몰 분쇄가공육(냉장)', '5일', 6),
  ('수제생떡갈비', '20170213008117', '쇼핑몰 분쇄가공육(냉장)', '7일', 7),
  ('등심돈까스', '20170213008100', '분쇄가공육(냉동)', '6개월', 8),
  ('안심돈까스', '20170213008102', '분쇄가공육(냉동)', '6개월', 9),
  ('치즈돈까스', '20170213008101', '분쇄가공육(냉동)', '6개월', 10),
  ('롤치즈돈까스', '20170213008103', '분쇄가공육(냉동)', '6개월', 11),
  ('고구마치즈롤까스', '20170213008104', '분쇄가공육(냉동)', '6개월', 12),
  ('고구마치즈돈까스', '20170213008114', '분쇄가공육(냉동)', '6개월', 13),
  ('숙성돈까스(스틱)', '20170213008105', '분쇄가공육(냉동)', '12개월', 14),
  ('멘치카츠', '20170213008106', '분쇄가공육(냉동)', '6개월', 15),
  ('치킨텐더커틀렛', '20170213008107', '분쇄가공육(냉동)', '6개월', 16),
  ('볼카츠', '20170213008111', '분쇄가공육(냉동)', '6개월', 17),
  ('치즈카츠용(통백카츠)', '2017021300850', '분쇄가공육(냉동)', '9개월', 19),
  ('수제떡갈비', '20170213008120', '분쇄가공육(냉동)', '10개월', 20),
  ('함박스테이크', '20170213008121', '분쇄가공육(냉동)', '10개월', 21),
  ('치즈함박스테이크', '20170213008116', '분쇄가공육(냉동)', '10개월', 22),
  ('톰슨등심생돈까스용', '2017021300824', '양념육(냉장)', '7일', 24),
  ('톰슨치즈생돈까스용', '2017021300825', '양념육(냉장)', '7일', 25),
  ('톰슨수제안심돈까스용', '2017021300826', '양념육(냉장)', '7일', 26),
  ('톰슨치킨텐더커틀렛용', '2017021300827', '양념육(냉동)', '12개월', 27),
  ('애플럼순살치킨가라아게', '20170213008119', '양념육(냉동)', '10개월', 29),
  ('돈등심세절육', '202603248383', '포장육', '12개월', 30),
  ('등심카츠용', '202603248381', '포장육', '15일,12개월', 31),
  ('안심카츠용', '202603248382', '포장육', '15일,12개월', 32)
on conflict (report_number) do update
set
  name = excluded.name,
  product_type = excluded.product_type,
  shelf_life = excluded.shelf_life,
  display_order = excluded.display_order,
  is_active = true,
  updated_at = now();
