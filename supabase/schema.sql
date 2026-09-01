-- Fast Nights — shared schedule.
--
-- Run this once in the Supabase SQL editor (same project as the closet).
-- The whole schedule is one row: eleven nights is a few hundred bytes, so
-- there is nothing to gain from a row per night, and a single row makes a
-- save atomic — no half-written schedule if a request dies midway.

create table if not exists public.fast_nights (
  id      text   primary key,
  data    jsonb  not null default '{}'::jsonb,
  updated bigint not null default 0
);

alter table public.fast_nights enable row level security;

-- The page ships a publishable key, so these policies describe what anyone
-- who finds the URL can do: read and rewrite this one table. That is the
-- same posture as closet_items. It is fine for a movie schedule — there is
-- nothing here worth stealing — but it is not privacy, and a stranger who
-- had the URL could scramble the dates. Nothing else in the project is
-- reachable with this key beyond what its own policies already allow.
drop policy if exists "fast_nights read"   on public.fast_nights;
drop policy if exists "fast_nights insert" on public.fast_nights;
drop policy if exists "fast_nights update" on public.fast_nights;

create policy "fast_nights read"   on public.fast_nights for select using (true);
create policy "fast_nights insert" on public.fast_nights for insert with check (true);
create policy "fast_nights update" on public.fast_nights for update using (true) with check (true);

-- Night 01 was watched on the 29th; everything else is still open.
insert into public.fast_nights (id, data, updated)
values ('main', '{"nights":{"1":{"d":"2026-08-29","t":"19:30"}}}'::jsonb, 0)
on conflict (id) do nothing;
