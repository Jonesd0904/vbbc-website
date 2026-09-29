-- Contact form backup: every message from /contact is saved here
-- (in addition to the email sent to vbbc@att.net).
-- Visitors can only INSERT; nobody can read it through the website.
-- Read messages in Supabase: Table Editor -> contact_messages.

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null check (char_length(name) <= 200),
  email text not null check (char_length(email) <= 320),
  phone text check (char_length(phone) <= 50),
  message text not null check (char_length(message) <= 5000)
);

alter table public.contact_messages enable row level security;

drop policy if exists "Anyone can submit a contact message" on public.contact_messages;
create policy "Anyone can submit a contact message"
  on public.contact_messages
  for insert
  to anon, authenticated
  with check (true);

-- Read/unread flag for the admin "Messages" tab
alter table public.contact_messages add column if not exists read boolean not null default false;
