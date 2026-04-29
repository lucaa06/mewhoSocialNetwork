-- ── Connections (Tinder-style match / collegamento) ─────────────────────────

create type connection_status as enum ('pending', 'accepted', 'rejected', 'skipped');

create table if not exists connections (
  id          uuid primary key default gen_random_uuid(),
  sender_id   uuid not null references profiles(id) on delete cascade,
  receiver_id uuid not null references profiles(id) on delete cascade,
  status      connection_status not null default 'pending',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint no_self_connect check (sender_id <> receiver_id),
  constraint unique_pair unique (sender_id, receiver_id)
);

create index idx_connections_sender   on connections(sender_id);
create index idx_connections_receiver on connections(receiver_id);
create index idx_connections_status   on connections(status);

-- RLS
alter table connections enable row level security;

-- A user can see their own connections (sent or received)
create policy "connections_select" on connections
  for select using (auth.uid() = sender_id or auth.uid() = receiver_id);

-- A user can insert a connection they send
create policy "connections_insert" on connections
  for insert with check (auth.uid() = sender_id);

-- A user can update connections where they are the receiver (to accept/reject)
-- or the sender (to cancel)
create policy "connections_update" on connections
  for update using (auth.uid() = sender_id or auth.uid() = receiver_id);

-- A user can delete connections they created
create policy "connections_delete" on connections
  for delete using (auth.uid() = sender_id);

-- Auto-accept when reverse pending exists: handled in app layer
-- Trigger to update updated_at
create or replace function touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

create trigger connections_updated_at
  before update on connections
  for each row execute function touch_updated_at();
