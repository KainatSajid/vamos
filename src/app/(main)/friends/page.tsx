"use client";

import { useState, useEffect, useCallback } from "react";
import {
  UserPlus,
  Search,
  Check,
  X,
  Clock,
  Loader2,
  Users,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types";

interface FriendshipRow {
  id: string;
  user_id: string;
  friend_id: string;
  status: "pending" | "accepted";
  friend?: Profile;
  requester?: Profile;
}

export default function FriendsPage() {
  const supabase = createClient();
  const [friends, setFriends] = useState<(Profile & { friendshipId: string })[]>([]);
  const [pendingReceived, setPendingReceived] = useState<(Profile & { friendshipId: string })[]>([]);
  const [pendingSent, setPendingSent] = useState<(Profile & { friendshipId: string })[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState<Profile | null>(null);
  const [searchError, setSearchError] = useState("");
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>("");

  const load = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    setCurrentUserId(user.id);

    const { data: allFriendships } = await supabase
      .from("friendships")
      .select(
        "*, friend:profiles!friendships_friend_id_fkey(*), requester:profiles!friendships_user_id_fkey(*)"
      )
      .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`);

    const accepted: (Profile & { friendshipId: string })[] = [];
    const received: (Profile & { friendshipId: string })[] = [];
    const sent: (Profile & { friendshipId: string })[] = [];

    (allFriendships || []).forEach((f: any) => {
      if (f.status === "accepted") {
        const profile = f.user_id === user.id ? f.friend : f.requester;
        if (profile) accepted.push({ ...profile, friendshipId: f.id });
      } else if (f.friend_id === user.id) {
        // I received this request
        if (f.requester)
          received.push({ ...f.requester, friendshipId: f.id });
      } else {
        // I sent this request
        if (f.friend) sent.push({ ...f.friend, friendshipId: f.id });
      }
    });

    setFriends(accepted);
    setPendingReceived(received);
    setPendingSent(sent);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    load();
  }, [load]);

  const searchUser = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    setSearchError("");
    setSearchResult(null);

    const query = searchQuery.trim().toLowerCase();
    const isEmail = query.includes("@");

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq(isEmail ? "email" : "username", query)
      .single();

    if (!data) {
      setSearchError("No user found with that " + (isEmail ? "email" : "username"));
    } else if (data.id === currentUserId) {
      setSearchError("That's you!");
    } else if (friends.some((f) => f.id === data.id)) {
      setSearchError("Already friends!");
    } else if (pendingSent.some((f) => f.id === data.id)) {
      setSearchError("Request already sent");
    } else {
      setSearchResult(data);
    }
    setSearching(false);
  };

  const sendRequest = async (friendId: string) => {
    await supabase.from("friendships").insert({
      user_id: currentUserId,
      friend_id: friendId,
    });
    setSearchResult(null);
    setSearchQuery("");
    load();
  };

  const acceptRequest = async (friendshipId: string) => {
    await supabase
      .from("friendships")
      .update({ status: "accepted" })
      .eq("id", friendshipId);
    load();
  };

  const removeFriend = async (friendshipId: string) => {
    await supabase.from("friendships").delete().eq("id", friendshipId);
    load();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-charcoal-300" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-10 pb-20 animate-fade-in">
      <header>
        <h1 className="headline text-4xl mb-2">Friends</h1>
        <p className="text-charcoal-400 font-medium">
          Add friends by email or username. Build your circles from here.
        </p>
      </header>

      {/* Search / Add */}
      <div className="card p-7 space-y-4">
        <h3 className="font-serif text-lg text-charcoal-700">Add a friend</h3>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-300" />
            <input
              className="input-warm pl-11"
              placeholder="Email or username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && searchUser()}
            />
          </div>
          <button
            onClick={searchUser}
            disabled={searching || !searchQuery.trim()}
            className="btn-brand px-5 py-3 text-sm disabled:opacity-50"
          >
            {searching ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Search"
            )}
          </button>
        </div>

        {searchError && (
          <p className="text-sm text-charcoal-400 px-1">{searchError}</p>
        )}

        {searchResult && (
          <div className="flex items-center justify-between p-4 bg-cream-200/30 rounded-xl animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-charcoal-700 flex items-center justify-center text-cream-50 text-xs font-bold">
                {searchResult.display_name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)}
              </div>
              <div>
                <p className="font-semibold text-charcoal-700 text-sm">
                  {searchResult.display_name}
                </p>
                <p className="text-xs text-charcoal-400">
                  @{searchResult.username}
                </p>
              </div>
            </div>
            <button
              onClick={() => sendRequest(searchResult.id)}
              className="btn-brand px-4 py-2 text-xs flex items-center gap-1.5"
            >
              <UserPlus className="w-3.5 h-3.5" />
              Add
            </button>
          </div>
        )}
      </div>

      {/* Pending received */}
      {pendingReceived.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-serif text-lg text-charcoal-700">
            Friend Requests
          </h3>
          {pendingReceived.map((p) => (
            <div
              key={p.id}
              className="card p-5 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 text-xs font-bold">
                  {p.display_name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)}
                </div>
                <div>
                  <p className="font-semibold text-charcoal-700 text-sm">
                    {p.display_name}
                  </p>
                  <p className="text-xs text-charcoal-400">@{p.username}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => acceptRequest(p.friendshipId)}
                  className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={() => removeFriend(p.friendshipId)}
                  className="p-2 rounded-lg bg-cream-200/50 text-charcoal-400 hover:bg-coral-50 hover:text-coral-400 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pending sent */}
      {pendingSent.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-serif text-lg text-charcoal-700">Pending</h3>
          {pendingSent.map((p) => (
            <div
              key={p.id}
              className="card p-5 flex items-center justify-between opacity-70"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-cream-200 flex items-center justify-center text-charcoal-400 text-xs font-bold">
                  {p.display_name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)}
                </div>
                <div>
                  <p className="font-semibold text-charcoal-600 text-sm">
                    {p.display_name}
                  </p>
                  <p className="text-xs text-charcoal-400">@{p.username}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-charcoal-300 font-medium">
                <Clock className="w-3 h-3" />
                Pending
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Friends list */}
      <div className="space-y-3">
        <h3 className="font-serif text-lg text-charcoal-700">
          Your Friends ({friends.length})
        </h3>
        {friends.length === 0 ? (
          <div className="card text-center py-12">
            <Users className="w-10 h-10 text-charcoal-200 mx-auto mb-4" />
            <p className="text-charcoal-400 font-medium">No friends yet</p>
            <p className="text-charcoal-300 text-sm mt-1">
              Search by email or username above to add friends.
            </p>
          </div>
        ) : (
          friends.map((f) => (
            <div
              key={f.id}
              className="card p-5 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-charcoal-700 flex items-center justify-center text-cream-50 text-xs font-bold">
                  {f.display_name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)}
                </div>
                <div>
                  <p className="font-semibold text-charcoal-700 text-sm">
                    {f.display_name}
                  </p>
                  <p className="text-xs text-charcoal-400">@{f.username}</p>
                </div>
              </div>
              <button
                onClick={() => removeFriend(f.friendshipId)}
                className="p-2 rounded-lg text-charcoal-300 hover:bg-coral-50 hover:text-coral-400 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
