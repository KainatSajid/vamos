"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Users, Settings, LogOut, Home, PlusCircle, UserPlus } from "lucide-react";
import Logo from "./Logo";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types";

interface SidebarProps {
  profile: Profile;
}

const navItems = [
  { icon: Home, label: "Home", path: "/home" },
  { icon: Users, label: "Circles", path: "/circles" },
  { icon: UserPlus, label: "Friends", path: "/friends" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

export default function Sidebar({ profile }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const initials = profile.display_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <aside className="w-64 border-r border-cream-300/40 bg-cream-50 h-screen sticky top-0 flex flex-col p-6 hidden md:flex">
      <div className="mb-10">
        <Logo />
      </div>

      <Link
        href="/events/new"
        className="btn-brand flex items-center justify-center gap-2 px-5 py-3.5 mb-8 text-sm"
      >
        <PlusCircle className="w-4 h-4" />
        <span>New Move</span>
      </Link>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.path);
          return (
            <Link
              key={item.label}
              href={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium
                ${
                  isActive
                    ? "bg-cream-200/70 text-charcoal-700 font-semibold"
                    : "text-charcoal-400 hover:bg-cream-200/40 hover:text-charcoal-600"
                }`}
            >
              <item.icon className="w-[18px] h-[18px]" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="pt-6 border-t border-cream-300/40 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-brand-gradient flex items-center justify-center font-bold text-white text-xs">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-charcoal-700 truncate">
              {profile.display_name}
            </p>
            <p className="text-xs text-charcoal-300 truncate">
              @{profile.username}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-4 py-2 text-xs font-bold text-coral-500 hover:bg-coral-50 rounded-lg transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
