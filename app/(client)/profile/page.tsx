"use client";

import { useMemo } from "react";

export default function ProfilePage() {
  const user = useMemo(() => {
    if (typeof window === "undefined") return { name: "Client", email: "" };
    try {
      const token = localStorage.getItem("client_access_token") || "";
      if (token.startsWith("mock_")) {
        const payload = JSON.parse(atob(token.replace("mock_", "")));
        return { name: payload.name || "Client", email: payload.sub || "" };
      }
    } catch { /* ignore */ }
    return { name: "Client", email: "" };
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Profile</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Manage your account and preferences
        </p>
      </div>

      {/* Profile Card */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-lg font-bold text-white">
            {user.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-zinc-100">{user.name}</h2>
            <p className="text-sm text-zinc-400">{user.email}</p>
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
        <h3 className="text-sm font-semibold text-zinc-200 mb-4">Job Preferences</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-zinc-400">Preferred Role</label>
            <input
              type="text"
              placeholder="e.g., Frontend Engineer"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-2.5 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-zinc-400">Industry</label>
            <input
              type="text"
              placeholder="e.g., Tech, Finance"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-2.5 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-zinc-400">Work Type</label>
            <select className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-2.5 text-sm text-zinc-100 outline-none transition focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20">
              <option value="">Any</option>
              <option value="remote">Remote</option>
              <option value="hybrid">Hybrid</option>
              <option value="onsite">On-site</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-zinc-400">Min Salary (USD)</label>
            <input
              type="number"
              placeholder="80000"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-2.5 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
        </div>

        <button
          className="mt-5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-5 py-2 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-500/20"
        >
          Save Preferences
        </button>
      </div>

      {/* Resume Section */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
        <h3 className="text-sm font-semibold text-zinc-200 mb-4">Resume</h3>
        <div className="rounded-lg border border-dashed border-zinc-700 bg-zinc-800/30 px-6 py-10 text-center">
          <svg className="mx-auto h-8 w-8 text-zinc-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-sm text-zinc-400">No resume uploaded</p>
          <p className="mt-1 text-xs text-zinc-500">Your TJH representative will upload your resume</p>
        </div>
      </div>
    </div>
  );
}
