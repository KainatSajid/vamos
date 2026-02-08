# ¡Vamos! — Spontaneous Connection

A social presence app where events are broadcast to your circles, not posted for the world. Powered by Gemini for AI-driven venue discovery and event sanity checks.

## Architecture

- **Next.js 14** (App Router) deployed on **Vercel**
- **Supabase** — Auth (email/password) + Postgres + Row Level Security
- **Gemini API** — Server-side AI for venue inspiration and event vibe checks
- **Tailwind CSS** — Warm editorial design system (DM Serif Display + Plus Jakarta Sans)

## Setup

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Go to the **SQL Editor** and paste the contents of `supabase/schema.sql`
3. Run the SQL to create all tables, RLS policies, and triggers
4. In **Settings > API**, copy your Project URL and anon key

### 2. Get a Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com)
2. Create an API key
3. This key stays server-side only (never exposed to the browser)

### 3. Configure Environment Variables

Copy the example env file and fill in your keys:

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
GEMINI_API_KEY=your-gemini-key
```

### 4. Install & Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 5. Deploy to Vercel

```bash
npx vercel
```

Add the same environment variables in your Vercel project settings.

## Database Schema

| Table | Purpose |
|-------|---------|
| `profiles` | User profiles (auto-created on signup via trigger) |
| `friendships` | Bidirectional friend requests with pending/accepted status |
| `circles` | User-created groups from their friend list |
| `circle_members` | Which friends are in which circles |
| `events` | Events with title, location, vibe, and visibility tier |
| `event_circle_visibility` | Which circles can see a circle-scoped event |

### Event Visibility Model

- **Public** — All authenticated users see it
- **Friends** — Only accepted friends of the host see it
- **Circles** — Only members of selected circles see it

All enforced via Supabase Row Level Security at the database level.

## Project Structure

```
src/
  app/
    (auth)/login, signup     — Auth pages
    (main)/                  — Authenticated app
      home/                  — Event feed + circles sidebar
      events/new/            — Create event (AI finder + manual)
      events/[id]/           — Event detail
      circles/               — Manage circles
      friends/               — Friend list + add friends
      settings/              — Profile settings
    api/ai/                  — Server-side Gemini routes
      inspire/               — AI venue suggestions
      sanity-check/          — Event vibe check
  components/
    layout/                  — Sidebar, Logo
    events/                  — EventCard, VibeBadge, VisibilityPicker
  lib/
    supabase/                — Client + server Supabase setup
    types.ts                 — All TypeScript types
  middleware.ts              — Auth session refresh + route protection
```

## Design System

Built around a warm, editorial aesthetic inspired by magazine layouts:

- **Cream backgrounds** (`#FDF6EE`) instead of cold white
- **Coral-rose** (`#E86B8B`) and **warm amber** (`#E8A817`) as brand accents
- **Warm charcoal** (`#2C2421`) instead of cold gray/black
- **DM Serif Display** for headlines, **Plus Jakarta Sans** for everything else
- Soft warm shadows, generous rounded corners, subtle gradient accents

## AI Features

1. **AI Event Finder** — Select a vibe + time preference, Gemini suggests real nearby venues with map coordinates
2. **Vibe Check** — Before sharing an event, Gemini verifies the venue exists, checks if it's typically open at that time, and flags weather concerns
