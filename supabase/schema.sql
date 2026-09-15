-- Run this once in your Supabase project's SQL Editor.

create extension if not exists "pgcrypto";

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  color text not null default '#6366f1',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.todos (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories(id) on delete set null,
  title text not null,
  date date not null,
  completed boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists todos_date_idx on public.todos (date);
create index if not exists todos_category_id_idx on public.todos (category_id);

-- This app has no login and is meant for a single personal user connecting
-- with the public anon key, so RLS policies below allow full access.
-- Do not reuse this schema for a multi-user app without adding real auth.
alter table public.categories enable row level security;
alter table public.todos enable row level security;

drop policy if exists "Allow all access to categories" on public.categories;
create policy "Allow all access to categories" on public.categories
  for all using (true) with check (true);

drop policy if exists "Allow all access to todos" on public.todos;
create policy "Allow all access to todos" on public.todos
  for all using (true) with check (true);
