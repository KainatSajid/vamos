"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Users,
  Trash2,
  UserPlus,
  X,
  Check,
  Loader2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Circle, Profile, Friendship } from "@/lib/types";

const CIRCLE_COLORS = [
  "#E86B8B",
  "#E8A817",
  "#6B9E78",
  "#7B8EC8",
  "#C17BCB",
  "#CB7B7B",
  "#7BC8B8",
  "#C8B07B",
];

export default function CirclesPage() {
  const supabase = createClient();
  const [circles, setCircles] = useState<(Circle & { members: Profile[] })[]>([]);
  const [friends, setFriends] = useState<Profile[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(CIRCLE_COLORS[0]);
  const [addingTo, setAddingTo] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      // Load circles
      const { data: circleData } = await supabase
        .from("circles")
        .select("*")
        .eq("owner_id", user.id);

      const circlesWithMembers = await Promise.all(
        (circleData || []).map(async (c) => {
          const { data: memberRows } = await supabase
            .from("circle_members")
            .select("user_id")
            .eq("circle_id", c.id);

          const memberIds = (memberRows || []).map((m: any) => m.user_id);
          let members: Profile[] = [];
          if (memberIds.length > 0) {
            const { data: profiles } = await supabase
              .from("profiles")
              .select("*")
              .in("id", memberIds);
            members = profiles || [];
          }

          return { ...c, members };
        })
      );

      setCircles(circlesWithMembers);

      // Load accepted friends
      const { data: friendships } = await supabase
        .from("friendships")
        .select("*")
        .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)
        .eq("status", "accepted");

      const friendIds = (friendships || []).map((f: any) =>
        f.user_id === user.id ? f.friend_id : f.user_id
      );

      let friendProfiles: Profile[] = [];
      if (friendIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("*")
          .in("id", friendIds);
        friendProfiles = profiles || [];
      }

      setFriends(friendProfiles);
    } catch (err) {
      console.error("Failed to load circles:", err);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    load();
  }, [load]);

  const createCircle = async () => {
    if (!newName.trim()) return;
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("circles").insert({
      owner_id: user.id,
      name: newName.trim(),
      color: newColor,
    });

    setNewName("");
    setShowCreate(false);
    load();
  };

  const deleteCircle = async (id: string) => {
    await supabase.from("circles").delete().eq("id", id);
    load();
  };

  const addMember = async (circleId: string, userId: string) => {
    await supabase.from("circle_members").insert({
      circle_id: circleId,
      user_id: userId,
    });
    setAddingTo(null);
    load();
  };

  const removeMember = async (circleId: string, userId: string) => {
    await supabase
      .from("circle_members")
      .delete()
      .eq("circle_id", circleId)
      .eq("user_id", userId);
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
    <div className="max-w-4xl space-y-10 pb-20 animate-fade-in">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="headline text-4xl mb-2">Your Circles</h1>
          <p className="text-charcoal-400 font-medium">
            Create groups from your friends to control who sees what.
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="btn-brand flex items-center gap-2 px-5 py-3 text-sm"
        >
          <Plus className="w-4 h-4" />
          <span>New Circle</span>
        </button>
      </header>

      {/* Create circle form */}
      {showCreate && (
        <div className="card p-8 space-y-5 animate-scale-in">
          <h3 className="font-serif text-xl text-charcoal-700">
            Create Circle
          </h3>
          <input
            autoFocus
            className="input-warm"
            placeholder="Circle name (e.g. Gym Crew)"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && createCircle()}
          />
          <div>
            <label className="label-caps block mb-3">Color</label>
            <div className="flex gap-2">
              {CIRCLE_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setNewColor(c)}
                  className={`w-8 h-8 rounded-full transition-all ${
                    newColor === c ? "ring-2 ring-offset-2 ring-charcoal-400 scale-110" : ""
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={createCircle} className="btn-brand px-6 py-3 text-sm">
              Create
            </button>
            <button
              onClick={() => setShowCreate(false)}
              className="px-6 py-3 text-sm font-semibold text-charcoal-400 hover:text-charcoal-600"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Circles list */}
      {circles.length === 0 && !showCreate ? (
        <div className="card text-center py-16">
          <Users className="w-10 h-10 text-charcoal-200 mx-auto mb-4" />
          <p className="text-charcoal-400 font-medium mb-2">No circles yet</p>
          <p className="text-charcoal-300 text-sm">
            Create circles to share events with specific groups of friends.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {circles.map((circle) => (
            <div key={circle.id} className="card p-7 space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: circle.color }}
                  />
                  <h3 className="font-serif text-xl text-charcoal-700">
                    {circle.name}
                  </h3>
                  <span className="text-xs text-charcoal-300 font-medium">
                    {circle.members.length} member
                    {circle.members.length !== 1 && "s"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setAddingTo(addingTo === circle.id ? null : circle.id)
                    }
                    className="p-2 rounded-lg hover:bg-cream-200/50 text-charcoal-400 transition-colors"
                  >
                    <UserPlus className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteCircle(circle.id)}
                    className="p-2 rounded-lg hover:bg-coral-50 text-charcoal-300 hover:text-coral-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Members */}
              {circle.members.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {circle.members.map((m) => (
                    <div
                      key={m.id}
                      className="flex items-center gap-2 bg-cream-200/40 px-3 py-1.5 rounded-full text-sm"
                    >
                      <span className="font-medium text-charcoal-600">
                        {m.display_name}
                      </span>
                      <button
                        onClick={() => removeMember(circle.id, m.id)}
                        className="text-charcoal-300 hover:text-coral-400 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add member dropdown */}
              {addingTo === circle.id && (
                <div className="bg-cream-200/30 rounded-2xl p-4 space-y-2 animate-fade-in">
                  <p className="label-caps mb-3">Add from friends</p>
                  {friends.filter(
                    (f) => !circle.members.some((m) => m.id === f.id)
                  ).length === 0 ? (
                    <p className="text-sm text-charcoal-400 italic">
                      All friends are already in this circle
                    </p>
                  ) : (
                    friends
                      .filter(
                        (f) => !circle.members.some((m) => m.id === f.id)
                      )
                      .map((f) => (
                        <button
                          key={f.id}
                          onClick={() => addMember(circle.id, f.id)}
                          className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-cream-50 transition-colors"
                        >
                          <span className="text-sm font-medium text-charcoal-600">
                            {f.display_name}
                          </span>
                          <Check className="w-4 h-4 text-charcoal-300" />
                        </button>
                      ))
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}