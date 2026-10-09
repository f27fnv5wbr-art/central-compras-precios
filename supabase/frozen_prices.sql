-- Frozen price module: separate from the general price workspace.
create table if not exists public.frozen_price_workspaces (
 owner_id uuid primary key references auth.users(id) on delete cascade,
 content jsonb not null default '[]'::jsonb,
 updated_at timestamptz not null default now()
);
alter table public.frozen_price_workspaces enable row level security;
grant select,insert,update on public.frozen_price_workspaces to authenticated;
create policy "Frozen owner select" on public.frozen_price_workspaces for select to authenticated using (auth.uid()=owner_id);
create policy "Frozen owner insert" on public.frozen_price_workspaces for insert to authenticated with check (auth.uid()=owner_id);
create policy "Frozen owner update" on public.frozen_price_workspaces for update to authenticated using (auth.uid()=owner_id) with check (auth.uid()=owner_id);
