-- Billing entitlements. Idempotent.
-- State machine lives in lib/entitlements.ts; this file only stores its output.
--
-- 1. public.purchases: one row per Stripe purchase (subscription id for Shield, payment intent or
--    checkout session id for the Kit). Written only by the server (service role) from the Stripe
--    webhook / verified checkout sessions. Users may read their own rows.
-- 2. profiles.plan / billing_interval become server-owned: a trigger pins them for any
--    browser (anon / authenticated JWT) write, so the paywall cannot be flipped from devtools.

create table if not exists public.purchases (
  id text primary key,
  user_id uuid references auth.users (id) on delete set null,
  email text,
  product text not null check (product in ('kit', 'shield')),
  billing_interval text not null default 'month' check (billing_interval in ('month', 'year')),
  status text not null check (status in ('pending', 'active', 'past_due', 'canceled', 'failed', 'refunded')),
  checkout_session_id text,
  stripe_customer_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists purchases_user_idx on public.purchases (user_id);
create index if not exists purchases_unclaimed_email_idx on public.purchases (lower(email)) where user_id is null;
create index if not exists purchases_checkout_session_idx on public.purchases (checkout_session_id);

alter table public.purchases enable row level security;

drop policy if exists "purchases_read_own" on public.purchases;
create policy "purchases_read_own" on public.purchases
  for select using (auth.uid() = user_id);

revoke all on public.purchases from anon, authenticated;
grant select on public.purchases to authenticated;
grant all on public.purchases to service_role;

create or replace function public.guard_profile_billing()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  -- Requests made with a user's JWT can never change billing columns.
  -- Service role (webhook / server routes) and direct SQL are unaffected.
  if coalesce(auth.role(), '') in ('anon', 'authenticated') then
    if tg_op = 'INSERT' then
      new.plan := 'free';
      new.billing_interval := 'month';
    else
      new.plan := old.plan;
      new.billing_interval := old.billing_interval;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists guard_profile_billing on public.profiles;
create trigger guard_profile_billing
  before insert or update on public.profiles
  for each row execute function public.guard_profile_billing();
