"use client";

import { useEffect, useRef, useState } from "react";
import type { Vibe } from "@/lib/types";

// ── Types ───────────────────────────────────────────────
export interface MapPin {
  id: string;
  lat: number;
  lng: number;
  title: string;
  vibe: Vibe;
  subtitle?: string;
  active?: boolean;
}

interface EventMapProps {
  pins: MapPin[];
  center?: [number, number];
  zoom?: number;
  height?: string;
  onPinClick?: (id: string) => void;
  interactive?: boolean;
  singlePin?: boolean;
}

// ── Vibe color mapping ──────────────────────────────────
const VIBE_COLORS: Record<Vibe, string> = {
  cozy: "#E86B8B",
  curious: "#E8A817",
  fun: "#F5C842",
  chill: "#7D7269",
  spontaneous: "#D94F5E",
};

// ── SVG marker factory ──────────────────────────────────
function markerSvg(color: string, size: number) {
  return `<svg width="${size}" height="${Math.round(size * 1.3)}" viewBox="0 0 40 52" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 51C20 51 38 33.36 38 20C38 10.06 29.94 2 20 2C10.06 2 2 10.06 2 20C2 33.36 20 51 20 51Z"
          fill="${color}" stroke="#FFFDF9" stroke-width="2.5"/>
    <circle cx="20" cy="19" r="7" fill="#FFFDF9" fill-opacity="0.9"/>
  </svg>`;
}

// ── Component ───────────────────────────────────────────
export default function EventMap({
  pins,
  center,
  zoom = 13,
  height = "h-[400px]",
  onPinClick,
  interactive = true,
  singlePin = false,
}: EventMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Initialize map
  useEffect(() => {
    let cancelled = false;

    const initMap = async () => {
      const L = await import("leaflet");
    //   await import("leaflet/dist/leaflet.css");

      if (cancelled || !containerRef.current) return;

      // Nuke any previous Leaflet instance on this DOM node
      if (mapRef.current) {
        try { mapRef.current.remove(); } catch {}
        mapRef.current = null;
      }
      // Clear Leaflet's internal tracking on the container
      const el = containerRef.current as any;
      if (el._leaflet_id) {
        el._leaflet_id = undefined;
      }

      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "",
        iconUrl: "",
        shadowUrl: "",
      });

      const defaultCenter = center || [40.7128, -74.006];

      try {
        const map = L.map(containerRef.current, {
          center: defaultCenter,
          zoom,
          zoomControl: interactive,
          scrollWheelZoom: interactive,
          dragging: interactive,
          attributionControl: false,
        });

        L.tileLayer(
          "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
          { maxZoom: 19, subdomains: "abcd" }
        ).addTo(map);

        L.control
          .attribution({ position: "bottomright", prefix: false })
          .addAttribution(
            '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          )
          .addTo(map);

        if (!cancelled) {
          mapRef.current = map;
          setLoaded(true);
        } else {
          map.remove();
        }
      } catch (err) {
        // Swallow "already initialized" in case of race
        console.warn("Map init error:", err);
      }
    };

    // Delay to let React finish DOM mutations (handles strict mode double-mount)
    const timer = setTimeout(initMap, 0);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      if (mapRef.current) {
        try { mapRef.current.remove(); } catch {}
        mapRef.current = null;
      }
      setLoaded(false);
    };
  }, []);

  // Update markers when pins change
  useEffect(() => {
    if (!mapRef.current || !loaded) return;

    const updateMarkers = async () => {
      const L = await import("leaflet");
      const map = mapRef.current;
      if (!map) return;

      // Clear old markers
      markersRef.current.forEach((m) => {
        try { map.removeLayer(m); } catch {}
      });
      markersRef.current = [];

      const validPins = pins.filter(
        (p) => p.lat && p.lng && !isNaN(p.lat) && !isNaN(p.lng)
      );

      if (validPins.length === 0) return;

      validPins.forEach((pin) => {
        const color = VIBE_COLORS[pin.vibe] || VIBE_COLORS.chill;
        const size = pin.active ? 44 : 34;

        const icon = L.divIcon({
          html: markerSvg(color, size),
          className: "vibe-marker",
          iconSize: [size, Math.round(size * 1.3)],
          iconAnchor: [size / 2, Math.round(size * 1.3)],
          popupAnchor: [0, -Math.round(size * 1.2)],
        });

        const marker = L.marker([pin.lat, pin.lng], { icon }).addTo(map);

        const popupContent = `
          <div style="font-family: 'Plus Jakarta Sans', sans-serif; min-width: 160px;">
            <div style="font-weight: 700; font-size: 14px; color: #2C2421; margin-bottom: 4px;">
              ${pin.title}
            </div>
            ${pin.subtitle ? `<div style="font-size: 12px; color: #7D7269;">${pin.subtitle}</div>` : ""}
          </div>
        `;
        marker.bindPopup(popupContent, {
          className: "vamos-popup",
          closeButton: false,
          offset: [0, -4],
        });

        if (onPinClick) {
          marker.on("click", () => onPinClick(pin.id));
        }

        markersRef.current.push(marker);
      });

      // Fit bounds
      if (validPins.length === 1 || singlePin) {
        map.setView([validPins[0].lat, validPins[0].lng], 15, {
          animate: true,
        });
      } else if (validPins.length > 1) {
        const bounds = L.latLngBounds(
          validPins.map((p) => [p.lat, p.lng] as [number, number])
        );
        map.fitBounds(bounds, { padding: [50, 50], animate: true });
      }
    };

    updateMarkers();
  }, [pins, loaded, onPinClick, singlePin]);

  return (
    <div
      className={`${height} rounded-4xl overflow-hidden border border-cream-300/50 shadow-warm relative`}
    >
      <div ref={containerRef} className="w-full h-full" />
      {!loaded && (
        <div className="absolute inset-0 bg-cream-200/50 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-coral-400 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}