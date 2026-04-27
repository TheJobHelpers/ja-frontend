"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { clearClientToken } from "../lib/clientAuth";
import { apiGet, apiPost } from "../lib/api";
import { ThemeToggle } from "./ThemeToggle";

const NAV_ITEMS = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    label: "Job Search",
    href: "/search",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
  },
  {
    label: "My Jobs",
    href: "/tracker",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
  },
];

export default function ClientSidebar({ isOpen = false, onClose = () => {} }: { isOpen?: boolean; onClose?: () => void }) {
  const pathname = usePathname();
  const [profile, setProfile] = useState<{ full_name: string; current_title: string; initials: string }>({
    full_name: "Job Hunter",
    current_title: "Client Portal",
    initials: "JH"
  });

  useEffect(() => {
    async function fetchProfile() {
      try {
        interface MeResponse { name?: string; full_name?: string; current_title?: string; initials?: string }
        const data = await apiGet<MeResponse>("/api/client/auth/me");
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
      } catch {
        // Ignore errors
      }
    }
    fetchProfile();
  }, []);

  const handleLogout = async () => {
    try {
      await apiPost("/api/client/auth/logout", {});
    } catch {
      // Ignore errors during logout
    }
    clearClientToken();
    window.location.href = "/login";
  };

  return (
    <>
      {/* Mobile backdrop */}
      <div 
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`} 
        onClick={onClose}
      />
      <aside 
        className={`fixed inset-y-0 left-0 z-50 flex h-[100dvh] w-72 flex-col border-r border-slate-300/70 dark:border-zinc-800/30 bg-slate-50/80 dark:bg-zinc-950/50 backdrop-blur-3xl transition-all duration-500 lg:static lg:translate-x-0 shadow-2xl lg:shadow-none ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
      {/* Identity Section - Scaled Up & Elegant */}
      <div className="relative p-8 pt-12 mb-4 group">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-emerald-500/[0.05] to-transparent pointer-events-none" />
        
        <div className="relative flex flex-col items-center gap-8">
          {/* Scaled Logo with Enhanced Glow */}
          <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-[2rem] shadow-xl dark:shadow-[0_0_30px_rgba(0,0,0,0.5)] bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800/50 group-hover:scale-105 transition-all duration-700">
             <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 dark:from-emerald-500/15 to-transparent" />
             <Image src="/logo.svg" alt="Logo" width={48} height={48} className="h-12 w-12 relative z-10" />
             {/* Dynamic Orbital Glow */}
             <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-emerald-500/20 dark:bg-emerald-500/30 blur-2xl rounded-full animate-pulse" />
          </div>
          
          <div className="text-center space-y-3">
            <div className="space-y-1">
              <p className="text-[14px] font-semibold text-slate-900 dark:text-white tracking-tight leading-none">Job Application Portal</p>
              <p className="text-[10px] font-medium uppercase tracking-[0.35em] text-emerald-600 dark:text-emerald-400/90">The Job Helpers</p>
            </div>
            
            {/* Elegant Identity Chip */}
            <div className="mt-6 px-6 py-2.5 rounded-full bg-white/60 dark:bg-zinc-900/60 border border-slate-200/60 dark:border-zinc-800/40 inline-flex items-center gap-3 shadow-md backdrop-blur-md group-hover:border-emerald-500/30 transition-colors">
               <div className="w-2 h-2 rounded-full bg-emerald-500/60 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
               <p className="text-[13px] font-medium text-slate-700 dark:text-zinc-200 tracking-tight truncate max-w-[160px]" title={profile.full_name}>
                 {profile.full_name}
               </p>
            </div>
          </div>
        </div>
      </div>

      {/* Subtle Divider Line */}
      <div className="px-10 mb-4">
        <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-slate-200 dark:via-zinc-800/50 to-transparent" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-3 px-6 py-6">
        <p className="px-5 text-[9px] font-medium text-slate-400 dark:text-zinc-600 uppercase tracking-[0.4em] mb-4">Operations</p>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`group relative flex items-center gap-4 rounded-2xl px-6 py-4 text-[12px] font-medium uppercase tracking-[0.2em] transition-all duration-300 ${
                isActive
                  ? "bg-white dark:bg-zinc-900/60 text-slate-900 dark:text-white shadow-md dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)]"
                  : "text-slate-500 dark:text-zinc-500 hover:text-slate-900 dark:hover:text-zinc-200 hover:bg-white/50 dark:hover:bg-zinc-900/30"
              }`}
            >
              {isActive && (
                <div className="absolute left-[-2px] top-4 bottom-4 w-[3px] bg-emerald-500 rounded-full shadow-[0_0_12px_rgba(16,185,129,0.6)]" />
              )}
              
              <span className={`transition-all duration-300 ${
                isActive ? "text-emerald-500 dark:text-emerald-400 scale-110" : "text-slate-300 dark:text-zinc-700 group-hover:text-slate-400 dark:group-hover:text-zinc-400"
              }`}>
                {item.icon}
              </span>
              
              <span className="relative z-10">{item.label}</span>
              
              {isActive && (
                <div className="absolute inset-0 bg-emerald-500/[0.02] rounded-2xl pointer-events-none" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer Section */}
      <div className="mt-auto px-6 py-8 border-t border-slate-200 dark:border-zinc-800/30 space-y-6">
        <div className="flex justify-center">
          <ThemeToggle />
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-4 rounded-2xl px-6 py-4 text-[11px] font-medium uppercase tracking-[0.2em] text-slate-400 dark:text-zinc-600 transition-all duration-300 hover:bg-red-500/5 hover:text-red-500 active:scale-95"
        >
          <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800/40 group-hover:border-red-500/30 transition-colors">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </div>
          Sign out
        </button>
      </div>
    </aside>
    </>
  );
}
