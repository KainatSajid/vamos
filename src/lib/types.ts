// ── Vibes ──────────────────────────────────────────────
export type Vibe = "cozy" | "curious" | "fun" | "chill" | "spontaneous";

export const VIBES: Vibe[] = ["cozy", "curious", "fun", "chill", "spontaneous"];

export const VIBE_CLASSES: Record<Vibe, string> = {
  cozy: "vibe-cozy",
  curious: "vibe-curious",
  fun: "vibe-fun",
  chill: "vibe-chill",
  spontaneous: "vibe-spontaneous",
};

// ── Event Visibility ──────────────────────────────────
export type EventVisibility = "public" | "friends" | "circles";

// ── Database Row Types ────────────────────────────────
export interface Profile {
  id: string;
  email: string;
  display_name: string;
  username: string;
  avatar_url?: string;
  created_at: string;
}

export interface Friendship {
  id: string;
  user_id: string;
  friend_id: string;
  status: "pending" | "accepted";
  created_at: string;
  // Joined fields
  friend?: Profile;
}

export interface Circle {
  id: string;
  owner_id: string;
  name: string;
  color: string;
  created_at: string;
  // Computed
  member_count?: number;
}

export interface CircleMember {
  id: string;
  circle_id: string;
  user_id: string;
  added_at: string;
  // Joined
  profile?: Profile;
}

export interface SocialEvent {
  id: string;
  host_id: string;
  title: string;
  description: string;
  location_name: string;
  latitude?: number;
  longitude?: number;
  start_time: string;
  end_time?: string;
  vibe: Vibe;
  visibility: EventVisibility;
  created_at: string;
  // Joined
  host?: Profile;
}

export interface EventCircleVisibility {
  id: string;
  event_id: string;
  circle_id: string;
}

// ── AI Types ──────────────────────────────────────────
export interface Suggestion {
  activity: string;
  reason: string;
  vibe: Vibe;
  details: string;
  url?: string;
  lat?: number;
  lng?: number;
}

export interface AiPreferences {
  vibe: Vibe;
  social: string;
  time: string;
  duration: string;
  aloneOk: string;
}
