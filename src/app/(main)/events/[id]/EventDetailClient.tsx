"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Clock,
  Info,
  Bell,
  CalendarCheck,
  ExternalLink,
  Share2,
  CheckCircle2,
  Sparkles,
  Loader2,
} from "lucide-react";
import VibeBadge from "@/components/events/VibeBadge";
import type { SocialEvent } from "@/lib/types";
import type { MapPin as MapPinType } from "@/components/maps/EventMap";

const EventMap = dynamic(() => import("@/components/maps/EventMap"), {
  ssr: false,
  loading: () => (
    <div className="h-[300px] rounded-4xl bg-cream-200/50 border border-cream-300/50 flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-coral-400 border-t-transparent rounded-full animate-spin" />
    </div>
  ),
});

export default function EventDetailClient({ event }: { event: SocialEvent }) {
  const router = useRouter();
  const [reminded, setReminded] = useState(false);
  const [vibeCheck, setVibeCheck] = useState<string | null>(null);
  const [vibeLoading, setVibeLoading] = useState(false);
  const [vibeOpen, setVibeOpen] = useState(false);

  const formattedDate = new Date(event.start_time).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const formattedTime = new Date(event.start_time).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  const addToGoogleCalendar = () => {
    const start = new Date(event.start_time);
    const end = event.end_time
      ? new Date(event.end_time)
      : new Date(start.getTime() + 60 * 60 * 1000);

    const fmt = (d: Date) =>
      d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

    const url = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.location_name)}&dates=${fmt(start)}/${fmt(end)}`;
    window.open(url, "_blank");
  };

  const openInMaps = () => {
    const query =
      event.latitude && event.longitude
        ? `${event.latitude},${event.longitude}`
        : encodeURIComponent(event.location_name);
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${query}`,
      "_blank"
    );
  };

  const fetchVibeCheck = async () => {
    if (vibeCheck) {
      setVibeOpen(!vibeOpen);
      return;
    }

    setVibeLoading(true);
    setVibeOpen(true);

    try {
      const dateStr = new Date(event.start_time).toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      });
      const timeStr = new Date(event.start_time).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      });

      const res = await fetch("/api/ai/sanity-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: event.title,
          location: event.location_name,
          date: dateStr,
          time: timeStr,
        }),
      });

      const data = await res.json();
      setVibeCheck(
        data.feedback || data.message || "Could not get a vibe check right now."
      );
    } catch {
      setVibeCheck("Could not get a vibe check right now. Try again later.");
    } finally {
      setVibeLoading(false);
    }
  };

  const hasCoords = event.latitude && event.longitude;
  const mapPins: MapPinType[] = hasCoords
    ? [
        {
          id: event.id,
          lat: event.latitude!,
          lng: event.longitude!,
          title: event.title,
          vibe: event.vibe,
          subtitle: event.location_name,
        },
      ]
    : [];

  return (
    <div className="max-w-5xl mx-auto pb-20 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
        {/* Main content */}
        <div className="md:col-span-7 space-y-8">
          <header className="space-y-5">
            <button
              onClick={() => router.push("/home")}
              className="flex items-center gap-2 text-charcoal-400 hover:text-charcoal-700 transition-colors font-semibold text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Moves</span>
            </button>

            <div className="flex items-center gap-3">
              <VibeBadge vibe={event.vibe} size="md" />
              <span className="text-charcoal-300">/</span>
              <span className="text-charcoal-400 text-sm font-medium">
                Hosted by {event.host?.display_name || "Someone"}
              </span>
            </div>

            <h1 className="headline text-5xl leading-tight tracking-tight">
              {event.title}
            </h1>
          </header>

          {/* Event details card */}
          <div className="card p-10 space-y-10">
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3 h-3 text-charcoal-300" />
                  <span className="label-caps">The Date</span>
                </div>
                <p className="font-serif text-2xl text-charcoal-800">
                  {formattedDate}
                </p>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-3 h-3 text-charcoal-300" />
                  <span className="label-caps">The Time</span>
                </div>
                <p className="font-serif text-2xl text-charcoal-800">
                  {formattedTime}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-3 h-3 text-charcoal-300" />
                <span className="label-caps">The Location</span>
              </div>
              <div className="flex items-center justify-between">
                <p className="font-serif text-2xl text-charcoal-800">
                  {event.location_name}
                </p>
                <button
                  onClick={openInMaps}
                  className="flex items-center gap-2 text-coral-400 font-semibold text-sm bg-coral-50 px-4 py-2 rounded-xl hover:bg-coral-100 transition-colors"
                >
                  <span>Maps</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Info className="w-3 h-3 text-charcoal-300" />
                <span className="label-caps">Context</span>
              </div>
              <p className="text-charcoal-500 leading-relaxed font-medium">
                {event.description ||
                  "No specific details shared. Just bring yourself and good vibes."}
              </p>
            </div>
          </div>

          {/* AI Vibe Check -- between details and map */}
          <div className="card p-7 space-y-5">
            <button
              onClick={fetchVibeCheck}
              disabled={vibeLoading}
              className="w-full flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-brand-gradient flex items-center justify-center shadow-sm">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div className="text-left">
                  <h4 className="font-semibold text-charcoal-700 text-sm">
                    AI Vibe Check
                  </h4>
                  <p className="text-[11px] text-charcoal-400">
                    Get the lowdown on this spot
                  </p>
                </div>
              </div>
              {vibeLoading ? (
                <Loader2 className="w-4 h-4 text-coral-400 animate-spin" />
              ) : (
                <span className="text-[10px] font-bold text-coral-400 uppercase tracking-widest group-hover:underline">
                  {vibeCheck ? (vibeOpen ? "Hide" : "Show") : "Check"}
                </span>
              )}
            </button>

            {vibeOpen && vibeCheck && (
              <div className="animate-fade-in">
                <div className="bg-cream-200/40 rounded-2xl p-5 border border-cream-300/40">
                  <p className="text-sm text-charcoal-500 leading-relaxed whitespace-pre-line">
                    {vibeCheck}
                  </p>
                </div>
                <p className="text-[10px] text-charcoal-300 mt-3 text-center font-medium">
                  Powered by Gemini
                </p>
              </div>
            )}
          </div>

          {/* Map */}
          {hasCoords ? (
            <EventMap
              pins={mapPins}
              singlePin
              height="h-[300px]"
              interactive={false}
            />
          ) : (
            <div className="h-[200px] rounded-4xl bg-cream-200/30 border border-cream-300/50 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-6 h-6 mx-auto mb-2 text-charcoal-200" />
                <p className="text-sm text-charcoal-300 font-medium">
                  No exact location pinned
                </p>
                <button
                  onClick={openInMaps}
                  className="text-coral-400 text-sm font-semibold mt-2 hover:underline"
                >
                  Search in Google Maps
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="md:col-span-5 space-y-6">
          <div className="bg-charcoal-700 text-cream-50 p-10 rounded-4xl shadow-warm-xl space-y-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gradient rounded-full blur-[80px] opacity-25" />

            <h3 className="font-serif text-2xl italic relative">
              Low Pressure Only.
            </h3>
            <p className="text-charcoal-300 text-sm leading-relaxed relative">
              &iexcl;Vamos! is about showing up because you want to, not because
              you said you would. No one is tracking you.
            </p>

            <div className="space-y-3 relative">
              <button
                onClick={() => setReminded(!reminded)}
                className={`w-full p-5 rounded-2xl flex items-center justify-between transition-all border ${
                  reminded
                    ? "bg-green-500 border-green-400"
                    : "bg-white/10 border-white/10 hover:bg-white/15"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Bell className="w-4 h-4" />
                  <span className="font-semibold text-sm">
                    {reminded ? "Reminding you later" : "Remind me"}
                  </span>
                </div>
                {reminded && <CheckCircle2 className="w-4 h-4" />}
              </button>

              <button
                onClick={addToGoogleCalendar}
                className="w-full p-5 rounded-2xl flex items-center justify-between transition-all bg-cream-50 text-charcoal-700 border border-cream-200 hover:scale-[1.01] active:scale-[0.99]"
              >
                <div className="flex items-center gap-3">
                  <CalendarCheck className="w-4 h-4 text-coral-400" />
                  <span className="font-semibold text-sm">Add to Calendar</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-charcoal-300" />
              </button>
            </div>

            <p className="text-[10px] text-charcoal-400 font-semibold uppercase tracking-widest text-center pt-2">
              Adding doesn&apos;t notify the host
            </p>
          </div>

          <div className="card p-7">
            <div className="flex items-center gap-3 mb-5">
              <Share2 className="w-4 h-4 text-amber-400" />
              <h4 className="font-semibold text-charcoal-600">Share</h4>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button className="bg-cream-200/50 py-3 rounded-xl text-xs font-bold text-charcoal-500 border border-cream-300/40 hover:bg-cream-200 transition-colors">
                WhatsApp
              </button>
              <button className="bg-cream-200/50 py-3 rounded-xl text-xs font-bold text-charcoal-500 border border-cream-300/40 hover:bg-cream-200 transition-colors">
                Copy Link
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}