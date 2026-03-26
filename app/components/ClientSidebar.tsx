"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { getClientToken, clearClientToken } from "../lib/clientAuth";
import { apiGet } from "../lib/api";

const NAV_ITEMS = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    label: "Job Search",
    href: "/search",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
  },

  {
    label: "My Jobs",
    href: "/tracker",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
  },
  {
    label: "Profile",
    href: "/profile",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
];

export default function ClientSidebar() {
  const pathname = usePathname();
  const [profile, setProfile] = useState<{ full_name: string; current_title: string; initials: string }>({
    full_name: "Job Hunter",
    current_title: "Client Portal",
    initials: "TJH"
  });

  useEffect(() => {
    async function fetchProfile() {
      const token = getClientToken();
      if (!token) return;
      try {
        const data = await apiGet<any>("/api/client/auth/me", token);
        const name = data?.name || data?.full_name;
        if (name) {
          const parts = name.trim().split(/\s+/);
          const initials = parts.length > 1
            ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
            : name.substring(0, 2).toUpperCase();

          setProfile({
            full_name: name,
            current_title: data.current_title || "Client Portal",
            initials: initials
          });
        }
      } catch (err) {
        // Ignore errors, stick to defaults
      }
    }
    fetchProfile();
  }, []);

  const handleLogout = () => {
    clearClientToken();
    window.location.href = "/login";
  };

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-zinc-800/80 bg-zinc-950/80 backdrop-blur-sm">
      {/* Logo */}
      <div className="flex items-center gap-3 border-b border-zinc-800/60 px-5 py-5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.3)] bg-zinc-900 border border-zinc-800">
          <img src="/logo.svg" alt="Logo" className="h-full w-full object-cover" />
        </div>
        <div className="overflow-hidden">
          <p className="text-sm font-bold text-zinc-100 leading-tight truncate" title={profile.full_name}>{profile.full_name}</p>
          <p className="text-[10px] uppercase tracking-[0.15em] text-emerald-400/70 truncate" title={profile.current_title}>{profile.current_title}</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                isActive
                  ? "bg-emerald-500/10 text-emerald-300 shadow-[inset_0_0_0_1px_rgba(16,185,129,0.15)]"
                  : "text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200"
              }`}
            >
              <span className={isActive ? "text-emerald-400" : "text-zinc-500"}>
                {item.icon}
              </span>
              {item.label}

            </Link>
          );
        })}
      </nav>

      {/* Bottom section — Logout */}
      <div className="border-t border-zinc-800/60 px-3 py-4">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-500 transition hover:bg-red-500/10 hover:text-red-400"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sign out
        </button>
      </div>
    </aside>
  );
}
