-- GCB Care Track - Supabase schema
-- Prototype only. Do NOT insert real customer information.

create extension if not exists pgcrypto;

create table if not exists public.tickets (
  id uuid primary key default gen_random_uuid(),
  ticket_id text unique not null,
  customer_name text not null,
  phone_last4 text,
  issue_type text not null,
  status text not null default 'Pending',
  customer_message text default 'Your complaint has been received and is in the service queue.',
  internal_note text,
  created_at timestamptz not null default now(),
  last_updated timestamptz not null default now(),
  constraint tickets_status_check check (status in ('Pending','Under Review','Assigned to IT','Resolved'))
);

create index if not exists tickets_ticket_id_idx on public.tickets(ticket_id);

-- Keep the public customer page read-only through a safe view.
create or replace view public.customer_ticket_view as
select ticket_id, issue_type, status, customer_message, created_at, last_updated
from public.tickets;

-- Demo policy: anyone can read the safe view for a prototype.
-- For production, replace this with server-side verification and strict RLS.
alter table public.tickets enable row level security;

drop policy if exists "prototype public read" on public.tickets;
create policy "prototype public read"
on public.tickets for select
using (true);

-- Staff writes should be handled through authenticated users.
drop policy if exists "authenticated staff update" on public.tickets;
create policy "authenticated staff update"
on public.tickets for update
to authenticated
using (true)
with check (true);

-- Demo data. Change/remove before any real use.
insert into public.tickets (ticket_id, customer_name, phone_last4, issue_type, status, customer_message, internal_note)
values
('GCB-1001','Demo Customer','1234','USSD failure','Pending','We have received your complaint. A service officer will review it.','Awaiting initial review.'),
('GCB-1002','Demo Customer','5678','Missing OTP','Under Review','Your complaint is currently being reviewed by the support team.','Checking OTP delivery logs.'),
('GCB-1003','Demo Customer','9012','Digital tariff query','Assigned to IT','Your complaint has been assigned to the technical team for investigation.','IT investigation in progress.'),
('GCB-1004','Demo Customer','3456','Mobile banking issue','Resolved','Your complaint has been resolved. Please try the service again.','Resolved and customer-facing message sent.')
on conflict (ticket_id) do nothing;
