"use client";

import Link from "next/link";

export default function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/home" className={`inline-block ${className}`}>
      <span className="font-serif text-3xl tracking-tight">
        <span className="text-charcoal-700">¡</span>
        <span className="text-coral-400">Vam</span>
        <span className="text-amber-400">os</span>
        <span className="text-charcoal-700">!</span>
      </span>
    </Link>
  );
}
