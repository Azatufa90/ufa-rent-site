-- 001_schema.sql
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'user',
  created_at timestamptz not null default now()
);

create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text not null default '',
  address text not null,
  city text not null default 'Уфа',
  district text not null,
  property_type text not null,
  price_rub integer not null,
  rooms integer,
  area_m2 numeric,
  floor integer,
  photos text[] not null default '{}',
  videos text[] not null default '{}',
  lat double precision,
  lng double precision,
  phone text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.listings drop constraint if exists district_allowed;
alter table public.listings add constraint district_allowed
check (district in ('Кировский','Советский','Ленинский','Орджоникидзевский','Калининский','Дёмский'));

alter table public.listings drop constraint if exists property_type_allowed;
alter table public.listings add constraint property_type_allowed
check (property_type in ('Комната','Студия','1 Комнатная','2-Х комнатная','3-Х комнатная','4-5 комнатная'));

alter table public.listings drop constraint if exists status_allowed;
alter table public.listings add constraint status_allowed
check (status in ('draft','active','archived'));

create index if not exists listings_city_idx on public.listings(city);
create index if not exists listings_owner_idx on public.listings(owner_id);
create index if not exists listings_district_idx on public.listings(district);
create index if not exists listings_type_idx on public.listings(property_type);
create index if not exists listings_price_idx on public.listings(price_rub);
create index if not exists listings_created_at_idx on public.listings(created_at);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_listings_updated_at on public.listings;
create trigger trg_listings_updated_at
before update on public.listings
for each row execute function public.set_updated_at();

create or replace view public.listings_public as
select
  l.id, l.owner_id, l.title, l.description, l.address, l.city,
  l.district, l.property_type,
  l.price_rub, l.rooms, l.area_m2, l.floor,
  l.photos, l.videos,
  l.lat, l.lng,
  l.status, l.created_at, l.updated_at,
  case
    when exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
      then l.phone
    else null
  end as phone
from public.listings l
where l.status = 'active';

alter view public.listings_public set (security_invoker = true);

alter table public.profiles enable row level security;
alter table public.listings enable row level security;

create policy "profiles_select_self"
on public.profiles for select
to authenticated
using (id = auth.uid());

create policy "profiles_insert_self"
on public.profiles for insert
to authenticated
with check (id = auth.uid());

create policy "profiles_update_self"
on public.profiles for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

-- Everyone can select active (public catalog). For admin/dashboard we select from table directly.
create policy "listings_select_active_for_all"
on public.listings for select
to authenticated, anon
using (status = 'active');

create policy "listings_insert_own"
on public.listings for insert
to authenticated
with check (owner_id = auth.uid());

create policy "listings_update_own"
on public.listings for update
to authenticated
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

create policy "listings_delete_own"
on public.listings for delete
to authenticated
using (owner_id = auth.uid());

-- Admin can moderate everything
create policy "admin_select_all"
on public.listings for select
to authenticated
using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role='admin'));

create policy "admin_update_all"
on public.listings for update
to authenticated
using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role='admin'))
with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role='admin'));

create policy "admin_delete_all"
on public.listings for delete
to authenticated
using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role='admin'));
