"use client";

import { useState } from "react";
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
} from "lucide-react";
import VibeBadge from "@/components/events/VibeBadge";
import type { SocialEvent } from "@/lib/types";

export default function EventDetailClient({ event }: { event: SocialEvent }) {
  const router = useRouter();
  const [reminded, setReminded] = useState(false);

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

  const hostInitials = (event.host?.display_name || "?")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

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
                <button className="flex items-center gap-2 text-coral-400 font-semibold text-sm bg-coral-50 px-4 py-2 rounded-xl hover:bg-coral-100 transition-colors">
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
        </div>

        {/* Sidebar */}
        <div className="md:col-span-5 space-y-6">
          <div className="bg-charcoal-700 text-cream-50 p-10 rounded-4xl shadow-warm-xl space-y-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gradient rounded-full blur-[80px] opacity-25" />

            <h3 className="font-serif text-2xl italic relative">
              Low Pressure Only.
            </h3>
            <p className="text-charcoal-300 text-sm leading-relaxed relative">
              ¡Vamos! is about showing up because you want to, not because you
              said you would. No one is tracking you.
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
