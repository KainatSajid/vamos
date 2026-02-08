"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, User, AtSign, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Logo from "@/components/layout/Logo";

export default function SignupPage() {
  const [form, setForm] = useState({
    displayName: "",
    username: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    // Check username availability
    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", form.username.toLowerCase())
      .single();

    if (existing) {
      setError("Username already taken");
      setLoading(false);
      return;
    }

    const { data, error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          display_name: form.displayName,
          username: form.username.toLowerCase(),
        },
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    // Set cookies server-side so middleware can read them
    if (data.session) {
      await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        }),
      });
    }

    window.location.href = "/home";
  };

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream-100 p-6">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-amber-400/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-coral-400/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-md w-full space-y-8 relative animate-fade-in">
        <div className="text-center">
          <Logo className="mb-8" />
          <h1 className="headline text-4xl mb-3">Join the circle</h1>
          <p className="text-charcoal-400 font-medium">
            Spontaneous connection starts here.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-10 space-y-5 card p-10">
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-300" />
            <input
              required
              className="input-warm pl-12"
              placeholder="Display name"
              value={form.displayName}
              onChange={(e) => update("displayName", e.target.value)}
            />
          </div>

          <div className="relative">
            <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-300" />
            <input
              required
              className="input-warm pl-12"
              placeholder="Username"
              value={form.username}
              onChange={(e) =>
                update("username", e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))
              }
            />
          </div>

          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-300" />
            <input
              required
              type="email"
              className="input-warm pl-12"
              placeholder="Email address"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-300" />
            <input
              required
              type="password"
              className="input-warm pl-12"
              placeholder="Password (6+ characters)"
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
            />
          </div>

          {error && (
            <p className="text-coral-500 text-sm font-medium px-1">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-brand py-4 text-base flex items-center justify-center gap-3 group disabled:opacity-60"
          >
            <span>{loading ? "Creating account..." : "Join ¡Vamos!"}</span>
            {!loading && (
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            )}
          </button>
        </form>

        <div className="text-center">
          <Link
            href="/login"
            className="text-sm font-semibold text-charcoal-400 hover:text-coral-400 transition-colors"
          >
            Already have an account?{" "}
            <span className="text-coral-400">Log in</span>
          </Link>
        </div>
      </div>
    </div>
  );
}