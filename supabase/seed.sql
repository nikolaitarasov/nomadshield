-- Demo seed for a local Supabase project.
-- Email: demo@nomadshield.app
-- Password: Demo1234!
-- UUID: 11111111-1111-4111-8111-111111111111
--
-- The Next.js app ALSO seeds this user in browser localStorage (no Supabase required).

insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change
)
values (
  '00000000-0000-0000-0000-000000000000',
  '11111111-1111-4111-8111-111111111111',
  'authenticated',
  'authenticated',
  'demo@nomadshield.app',
  crypt('Demo1234!', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Alex Rivera"}',
  now(),
  now(),
  '',
  '',
  '',
  ''
)
on conflict (id) do nothing;

insert into public.profiles (
  id, full_name, from_state, target_state, filing_status, annual_income, income_types,
  owns_property_in_from_state, mailbox_provider, mailbox_address, plan, tax_year_start,
  watch_state, disclaimer_version, onboarded
) values (
  '11111111-1111-4111-8111-111111111111',
  'Alex Rivera',
  'CA',
  'FL',
  'single',
  180000,
  array['w2'],
  false,
  'anytime_mailbox',
  '{"path":"connect","provider":"anytime_mailbox","street":"1001 Brickell Bay Dr","unit":"PMB 220","city":"Miami","state":"FL","zip":"33131","mailboxId":"AM-88421","form1583":"complete","inboundAlias":"mail+11111111@inbound.nomadshield.app"}'::jsonb,
  'shield',
  '2026-01-01',
  'NY',
  '2026-03-01',
  true
)
on conflict (id) do update set
  full_name = excluded.full_name,
  from_state = excluded.from_state,
  target_state = excluded.target_state,
  annual_income = excluded.annual_income,
  plan = excluded.plan;

insert into public.migrations (id, user_id, target_state, status, started_at)
values (
  '22222222-2222-4222-8222-222222222222',
  '11111111-1111-4111-8111-111111111111',
  'FL',
  'active',
  '2026-02-18T15:04:00Z'
)
on conflict (id) do nothing;

insert into public.presence_days (user_id, date, bucket, former_state, note)
select
  '11111111-1111-4111-8111-111111111111',
  d::date,
  'former',
  'CA',
  'Still in CA'
from generate_series('2026-01-01'::date, '2026-01-20'::date, '1 day') d
on conflict (user_id, date) do nothing;

insert into public.presence_days (user_id, date, bucket, former_state, note)
select '11111111-1111-4111-8111-111111111111', d::date, 'former', 'CA', 'Still in CA'
from generate_series('2026-02-01'::date, '2026-02-10'::date, '1 day') d
on conflict (user_id, date) do nothing;

insert into public.presence_days (user_id, date, bucket, former_state, note)
select '11111111-1111-4111-8111-111111111111', d::date, 'former', 'CA', 'Still in CA'
from generate_series('2026-03-15'::date, '2026-03-25'::date, '1 day') d
on conflict (user_id, date) do nothing;

insert into public.presence_days (user_id, date, bucket, former_state, note)
select '11111111-1111-4111-8111-111111111111', d::date, 'target', null, 'Florida trip'
from generate_series('2026-04-10'::date, '2026-04-16'::date, '1 day') d
on conflict (user_id, date) do nothing;

insert into public.presence_days (user_id, date, bucket, former_state, note)
select '11111111-1111-4111-8111-111111111111', d::date, 'target', null, 'Florida trip'
from generate_series('2026-06-01'::date, '2026-06-07'::date, '1 day') d
on conflict (user_id, date) do nothing;

insert into public.presence_days (user_id, date, bucket, former_state, note)
select '11111111-1111-4111-8111-111111111111', d::date, 'other', null, 'Travel / other'
from generate_series('2026-05-20'::date, '2026-05-24'::date, '1 day') d
on conflict (user_id, date) do nothing;

insert into public.evidence (user_id, storage_path, file_name, category, evidence_date, jurisdiction, amount, note)
values
  ('11111111-1111-4111-8111-111111111111', '11111111-1111-4111-8111-111111111111/hotel-miami-april.pdf', 'hotel-miami-april.pdf', 'lodging', '2026-04-10', 'FL', 1284, '7 nights, Brickell'),
  ('11111111-1111-4111-8111-111111111111', '11111111-1111-4111-8111-111111111111/boarding-pass-lax-mia.pdf', 'boarding-pass-lax-mia.pdf', 'travel', '2026-04-10', 'CA', 312, 'LAX → MIA'),
  ('11111111-1111-4111-8111-111111111111', '11111111-1111-4111-8111-111111111111/flhsmv-appointment.txt', 'flhsmv-appointment.txt', 'dl', '2026-04-14', 'FL', null, 'Appointment window'),
  ('11111111-1111-4111-8111-111111111111', '11111111-1111-4111-8111-111111111111/anytime-mailbox-1583.pdf', 'anytime-mailbox-1583.pdf', 'mail', '2026-02-20', 'FL', 0, 'Form 1583 complete'),
  ('11111111-1111-4111-8111-111111111111', '11111111-1111-4111-8111-111111111111/equinox-cancel-receipt.pdf', 'equinox-cancel-receipt.pdf', 'gym', '2026-03-01', 'CA', 0, 'SF Equinox cancellation'),
  ('11111111-1111-4111-8111-111111111111', '11111111-1111-4111-8111-111111111111/declaration-draft.pdf', 'declaration-draft.pdf', 'declarations', '2026-04-16', 'FL', null, 'Ready-to-sign draft — not filed');

insert into public.letters (user_id, template_key, recipient, body, status, created_at)
values (
  '11111111-1111-4111-8111-111111111111',
  'voter_cancel',
  'County board of elections / registrar',
  $letter$Alex Rivera
1001 Brickell Bay Dr, PMB 220
Miami, FL 33131
demo@nomadshield.app

March 4, 2026

County board of elections / registrar

Re: Cancellation of voter registration — California

I, Alex Rivera, request that you cancel my voter registration in California. I have changed my domicile to Florida and will register to vote there.

This letter is a records notice. It is not a legal opinion.

Sincerely,
Alex Rivera
$letter$,
  'sent',
  '2026-03-04T14:22:00Z'
);
