-- Run this in Supabase SQL Editor to create the products table

create table if not exists products (
  id            bigint generated always as identity primary key,
  slug          text unique not null,
  video_url     text,
  video_title   text,
  view_count    bigint default 0,
  product_name  text,
  seo_title     text,
  seo_description text,
  affiliate_url text,
  created_at    timestamptz default now()
);

-- Enable Row Level Security (optional but recommended)
alter table products enable row level security;

-- Allow public read access for the frontend
create policy "Public read access"
  on products for select
  using (true);
