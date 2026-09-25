-- Run in the Supabase SQL editor before configuring environment variables.
create table if not exists public.price_workspaces (
  owner_id uuid primary key references auth.users(id) on delete cascade,
  content jsonb not null default '{"suppliers":[],"tariffs":[],"items":[],"lines":[]}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.price_workspaces enable row level security;
grant usage on schema public to authenticated;
grant select, insert, update on public.price_workspaces to authenticated;
create policy "Owner reads own prices" on public.price_workspaces for select to authenticated using (auth.uid() = owner_id);
create policy "Owner inserts own prices" on public.price_workspaces for insert to authenticated with check (auth.uid() = owner_id);
create policy "Owner updates own prices" on public.price_workspaces for update to authenticated using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
