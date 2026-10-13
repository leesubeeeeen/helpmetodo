-- Run this in your Supabase project's SQL Editor after schema.sql.
-- Safe to run on an existing database: it only adds the routines table and
-- a routine_id column on todos, without touching existing rows.

-- ---------------------------------------------------------------------------
-- routines: a recurring todo template. weekdays holds the days it repeats on,
-- using JS Date#getDay() numbering (0 = Sunday ... 6 = Saturday).
-- ---------------------------------------------------------------------------
create table if not exists public.routines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  category_id uuid references public.categories (id) on delete set null,
  title text not null,
  weekdays smallint[] not null,
  created_at timestamptz not null default now(),
  constraint routines_weekdays_valid check (
    cardinality(weekdays) > 0 and weekdays <@ array[0, 1, 2, 3, 4, 5, 6]::smallint[]
  )
);

create index if not exists routines_user_id_idx on public.routines (user_id);

alter table public.routines enable row level security;

drop policy if exists "Owners manage routines" on public.routines;
create policy "Owners manage routines" on public.routines
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Links a todo back to the routine it was created from, so the day view can
-- hide that routine's suggestion once it has been added for the day.
alter table public.todos
  add column if not exists routine_id uuid references public.routines (id) on delete set null;

create index if not exists todos_routine_id_idx on public.todos (routine_id);
