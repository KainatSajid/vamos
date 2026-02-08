"use client";

import { useState, useEffect } from "react";
import { Save, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types";

export default function SettingsPage() {
  const supabase = createClient();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [form, setForm] = useState({ display_name: "", username: "" });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (data) {
        setProfile(data);
        setForm({
          display_name: data.display_name,
          username: data.username,
        });
      }
    }
    load();
  }, [supabase]);

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);

    await supabase
      .from("profiles")
      .update({
        display_name: form.display_name,
        username: form.username.toLowerCase(),
      })
      .eq("id", profile.id);

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (!profile) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-charcoal-300" />
      </div>
    );
  }

  return (
    <div className="max-w-xl space-y-10 pb-20 animate-fade-in">
      <header>
        <h1 className="headline text-4xl mb-2">Settings</h1>
        <p className="text-charcoal-400 font-medium">Manage your profile.</p>
      </header>

      <div className="card p-8 space-y-6">
        <div>
          <label className="label-caps block mb-3">Display Name</label>
          <input
            className="input-warm"
            value={form.display_name}
            onChange={(e) =>
              setForm({ ...form, display_name: e.target.value })
            }
          />
        </div>

        <div>
          <label className="label-caps block mb-3">Username</label>
          <input
            className="input-warm"
            value={form.username}
            onChange={(e) =>
              setForm({
                ...form,
                username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""),
              })
            }
          />
        </div>

        <div>
          <label className="label-caps block mb-3">Email</label>
          <input
            className="input-warm opacity-60 cursor-not-allowed"
            value={profile.email}
            disabled
          />
          <p className="text-xs text-charcoal-300 mt-2">
            Email cannot be changed here.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-brand px-6 py-3 text-sm flex items-center gap-2"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>{saved ? "Saved!" : "Save Changes"}</span>
        </button>
      </div>
    </div>
  );
}
