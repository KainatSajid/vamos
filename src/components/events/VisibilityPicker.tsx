"use client";

import { useState, useEffect } from "react";
import { Globe, Users, Lock, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { EventVisibility, Circle } from "@/lib/types";

interface VisibilityPickerProps {
  value: EventVisibility;
  selectedCircles: string[];
  onChange: (visibility: EventVisibility) => void;
  onCirclesChange: (circleIds: string[]) => void;
}

const tiers = [
  {
    value: "public" as const,
    icon: Globe,
    label: "Public",
    desc: "Anyone on Vamos can see this",
  },
  {
    value: "friends" as const,
    icon: Users,
    label: "Friends",
    desc: "Only your friends",
  },
  {
    value: "circles" as const,
    icon: Lock,
    label: "Circles",
    desc: "Pick specific groups",
  },
];

export default function VisibilityPicker({
  value,
  selectedCircles,
  onChange,
  onCirclesChange,
}: VisibilityPickerProps) {
  const [circles, setCircles] = useState<Circle[]>([]);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("circles")
        .select("*")
        .eq("owner_id", user.id);
      setCircles(data || []);
    }
    load();
  }, [supabase]);

  const toggleCircle = (id: string) => {
    onCirclesChange(
      selectedCircles.includes(id)
        ? selectedCircles.filter((c) => c !== id)
        : [...selectedCircles, id]
    );
  };

  return (
    <div className="space-y-4">
      <label className="label-caps block">Who can see this?</label>
      <div className="grid grid-cols-3 gap-3">
        {tiers.map((tier) => (
          <button
            key={tier.value}
            type="button"
            onClick={() => onChange(tier.value)}
            className={`p-4 rounded-2xl border-2 text-left transition-all ${
              value === tier.value
                ? "border-coral-400 bg-coral-50/50"
                : "border-cream-300/50 bg-cream-50 hover:border-cream-300"
            }`}
          >
            <tier.icon
              className={`w-5 h-5 mb-2 ${
                value === tier.value ? "text-coral-400" : "text-charcoal-300"
              }`}
            />
            <p
              className={`text-sm font-bold ${
                value === tier.value ? "text-coral-500" : "text-charcoal-600"
              }`}
            >
              {tier.label}
            </p>
            <p className="text-[11px] text-charcoal-400 mt-0.5">{tier.desc}</p>
          </button>
        ))}
      </div>

      {value === "circles" && (
        <div className="space-y-2 pt-2 animate-fade-in">
          {circles.length === 0 ? (
            <p className="text-sm text-charcoal-400 italic">
              No circles yet. Create one in the Circles tab first.
            </p>
          ) : (
            circles.map((circle) => (
              <button
                key={circle.id}
                type="button"
                onClick={() => toggleCircle(circle.id)}
                className={`w-full flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                  selectedCircles.includes(circle.id)
                    ? "border-coral-400/50 bg-coral-50/30"
                    : "border-cream-300/40 hover:border-cream-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: circle.color }}
                  />
                  <span className="text-sm font-semibold text-charcoal-600">
                    {circle.name}
                  </span>
                </div>
                {selectedCircles.includes(circle.id) && (
                  <Check className="w-4 h-4 text-coral-400" />
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
