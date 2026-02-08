"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Sparkles,
  Send,
  MapPin,
  ChevronRight,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import VisibilityPicker from "@/components/events/VisibilityPicker";
import VibeBadge from "@/components/events/VibeBadge";
import { VIBES, VIBE_CLASSES } from "@/lib/types";
import type { Vibe, EventVisibility, Suggestion, AiPreferences } from "@/lib/types";

export default function CreateEventPage() {
  const router = useRouter();
  const supabase = createClient();
  const [step, setStep] = useState<"choice" | "manual" | "ai">("choice");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

  const [aiPrefs, setAiPrefs] = useState<AiPreferences>({
    vibe: "chill",
    social: "lightly social",
    time: "evening",
    duration: "1-3 hrs",
    aloneOk: "yes",
  });

  const [form, setForm] = useState({
    title: "",
    date: new Date().toISOString().split("T")[0],
    time: "19:00",
    locationName: "",
    latitude: undefined as number | undefined,
    longitude: undefined as number | undefined,
    vibe: "chill" as Vibe,
    description: "",
    visibility: "public" as EventVisibility,
    selectedCircles: [] as string[],
  });

  const [sanityCheck, setSanityCheck] = useState<string | null>(null);

  const handleAiFinder = async () => {
    setLoading(true);
    setSuggestions([]);
    try {
      const res = await fetch("/api/ai/inspire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(aiPrefs),
      });
      const data = await res.json();
      setSuggestions(data.suggestions || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const selectSuggestion = (s: Suggestion) => {
    setForm({
      ...form,
      title: s.activity,
      locationName: s.activity,
      vibe: s.vibe,
      description: s.details,
      latitude: s.lat,
      longitude: s.lng,
    });
    setStep("manual");
  };

  const checkPlan = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/sanity-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          location: form.locationName,
          date: form.date,
          time: form.time,
        }),
      });
      const data = await res.json();
      setSanityCheck(data.feedback || null);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const startTime = new Date(`${form.date}T${form.time}`).toISOString();

    const { data: event, error } = await supabase
      .from("events")
      .insert({
        host_id: user.id,
        title: form.title,
        description: form.description,
        location_name: form.locationName,
        latitude: form.latitude,
        longitude: form.longitude,
        start_time: startTime,
        vibe: form.vibe,
        visibility: form.visibility,
      })
      .select()
      .single();

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    // If circle visibility, insert circle mappings
    if (form.visibility === "circles" && form.selectedCircles.length > 0) {
      await supabase.from("event_circle_visibility").insert(
        form.selectedCircles.map((circleId) => ({
          event_id: event.id,
          circle_id: circleId,
        }))
      );
    }

    router.push("/home");
    router.refresh();
  };

  const update = (field: string, value: any) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-5">
        <button
          onClick={() => (step === "choice" ? router.push("/home") : setStep("choice"))}
          className="w-11 h-11 rounded-full border border-cream-300/50 flex items-center justify-center text-charcoal-400 hover:bg-cream-200/50 transition-colors bg-cream-50 shadow-warm"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="headline text-3xl">New Move</h1>
      </div>

      {/* Step: Choice */}
      {step === "choice" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
          <button
            onClick={() => setStep("ai")}
            className="group p-8 card-hover text-left relative overflow-hidden border-2 border-amber-200/50 hover:border-amber-300"
          >
            <div className="bg-amber-100 p-4 rounded-2xl w-fit mb-6">
              <Sparkles className="w-7 h-7 text-amber-600" />
            </div>
            <h3 className="font-serif text-2xl mb-2 text-charcoal-800">
              AI Event Finder
            </h3>
            <p className="text-charcoal-400 font-medium text-sm">
              Gemini scans real venues currently open near you that match your
              mood.
            </p>
            <div className="mt-6 flex items-center text-charcoal-700 font-semibold text-sm">
              Let&apos;s explore
              <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          <button
            onClick={() => setStep("manual")}
            className="group p-8 card-hover text-left relative overflow-hidden border-2 border-coral-200/50 hover:border-coral-300"
          >
            <div className="bg-coral-50 p-4 rounded-2xl w-fit mb-6">
              <Send className="w-7 h-7 text-coral-400" />
            </div>
            <h3 className="font-serif text-2xl mb-2 text-charcoal-800">
              I have an idea
            </h3>
            <p className="text-charcoal-400 font-medium text-sm">
              Just drop the details. We&apos;ll share it with your people.
            </p>
            <div className="mt-6 flex items-center text-charcoal-700 font-semibold text-sm">
              Quick entry
              <ChevronRight className="w-4 h-4 ml-1 text-coral-400 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        </div>
      )}

      {/* Step: AI Finder */}
      {step === "ai" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
          <div className="lg:col-span-5 space-y-6">
            <div className="card p-8 space-y-6">
              <div className="flex items-center gap-3">
                <div className="bg-amber-100 p-2 rounded-xl">
                  <Sparkles className="w-5 h-5 text-amber-600" />
                </div>
                <h2 className="font-serif text-xl text-charcoal-800">
                  Finder Settings
                </h2>
              </div>

              <div>
                <label className="label-caps block mb-3">Select Vibe</label>
                <div className="flex flex-wrap gap-2">
                  {VIBES.map((v) => (
                    <button
                      key={v}
                      onClick={() => setAiPrefs({ ...aiPrefs, vibe: v })}
                      className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border ${
                        aiPrefs.vibe === v
                          ? VIBE_CLASSES[v] + " shadow-md scale-105"
                          : "bg-cream-200/40 text-charcoal-400 border-cream-300/40"
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="label-caps block mb-3">Time</label>
                <select
                  value={aiPrefs.time}
                  onChange={(e) =>
                    setAiPrefs({ ...aiPrefs, time: e.target.value })
                  }
                  className="input-warm cursor-pointer"
                >
                  <option>morning</option>
                  <option>afternoon</option>
                  <option>evening</option>
                  <option>whenever</option>
                </select>
              </div>

              <div>
                <label className="label-caps block mb-3">Duration</label>
                <select
                  value={aiPrefs.duration}
                  onChange={(e) =>
                    setAiPrefs({ ...aiPrefs, duration: e.target.value })
                  }
                  className="input-warm cursor-pointer"
                >
                  <option>under 1 hr</option>
                  <option>1-3 hrs</option>
                  <option>half day</option>
                  <option>open ended</option>
                </select>
              </div>

              <button
                onClick={handleAiFinder}
                disabled={loading}
                className="w-full btn-brand py-4 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Searching nearby...</span>
                  </>
                ) : (
                  <span>Get Location-Based Ideas</span>
                )}
              </button>
            </div>

            {/* AI Suggestions */}
            {suggestions.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-serif text-lg text-charcoal-700 px-1">
                  Suggestions
                </h3>
                {suggestions.map((s, idx) => (
                  <button
                    key={idx}
                    className="w-full text-left card-hover p-5"
                    onClick={() => selectSuggestion(s)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-charcoal-700">{s.activity}</h4>
                      <VibeBadge vibe={s.vibe} />
                    </div>
                    <p className="text-sm text-charcoal-400 mb-2">{s.reason}</p>
                    {s.url && (
                      <span className="text-[10px] text-coral-400 flex items-center gap-1 font-semibold">
                        <ExternalLink className="w-3 h-3" />
                        Source
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-7 h-[calc(100vh-250px)] sticky top-32">
            <div className="card h-full flex items-center justify-center text-charcoal-300 font-medium">
              <div className="text-center">
                <MapPin className="w-8 h-8 mx-auto mb-3 text-charcoal-200" />
                <p className="text-sm">
                  Map will display suggestions here
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step: Manual Form */}
      {step === "manual" && (
        <div className="max-w-3xl animate-fade-in">
          <form onSubmit={handleSubmit} className="card p-10 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="label-caps block mb-3">
                  What&apos;s the move?
                </label>
                <input
                  required
                  className="input-warm text-lg font-serif"
                  placeholder="Coffee at The Daily Grind..."
                  value={form.title}
                  onChange={(e) => update("title", e.target.value)}
                />
              </div>

              <div className="md:col-span-2">
                <label className="label-caps block mb-3">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-300" />
                  <input
                    required
                    className="input-warm pl-12"
                    placeholder="Central Park Fountain..."
                    value={form.locationName}
                    onChange={(e) => update("locationName", e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="label-caps block mb-3">Date</label>
                <input
                  type="date"
                  className="input-warm"
                  value={form.date}
                  onChange={(e) => update("date", e.target.value)}
                />
              </div>
              <div>
                <label className="label-caps block mb-3">Time</label>
                <input
                  type="time"
                  className="input-warm"
                  value={form.time}
                  onChange={(e) => update("time", e.target.value)}
                />
              </div>
            </div>

            {/* Vibe selector */}
            <div>
              <label className="label-caps block mb-3">Vibe</label>
              <div className="flex flex-wrap gap-2">
                {VIBES.map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => update("vibe", v)}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border ${
                      form.vibe === v
                        ? VIBE_CLASSES[v] + " shadow-md scale-105"
                        : "bg-cream-200/40 text-charcoal-400 border-cream-300/40"
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label-caps block mb-3">
                Details (keep it light)
              </label>
              <textarea
                className="input-warm min-h-[120px] resize-none"
                placeholder="I'll be by the window reading. Join if you're around..."
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
              />
            </div>

            {/* Visibility */}
            <VisibilityPicker
              value={form.visibility}
              selectedCircles={form.selectedCircles}
              onChange={(v) => update("visibility", v)}
              onCirclesChange={(c) => update("selectedCircles", c)}
            />

            {/* Sanity check result */}
            {sanityCheck && (
              <div className="bg-amber-50/50 p-6 rounded-3xl border border-amber-100/50 flex items-start gap-4 animate-scale-in">
                <div className="bg-cream-50 p-2 rounded-xl border border-amber-100 shadow-warm">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                </div>
                <div className="flex-1">
                  <p className="label-caps text-amber-600 mb-2">
                    Gemini Vibe Check
                  </p>
                  <p className="text-sm text-charcoal-600 leading-relaxed whitespace-pre-wrap">
                    {sanityCheck}
                  </p>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                type="button"
                onClick={checkPlan}
                disabled={loading || !form.title || !form.locationName}
                className="flex-1 px-6 py-4 rounded-2xl border-2 border-amber-200 text-amber-600 font-bold bg-cream-50 hover:bg-amber-50 transition-all flex items-center justify-center gap-2 disabled:opacity-40"
              >
                <Sparkles className="w-4 h-4" />
                <span>Vibe Check</span>
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 btn-brand py-4 disabled:opacity-60"
              >
                {loading ? "Creating..." : "Share Move"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
