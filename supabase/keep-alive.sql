-- Keep-alive for the free Supabase project (prevents auto-pause).
-- Called daily by Vercel Cron via /api/keep-alive.

create table if not exists public.keep_alive (
  id int primary key default 1,
  pinged_at timestamptz not null default now(),
  ping_count bigint not null default 0,
  constraint keep_alive_single_row check (id = 1)
);

insert into public.keep_alive (id) values (1) on conflict (id) do nothing;

alter table public.keep_alive enable row level security;
-- No policies on the table itself: nobody writes it directly.
-- The function below runs as its owner and does the write.

create or replace function public.keep_alive_ping()
returns timestamptz
language sql
security definer
set search_path = public
as $$
  update public.keep_alive
     set pinged_at = now(), ping_count = ping_count + 1
   where id = 1
  returning pinged_at;
$$;

revoke all on function public.keep_alive_ping() from public;
grant execute on function public.keep_alive_ping() to anon, authenticated;
