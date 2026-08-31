-- NomadShield production schema
-- Idempotent. Apply via SQL editor, Management API, or `supabase db push`.
-- RLS: users can only CRUD their own rows.

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  from_state text,
  target_state text,
  filing_status text,
  annual_income numeric,
  income_types text[] default '{}',
  owns_property_in_from_state boolean default false,
  mailbox_provider text,
  mailbox_address jsonb default '{}'::jsonb,
  plan text default 'free',
  tax_year_start date,
  watch_state text,
  disclaimer_version text,
  concierge_waitlist boolean default false,
  billing_interval text default 'month',
  onboarded boolean default false,
  created_at timestamptz not null default now()
);

create table if not exists public.calculator_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  email text,
  inputs jsonb not null default '{}'::jsonb,
  outputs jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.migrations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  target_state text not null,
  status text not null default 'active',
  started_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.checklist_items (
  id uuid primary key default gen_random_uuid(),
  migration_id uuid not null references public.migrations (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  step_key text not null,
  item_key text not null,
  label text not null,
  status text not null default 'todo',
  metadata jsonb not null default '{}'::jsonb,
  unique (migration_id, step_key, item_key)
);

create table if not exists public.presence_days (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  date date not null,
  bucket text not null check (bucket in ('target', 'former', 'other')),
  former_state text,
  note text,
  evidence_id uuid,
  created_at timestamptz not null default now(),
  unique (user_id, date)
);

create table if not exists public.evidence (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  storage_path text not null,
  file_name text,
  category text not null,
  evidence_date date,
  jurisdiction text,
  amount numeric,
  note text,
  size bigint,
  mime_type text,
  created_at timestamptz not null default now()
);

create table if not exists public.letters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  template_key text not null,
  recipient text,
  subject text,
  body text,
  status text not null default 'not_sent',
  created_at timestamptz not null default now()
);

alter table public.presence_days add column if not exists evidence_id uuid;
alter table public.evidence add column if not exists size bigint;
alter table public.evidence add column if not exists mime_type text;
alter table public.letters add column if not exists subject text;

create index if not exists checklist_items_user_idx on public.checklist_items (user_id);
create index if not exists presence_days_user_idx on public.presence_days (user_id);
create index if not exists evidence_user_idx on public.evidence (user_id);
create index if not exists letters_user_idx on public.letters (user_id);
create index if not exists migrations_user_idx on public.migrations (user_id);
create index if not exists snapshots_user_idx on public.calculator_snapshots (user_id);

alter table public.profiles enable row level security;
alter table public.calculator_snapshots enable row level security;
alter table public.migrations enable row level security;
alter table public.checklist_items enable row level security;
alter table public.presence_days enable row level security;
alter table public.evidence enable row level security;
alter table public.letters enable row level security;

drop policy if exists "profiles_own" on public.profiles;
create policy "profiles_own" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "snapshots_read_own" on public.calculator_snapshots;
create policy "snapshots_read_own" on public.calculator_snapshots
  for select using (auth.uid() = user_id);

drop policy if exists "snapshots_insert" on public.calculator_snapshots;
create policy "snapshots_insert" on public.calculator_snapshots
  for insert with check (user_id is null or auth.uid() = user_id);

drop policy if exists "snapshots_update_own" on public.calculator_snapshots;
create policy "snapshots_update_own" on public.calculator_snapshots
  for update using (auth.uid() = user_id);

drop policy if exists "migrations_own" on public.migrations;
create policy "migrations_own" on public.migrations
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "checklist_own" on public.checklist_items;
create policy "checklist_own" on public.checklist_items
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "presence_own" on public.presence_days;
create policy "presence_own" on public.presence_days
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "evidence_own" on public.evidence;
create policy "evidence_own" on public.evidence
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "letters_own" on public.letters;
create policy "letters_own" on public.letters
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

grant usage on schema public to anon, authenticated, service_role;
grant all on all tables in schema public to postgres, service_role, authenticated;
grant all on all sequences in schema public to postgres, service_role, authenticated;
grant select, insert on public.calculator_snapshots to anon;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'evidence',
  'evidence',
  false,
  52428800,
  null
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit;

drop policy if exists "evidence_storage_own" on storage.objects;
create policy "evidence_storage_own"
  on storage.objects for all
  using (bucket_id = 'evidence' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'evidence' and (storage.foldername(name))[1] = auth.uid()::text);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.delete_own_account()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;
  delete from auth.users where id = auth.uid();
end;
$$;

revoke all on function public.delete_own_account() from public;
grant execute on function public.delete_own_account() to authenticated;
