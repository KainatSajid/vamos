"use client";

import Link from "next/link";
import { MapPin, Calendar } from "lucide-react";
import VibeBadge from "./VibeBadge";
import type { SocialEvent } from "@/lib/types";

export default function EventCard({ event }: { event: SocialEvent }) {
  const hostInitials = (event.host?.display_name || "?")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const formattedDate = new Date(event.start_time).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  const formattedTime = new Date(event.start_time).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <Link
      href={`/events/${event.id}`}
      className="group block card-hover p-6 relative overflow-hidden"
    >
      {/* Subtle decorative corner accent */}
      <div className="absolute -top-8 -right-8 w-24 h-24 bg-brand-gradient-soft rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="flex justify-between items-start mb-5 relative">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-charcoal-700 flex items-center justify-center font-bold text-cream-50 text-[10px]">
            {hostInitials}
          </div>
          <span className="text-xs font-semibold text-charcoal-500">
            {event.host?.display_name || "Someone"}
          </span>
        </div>
        <VibeBadge vibe={event.vibe} />
      </div>

      <h3 className="font-serif text-xl mb-3 text-charcoal-800 leading-tight group-hover:text-coral-400 transition-colors">
        {event.title}
      </h3>

      <div className="flex items-center text-charcoal-400 text-sm mb-4">
        <MapPin className="w-3.5 h-3.5 mr-2 text-charcoal-300" />
        <span className="truncate">{event.location_name}</span>
      </div>

      <div className="pt-4 border-t border-cream-200 flex items-center justify-between">
        <div className="flex items-center text-charcoal-400 text-xs font-medium">
          <Calendar className="w-3 h-3 mr-1.5" />
          {formattedDate} at {formattedTime}
        </div>
        <span className="text-[10px] font-semibold text-charcoal-300 uppercase tracking-widest italic">
          {event.visibility === "public" ? "Open" : "Invited"}
        </span>
      </div>
    </Link>
  );
}
