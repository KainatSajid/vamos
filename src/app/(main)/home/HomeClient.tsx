"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LayoutGrid,
  Map as MapIcon,
  PlusCircle,
  Coffee,
  Globe,
  Users,
  Lock,
} from "lucide-react";
import EventCard from "@/components/events/EventCard";
import type { Profile, SocialEvent, Circle } from "@/lib/types";
import type { MapPin } from "@/components/maps/EventMap";

// Dynamically import map to avoid SSR issues with Leaflet
const EventMap = dynamic(() => import("@/components/maps/EventMap"), {
  ssr: false,
  loading: () => (
    <div className="h-[600px] rounded-4xl bg-cream-200/50 border border-cream-300/50 flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-coral-400 border-t-transparent rounded-full animate-spin" />
    </div>
  ),
});

interface HomeClientProps {
  profile: Profile;
  events: SocialEvent[];
  circles: Circle[];
}

export default function HomeClient({
  profile,
  events,
  circles,
}: HomeClientProps) {
  const [viewMode, setViewMode] = useState<"feed" | "map">("feed");
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const router = useRouter();
  const firstName = profile.display_name.split(" ")[0];

  // Convert events with coordinates to map pins
  const mapPins: MapPin[] = events
    .filter((e) => e.latitude && e.longitude)
    .map((e) => ({
      id: e.id,
      lat: e.latitude!,
      lng: e.longitude!,
      title: e.title,
      vibe: e.vibe,
      subtitle: e.location_name,
      active: e.id === selectedEventId,
    }));

  const handlePinClick = (id: string) => {
    router.push(`/events/${id}`);
  };

  return (
    <div className="space-y-10 pb-20 animate-fade-in">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="headline text-4xl mb-2">
            Hey {firstName}, see what&apos;s on.
          </h1>
          <p className="text-charcoal-400 font-medium">
            Spontaneous moves from your circles.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/events/new"
            className="btn-brand flex items-center gap-2 px-5 py-3 text-sm md:hidden"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Move</span>
          </Link>

          <div className="flex items-center gap-1 bg-cream-50 p-1 rounded-xl border border-cream-300/50 shadow-warm">
            <button
              onClick={() => setViewMode("feed")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                viewMode === "feed"
                  ? "bg-charcoal-700 text-cream-50 shadow-md"
                  : "text-charcoal-400 hover:text-charcoal-600"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Feed</span>
            </button>
            <button
              onClick={() => setViewMode("map")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                viewMode === "map"
                  ? "bg-charcoal-700 text-cream-50 shadow-md"
                  : "text-charcoal-400 hover:text-charcoal-600"
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>Map</span>
            </button>
          </div>
        </div>
      </header>

      {viewMode === "feed" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Event feed */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-xl text-charcoal-700">
                Spontaneous Moves
              </h3>
            </div>

            {events.length === 0 ? (
              <div className="card text-center py-20 flex flex-col items-center justify-center">
                <Coffee className="w-10 h-10 text-charcoal-200 mb-5" />
                <p className="text-charcoal-400 font-medium mb-4">
                  No live moves yet.
                </p>
                <Link
                  href="/events/new"
                  className="btn-brand px-6 py-3 text-sm inline-flex items-center gap-2"
                >
                  <PlusCircle className="w-4 h-4" />
                  Be the first
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {events.map((event, idx) => (
                  <div
                    key={event.id}
                    className="opacity-0 animate-fade-in-up"
                    style={{ animationDelay: `${idx * 0.05}s` }}
                  >
                    <EventCard event={event} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Circles sidebar */}
          <aside className="space-y-6">
            <div className="bg-charcoal-700 text-cream-50 p-8 rounded-4xl shadow-warm-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gradient rounded-full blur-[80px] opacity-30" />
              <h3 className="font-serif text-xl mb-5 relative">My Circles</h3>
              <div className="space-y-3 relative">
                {circles.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-charcoal-300 text-sm mb-3">
                      No circles yet
                    </p>
                    <Link
                      href="/circles"
                      className="text-coral-400 text-sm font-semibold hover:underline"
                    >
                      Create your first circle
                    </Link>
                  </div>
                ) : (
                  circles.map((circle) => (
                    <div
                      key={circle.id}
                      className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: circle.color }}
                        />
                        <span className="text-sm font-semibold">
                          {circle.name}
                        </span>
                      </div>
                      <span className="text-[10px] bg-coral-400/20 text-coral-300 px-2 py-0.5 rounded-full font-bold">
                        {circle.member_count || 0}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Visibility legend */}
            <div className="card p-6 space-y-3">
              <h4 className="label-caps mb-4">Event Visibility</h4>
              <div className="flex items-center gap-3 text-sm text-charcoal-500">
                <Globe className="w-4 h-4 text-charcoal-300" />
                <span>
                  <span className="font-semibold">Public</span> &mdash; everyone sees
                  it
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm text-charcoal-500">
                <Users className="w-4 h-4 text-charcoal-300" />
                <span>
                  <span className="font-semibold">Friends</span> &mdash; your friend
                  list
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm text-charcoal-500">
                <Lock className="w-4 h-4 text-charcoal-300" />
                <span>
                  <span className="font-semibold">Circles</span> &mdash; specific
                  groups
                </span>
              </div>
            </div>
          </aside>
        </div>
      ) : (
        /* Map view */
        <div className="space-y-6">
          {mapPins.length > 0 ? (
            <EventMap
              pins={mapPins}
              height="h-[600px]"
              onPinClick={handlePinClick}
            />
          ) : (
            <div className="card h-[600px] relative overflow-hidden">
              <div className="absolute inset-0 bg-cream-200/50 flex items-center justify-center text-charcoal-300 font-medium">
                <div className="text-center">
                  <MapIcon className="w-10 h-10 mx-auto mb-3 text-charcoal-200" />
                  <p className="text-charcoal-400 font-medium mb-2">
                    No events with locations yet
                  </p>
                  <p className="text-sm text-charcoal-300">
                    Events created with the AI finder will show on the map
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Event list below map */}
          {events.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}