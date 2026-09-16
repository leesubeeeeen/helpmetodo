-- Run this once in your Supabase project's SQL Editor.
-- This replaces the previous single-user schema: it adds real auth
-- (Supabase Auth), a profile per user (nickname + shareable friend code),
-- a friend request/accept system, and scopes categories/todos to their owner
-- (with friends allowed to read, but not edit, each other's data).

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- profiles: one row per auth.users row, holds the public-safe nickname and
-- the "friend code" other users search by to send a friend request.
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nickname text not null,
  friend_code text not null,
  created_at timestamptz not null default now()
);

create unique index if not exists profiles_nickname_lower_idx
  on public.profiles (lower(nickname));
create unique index if not exists profiles_friend_code_idx
  on public.profiles (friend_code);

alter table public.profiles enable row level security;

drop policy if exists "Authenticated users can read profiles" on public.profiles;
create policy "Authenticated users can read profiles" on public.profiles
  for select using (auth.uid() is not null);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

-- Generates an 8-character, human-typeable friend code (uppercase hex),
-- retrying on the rare collision. Uses only built-in functions (no
-- pgcrypto) so it keeps working under a SECURITY DEFINER function's
-- restricted search_path, where Supabase's pgcrypto (installed into the
-- `extensions` schema, not `public`) would not be found.
create or replace function public.generate_friend_code()
returns text
language plpgsql
as $$
declare
  candidate text;
  tries int := 0;
begin
  loop
    candidate := upper(substr(md5(random()::text || clock_timestamp()::text), 1, 8));
    exit when not exists (select 1 from public.profiles where friend_code = candidate);
    tries := tries + 1;
    if tries > 20 then
      raise exception 'Could not generate a unique friend code';
    end if;
  end loop;
  return candidate;
end;
$$;

-- Auto-creates a profile row whenever a new auth.users row is inserted
-- (i.e. right at signup), reading the nickname passed via
-- supabase.auth.signUp({ options: { data: { nickname } } }).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, nickname, friend_code)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'nickname', split_part(new.email, '@', 1)),
    public.generate_friend_code()
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- friendships: a single row per pair, created by the requester as 'pending',
-- flipped to 'accepted' by the addressee. Either side can delete the row to
-- cancel a request, decline it, or unfriend.
-- ---------------------------------------------------------------------------
create table if not exists public.friendships (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references auth.users (id) on delete cascade,
  addressee_id uuid not null references auth.users (id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted')),
  created_at timestamptz not null default now(),
  responded_at timestamptz,
  constraint friendships_not_self check (requester_id <> addressee_id)
);

create unique index if not exists friendships_pair_idx on public.friendships (
  least(requester_id, addressee_id),
  greatest(requester_id, addressee_id)
);

alter table public.friendships enable row level security;

drop policy if exists "Users can read their own friendships" on public.friendships;
create policy "Users can read their own friendships" on public.friendships
  for select using (auth.uid() = requester_id or auth.uid() = addressee_id);

drop policy if exists "Users can send friend requests" on public.friendships;
create policy "Users can send friend requests" on public.friendships
  for insert with check (auth.uid() = requester_id);

drop policy if exists "Addressee can accept a request" on public.friendships;
create policy "Addressee can accept a request" on public.friendships
  for update
  using (auth.uid() = addressee_id and status = 'pending')
  with check (status = 'accepted');

drop policy if exists "Either side can remove a friendship" on public.friendships;
create policy "Either side can remove a friendship" on public.friendships
  for delete using (auth.uid() = requester_id or auth.uid() = addressee_id);

-- Checks whether a and b are accepted friends. security definer so it can be
-- used inside the categories/todos policies below without depending on the
-- caller also being able to see the underlying friendships row directly.
create or replace function public.is_friend(a uuid, b uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.friendships f
    where f.status = 'accepted'
      and ((f.requester_id = a and f.addressee_id = b)
        or (f.requester_id = b and f.addressee_id = a))
  );
$$;

-- ---------------------------------------------------------------------------
-- categories / todos: now owned by a user. Owners can do anything with their
-- own rows; friends can only read.
-- ---------------------------------------------------------------------------
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  color text not null default '#6366f1',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.todos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  category_id uuid references public.categories (id) on delete set null,
  title text not null,
  date date not null,
  completed boolean not null default false,
  created_at timestamptz not null default now()
);

-- If these tables already existed from the previous single-user schema,
-- they have rows with no owner. There's no safe way to attribute old rows
-- to a user, so clear them before adding the NOT NULL user_id column below.
-- Comment this out if you don't want to lose existing data.
do $$
begin
  if to_regclass('public.todos') is not null and to_regclass('public.categories') is not null then
    truncate table public.todos, public.categories;
  elsif to_regclass('public.todos') is not null then
    truncate table public.todos;
  elsif to_regclass('public.categories') is not null then
    truncate table public.categories;
  end if;
end $$;

alter table public.categories add column if not exists user_id uuid references auth.users (id) on delete cascade;
alter table public.categories alter column user_id set not null;
alter table public.categories alter column user_id set default auth.uid();

alter table public.todos add column if not exists user_id uuid references auth.users (id) on delete cascade;
alter table public.todos alter column user_id set not null;
alter table public.todos alter column user_id set default auth.uid();

create index if not exists categories_user_id_idx on public.categories (user_id);
create index if not exists todos_date_idx on public.todos (date);
create index if not exists todos_category_id_idx on public.todos (category_id);
create index if not exists todos_user_id_idx on public.todos (user_id);

alter table public.categories enable row level security;
alter table public.todos enable row level security;

drop policy if exists "Allow all access to categories" on public.categories;
drop policy if exists "Owners manage categories, friends can read" on public.categories;
create policy "Owners manage categories, friends can read" on public.categories
  for select using (user_id = auth.uid() or public.is_friend(auth.uid(), user_id));

drop policy if exists "Owners insert categories" on public.categories;
create policy "Owners insert categories" on public.categories
  for insert with check (user_id = auth.uid());

drop policy if exists "Owners update categories" on public.categories;
create policy "Owners update categories" on public.categories
  for update using (user_id = auth.uid());

drop policy if exists "Owners delete categories" on public.categories;
create policy "Owners delete categories" on public.categories
  for delete using (user_id = auth.uid());

drop policy if exists "Allow all access to todos" on public.todos;
drop policy if exists "Owners read own todos, friends can read" on public.todos;
create policy "Owners read own todos, friends can read" on public.todos
  for select using (user_id = auth.uid() or public.is_friend(auth.uid(), user_id));

drop policy if exists "Owners insert todos" on public.todos;
create policy "Owners insert todos" on public.todos
  for insert with check (user_id = auth.uid());

drop policy if exists "Owners update todos" on public.todos;
create policy "Owners update todos" on public.todos
  for update using (user_id = auth.uid());

drop policy if exists "Owners delete todos" on public.todos;
create policy "Owners delete todos" on public.todos
  for delete using (user_id = auth.uid());
