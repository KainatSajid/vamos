"use client";

import Link from "next/link";

export default function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/home" className={`inline-block ${className}`}>
      <svg width={145} height={48} viewBox="0 0 145 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#D95D7A" />
            <stop offset="100%" stopColor="#E8A817" />
          </linearGradient>
        </defs>
        <text
          y="40"
          fontFamily="'DM Serif Display', Georgia, serif"
          fontStyle="italic"
          fontSize="46"
          fill="url(#logo-grad)"
          paintOrder="stroke"
          stroke="url(#logo-grad)"
          strokeWidth="2"
          transform="skewX(-12)"
        >
          <tspan x="10">V</tspan><tspan dx="-5" fontSize="42">amos</tspan>
        </text>
      </svg>
    </Link>
  );
}