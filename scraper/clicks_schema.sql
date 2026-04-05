create table if not exists clicks (
  id            bigint generated always as identity primary key,
  slug          text not null,
  product_name  text,
  affiliate_url text,
  ip_address    text,
  user_agent    text,
  referer       text,
  clicked_at    timestamptz default now()
);

create index if not exists clicks_slug_idx on clicks (slug);
create index if not exists clicks_date_idx on clicks (clicked_at desc);

alter table clicks enable row level security;

create policy "Allow insert"
  on clicks for insert
  with check (true);

create policy "Public read"
  on clicks for select
  using (true);
