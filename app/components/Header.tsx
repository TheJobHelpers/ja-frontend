"use client";

import { useState, useMemo } from "react";
import { usePathname } from "next/navigation";

export default function Header() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const pathname = usePathname();

  // Derive login state from localStorage (re-evaluated on pathname change)
  const isLoggedIn = useMemo(() => {
    if (typeof window === "undefined") return false;
    return !!localStorage.getItem("access_token");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      // Call the backend logout API to clear the server-side session
      const token = localStorage.getItem("access_token");
      if (token) {
        await fetch("/api/auth/logout", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.error("Logout API error:", error);
      // Continue with client-side logout even if API fails
    }

    // Clear tokens
    localStorage.removeItem("access_token");
    localStorage.removeItem("token_type");

    // Redirect to login page
    setTimeout(() => {
      window.location.href = "/job-search/login";
    }, 500);
  };

  return (
    <header className="border-b border-white/5 bg-black/20 backdrop-blur-md sticky top-0 z-20">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <a href="/job-search" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-tr from-blue-500 via-sky-400 to-emerald-400 shadow-[0_0_25px_rgba(56,189,248,0.75)]">
              <span className="text-xs font-black tracking-[0.18em] text-white flex items-center justify-center w-full text-center leading-none">
                TheJobHelpers
              </span>
            </div>
            <div>
              <p className="text-sm font-semibold tracking-tight">
                Job Application Hub
              </p>
              <p className="text-[11px] text-zinc-400">One sleek interface</p>
            </div>
          </a>
        </div>

        <div className="flex items-center gap-3 text-xs text-zinc-400">
          <span className="hidden sm:inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 font-medium text-emerald-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.9)]" />
            Live job insights
          </span>
          <span className="hidden md:inline text-zinc-500">•</span>
          <span className="hidden md:inline">
            Designed for fast, focused job discovery
          </span>

          {/* Auth Buttons */}
          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="ml-2 inline-flex items-center gap-1.5 rounded-full border border-red-500/40 bg-red-500/10 px-3 py-1.5 text-[11px] font-medium text-red-300 transition hover:bg-red-500/20 hover:border-red-500/60 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoggingOut ? (
                <>
                  <svg
                    className="h-3 w-3 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>Logging out...</span>
                </>
              ) : (
                <>
                  <svg
                    className="h-3 w-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  <span>Logout</span>
                </>
              )}
            </button>
          ) : pathname !== "/login" ? (
            <a
              href="/job-search/login"
              className="ml-2 inline-flex items-center gap-1.5 rounded-full border border-violet-500/40 bg-violet-500/10 px-3 py-1.5 text-[11px] font-medium text-violet-300 transition hover:bg-violet-500/20 hover:border-violet-500/60"
            >
              <svg
                className="h-3 w-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                />
              </svg>
              <span>Login</span>
            </a>
          ) : null}
        </div>
      </div>
    </header>
  );
}
