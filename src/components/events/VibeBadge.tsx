import { VIBE_CLASSES, type Vibe } from "@/lib/types";

export default function VibeBadge({
  vibe,
  size = "sm",
}: {
  vibe: Vibe;
  size?: "sm" | "md";
}) {
  const sizeClasses =
    size === "sm"
      ? "px-2.5 py-0.5 text-[10px]"
      : "px-3.5 py-1 text-xs";

  return (
    <span
      className={`inline-block rounded-full font-bold uppercase tracking-widest border ${sizeClasses} ${VIBE_CLASSES[vibe]}`}
    >
      {vibe}
    </span>
  );
}
