-- ╔══════════════════════════════════════════════════════════╗
-- ║  ¡Vamos! — Supabase Schema                              ║
-- ║  Run this in the Supabase SQL Editor                     ║
-- ╚══════════════════════════════════════════════════════════╝

-- ── Extensions ────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ── Profiles ──────────────────────────────────────────────
-- Auto-created from auth.users via trigger
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null,
  display_name text not null default '',
  username    text unique not null,
  avatar_url  text,
  created_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Anyone can read profiles (needed to search for friends)
create policy "Profiles are viewable by everyone"
  on public.profiles for select using (true);

-- Users can only update their own profile
create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- Allow inserts from trigger (service role) and the user themselves
create policy "Users can insert own profile"
  on public.profiles for insert with check (auth.uid() = id);

-- ── Auto-create profile on signup ─────────────────────────
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, display_name, username)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    coalesce(
      new.raw_user_meta_data->>'username',
      lower(replace(split_part(new.email, '@', 1), '.', '_')) || '_' || substr(new.id::text, 1, 4)
    )
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ── Friendships ───────────────────────────────────────────
-- Bidirectional: user_id sends request, friend_id receives
create table public.friendships (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  friend_id  uuid not null references public.profiles(id) on delete cascade,
  status     text not null default 'pending' check (status in ('pending', 'accepted')),
  created_at timestamptz not null default now(),
  unique(user_id, friend_id)
);

alter table public.friendships enable row level security;

-- Both parties can see the friendship
create policy "Users can see own friendships"
  on public.friendships for select
  using (auth.uid() = user_id or auth.uid() = friend_id);

-- Anyone can send a friend request
create policy "Users can create friend requests"
  on public.friendships for insert
  with check (auth.uid() = user_id);

-- The receiver can accept (update status)
create policy "Receiver can accept friendship"
  on public.friendships for update
  using (auth.uid() = friend_id);

-- Either party can delete
create policy "Either party can remove friendship"
  on public.friendships for delete
  using (auth.uid() = user_id or auth.uid() = friend_id);


-- ── Circles ───────────────────────────────────────────────
create table public.circles (
  id        uuid primary key default uuid_generate_v4(),
  owner_id  uuid not null references public.profiles(id) on delete cascade,
  name      text not null,
  color     text not null default '#E86B8B',
  created_at timestamptz not null default now()
);

alter table public.circles enable row level security;

-- Owner can do everything
create policy "Owner can manage circles"
  on public.circles for all using (auth.uid() = owner_id);

-- Members can see circles they belong to (via circle_members)
create policy "Members can view circles they belong to"
  on public.circles for select
  using (
    id in (
      select circle_id from public.circle_members where user_id = auth.uid()
    )
  );


-- ── Circle Members ────────────────────────────────────────
create table public.circle_members (
  id        uuid primary key default uuid_generate_v4(),
  circle_id uuid not null references public.circles(id) on delete cascade,
  user_id   uuid not null references public.profiles(id) on delete cascade,
  added_at  timestamptz not null default now(),
  unique(circle_id, user_id)
);

alter table public.circle_members enable row level security;

-- Circle owner can manage members
create policy "Circle owner can manage members"
  on public.circle_members for all
  using (
    circle_id in (select id from public.circles where owner_id = auth.uid())
  );

-- Users can see their own memberships
create policy "Users can see own memberships"
  on public.circle_members for select
  using (user_id = auth.uid());


-- ── Events ────────────────────────────────────────────────
create table public.events (
  id            uuid primary key default uuid_generate_v4(),
  host_id       uuid not null references public.profiles(id) on delete cascade,
  title         text not null,
  description   text not null default '',
  location_name text not null,
  latitude      double precision,
  longitude     double precision,
  start_time    timestamptz not null,
  end_time      timestamptz,
  vibe          text not null default 'chill' check (vibe in ('cozy','curious','fun','chill','spontaneous')),
  visibility    text not null default 'public' check (visibility in ('public','friends','circles')),
  created_at    timestamptz not null default now()
);

alter table public.events enable row level security;

-- Host can do everything with their own events
create policy "Host can manage own events"
  on public.events for all using (auth.uid() = host_id);

-- Public events are visible to all authenticated users
create policy "Public events are visible to all"
  on public.events for select
  using (visibility = 'public');

-- Friends-only events visible to accepted friends
create policy "Friends events visible to friends"
  on public.events for select
  using (
    visibility = 'friends'
    and (
      host_id in (
        select friend_id from public.friendships
        where user_id = auth.uid() and status = 'accepted'
        union
        select user_id from public.friendships
        where friend_id = auth.uid() and status = 'accepted'
      )
    )
  );

-- Circle events visible to members of the selected circles
create policy "Circle events visible to circle members"
  on public.events for select
  using (
    visibility = 'circles'
    and id in (
      select ecv.event_id
      from public.event_circle_visibility ecv
      join public.circle_members cm on cm.circle_id = ecv.circle_id
      where cm.user_id = auth.uid()
    )
  );


-- ── Event Circle Visibility ──────────────────────────────
-- Junction table: which circles can see a circle-scoped event
create table public.event_circle_visibility (
  id        uuid primary key default uuid_generate_v4(),
  event_id  uuid not null references public.events(id) on delete cascade,
  circle_id uuid not null references public.circles(id) on delete cascade,
  unique(event_id, circle_id)
);

alter table public.event_circle_visibility enable row level security;

-- Event host can manage visibility
create policy "Event host can manage circle visibility"
  on public.event_circle_visibility for all
  using (
    event_id in (select id from public.events where host_id = auth.uid())
  );

-- Circle members can see the mapping (needed for the event query)
create policy "Circle members can read visibility"
  on public.event_circle_visibility for select
  using (
    circle_id in (
      select circle_id from public.circle_members where user_id = auth.uid()
    )
  );


-- ── Indexes ───────────────────────────────────────────────
create index idx_events_host on public.events(host_id);
create index idx_events_visibility on public.events(visibility);
create index idx_events_start_time on public.events(start_time);
create index idx_friendships_user on public.friendships(user_id);
create index idx_friendships_friend on public.friendships(friend_id);
create index idx_circle_members_circle on public.circle_members(circle_id);
create index idx_circle_members_user on public.circle_members(user_id);
create index idx_ecv_event on public.event_circle_visibility(event_id);
create index idx_ecv_circle on public.event_circle_visibility(circle_id);
