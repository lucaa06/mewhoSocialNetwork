-- ─── Conversations (chat threads) ────────────────────────────────────────────
create table if not exists public.conversations (
  id              uuid primary key default gen_random_uuid(),
  theme           text not null default 'default',
  last_message_at timestamptz not null default now(),
  created_at      timestamptz not null default now()
);

-- ─── Conversation members ────────────────────────────────────────────────────
create table if not exists public.conversation_members (
  conversation_id uuid references public.conversations(id) on delete cascade,
  user_id         uuid references public.profiles(id) on delete cascade,
  last_read_at    timestamptz default now(),
  joined_at       timestamptz default now(),
  primary key (conversation_id, user_id)
);

-- ─── Messages (E2E encrypted) ────────────────────────────────────────────────
create table if not exists public.messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id       uuid not null references public.profiles(id) on delete cascade,
  ciphertext      text not null,
  iv              text not null,
  is_deleted      boolean not null default false,
  created_at      timestamptz not null default now()
);

-- ─── User public keys (for E2E encryption) ───────────────────────────────────
create table if not exists public.user_public_keys (
  user_id        uuid primary key references public.profiles(id) on delete cascade,
  public_key_jwk jsonb not null,
  updated_at     timestamptz not null default now()
);

-- ─── Indexes ─────────────────────────────────────────────────────────────────
create index if not exists idx_conversation_members_user on public.conversation_members(user_id);
create index if not exists idx_messages_conversation on public.messages(conversation_id, created_at);
create index if not exists idx_messages_sender on public.messages(sender_id);

-- ─── RLS ─────────────────────────────────────────────────────────────────────
alter table public.conversations         enable row level security;
alter table public.conversation_members  enable row level security;
alter table public.messages              enable row level security;
alter table public.user_public_keys      enable row level security;

-- conversations: visible only to members
create policy "members can view conversation"
  on public.conversations for select
  using (
    exists (
      select 1 from public.conversation_members
      where conversation_id = conversations.id
        and user_id = auth.uid()
    )
  );

create policy "members can insert conversation"
  on public.conversations for insert
  with check (true);

create policy "members can update theme"
  on public.conversations for update
  using (
    exists (
      select 1 from public.conversation_members
      where conversation_id = conversations.id
        and user_id = auth.uid()
    )
  );

-- conversation_members: only members can see their conversations
create policy "view own memberships"
  on public.conversation_members for select
  using (
    user_id = auth.uid()
    or exists (
      select 1 from public.conversation_members cm2
      where cm2.conversation_id = conversation_members.conversation_id
        and cm2.user_id = auth.uid()
    )
  );

create policy "insert own membership"
  on public.conversation_members for insert
  with check (true);

create policy "update own last_read"
  on public.conversation_members for update
  using (user_id = auth.uid());

-- messages: only conversation members can read/write
create policy "members can read messages"
  on public.messages for select
  using (
    exists (
      select 1 from public.conversation_members
      where conversation_id = messages.conversation_id
        and user_id = auth.uid()
    )
  );

create policy "members can send messages"
  on public.messages for insert
  with check (
    sender_id = auth.uid()
    and exists (
      select 1 from public.conversation_members
      where conversation_id = messages.conversation_id
        and user_id = auth.uid()
    )
  );

create policy "sender can soft-delete"
  on public.messages for update
  using (sender_id = auth.uid());

-- user_public_keys: readable by all authenticated, writable only by owner
create policy "anyone can read public keys"
  on public.user_public_keys for select
  using (auth.uid() is not null);

create policy "owner can upsert own key"
  on public.user_public_keys for insert
  with check (user_id = auth.uid());

create policy "owner can update own key"
  on public.user_public_keys for update
  using (user_id = auth.uid());

-- ─── Trigger: update last_message_at on new message ─────────────────────────
create or replace function public.update_conversation_last_message()
returns trigger language plpgsql security definer as $$
begin
  update public.conversations
  set last_message_at = new.created_at
  where id = new.conversation_id;
  return new;
end;
$$;

drop trigger if exists on_new_message on public.messages;
create trigger on_new_message
  after insert on public.messages
  for each row execute function public.update_conversation_last_message();

-- ─── Enable realtime for messages ────────────────────────────────────────────
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.conversations;
