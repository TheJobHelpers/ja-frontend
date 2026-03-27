"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { setJaToken } from "../../lib/jaAuth";

export default function JaAdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // TODO: backend — real endpoint:  POST /api/ja-admin/auth/login
      const res = await fetch("/api/ja-admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }

      setJaToken(data.access_token, data.token_type, data.user);
      router.push("/ja-admin/dashboard");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-zinc-950">
      {/* Left — Branding */}
      <div className="hidden lg:flex lg:w-[45%] flex-col justify-between p-12 bg-gradient-to-br from-violet-950 via-violet-900 to-zinc-900 border-r border-violet-800/30">
        <div>
          <div className="flex items-center gap-3 mb-16">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/20 border border-violet-500/30">
              <svg className="h-5 w-5 text-violet-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-400">TheJobHelpers</p>
              <p className="text-sm font-bold text-white">JA Internal Portal</p>
            </div>
          </div>

          <div className="space-y-3">
            <h1 className="text-4xl font-bold text-white leading-tight">
              Manage.<br />Track.<br />Deliver.
            </h1>
            <p className="text-sm text-violet-300/80 leading-relaxed max-w-xs">
              The central hub for JA Team to manage clients, oversee job assignments, and monitor AI-powered search activity.
            </p>
          </div>
        </div>

        {/* Feature list */}
        <div className="space-y-3">
          {[
            { icon: "👥", label: "Client Management", desc: "Create & manage client accounts" },
            { icon: "📋", label: "Job Assignments", desc: "Track application pipeline" },
            { icon: "🔍", label: "Search Logs", desc: "Audit AI Agent activity per client" },
          ].map((f) => (
            <div key={f.label} className="flex items-center gap-3 rounded-xl bg-white/5 border border-white/8 px-4 py-3">
              <span className="text-base">{f.icon}</span>
              <div>
                <p className="text-[11px] font-bold text-white">{f.label}</p>
                <p className="text-[10px] text-violet-300/60">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right — Login form */}
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="w-full max-w-[360px] space-y-7">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/20 border border-violet-500/30">
              <svg className="h-4 w-4 text-violet-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </div>
            <p className="text-sm font-bold text-white">JA Internal Portal</p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-zinc-100">Staff Sign In</h2>
            <p className="mt-1 text-sm text-zinc-400">JA Team internal access only</p>
          </div>



          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-400">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="admin@jateam.com"
                className="w-full rounded-xl border border-white/10 bg-zinc-900/80 px-4 py-3 text-sm text-zinc-50 placeholder-zinc-600 outline-none transition focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20"
              />
            </div>

            <div className="space-y-1.5 group relative">
              <label className="block text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-400 group-focus-within:text-violet-400 transition-colors">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-white/10 bg-zinc-900/80 px-4 py-3 text-sm text-zinc-50 placeholder-zinc-600 outline-none transition hover:bg-zinc-900/90 focus:border-violet-500/50 focus:bg-zinc-900/90 focus:ring-2 focus:ring-violet-500/20"
                />
                {password.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md bg-zinc-800 px-2 py-1 text-[10px] font-bold text-zinc-400 hover:text-zinc-200 transition"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                )}
              </div>
            </div>

            {error && (
              <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-xs font-medium text-red-300">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 py-3 text-sm font-bold text-white shadow-[0_8px_30px_rgba(139,92,246,0.35)] transition hover:from-violet-400 hover:to-purple-500 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in...
                </span>
              ) : "Sign In →"}
            </button>
          </form>

          <div className="flex items-center gap-3 pt-2">
            <div className="h-px flex-1 bg-zinc-800" />
            <span className="text-[10px] text-zinc-600">Other portals</span>
            <div className="h-px flex-1 bg-zinc-800" />
          </div>

          <div className="flex gap-3">
            <a href="/login" className="flex-1 rounded-xl border border-zinc-800 bg-zinc-900/50 py-2.5 text-center text-[11px] font-semibold text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition">
              Client Portal
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
